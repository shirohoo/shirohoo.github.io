---
layout: post
category:
  - cs
  - operating-system
title: 운영체제(Operating System) 8강
description: |
    반효경 교수님 - Virtual Memory
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - _posts/cs/operating-system/2022-03-10-memory-management.md
  - _posts/cs/operating-system/2022-03-18-file-system.md
published: true
---

* toc
{:toc}

<br />

# Lecture

---

- [운영체제 - 반효경 교수님](http://www.kocw.or.kr/home/cview.do?mty=p&kemId=1046323)
  - Virtual Memory 1
  - Virtual Memory 2

<br />

# Virtual Memory

---

## Demand Paging

- 페이지가 실제로 필요할 때 메모리에 올리기에 다음과 같은 장점이 있다
  - I/O 감소
  - 메모리 사용량 감소
  - 빠른 응답 시간
  - 더 많은 사용자 수용

- Valid/Invalid Bit
  - Invalild의 의미
    - 사용되지 않는 주소 영역인 경우
    - 페이지가 물리 메모리에 없는 경우
  - 최초에는 모든 page entry가 Invalid로 초기화 됨

<br />

![image](https://user-images.githubusercontent.com/71188307/157585722-6b5f5ec9-6d1c-44b1-9d11-091cc10f91d1.png)

<br />

- 0, 2, 5 (A, C, F) 는 당장 필요한 부분이기 때문에,
  물리 메모리에 올라가 있고 Valid로 마킹 되어있다
- 1, 3, 4 (B, D, E) 는 논리 메모리에는 올라가 있지만 당장 사용되지 않고 있는 부분이기 때문에 Invalid로 마킹 되어있다
- 6, 7 (G, H) 같은 경우에는 페이지가 물리 메모리에 없는 상태이기 때문에,
  Invalid로 마킹 되어있다
- Invalid Bit이 설정되어 있으면, `Page Fault` 인터럽트가 발생하며, 쉽게 얘기하자면 물리 메모리에 페이지가 존재하지 않으니 확인해보라는 의미이다

<br />

## Page Fault

---

- Invalid Page에 접근하면 MMU가 interrupt를 발생시킨다 (page fault trap)
- 커널 모드로 전환 후 Page Fault Handler가 호출 된다
- Page Fault 처리 순서
  - Invalid 를 참조
  - 빈 Page Frame을 가져오는데, 없으면 뺏어온다 (Page Replace)
  - 해당 페이지를 디스크에서 메모리로 읽어온다 (swap in)
  - 디스크 읽기/쓰기 작업이 끝날 때 까지 프로세스가 blocked된다
  - 디스크 읽기가 끝나면 PTE(Page Table Entry)를 기록하고,
    Valid/Invalid Bit을 Valid로 바꾼다.
  - Ready Queue에 프로세스를 넣는다
  - 이 프로세스가 CPU를 점유하여 다시 running
  - 아까 중단되었던 Instruction을 재개

<br />

### Performance of Demand Paging

---

- 페이지 부재의 발생 빈도가 성능에 가장 큰 영향을 미친다.
- 유효 접근 시간(요청한 페이지를 참조하는 데 걸리는 시간)
  - (1 - P) x 메모리 접근 시간 + P x M
  - 페이지 부재 발생 비율(P) → 0 ≤ P ≤ 1
    - P = 0: 페이지 부재가 한 번도 일어나지 않은 경우
    - P = 1: 모든 참조 요청에서 페이지 부재가 발생한 경우
  - M (각종 오버헤드)
    - 페이지 부재 발생 처리 오버헤드
    - 메모리에 빈 프레임이 없는 경우 swap out 오버헤드
    - 요창된 페이지의 swap in 오버헤드
    - 프로세스의 재시작 오버헤드
    - 위 오버헤드의 총합
- **쉽게 얘기하면 Page Fault가 발생했을때의 오버헤드는 매우 값 비싸다**

<br />

## Page Replacement

---

- Page Fault가 발생하여 요청된 페이지를 디스크에서 메모리로 읽어오려고 하는데, 물리 메모리에 빈 공간이 없을 수 있다
- 이때 이미 메모리에 올라와 있는 페이지 중 하나를 디스크로 쫓아내(swap out) 물리 메모리에 빈 공간을 확보하는데, 어떠한 페이지를 교체할지 결정하는 것을 Page Replacement라고 한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/157590366-024ff8db-0d8c-4087-8abe-56fd47caede2.png)

<br />

## Page Replacement Algorithm

---

- 페이지 교체를 할 때에 어떠한 프레임에 있는 페이지를 swap out 할 것인지 결정하는 알고리즘
  - 이 알고리즘의 목표는 페이지 부재율을 최소화하는 것
  - 주어진 페이지 참조열에 대한 부재율을 계산하여 알고리즘을 평가한다

<br />

### Optimal Algorithm

---

- 물리 메모리에 존재하는 페이지 중 가장 먼 미래에 참조될 페이지를 쫓아내는 알고리즘
- 미래의 참조를 알아야 하므로 현실적으로 구현할 수 없다
- 하지만 현존하는 알고리즘 중 가장 성능이 좋으므로, 타 알고리즘과의 비교를 위해 사용된다
- 즉, 다른 알고리즘의 성능에 대한 상한선을 제공

<br />

![image](https://user-images.githubusercontent.com/71188307/157590646-46e2fd52-6f11-40d9-ba1e-d719903c81fe.png)

<br />

- 초기 4회는 물리 메모리가 비어있으므로 불가피하게 Page Fault가 발생
- 이후 1, 2는 물리 메모리에 1, 2페이지가 있으므로 Page Fault가 발생하지 않는다
- 페이지 5는 물리 메모리에 없으므로 가장 먼 미래에 참조되는 페이지 4를 디스크로 swap out
- 반복한다

<br />

### FIFO (First-In-First-Out)

<br />

- 물리 메모리에 가장 먼저 올라온 페이지를 우선적으로 swap out한다
- 메모리가 증가하였음에도 Page Fault가 오히려 늘어나는 현상이 발생할 수 있다 (Belady's Anomaly)

<br />

![image](https://user-images.githubusercontent.com/71188307/157591193-28223764-61f1-4972-bc0b-6ef39800d7a4.png)

<br />


### LRU (Least Recently Used)

---

- 지역성 이론중, 시간적 지역성에 따른 알고리즘이다
- 최근에 참조된 것이 조만간 다시 참조될 수 있다는 것인데, 역설적으로 말하면 최근에 참조되지 않은 것은 다시 참조될 확률이 적다고 볼수도 있는 것이다
- 즉, 가장 오래 전에 참조됐던 페이지를 swap out 하는 알고리즘이다

<br />

![image](https://user-images.githubusercontent.com/71188307/157591589-4b8fc2d9-33dc-4b26-b923-2626243da8de.png)

<br />

- 초기 4회는 물리 메모리가 비어있으므로 불가피하게 Page Fault가 발생
- 이후 1, 2는 물리 메모리에 1, 2페이지가 있으므로 Page Fault가 발생하지 않는다
- 페이지 5는 물리 메모리에 없으므로 가장 오래 전에 참조된 페이지 3을 디스크로 swap out한다
- 반복한다

<br />

### LFU (Least Frequently Used)

- 페이지의 참조 횟수가 가장 적은 페이지를 교체하는 알고리즘
- 최저 참조 횟수인 페이지가 여러 개 있는 경우
  - LFU 알고리즘 자체에서는 여러 페이지 중 임의로 선정
  - 성능 향상을 위해 가장 오래 전에 참조된 페이지를 지우게 구현할 수도 있다
- 장점
  - LRU처럼 직전 참조 시점만 보는 것이 아니라 장기적인 규모로 보기 때문에 페이지의 인기도를 조금 더 정확히 반영할 수 있다
- 단점
  - 참조 시점의 최근성을 반영하지 못한다
  - LRU보다 구현이 복잡하다

<br />

## 다양한 캐싱 환경

- 캐싱 기법
  - 한정된 빠른 공간(=캐시)에 요청된 데이터를 저장해 두었다가 후속 요청시 캐시로부터 직접 서비스하는 방식
  - 페이징 시스템 외에도 캐시 메모리, 버퍼 캐시, 웹 캐시 등 다양한 분야에서 사용된다
- 캐시 운영의 시간 제약
  - 교체 알고리즘에서 삭제할 항목을 결정하는 일에 지나치게 많은 시간이 걸리는 경우 실제 시스템에서 사용할 수 없다
  - 버퍼 캐시나나 웹 캐시의 경우 O(1)에서 O(log N)까지 허용
  - 페이징 시스템의 경우
    - Page Fault의 경우에만 OS가 관여한다.
    - 페이지가 이미 메모리에 존재하는 경우 참조 시각 등의 정보를 OS가 알 수 없다
    - O(1)인 LRU의 List 조작조차 불가능

<br />

### 페이징 시스템에서 LRU, LFU 가능한가?

---

![image](https://user-images.githubusercontent.com/71188307/157619731-c0d89443-d995-4df8-97c7-5d52d02141fc.png)

<br />

- 프로세스 A가 CPU를 잡고 실행 중인 상태라면, 프로세스 A의 논리 메모리에서 매 순간 명령어를 읽어와서 처리 할 것이다
- 이때 페이지 테이블을 통해서 논리 주소를 물리 주소로 변환 하여 물리 메모리에 있는 내용을 CPU로 읽어와야 한다
  - 주소 변환을 했는데 해당하는 페이지가 이미 물리 메모리에 올라와 있다면 물리 메모리를 그대로 읽는다
  - 위와 같은 주소 변환 과정은 모두 하드웨어가 담당하며, OS는 일체 관여하지 않는다.
- 변환하려는 논리 주소의 Valid-Invalid Bit의 값이 Invalid 여서 Page Fault가 발생하였다면 Backing Store 접근을 필요로 한다
- 이때 DISK I/O를 수행해야 하므로 trap이 발동하여 interrupt가 발생하고 CPU의 제어권이 프로세스 A에서 OS로 넘어가게 된다
- OS가 디스크의 Page Fault가 발생한 페이지를 물리 메모리로 swap in하고, 그 과정에서 물리 메모리에 빈 공간이 없다면 물리 메모리의 페이지 하나를 swap out해야 한다
- 위 일련의 과정을 수행하면서 LRU, LFU 알고리즘을 적용할 수 있을까?
  - 프로세스가 요청한 페이지가 메모리에 이미 있는 경우에는 CPU가 OS로 넘어가지 않는다
  - Page Fault 가 발생해야 CPU 제어권이 OS로 넘어가므로 디스크에서 메모리로 페이지가 넘어오는 시간을 파악할 수 있다
  - 즉, Page Fault가 발생할 때만 페이지에 접근하는 정보를 알 수 있으므로 LRU, LFU 알고리즘은 페이징 시스템에서 사용할 수 없다

<br />

## Clock Algorithm

---

- LRU의 근사 알고리즘이다
- 여러 명칭으로 불린다
  - Second Chance Algorithm
  - NUR(Not Used Recently)
  - NRU (Not Recently Used)
- Reference Bit를 사용하여 교체 대상 페이지를 선정한다. (circular list)
  - Reference Bit를 수정하는 작업은 OS가 아닌, 하드웨어가 수행
  - Reference Bit가 0인 것을 찾을 때까지 포인터를 하나씩 앞으로 이동
- Clock Algorithm 개선
  - Reference Bit와 Modified Bit(Dirty Bit)를 함께 사용한다.
  - Reference Bit가 1이면 최근에 참조된 페이지
  - Modified Bit(Dirty Bit)가 1이면 최근에 변경된 페이지 (I/O를 동반하는 페이지)

<br />

![image](https://user-images.githubusercontent.com/71188307/157621089-fc271e3f-ffb5-4807-8e8d-5a0ece5b6fef.png)

<br />

- 각 사각형은 물리 메모리에 있는 페이지 프레임을 의미
- 페이지에 대해 어떤 페이지가 참조되어 CPU가 그 페이지를 사용하게 되면, 하드웨어는 그 페이지의 Reference Bit가 1로 세팅한다
- OS는 포인터를 이동하면서 페이지의 Reference Bit가 이미 1이면, 페이지를 swap out 하지 않고 Reference Bit를 0으로 세팅한 후 다음 페이지의 Reference Bit를 검사
- OS는 다시 포인터를 이동하다가 Reference Bit가 0인 페이지를 찾으면, 해당 페이지를 swap out
  - Reference Bit는 해당 페이지가 참조될 때 하드웨어가 1로 세팅하므로 시계 바늘이 한 바퀴 돌아오는 동안에 다시 참조되지 않은 경우 그 페이지는 교체되는 것이다
  - A라는 페이지 프레임의 Reference Bit를 0으로 바꾼 후, 다시 한 바퀴 돌아서 A 페이지 프레임의 Reference Bit가 0이면 가장 오랫동안 참조가 일어나지 않은 페이지라고 판단한다
- 개선 클럭 알고리즘은 Reference Bit 외에 Modified Bit를 사용
  - Modified Bit는 어떤 페이지가 쫓겨날 때, 이 페이지의 Modified Bit가 0이면 Backing Store에서 물리적 메모리로 올라온 이후로 수정이 되지 않은 페이지이므로 바로 메모리에서 지워도 된다
  - Modified Bit가 1이면 물리 메모리로 올라온 이후로 수정이 발생한 페이지이므로 swap out 전에 Backing Store에 수정한 내용을 반영하고 메모리에서 지워야 한다
  - Modified Bit가 1이면 디스크로 swap out 되는 페이지의 수정된 내용을 반영하는 오버헤드가 발생하므로, 해당 페이지를 swap out하지 않고 Modified Bit를 0으로 수정한다

<br />

## Page Frame Allocation

---

![image](https://user-images.githubusercontent.com/71188307/157621799-03d544c6-bf18-4e53-83fc-a4562a6ec09a.png)

<br />

## Global vs Local Replacement

---

![image](https://user-images.githubusercontent.com/71188307/157621873-721e44a3-d55c-44d2-8e2a-28f3fcf6344f.png)

<br />

## Thrashing

---

- 프로세스의 원활한 수행에 필요한 최소한의 Page Frame수를 할당받지 못하면 Page Fault Rate가 크게 상승하여 CPU 이용률이 떨어지고, 낮은 처리량을 보이는 현상이다.
- 스레싱이 발생하는 시나리오
  - OS는 CPU 이용률이 낮을 경우 메모리에 올라와 있는 프로세스의 수가 적다고 판단하여 메모리에 올라가는 프로세스를 늘린다
    - Ready Queue에 프로세스가 단 하나라도 있으면 CPU는 그 프로세스를 실행하므로 쉬지 않고 일하게 되는데, CPU 이용률이 낮다는 것은 Ready Queue가 비어있다는 것을 의미한다
    - 메모리에 올라가 있는 프로세스의 수를 Multi Programming Degree(MPD)라고 부른다
  - MPD가 과도하게 높아지면 각 프로세스에게 할당되는 메모리의 양이 감소한다
  - 각 프로세스는 그들이 원활하게 수행되기 위해 필요한 최소한의 Page Frame도 할당 받지 못하므로 Page Fault Rate가 증가한다
  - Page Fault가 발생하면 DISK I/O를 수반하므로 다른 프로세스에게 CPU가 넘어간다
  - 다른 프로세스 역시 Page Fault가 발생하고 있어서 또 다른 프로세스에게 CPU가 넘어간다
  - 결국 Ready Queue에 있는 모든 프로세스에게 CPU가 한 차례씩 할당 되었는데도 모든 프로세스에 Page Fault가 발생하여 CPU의 이용률이 급격하게 떨어진다
  - OS는 위 현상이 MPD가 낮다고 판단하여 다시 MPD를 높이려고 한다
  - 이러한 악순환이 계속 반복되는 상황을 스레싱이라고 부른다

<br />

![image](https://user-images.githubusercontent.com/71188307/157621970-6df5542f-aaef-4494-ade5-732212f76da0.png)

<br />

## Working-Set

---

![image](https://user-images.githubusercontent.com/71188307/157625267-c9c8d326-4136-4a54-8b13-b78151967424.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/157625352-5c2ebca3-37ab-4f78-8b27-80c99695f79f.png)

<br />

### PFF (Page-Fault Frequency)

---

![image](https://user-images.githubusercontent.com/71188307/157625610-f41955e2-1961-4d7d-8441-b15e05bb2a3c.png)

<br />

- Page Fault Rate를 주기적으로 조사하고 이 값에 근거해서 각 프로세스에 할당할 메모리 양을 동적으로 조절하는 것
- Page Fault Rate의 상한값과 하한값을 둔다
  - Page Fault Rate의 상한값을 넘으면 페이지 프레임을 더 할당한다
  - Page Fault Rate의 하한값보다 낮으면 할당 페이지 프레임 수를 줄인다
- 빈 페이지 프레임이 없으면 일부 프로세스를 swap out한다

<br />

### Page Size 결정

---

![image](https://user-images.githubusercontent.com/71188307/157625917-35bfc93b-eba0-450c-b5c1-96c19d12e2e9.png)

<br />
