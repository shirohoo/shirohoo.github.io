---
layout: post
category:
  - cs
  - operating-system
title: 운영체제(Operating System) 10강
description: |
    반효경 교수님 - Disk Management and Scheduling
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - _posts/cs/operating-system/2022-03-18-file-system.md
published: true
---

* toc
{:toc}

<br />

# Lecture

---

- [운영체제 - 반효경 교수님](http://www.kocw.or.kr/home/cview.do?mty=p&kemId=1046323)
  - Disk Management and Scheduling 1
  - Disk Management and Scheduling 2

<br />

# Disk Management and Scheduling

## Disk Structure

---

![image](https://user-images.githubusercontent.com/71188307/159114161-048feeed-9f6f-4774-9112-0a599c417e35.png)

<br />

- Logical Block
  - 디스크의 외부에서 보는 디스크의 단위 정보 저장 공간
  - 디스크 외부에서는 이를 주소를 가진 1차원 배열로 취급
  - 디스크에 데이터가 저장될때, 디스크 I/O가 일어날때 모두 논리 블록 단위로 관리
  - 디스크에 저장된 데이터에 접근하기 위해서는 해당 데이터가 저장돼있는 논리 블록의 인덱스 번호를 디스크로 전달해야 함
  - 논리 블록은 가상 메모리처럼 논리적인 개념이다

- Sector
  - 디스크의 물리적인 최소 단위
  - 논리 블록과 매핑된 디스크의 물리적인 위치 (논리블록 : 섹터 = 1 : 1)
  - 디스크의 물리적인 구조는 마그네틱 원판으로 구성돼있으며, 이 원판은 최소 하나 이상이다
  - 각 원판은 트랙(Track)으로 구성돼있고, 각 트랙은 섹터로 구성돼있다
  - 여러 개의 원판에서 상대적으로 동일한 위치의 트랙 집합을 실린더라고 부른다
  - 섹터 0은 최외곽 실린더의 첫 번째 트랙의 첫 번째 섹터이다
    - 디스크에 데이터를 읽고 쓰기 위해서는 디스크 암(Disk Arm)이 해당 섹터가 위치한 실린더로 이동 후 원판이 회전하여 디스크 헤드가 저장된 섹터 위치에 도달해야 한다

<br />

## Disk Management

---

- Physical Formatting (Low-Level Formatting)
  - 디스크를 컨트롤러가 읽고 쓸 수 있도록 여러개의 섹터로 나누는 과정
  - 각 섹터는 `header` + `data(보통 512 bytes)` + `trailer` 로 구성
  - header와 trailer는 sector number, ECC(Error-Correcting Code) 등의 정보가 저장되며 컨트롤러가 직접 접근 및 운영
- Partitioning
  - 디스크를 하나 이상의 실린더 그룹으로 나누는 과정
  - OS는 이것을 독립적인 디스크로 취급한다 (물리적인 하드디스크는 하나이지만, C드라이브, D드라이브등으로 나눌 수 있다)
- Logical Formatting
  - 파일 시스템을 만드는 것
  - FAT, Inode, Free Space 등의 구조를 포함
- Booting
  - ROM에 있는 `Small Bootstrap Loader`를 실행
  - sector 0(boot block)을 load하여 실행
  - sector 0은 `Full Bootstrap Loader Program`
  - OS를 디스크에서 load하여 실행

<br />

## Disk Scheduling

---

- 디스크에 대한 접근 시간(Access Time)은 아래 세 가지 시간의 합
  - 탐색 시간(seek time)
    - 디스크 헤드를 해당 실린더 위치로 이동하는 데 걸리는 시간
  - 회전 지연 시간(rotational latency)
    - 디스크가 회전해서 읽고 쓰려는 섹터가 헤드 위치에 도달하기까지 걸리는 시간
  - 전송 시간(transfer time)
    - 해당 섹터가 헤드 위치에 도달한 후 데이터를 실제로 섹터에 읽고 쓰는 데 소요되는 시간
- 회전 지연 시간과 전송 시간은 상대적으로 수치가 작고 운영체제 입장에서 통제하기 힘든 부분이기에 탐색 시간을 줄이기 위해 헤드의 움직임을 최소화하는 스케쥴링 작업을 함
- 즉, 디스크 스케쥴링의 가장 중요한 목표는 디스크 헤드의 이동 거리를 줄이는 것

<br />

### FCFS (First Come First Service)

---

- FCFS은 디스크에 먼저 들어온 요청을 먼저 처리하는 방식 (FIFO와 사실상 같다)

<br />

![image](https://user-images.githubusercontent.com/71188307/159114492-19e12dfa-f987-4235-9ce1-dbd05d5ab3b2.png)

<br />

- 현재 디스크 헤드가 53번 실린더에 있을 경우 헤드는 53에서 출발해 98, 183, ...과 같이 요청이 들어온 순서대로 이동하게 되므로 총 헤드가 이동한 거리는 640이 된다
- FCFS는 합리적인 것처럼 보이지만 효율성은 매우 떨어진다
- 최악의 경우 디스크의 한쪽 끝과 반대쪽 끝을 왔다갔다하면 탐색 시간이 매우 길어지므로 접근 시간이 기하급수적으로 커질 수 있다

<br />

### SSTF (Shortest Seek Time First)

---

- SSTF 스케쥴링은 헤드의 현재 위치로부터 가장 가까운 위치에 있는 요청을 제일 먼저 처리하는 알고리즘이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/159114528-90805343-e606-4a48-9b43-4bdaa1389ccf.png)

<br />

- 53번 실린더에서 출발하여 가장 가까운 65번, 그 후 65번에서 가장 가까운 67번, ...을 반복하여 총 이동 거리는 236이다
- FCFS보다 약 3배나 성능 개선이 이루어진 것을 볼 수 있다
- 그러나 SSTF는 Starvation(기아) 문제를 초래할 수 있다
  - 현재의 헤드 위치 근방으로 무한히 요청이 들어오면, 헤드 위치에서 멀리 있는 요청은 영원히 기다려야 할 수도 있다

<br />

### SCAN (Elevator Algorithm)

---

![image](https://user-images.githubusercontent.com/71188307/159114582-4105cc88-4d4c-49a7-bb97-640df5d0f5ab.png)

<br />

- SCAN은 헤드가 디스크 원판의 안쪽 끝과 바깥쪽 끝을 오가며, 그 경로에 존재하는 모든 요청을 처리하는 것
- 즉, 디스크의 어떠한 위치에 요청이 들어오는 가와 상관 없이 헤드는 정해진 방향으로 이동하면서 길목에 있는 요청을 처리하며 지나감
- 문제점: 실린더 위치에 따라 대기 시간이 다름
  - 제일 안쪽이나 제일 바깥쪽 위치보다는 가운데 위치가 평균 대기 시간이 짧다
  - 예를 들어 0번에서 199번까지 200개의 실린더를 가진 디스크의 경우 0번 실린더나 199번 실린더를 막 지나가고 나서 해당 지점에 요청이 들어왔다면 반대쪽 끝까지 헤드가 갔다 와야 하므로 이동 거리 400만큼 대기해야 하지만, 100번 실린더를 막 지나가고 나서 해당 지점에 요청이 들어왔다면 대기해야 하는 이동 거리가 200에 불과함

<br />

![image](https://user-images.githubusercontent.com/71188307/159114657-5337a1b5-ae2c-4efd-ad68-fd526e27201f.png)

<br />

### C-SCAN

---

![image](https://user-images.githubusercontent.com/71188307/159114734-a5d901ae-92c9-4dd2-9735-80416cf73bd4.png)

<br />

- C-SCAN은 SCAN처럼 헤드가 한쪽 끝에서 다른 쪽 끝으로 이동하며 가는 길목에 있는 모든 요청을 처리
- 하지만 SCAN과 달리 헤드가 다른 족 끝에 도달해 방향을 바꾼 후에는 요청을 처리하지 않고 곧바로 출발점으로 다시 이동
- SCAN 알고리즘보다 균일한 대기 시간을 제공

<br />

![image](https://user-images.githubusercontent.com/71188307/159114717-ee5908d6-b6b3-4222-a681-22298b8bc312.png)

<br />

- 헤드가 53번 실린더에서 출발하여 199번 실린더까지 이동하며 중간에 있는 요청을 처리
- 헤드가 199번 실린더에 도달하면 0번 다시 실린더로 이동하는데, 이때는 중간에 있는 요청을 처리하지 않음
- 이후 0번 실린더에서 다시 199번 실린더로 이동하면서 중간에 있는 요청을 처리
- 총 이동 거리는 383

<br />

### N-SCAN, LOOK, C-LOOK

---

- N-SCAN 알고리즘
  - SCAN의 변형 알고리즘
  - 일단 헤드가 한 방향으로 움직이기 시작하면 그 시점 이후에 도착한 요청은 되돌아올 때 처리
- LOOK, C-LOOK 알고리즘
  - SCAN이나 C-SCAN은 헤드가 디스크 끝에서 끝으로 이동
  - LOOK과 C-LOOK은 헤드가 이동 중 그 방향에 더 이상 기다리는 요청이 없으면 헤드의 이동 방향을 즉시 반전시킴

<br />

![image](https://user-images.githubusercontent.com/71188307/159114910-66d29e54-0b1f-4ca7-87d6-0cd70d2e275d.png)

<br />

### Disk Scheduling Algorithm의 결정

---

- SCAN, C-SCAN 및 그 응용 알고리즘은 LOOK, C-LOOK 등이 일반적으로 디스크 입출력이 많은 시스템에서 효율적인 것으로 알려져 있음
- 현대 컴퓨팅 시스템에서는 SCAN 기반의 알고리즘들을 많이 사용하고 있음
  - 디스크 헤드의 이동거리를 줄일 수 있는것이 가장 큰 이유
- File의 할당 방법에 따라 디스크 요청이 영향을 받음
  - 연속 할당을 했다면 연속된 실린더 위치에 존재하기 때문에 헤드의 이동거리를 줄일 수 있음
  - 불연속 할당을 했다면 헤드의 이동거리가 상대적으로 증가할 수 있음
- 디스크 스케쥴링 알고리즘은 필요할 경우 다른 알고리즘으로 쉽게 교체할 수 있도록 OS와 별도의 모듈로 작성되는 것이 바람직
  - 디스크 스케쥴링의 효율을 결정짓는 변인이 많기 때문에, 디스크 스케쥴링 알고리즘을 쉽게 변경할 수 있어야 한다

<br />

## Swap-Space Management

---

![image](https://user-images.githubusercontent.com/71188307/159115229-893425cb-bbaa-4c6f-9d7e-d9a9f9ed7711.png)

<br />

- 디스크를 사용하는 이유는 메모리의 제약적인 성질때문이다
  - 메모리의 휘발성을 비휘발성인 파일 시스템으로 해결
  - 메모리의 단가가 비싸기 때문에 프로그램 실행을 위한 메모리 공간은 항상 부족
  - 메모리 공간 부족을 디스크를 활용한 Swap space로 해결
- Swap-Space
  - 가상 메모리 시스템에서 디스크를 메모리의 연장 공간으로 사용
  - 파일 시스템 내부에 둘 수도 있으나 별도 파티션을 사용하는 것이 일반적
    - 공간 효율성보다는 속도 효율성이 우선
      - 공간 효율성이 덜 중요한 이유는, 어차피 시간이 조금 지나 프로세스가 종료되면 사라질 내용들이기 때문
    - 일반 파일보다 훨씬 짧은 시간만 존재하고 자주 참조됨
    - 따라서 블록의 크기 및 저장 방식이 일반 파일 시스템과 다름

<br />

## RAID (Redundant Array of Independent Disks)

---

![image](https://user-images.githubusercontent.com/71188307/159115328-0dcf8b37-02b7-4233-b878-f06b01177489.png)

<br />

- RAID는 여러 개의 디스크(특히 저렴한)를 묶어서 사용하는 것
- RAID의 사용 목적
  - 디스크 처리 속도 향상
    - 여러 디스크에다 블록의 내용들을 `분산 저장`
    - 병렬적으로 읽어올 수 있음 (interleaving 혹은 striping)
  - 신뢰성(Reliability) 향상
    - 동일 정보를 여러 디스크에 `중복 저장`
    - 하나의 디스크가 고장나도 다른 디스크에서 읽어올 수 있음 (mirroring 혹은 shadowing)
    - 단순한 중복 저장이 아니라 일부 디스크에 parity(오류 검출 코드)를 저장하여 공간의 효율성을 높일 수도 있음

<br />
