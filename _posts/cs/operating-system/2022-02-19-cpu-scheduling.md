---
layout: post
category:
  - cs
  - operating-system
title: 운영체제(Operating System) 4강
description: |
    CPU Scheduling
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - _posts/cs/operating-system/2022-02-16-process-management.md
published: true
---

* toc
{:toc}

<br />

# Lecture

---

- [운영체제 - 반효경 교수님](http://www.kocw.or.kr/home/cview.do?mty=p&kemId=1046323)
  - CPU Scheduling 1
  - CPU Scheduling 2

<br />

# CPU burst & I/O burst

---

프로세스의 작업은 크게 두가지로 나뉘는데, 결과를 화면에 출력하거나, 다른 파일에 접근하여 데이터를 읽어오거나, 다른 컴퓨터와 통신하는 등의 I/O 작업과, 어떤 결과를 도출해내기 위한 CPU 연산 작업으로 이뤄져있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154785994-de39ec4a-9fc7-4fa1-913d-a10f2c6e4a64.png)

<br />

## CPU burst

---

CPU 버스트는 사용자 프로세스가 CPU를 할당받아 명령어들을 빠르게 수행하는 단계이다. 

이 때, 사용자 프로세스는 CPU 내에서 일어나는 명령(연산)이나 메모리에 접근하는 일반 명령(읽기, 쓰기)을 수행 할 수 있다.

<br />

## I/O burst

---

I/O 버스트는 사용자 프로세스가 시스템 콜을 통해 운영체제에 작업을 위탁한 후 운영체제에 의해 I/O 작업을 진행하는 단계이다. 

이 단계에서 모든 I/O 작업은 커널 모드로 수행되기 때문에 오로지 운영체제를 통해서만 수행된다.

이처럼 사용자 프로그램이 수행되는 과정은 CPU 버스트와 I/O 버스트의 반복으로 구성된다.

<br />

## CPU bound process & I/O bound process

---

각 사용자 프로세스는 CPU 버스트와 I/O 버스트의 비율이 다르다. 

사용자 입출력이 많은 프로세스는 I/O 버스트가 CPU 버스트에 비해 많은 비율을 차지하겠지만, 사용자 입출력이 거의 없이 오로지 연산만 하는 경우는 CPU 버스트의 비율이 더 높게 나타난다.

이러한 기준에서 프로세스는 `CPU bound process`와 I`/O bound process`로 나눌 수 있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154786012-edc86e05-5848-49dc-91cb-0ecd9a7eed14.png)

<br />

프로세스 수행 구조를 보면 I/O bound process는 짧은 CPU 버스트를 많이 가지고 있는 반면, CPU bound process는 소수의 긴 CPU 버스트로 구성되고 있는 것을 볼 수 있다.

<br />

# CPU Scheduling

---

컴퓨터 시스템 내에서 수행되는 프로세스들의 CPU 버스트를 분석해보면 대부분의 프로세스가 짧은 CPU 버스트를 가지며, 극히 일부분의 프로세스만 긴 CPU 버스트를 갖는다. 

이는 다시 말해서 CPU를 한 번에 오래 사용하기보다는 잠깐 사용하고 I/O 작업을 수행하는 프로세스가 많다는 것이다. 

즉, 사용자와의 대화형 작업(인터랙션)을 많이 수행한다고 볼 수 있는데, 사용자에 대한 빠른 응답을 위해서는 해당 프로세스에게 우선적으로 CPU를 할당하는 것이 바람직하다. 왜냐하면, 만약 CPU 바운드 프로세스에게 먼저 CPU를 할당한다면 그 프로세스가 CPU를 다 사용할 때까지 수많은 I/O 바운드 프로세스는 기다려야할 것이다. 이는 사용자 경험측면에서 봤을 때 컴퓨터의 응답이 느려진다는 치명적인 결과로 이어진다. 

이러한 이유로 어떤 프로세스에게 CPU를 더 먼저 할당해줄지를 결정하는 CPU 스케쥴링이 필요해졌다.

<br />

## CPU Scheduler

---

CPU 스케쥴러는 준비 상태에 있는 프로세스들 중 어떠한 프로세스에게 CPU를 할당할 지 결정하는 운영체제의 코드이다.

즉, 단순히 운영체제 코드에 정의된 어떤 함수일 뿐이며, 이를 범용적으로 CPU 스케쥴러라고 부르는 것이다.

이 코드는 당장 깃허브에 리눅스 프로젝트를 검색해 들어가면 볼 수 있다.

<br />

### CPU 스케쥴러가 필요한 경우

---

CPU 스케쥴링이 필요한 경우는 프로세스에게 다음과 같은 상태 변화가 있는 경우이다.

<br />

1. Running -> Blocked (예: I/O 요청하는 시스템 콜)
2. Running -> Ready (예: 할당 시간 만료로 타이머 인터럽트 발생)
3. Blocked -> Ready (예: I/O 완료 후 인터럽트)
4. Terminated (예: 프로세스 종료)

<br />

1, 4번째의 스케쥴링은 강제로 빼앗지 않고 자진 반납하는 `non-preemptive(비선점, 자발적인)` 방식이고, 그 외의 스케쥴링은 CPU를 강제로 빼앗는 `preemptive(선점, 강제적인)` 방식이다.

<br />

### Dispatcher

---

CPU를 누구한테 누구한테 줄 지 결정했으면 해당 프로세스에게 넘겨야 하는데, 디스패처가 이 역할을 수행한다. 이 과정이 `Context Switch`에 해당한다.

참고로, 디스패처는 관제탑에서 여러 비행기들에게 지시하는 사람을 의미한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154786388-78e6c384-03e4-4771-90cc-73ce9e9bd0c6.png)

<br />

## Scheduling Criteria

---

![image](https://user-images.githubusercontent.com/71188307/154786465-8d23a3e6-d153-4778-abe2-9597a085da42.png)


<br />

### 시스템 측면

---

시스템 측면에서의 성능 척도라는 것은 CPU 하나를 가지고 최대한 일을 많이 시키면 좋은 것이다.

따라서 다음 두개의 지표를 본다.

<br />

- CPU utilization (CPU 이용률)
  - 전체 시간 중에서 CPU가 놀지 않고 일을 한 시간의 비율
  - keep the CPU as busy as possible (가능한 바쁘게 일을 시켜야 한다)


- Throughput (처리량, 산출량)
  - 주어진 시간동안 몇개의 작업을 완료했는가
  - CPU를 원하는 프로세스 중 몇 개가 원하는 만큼의 CPU를 사용하고 있고, 이번 CPU 버스트를 끝내어 레디큐를 떠났는지 측정한 것
  - 더 많은 프로세스들이 CPU 작업을 완료하기 위해서는 CPU 버스트가 짧은 프로세스에게 우선적으로 CPU를 할당하는 것이 유리할 것

<br />

### 프로세스 측면

---

프로세스 측면에서의 성능 척도라는 것은 자신이 CPU를 빨리 얻어서 해야 할 작업을 빨리 끝내면 좋은 것이다.

따라서 다음 세가지의 지표를 본다.

<br />

- Turnaround time (소요 시간, 반환 시간)
  - 프로세스가 CPU를 사용하기 위해 레디큐에 들어와서, CPU를 다 사용하고 나갈 때까지 걸린 시간을 의미
  - 즉, Turnaround time = Waiting time + 실제로 CPU를 사용한 시간


- Waiting time (대기 시간)
  - CPU 버스트 중 프로세스가 레디큐에서 CPU를 얻기 위해 기다린 시간의 총 합을 의미
  - 시분할 시스템의 경우 CPU를 강제적으로 계속 빼앗길 수 있기 때문에, 한 번의 CPU 버스트 중에도 레디큐에서 기다리는 시간이 여러 번 발생할 수 있다


- Response time (응답 시간)
  - 프로세스가 준비 큐에 들어온 후 첫 번째 CPU를 획득하기까지 기다린 시간을 뜻한다
  - 응답 시간은 대화형 시스템에 적합한 성능 척도로서, 사용자 입장에서 가장 중요한 성능 척도라고 할 수 있다

<br />

### 중국집으로 비유한 스케쥴링 성능 척도

---

중국집에 주방장 한명과 여러 손님이 있다.

중국집 입장에서는 주방장한테 일을 많이 시키는게 좋다.

- CPU utilization: 전체 시간 중 주방장이 일을 한 시간의 비율. 당연히 높으면 좋을 것
- Throughput: 정해진 시간 동안 주방장이 몇명의 손님에게 요리를 만들어 주었는가. 당연히 높으면 좋을 것

<br />

손님 입장에서는 중국집에 밥을 먹으러 들어가서 밥을 먹고 나오는 시간이 짧으면 짧을수록 좋다.

- Turnaround time: 손님이 중국집에 들어와 음식을 주문하고, 주문한 음식을 다 먹고 나가기까지 소요된 총 시간
- Waiting time: 음식을 먹은 시간을 제외한 순수하게 기다린 시간 (코스요리 처럼 음식이 여러 번 나누어져 나오는 경우 중간중간 기다린 시간을 모두 다 합쳐야 한다)
- Response time: 최초의 음식이 나오기까지 손님이 기다린 시간

<br />

## CPU Scheduling Algorithms

---

### FCFS (First-Come First-Served)

---

- 먼저 온 순서대로 처리하는 방식 (`non-preemptive`)
- 버스트 타임이 긴 프로세스와 짧은 프로세스들이 있는 상황에, 버스트 타임이 가장 긴 프로세스가 가장 먼저 도착하면 버스트 타임이 짧은 프로세스들은 앞의 프로세스가 끝날때까지 대기해야만 한다
- 마트 계산대로 비유하자면, 나는 아이스크림 하나만 결제하고 나가면 되는데, 앞에 카트를 통째로 채워온 손님이 먼저 도착하여 계산을 하고 있는 경우와 같다

<br />

![image](https://user-images.githubusercontent.com/71188307/154800499-0a06dc30-5854-44ac-9cde-5652f8ac8625.png)

<br />

- 위 사진처럼 어떤 프로세스가 먼저 CPU를 할당받느냐에 따라 전체 대기 시간에 상당한 영향을 미침
  - 1번
    - 대기 시간: P1 = 0, P2 = 24, P3 = 27
    - 평균 대기 시간: (0 + 24 + 27) / 3 = 17
  - 2번
    - 대기 시간: P1 = 6, P2 = 0, P3 = 3
    - 평균 대기 시간: (6 + 0 + 3) / 3 = 3
- 긴 프로세스 하나 때문에 짧은 프로세스 여러 개가 기다리는 현상을 `Convoy effect` 라 부른다

<br />

### SJF (Shortest-Job-First)

---

![image](https://user-images.githubusercontent.com/71188307/154800621-03a03e58-34cd-4354-a24c-9c7fd94c0233.png)

<br />

- 버스트 타임이 가장 짧은 프로세스에게 가장 먼저 CPU를 할당하는 방식
- 평균 대기 시간을 가장 짧게 가져가는 알고리즘 (minimum average wating time)

<br />

![image](https://user-images.githubusercontent.com/71188307/154800799-701a92a8-d0f2-4a04-9f3e-6f2cc857d0fc.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/154800816-615b87ca-d165-44ec-aebf-9c756ce35e82.png)

<br />

- 문제점
  - Starvation (기아): 버스트 타임이 짧은 프로세스가 계속해서 들어오면 버스트 타임이 상대적으로 긴 프로세스가 영원히 CPU를 할당받지 못할 수도 있다
  - 정확한 버스트 타임을 미리 알 수 없고, 과거 버스트 타임을 통해 추정만 할 수 있다

<br />

![image](https://user-images.githubusercontent.com/71188307/154800862-32b23697-13d1-431a-ae14-c952473c97f6.png)

<br />

### Priority Scheduling

---

- `우선 순위`가 제일 높은 프로세스에게 CPU를 할당
- 일반적으로 `우선 순위 값(priority number)`이 작을 수록 높은 우선 순위를 갖는다. (정수형)
- non-preemptive (비선점형)
  - 일단 CPU를 할당 받으면, 더 높은 우선 순위를 가진 프로세스가 들어와도 CPU 버스트가 완료될 떄까지 CPU를 빼앗기지 않는다
- preemptive (선점형)
  - CPU를 할당받아 작업중이더라도 더 높은 우선 순위를 가진 프로세스가 들어오면 CPU를 빼앗긴다
- SJF는 버스트 타임을 우선순위로 사용하는 우선 순위 스케쥴링의 일종이라고 볼 수 있다
- 문제점
  - Starvation (기아): 우선 순위가 낮은 프로세스가 지나치게 오래 기다리거나, 혹은 영원히 CPU를 할당 받지 못할 수도 있다
- 해결 방안
  - Aging (노화): 우선 순위가 낮은 프로세스에 대해 기다린 시간만큼 비례하여 우선 순위를 높여주는 기법

<br />

### RR (Round Robin)

---

- 각 프로세스는 동일한 크기의 `할당 시간(time quantum)` 을 가진다
- 할당 시간이 지나면 프로세스는 CPU를 빼앗기고 레디큐 맨 뒤에 가서 줄을 선다
- 사용자에게 짧은 응답 시간을 보장함
  - CPU를 줬다 뺏었다를 반복하기 때문에 CPU를 최초로 얻기까지 걸리는 시간이 짧다
  - n개의 프로세스가 레디큐에 있고, 할당 시간이 q인 경우 어떤 프로세스도 `(n - 1) * q` 이상 기다리지 않는다
  - CPU를 할당받기 위해 기다리는 시간이 CPU 버스트에 비례한다
- 성능
  - q가 커질 수록 `FCFS`에 가까워진다
  - q가 작을 수록 `Context Switch`로 인한 오버헤드가 증가한다
- 일반적으로 SJF보다 평균 Turnaround time이 길지만, 응답 시간은 짧다
- 시간이 오래 걸리는 프로세스와 짧게 걸리는 프로세스가 섞여 있을 때는 효율적이지만, 시간이 동일한 프로세스만 있을 때는 비 효율적이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154801423-9c95e499-4ffe-4522-8b16-a938ca5dbfc0.png)

<br />

위와 같이 RR은 정해진 할당 시간(20) 만큼만 공평하게 CPU를 사용한다.

<br />

### Multi-Level Queue

---

![image](https://user-images.githubusercontent.com/71188307/154801626-3bb02946-7a03-4b4d-82e6-2886d84b19d8.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/154801601-98f1957c-75f6-4e8f-af9a-143bac5e368e.png)

<br />

- 우선 순위에 따라 여러개의 레디큐를 둔다
  - 사용자에게 빠른 응답을 줘야하는 대화형 작업은 우선순위가 높은 전위큐에 넣는다
    - 전위큐에서는 주로 RR 스케쥴링 기법을 사용한다
  - 계산 위주의 작업은 우선순위가 낮은 후위큐에 넣는다
    - 후위큐에서는 주로 FCFS 스케쥴링 기법을 사용한다
- 멀티 레벨 큐 자체에 대한 스케쥴링이 필요하다
  - 고정 우선순위 방식 (Fixed Priority Scheduling)
    - 전위큐에 있는 프로세스에게 우선적으로 CPU가 할당되고, 전위큐가 비어 있는 경우에만 후위큐에 있는 프로세스에게 CPU가 할당된다
    - Starvation (기아) 가능성이 존재한다
  - 타임 슬라이스 방식 (Time Slice)
    - 각 큐에 CPU 사용 시간을 적절한 비율로 할당한다.
    - 예: 80%는 전위큐, 20%는 후위큐

<br />

### Multi-Level Feedback Queue

---

![image](https://user-images.githubusercontent.com/71188307/154801820-93d7bc30-0a76-4248-acc6-8c72fe4841e5.png)

<br />

<br />

![image](https://user-images.githubusercontent.com/71188307/154801876-163ea208-0e4c-424b-85c6-93309c397e71.png)

<br />

- 현대에 와서, 대다수의 컴퓨터들이 채택하고 있는 CPU 스케쥴링 기법이다
- 프로세스가 여러 개로 분할된 레디큐 내에서 다른 큐로 이동이 가능하다
- 멀티 레벨 피드백 큐를 이용하여 Aging (노화) 기법을 구현할 수 있다
  - Aging 기법은 프로세스가 우선 순위가 낮은 큐에서 오래 기다리면, 우선 순위가 높은 큐로 승격하는 방식이다
- 멀티 레벨 피드백 큐를 정의하는 요소
  - 큐의 수
  - 각 큐의 스케쥴링 알고리즘
  - 프로세스를 상위큐로 승격하는 기준
  - 프로세스를 하위큐로 강등하는 기준
  - 프로세스가 도착했을 때 들어갈 큐를 결정하는 기준
    - 일반적으로 처음 들어온 프로세스는 CPU 할당 시간을 짧게 하여 우선 순위가 가장 높은 전위큐에 배치한다
    - 만약 주어진 할당 시간 안에 작업을 완료하지 못하면 CPU 할당 시간을 조금 더 주되, 우선 순위가 한 단계 낮은 큐로 강등한다
    - 이 과정을 반복하다가 최하위큐에 배치가 된다

<br />

## Multi-Processor Scheduling

---

은행으로 비유하자면, 행원 한명과 은행 창구 하나만 있던 상황에서, 행원과 은행 창구가 여러명으로 늘어난 것과 같은 상황이다.

이렇게 되어도 근본적인 CPU 스케쥴링에는 큰 차이가 없으나 몇가지 특이한 상황이 발생할 수 있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154801938-dadbc715-7515-4f00-a1a3-e7115be7869c.png)

<br />

### Real-time Scheduling

---

정해진 시간 안에 반드시 실행이 되어야 하는, 즉 프로세스에 `데드라인`이 있는 경우 사용하는 기법이다.

<br />

- `Hard real-time systems`
  - 정해진 시간 안에 반드시 작업이 끝나도록 스케쥴링해야 한다
  - 미사일 발사 버튼같은 것들을 생각해볼 수 있다
- `Soft real-time systems`
  - 데드라인이 존재하기는 하지만 지키지 못했다고 해서 위험한 상황이 생기지는 않는다
  - 일반 프로세스에 비해 높은 우선 순위를 갖도록 한다

<br />

### Thread Scheduling

---

- `Local Scheduling`
  - 운영체제가 스레드의 존재를 모르는 것을 유저 레벨 스레드라고 한다
  - OS가 아닌 사용자 프로세스가 직접 어느 스레드한테 CPU를 줄 것인지 결정한다
  - 대표적으로 구버전 JVM의 스레드 스케쥴링이 있다
- `Global Scheduling`
  - 커널 레벨 스레드의 경우 일반 프로세스처럼 운영체제의 단기 스케쥴러가 어떤 스레드를 스케쥴할 지 결정한다

<br />

## Scheduling Algorithmic Evaluation

### Queuing Model

---

- 주로 이론가들이 수행하는 방식
- 확률 분포로 주어지는 도착율(Arrival Rate)과 처리율(Service Rate)등을 통해 각종 성능 지표를 계산한다

<br />

### Implementation & Measurement

---

- 주로 구현가들이 수행하는 방식으로, 실측을 의미한다
- 실제 시스템에 알고리즘을 구현하여 실제 작업에 대해서 성능을 측정하여 비교한다
- 예를 들어 새로운 CPU 스케쥴링 알고리즘을 개발했다고 가정하면, 리눅스의 스케쥴링 함수를 직접 개발한 알고리즘으로 수정한 후 컴파일 하여 컴파일된 리눅스를 직접 돌려 성능 지표를 뽑아낸 후 기존 리눅스와 비교하는 방식이라고 생각하면 되겠다

<br />

### Simulation

---

- 알고리즘을 모의 프로그램으로 작성한 후 trace(실제 시스템에서 추출한 입력값)를 입력으로 하여 결과를 비교한다

<br />
