---
layout: post
category:
    - backend
    - database
date: 2021-05-22 23:59
title: MySQL 시작하기
description: >
    MySQL 초기 세팅에 대해 정리합니다
image: /assets/img/backend/mysql.png
related_posts:
    -
---

* toc
{:toc}

&nbsp;  

새 사이드 프로젝트를 시작할 때 딱 한번 하고 마는 작업들이라 할 때마다 약간씩 헷갈려서 기록해둔다.

우선 MySQL을 구축했다면 접속을 한다.

터미널로 하든 `workbench`로 하든 `Data Grip`이든 상관없다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FB1qYz%2Fbtq5ufFyCQ2%2FI3Fs3fQSvQw6Bz6eTdgUw1%2Fimg.png)

이후 순서는 크게 세개다.

&nbsp;  

# 1. 데이터베이스 생성

---

MySQL은 기본적으로 대소문자를 구분하므로 별다른 설정을 하지 않았다면 가급적 소문자로 SQL을 입력한다.

데이터베이스를 생성하기 전 현재 데이터베이스 목록을 확인한다.

```sql
show databases;
```

&nbsp;  

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbmxFLd%2Fbtq5sRZ0qWW%2Fm6zQdYNxbEsvhIkzEibNfk%2Fimg.png)

이후 생성하고자 하는 데이터베이스가 없다면 새로 생성해주자.

&nbsp;  

```sql
create database {DB} default character set utf8mb4;
```

이때 데이터베이스의 기본 인코딩을 지정해줘야 추후 한글이 깨지지 않는다.

그리고 utf8과 utf8mb4가 있는데, 무슨 차이냐면 ! 

utf8로 하면 한글은 제대로 나오지만 emoji가 제대로 나오지 않는다.😲

따라서 가급적 utf8mb4로 설정해주자.

&nbsp;  

# 2. 사용자 계정 생성

---

역시 사용자를 생성하기 전 사용자 목록을 먼저 확인해준다.

MYSQL 스키마를 선택한 후 유저 테이블을 뒤질 것이다.

```sql
use mysql;
select user, host from user;
```

&nbsp;  

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbL62qg%2Fbtq5uf6EWF7%2FeRhh5W0rSklWB0fEWwZaS0%2Fimg.png)

&nbsp;  

생성하고자 하는 사용자 계정과 겹치는 게 있는지 확인한 후 사용자를 생성하자.

```sql
create user '{user}'@'%' identified by '{password}';
```

여기서 사용자 이름 뒤의 % 는 외부에서의 접속을 허락한다는 뜻이다.

만일 로컬에서만 사용하고자 한다면 %가 아닌 localhost나 127.0.0.1을 입력해주면 되겠다.

혹은 특정 IP에서만 DB에 접속이 가능하게 하고싶다면 해당 IP주소를 입력하면 되겠다.

뒤는 해당 사용자명으로 접속하고자 할 때 입력해야 할 패스워드를 지정해준다.

&nbsp;  

# 3. 사용자에게 권한 부여

---

마지막으로 사용자에게 권한을 줘야 하는데 생각해볼 점이 있다.

해당 사용자가 DDL도 사용할 수 있게 할 것인지, DML만 사용하게 할 것인지

만일 DML만 사용 가능하다면 어느 정도 선까지 허용할 것인지 등이다.

개발을 하다 보면 의도치 않게 DB 테이블을 날려버린다거나 혹은 데이터를 날려버린다거나 하는 일이 자주 발생한다.

이런 경우는 정말 대참사이고 생각보다 자주 발생하기 때문에~~(심지어 회사에서도 종종 목격할 수 있다)~~ 애초에 애플리케이션용 사용자 계정을 새로 만들어 데이터를 삭제하지 못하게 권한을 부여하지 않는 식으로 작업을 한다.

필자 같은 경우엔 보통 DML만 사용 가능하게 하고 DML 중에서도 select, insert, update만 사용가능하게 권한을 주는 걸 선호한다.

delete문을 제외하는 이유는 사용하여 데이터 자체를 삭제했다고 한다면, 나중에 이 데이터가 다시 필요해질 경우에 굉장히 곤란해지기 때문이다.

또한, delete는 애초에 거의 사용하지 않고 테이블에 유효한 데이터인지를 표시하는 컬럼을 별도로 생성하여 데이터를 관리한다.

그리고 delete 사용에 제약을 걸어 의도치 않게 row가 날아가는 일을 원천 차단하는 것이다.

```sql
grant select, insert, update on {DB}.* to '{user}'@'%';
```

이 SQL은 선택한 DB에 존재하는 `모든 테이블 (DB.\*)`에 한해 선택한 사용자가 `select`, `insert`, `update`만을 사용할 수 있게 권한을 부여한다는 의미이다.
