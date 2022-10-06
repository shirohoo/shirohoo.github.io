---
layout: post
category:
    - backend
    - database
title: MySQL 통계 쿼리 최적화 사례
description: >
    정렬과 디스크 I/O를 최소화
image: /assets/img/backend/mysql.png
related_posts:
    -
---

* toc
{:toc}

A팀(영화 A팀에서 나온 이름입니다...) 소속 팀원으로서, 레거시 시스템 성능 개선 업무의 일환으로 처리했던 작업 중 하나입니다.

튜닝을 진행하기 전에 도메인을 먼저 파악하던 중 버그도 하나 찾게되어 쿼리 자체를 재구성하게 되었습니다.

# 튜닝 전 쿼리

```sql
SELECT
    point_info.user_id,
    SUM(point_detail.point) expired_point
FROM
    point_detail JOIN point_info ON point_detail.point_id = point_info.point_id
WHERE
    point_detail.expiry_date <= CURRENT_TIMESTAMP
GROUP BY
    point_info.user_id
HAVING
    expired_point > 0
LIMIT 1000;
```

# 튜닝 전 실행계획

| id  | select_type | table        | type   | key      | ref           | rows    | filtered | Extra                                        |
|-----|-------------|--------------|--------|----------|---------------|---------|----------|----------------------------------------------|
| 1   | SIMPLE      | point_detail | index  | \<null\> | \<null\>      | 943,527 | 33.33    | Using where; Using temporary; Using filesort |
| 1   | SIMPLE      | point_info   | eq_ref | PRIMARY  | point_info_id | 1       | 100      | \<null\>                                     |

표시되는 행은 2개고, id가 둘다 1임을 보아 `point_detail`과 `point_info`를 조인하고 있으며, `point_info`의 `type`이 `eq_ref`임을 보아 조인의 기준이 되는 드라이빙 테이블은 `point_detail`임을 알 수 있습니다.

`select_type`이 `SIMPLE`이므로 단순한 select 쿼리이며, 쿼리에 사용된 `key`가 없고 `type` 이 `ALL` 임을 보아 `point_detail`에서 `테이블 풀 스캔`이 일어났음을 알 수 있습니다.

이 때, 테이블 풀 스캔이 발생하며 읽은 행은 약 94만 행이며, 그 중 33%의 행을 가져왔으며, `Extra`열에 `Using temporary`, `Using filesort`가 있음을 보아 `임시 테이블`이 사용되었고, `정렬 작업`도 있었음을 알 수 있습니다.

실행계획을 요약하면 다음과 같습니다.

<u>MySQL이 인덱스를 거치지 않고 HDD에 즉시 접근하여 테이블 풀 스캔을 수행 한 후 33%의 행을 읽어왔고, 읽어온 데이터를 임시 테이블로 복사해 정렬을 했으며, 정렬된 데이터와 point_info 테이블 간 조인을 수행합니다.</u>

튜닝을 위해 테이블의 인덱스를 확인한 결과는 `point_detail` 테이블에는 `PK`, `FK`를 제외하고 `non-clusterd 인덱스`인 `idx_point_key`가 하나 있으며, `point_info` 테이블에는 `PK`인 `point_id`가 하나 있습니다.

일단 당장 딱히 쓸 만한 인덱스는 없는걸로 판단되며, 도메인상으로는 테이블의 전체 데이터 중 대부분의 데이터를 활용해야만 하므로 `테이블 풀 스캔`이나 `인덱스 풀 스캔`을 하는편이 이로워보이는데, 가급적이면 대체로 성능이 더 좋은 인덱스 풀 스캔을 활용해보는 방향으로 잡습니다. (`인덱스 레인지 스캔`은 통상적으로 테이블 전체 데이터의 약 15% ~ 25% 이하의 적은 데이터를 조회할때 효과적이라고 알려져 있습니다)

# 튜닝 후 쿼리

```sql
SELECT
    i.user_id,
    d.expired_point
FROM
    (SELECT
         SUM(point) expired_point
     FROM
         point_detail
     WHERE
         expiry_date < NOW()
     GROUP BY
         point_key
     HAVING
         expired_point > 0) d, point_info i
WHERE
    d.point_id = i.point_id;    
```

`인라인 뷰`를 씁니다. 

`point_detail` 테이블의 액세스 조건으로 `포인트 만료일`을 주었고, `point_key`로 그룹화를 한 후 having 절을 통해 이미 만료됐으면서도 잔액이 0원을 초과하는 포인트를 모두 출력하도록 하였습니다.

그리고 쿼리의 모든 열을 포함하는 `커버링 인덱스`를 생성합니다.

이 때, 인덱스의 순서가 매우 중요합니다. 

그룹화에 사용되는 `point_key`를 인덱스의 가장 첫 번째 열로 설정하고, 액세스 조건으로 사용되는 `expiry_date`를 두 번째 열로 설정합니다.

(원래는 액세스 조건을 인덱스의 첫번째 열로 설정하는 것이 대부분의 상황에서 가장 유효한 가이드이지만, 이번 케이스는 그러한 가이드를 따르면 `Using temporary`, `Using filesort`가 발생해 빠른 쿼리를 만들기가 어렵습니다.)

```sql
CREATE INDEX cidx_point_expiration ON point_detail (point_key, expiry_date);
```

이렇게 드라이빙 테이블에서 읽어올 행과 디스크 I/O를 최소화 한 후 조인을 시도합니다.

# 튜닝 후 실행계획

| id  | select_type | table        | type   | key                   | ref        | rows    | filtered | Extra                     |
|-----|-------------|--------------|--------|-----------------------|------------|---------|----------|---------------------------|
| 1   | PRIMARY     | \<derived2\> | ALL    | \<null\>              | \<null\>   | 316,092 | 100      | \<null\>                  |
| 1   | PRIMARY     | point_info   | eq_ref | PRIMARY               | d.point_id | 1       | 100      | \<null\>                  |
| 2   | DERIVED     | point_detail | index  | cidx_point_expiration | \<null\>   | 948,371 | 33.33    | Using where; Using index; |

이제는 행이 3개로 늘어났는데, `derived2`와 `point_info`의 id가 둘다 1임을 보아 두 테이블이 조인 됐음을 알 수 있습니다. 

여기서 `derived2`는 id가 2인 테이블. 즉, 인라인 뷰로 작성된 `point_detail`을 의미합니다.

`derived2`의 실행계획을 보면 `type` 이 `index`이며, `key`가 금방 생성한 커버링 인덱스의 이름입니다.

이 정보로 금방 생성했던 커버링 인덱스를 풀 스캔 했으며, 약 95만개의 행 중 33%를 가져왔음을 알 수 있습니다. (316,092 행)

이 때, `Extra` 열을 보면 `Using index`를 확인할 수 있는데, 이 항목이 바로 커버링 인덱스가 사용됐음을 의미합니다. 

즉, 인덱스에 이미 필요한 모든 데이터가 존재하므로 95만 행을 스캔하는데 실질적인 디스크 I/O가 거의 발생하지 않은 것입니다.

메모리는 0과 1로 이뤄진 전기 신호(빛의 속도)로 모든것을 순식간에 제어할 수 있으나, HDD는 메모리와 다르게 데이터를 읽거나 쓰기 위해서는 디스크 암이 대상 섹터가 위치한 실린더로 이동한 후 마그네틱 원판이 회전하여 디스크 헤드가 섹터의 위치에 도달해야만 하는 구조이므로 디스크 I/O가 발생할 경우 이렇게 하드웨어가 직접 움직여야 되기 때문에 최소한의 물리적인 시간이 필요해지고, 이러한 과정이 처리되는 속도는 빛의 속도에 비할바가 아닙니다. 

따라서, 일단 디스크 I/O가 발생한다면 그 자체로 엄청난 오버헤드가 발생함을 유추할 수 있습니다.

또한 튜닝 전에는 `Using temporary`, `Using filesort`가 있었으나 튜닝 후에는 없습니다.

이것이 의미하는 바는, 인덱스는 이미 정렬되어있는 자료구조이며 이렇게 이미 정렬되어 있는 자료구조를 이용했기 때문에 별도로 임시 테이블에 데이터를 복사하고 정렬하는 작업이 필요 없어져 생략이 가능해진다는 것입니다.

정렬은 아무리 훌륭한 알고리듬을 사용하더라도 그 자체로 매우 비싼 비용을 지불해야 하기 때문에 매 쿼리마다 정렬을 하는 것보다 미리 정렬을 해둔 자료구조를 만들어둔 후 이를 재사용하는 것이 실용적입니다.

# 튜닝 전후 쿼리 시간 비교

![image](https://user-images.githubusercontent.com/71188307/194039179-1f50c60b-8e9d-47de-be01-50a74fd25ccc.png)
튜닝 전 10.6s
{:.figcaption}

![image](https://user-images.githubusercontent.com/71188307/194039244-66dc0a08-aeb0-4e70-8331-964c2efe3350.png)
튜닝 후 1.2s
{:.figcaption}

이 사례의 핵심 포인트는 `정렬`과 `디스크 I/O`라는 두 오버헤드를 줄이는데 목적을 두고 진행된 사례입니다.

튜닝 결과를 쿼리 속도를 기준으로 비교했을 때 `10.6s` → `1.2s` 로 거의 10배에 가깝게 빨라졌음을 볼 수 있습니다.

# 생각해 볼 점

지금은 행이 90만 정도밖에 되지않아 큰 문제가 없지만 시간이 더 지나 테이블의 행이 수백만, 수천만 행 정도가 되면 문제가 생길 수 있습니다.

하지만 현재 설계는 `point_key` 를 기준으로 포인트의 적립(+)과 사용(-) 내역이 누적되는 구조이기 때문에 `point_key` 열로 그룹화를 한 후 `sum 함수`로 모든 포인트의 적립과 사용 내역을 합산해야지만 최종적으로 남은 포인트를 알 수 있는 구조라 당장 더 좋은 해결책이 떠오르지는 않습니다.

개인적으로는 `0.x초 대`의 쿼리 속도를 목표로 하였으나, 더욱 깔끔하고 명확한 해결 방법이 떠오르지 않고, 시간이 무한하지 않기 때문에 이쯤에서 마무리를 하게 됐습니다.
