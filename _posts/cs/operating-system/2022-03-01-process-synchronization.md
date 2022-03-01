---
layout: post
category:
  - cs
  - operating-system
title: 운영체제(Operating System) 5강
description: |
    Process Synchronization
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - _posts/cs/operating-system/2022-02-19-cpu-scheduling.md
published: true
---

* toc
{:toc}

<br />

# Lecture

---

- [운영체제 - 반효경 교수님](http://www.kocw.or.kr/home/cview.do?mty=p&kemId=1046323)
  - Process Synchronization 1
  - Process Synchronization 2
  - Process Synchronization 3
  - Process Synchronization 4

<br />

# 임계구역(Critical section)

---

- n 개의 프로세스가 공유 자원을 동시에 사용하기를 원하는 경우, `공유 자원에 접근하려 하는 코드 블럭을 의미`
- A프로세스에서 공유자원 c의 값을 1만큼 증가시키고, B프로세스에서는 동시에 c의 값을 1만큼 감소시킨다면 어떤 현상이 발생하는가?
- 이러한 경우 발생할 수 있는 문제들을 해결하기 위해 `동기화(synchronization)`가 필요하다

<br />

## 프로그램적 해결법의 충족 조건

---

**Mutual Exclusion (상호 배제)**

- 프로세스가 임계구역 부분을 수행 중이면 다른 모든 프로세스들은 그들의 임계구역에 들어갈 수 없다

**Progress (진행)**

- 아무 프로세스도 임계구역에 있지 않는 상태에서 임계구역에 들어가고자 하는 프로세스가 생긴다면 즉시 임계구역에 들어가게 해줘야한다

**Bounded Waiting (유한 대기)**

- 프로세스가 임계구역에 들어가려고 요청한 후 부터 그 요청이 허용될 때까지 다른 프로세스들이 임계구역에 들어가는 횟수에 한계가 있어야 한다

<br />

### 문제 해결 알고리즘

---

다음과 같이 가정한다.

- 모든 프로세스의 수행 속도는 0보다 크다
- 프로세스들 간의 상대적인 수행 속도는 가정하지 않는다

<br />

#### Algorithm 1

---

<br />

```c
do {
    while (turn != 0)
    critical section
    turn = 1;
    remainder section
} while (1);
```

<br />

turn이라는 변수를 가지고 자기 차례에만 임계구역에 들어가게 강제한다.

<br />

상호배제를 만족하지만, 프로세스 간의 임계구역에 들어가야하는 횟수가 다르다면 문제가 생길 수 있다.

- 프로세스 1은 임계구역에 한 번만 들어가도 되고, 프로세스 2는 임계구역에 여러 번 들어가야 되는 상황이다
- 코드가 한 번 작동한 이후, 프로세스 1이 더이상 들어갈 일이 없게 되기 때문에 프로세스 2에게는 자신의 차례가 돌아오지 않게 되버린다
- 즉, Progress(진행) 조건을 만족하지 못한다

<br />

#### Algorithm 2

---

<br />

```c
do {
    flag[i] = true;
    while(flag[j]);
    critical section
    flag[i] = false;
    remainder section
} while(1);
```

<br />

flag라는 boolean 변수를 가지고 임계구역에 들어갈 상태를 표현한다.

- 다른 프로세스의 flag를 체크하고, 프로세스의 flag가 true라면 양보, false라면 자신이 들어간다

이 또한 상호배제는 만족하므로 얼핏 보기에는 문제가 없어 보이지만, 선점 문제가 발생 할 수있다.

- 프로세스 1이 임계구역에 들어가기 위해 flag를 true로 만들어 둔 상태에서 CPU를 뺏기게 된다
- 프로세스 2도 임계구역에 들어가기 위해 flag를 true로 만들고 들어가려하는데, 다른 프로세스의 flag가 이미 true이기에 양보를 하게된다
- 프로세스 1에게 다시 CPU가 넘어와 임계구역에 들어가려하는데, 다른 프로세스의 flag가 true이므로 프로세스1도 마찬가지로 양보를 하게되버린다
- 즉, 서로 무한정으로 양보하는 상황이 발생한다 (데드락)

<br />

#### Algorithm 3(Peterson`s Algorithm)

---

<br />

```c
do {
    flag[i]= true;
    turm = j;
    while(flag[j] && turn == j);
    critical section
    flag[i] = false;
    remainder section
} while(1);
```

<br />

flag 변수와 turn 변수를 둘 다 사용하는 방법으로, 프로그램적 해결법의 충족 조건을 모두 만족하게 된다.

하지만 `Busy Waiting(Spin Lock)`문제가 발생한다.

Busy Waiting은 계속 CPU와 Memory를 사용하며 wait하고 있는 상태를 의미하며, 코드상으로 while문을 계속해서 돌고있는 상태이다.

<br />

### Synchronization Hardware

---

하드웨어적으로 Test & modify를 atomic 하게 수행할 수 있도록 지원하는 경우 앞의 문제는 간단히 해결 가능하다.

- lock을 걸고 푸는 작업을 하나의 명령어(논리)로 처리하기 때문에, 문제를 손 쉽게 해결 할 수 있다.

<br />

```c
Synchronization variable;
    boolean lock = false;

do {
    while(Test_and_Set(losk));
    critical section
    lock = false;
    remainder section
}
```

<br />

## Semaphores

---

- 앞의 방식들을 추상화 시킨 것
- 앞서 보았던 잠금을 걸고, 푸는 작업을 대신 해준다. (공유 자원을 획득하고, 다시 반납하는 작업)

<br />

`P(S)` - 잠금을 거는 연산

<br />

```c
while (S<=0) do no-op;
S--;
```

<br />

`V(S)` - 잠금을 푸는 연산

<br />

```c
S++;
```

<br />

### Semaphores Examples

---

```c
Synchronization variable:
semaphore mutex; // 1로 초기화

do{
	P(mutex);
	/* critical section */
	V(mutex); 
} whlile (1);
```

<br />

프로그래머는 위처럼 세마포어를 이용해서 더 간단하게 프로그램을 작성할 수 있다.

<br />

Block & Wakeup (Sleep Lock) 방식의 구현을 이용한다.

- 임계구역의 길이가 긴 경우 적당하다.

Busy-wait (Spin Lock)

- 임계구역의 길이가 매우 짧은 경우 오버헤드가 비교적 더 작다.
- 그렇기 때문에 일반적으로 Block & Wakeup 방식이 더 효율적으로 사용할 수 있다.

### Block & Wakeup Implementation

---

세마포어는 다음과 같이 정의 할 수있다.

<br />

```c
typedef struct
{
	int value; // 세마포어 변수
	struct process *L; // 세마포어를 사용하기 위한 대기 큐
}semaphore;
```

<br />

![image](https://user-images.githubusercontent.com/71188307/155293040-e5cc5a1a-fee0-48e6-b1ea-7bb0518f7b8d.png)

<br />

- block()
  - 커널은 block을 호출한 프로세스를 suspend하고, 이 프로세스의 PCB를 세마포어의 대기큐에 넣는다
- wakeup(P)
  - block된 프로세스를 wake up하고, 이 프로세스의 PCB를 레디큐에 넣는다

<br />

세마포어 연산은 다음과 같이 정의 및 구현한다

> P(S):
>
> 세마포어 변수 S를 무조건 1 줄이고, 그 변수의 값이 음수면 해당 프로세스를 대기큐로 보낸 후 Block 상태로 만든다.

<br />

```c
// P(S)
S.value--;
if (S.value < 0)
{
    add this process to S.L;
    block();
}
```

<br />

> V(S):
>
> 세마포어 변수 S를 무조건 1 늘리고, 그 변수의 값이 0보다 작거나 같으면 이미 기다리고 있는 프로세스가 있으므로 프로세스를 대기큐에서 꺼내 레디큐로 보낸다. 세마포어 변수 S 값이 양수면 아무나 임계 구역에 들어 갈 수 있으므로 별다른 추가 연산을 하지 않는다. V 연산은 특정 프로세스가 공유 데이터를 반납한 후 임계 구역에서 나가는 연산이다.

<br />

```c
// V(S)
S.value++;
if (S.value <= 0)
{
    remove a process P from S.L;
    wakeup(P);
}
```

<br />

- **block()**
  - 커널은 block을 호출한 프로세스를 대기 시킨다.
  - 이 프로세스의 PCB를 세마포어를 위한 대기 큐에 넣는다.
- **wakeup(P)**
  - block 된 프로세스 P를 wakeup 시킨다.
  - 이 프로세스의 PCB를 준비 큐로 옮긴다.

<br />

### Type of Semaphore

---

- Counting Semaphore
  - 도메인이 0이상인 임의의 정수값
  - 여러 개의 공유 자원을 상호 배제
  - 주로 resource counting에 사용

-Binary Semaphore
- 0 또는 1값만 가질 수 있는 세마포어
- 한 개의 공유 자원을 상호 배제
- mutex와 유사하나 완전히 같지는 않다

<br />

## Deadlock & Starvation

### Deadlock

---

둘 이상의 프로세스가 서로 상대방에 의해 충족될 수 있는 event를 무한히 기다리는 현상으로, 예시는 다음과 같다.

<br />

**S와 Q가 1로 초기화된 세마포어라 하자.**

![image](https://user-images.githubusercontent.com/71188307/155294603-9fd76523-598b-4252-b834-ac6a00419782.png)

<br />

P0이 CPU를 얻어 P(S) 연산까지 수행하여 S 자원을 얻었다고 가정 한다. 이 때,  P0의 CPU 점유 시간이 끝나 Context Switch가 발생하고 P1에게 CPU 제어권이 넘어갔다.

P1은 P(Q) 연산을 수행하여 Q 자원을 얻었으나 또 다시 CPU 점유 시간이 끝나 Context Switch가 발생하여 P0에게 CPU 제어권이 넘어갔다.

P0은 P(Q) 연산을 통해 Q 자원을 얻고 싶지만, 이미 Q 자원은 P1이 갖고 있는 상태이므로 Q 자원을 가져올 수가 없다.

마찬가지로 P1도 P(S) 연산을 통해 S 자원을 얻고 싶지만, 이미 S 자원은 P0이 갖고 있는 상태이므로 S 자원을 가져올 수 없다.

이렇게 P0와 P1은 영원히 서로의 자원을 가져올 수 없고, 이러한 상황을 `Deadlock`이라고 한다.

<br />

이러한 현상을 해결하는 방법 중 하나로, 자원의 획득 순서를 정해주어 해결하는 방법이 있다.

S를 획득해야만 Q를 획득할 수 있게끔 순서를 정해주면 프로세스 A가 S를 획득했을 때 프로세스 B가 Q를 획득할 일이 없다.

<br />

### Starvation

---

indefinite blocking(무기한적인 차단)으로, 프로세스가 자원을 얻지 못하고 무한히 기다리는 현상을 의미한다.

<br />

### Deadlock vs Starvation

---

언뜻 보기에 둘 다 자원을 가져오지 못하고 무한히 기다리니까 같은 단어라고 혼동할 수 있다.

`Deadlock`은 P0 프로세스가 A 자원을 보유하고 있고, P1 프로세스가 B 자원을 보유하고 있을 때 서로의 자원을 요구하여 무한히 기다리는 현상이다.

반면 `Starvation`은 프로세스가 자원 자체를 얻지 못하고 무한히 기다리는 현상이다. SJF 알고리즘을 생각하면 이해가 쉬울 수 있다.

<br />

# Producer-Consumer Problem

---

![image](https://user-images.githubusercontent.com/71188307/155873331-0a01a555-9ef6-489c-9825-206a87b758f8.png)

<br />

- 주황색: Full buffer
- 회색: Empty buffer

<br />

- Producer
  - empty buffer가 있는지 확인하고 없다면 기다린다
  - 공유 데이터에 lock을 건다
  - empty buffer에 데이터를 입력한다
  - lock을 푼다
  - full buffer가 하나 증가한다

<br />

- Consumer
  - full buffer가 있는지 확인하고 없다면 기다린다
  - 공유 데이터에 lock을 건다
  - full buffer에서 데이터를 꺼낸다
  - lock을 푼다
  - empty buffer가 하나 증가한다

<br />

## Synchronization Problem

---

- 공유 버퍼이기 때문에 여러 생산자가 동시에 한 버퍼에 데이터를 입력 할 수 있다
- 마찬가지로 여러 생산자가 동시에 한 버퍼의 데이터를 꺼내가려 할 수 있다

<br />

## Uses of semaphores

---

- 공유 데이터의 상호배제를 위해 이진 세마포어가 필요
- 가용 자원의 갯수를 세기 위해 계수 세마포어가 필요

<br />

## Solution example using semaphore

---

![image](https://user-images.githubusercontent.com/71188307/155873468-ac262942-97d6-42cc-8000-7489622c2dec.png)

- Producer
  - P 연산을 통해 empty buffer가 있는지 확인하고 없다면 대기한다
  - P 연산을 통해 empty buffer가 있다면 mutex를 0으로 만들고 임계 구역에 진입한다
  - empty buffer에 데이터를 입력한다
  - V 연산을 통해 mutex 값을 1로 만든다
  - V 연산을 통해 full buffer를 1 증가하고 임계 구역에서 빠져나온다

<br />

- Consumer
  - P 연산을 통해 full buffer가 있는지 확인하고 없다면 대기한다
  - P 연산을 통해 full buffer가 있다면 mutex를 0으로 만들고 임계 구역에 진입한다
  - full buffer에서 데이터를 빼 간다
  - V 연산을 통해 mutex 값을 1로 만든다
  - V 연산을 통해 empty buffer를 1 증가하고 임계 구역에서 빠져나온다

<br />

# Readers-Writers Problem

---

- 한 프로세스가 DB에 쓰기 중일 때 다른 프로세스가 접근하면 안 된다
- 읽기는 동시에 여러 명이 해도 된다

<br />

## Solution

---

![image](https://user-images.githubusercontent.com/71188307/155874002-5f6c09b3-f678-463f-9a45-06dad453668a.png)

![image](https://user-images.githubusercontent.com/71188307/155873906-a4b88260-c74d-477f-8e2a-13a8b757e400.png)

<br />

이진 세마포어 두 개를 사용한다

- semaphore mutex = 1
  - 상호 배제를 보장해야 하므로 각각의 세마 포어 값은 1로 지정하며, 다수의 Reader들이 readCount에 동시 접근하면 데이터 불일치의 위험이 있으므로 mutex를 정의
- db = 1
  - db는 Reader와 Writer가 공통 데이터베이스에서 서로 상호 배제를 보장해야하므로 정의

<br />

- Reader
  - readCount도 공유 변수이기 때문에 P(mutex) 연산을 통해 readCount를 상호 배제 처리하고 값을 1 증가시킨다 (readCount++)
  - Reader가 없고, Reader가 오로지 본인 혼자라면 (if(readCount == 1)) db에 lock을 건다 (P(db))
  - V(mutex) 연산을 통해 임계 구역에서 빠져 나온다
  - db를 원하는 만큼 읽는다
  - P(mutex) 연산을 통해 readCount 상호 배제 처리하고 값을 1 감소시킨다 (readCount--)
  - 마지막으로 read를 그만하고 나가려는 프로세스가 나 하나라면 (if(readCount == 0)) db의 lock을 해제한다 (V(db))
  - V(mutex) 연산을 통해 임계 구역에서 빠져나온다.

<br />

- Wrtier
  - P(db) 연산을 통해 db에 lock이 걸려있는지 확인한다
  - lock이 걸려 있지 않으면 db에 lock을 걸고 임계 구역에 진입한다
  - 쓰기 작업이 끝나면 V(db) 연산을 통해 db의 lock을 해제하고 임계 구역에서 빠져 나온다

<br />

- 문제점
  - Writer가 쓰기 작업을 하고 싶어도 무조건 Read 하고 있는 프로세스인 Reader가 없어야 한다
  - 만약 Reader가 무한히 read 작업을 실행한다면 Writer는 영영 임계 구역에 진입 하지 못하는 Startvation에 빠질 수도 있다

<br />

# Dining-Philosophers Problem

---

철학자 다섯이서 원형 식탁에 둘러앉아 생각에 빠져있다가, 배가 고파지면 밥을 먹는다.

그들의 양쪽엔 각각 젓가락 한 짝씩 놓여있고, 밥을 먹으려 할 땐 다음의 과정을 따른다.

1. 왼쪽 젓가락부터 집어든다. 다른 철학자가 이미 왼쪽 젓가락을 쓰고 있다면 그가 내려놓을 때까지 생각하며 대기한다
2. 왼쪽을 들었으면 오른쪽 젓가락을 든다. 들 수 없다면 1번과 마찬가지로 들 수 있을 때까지 생각하며 대기한다
3. 두 젓가락을 모두 들었다면 일정 시간동안 식사를 한다
4. 식사를 마쳤으면 오른쪽 젓가락을 내려놓고, 그 다음 왼쪽 젓가락을 내려놓는다
5. 다시 생각하다가 배고프면 1번으로 돌아간다

<br />

## Example

---

```c
do {
    P(chopstick[i]);
    P(chopstick[(i + 1) % 5]);
    ...
    eat();
    ...
    V(chopstick[(i + 1) % 5]);
    V(chopstick[i]);
    ...
    think();
    ...
} while (1);
```

<br />

모두가 동시에 왼쪽 젓가락을 드는 순간부터 환형대기에 빠져 다 같이 오른쪽 젓가락을 들 수 없으므로 Deadlock이 발생할 수 있다

Deadlock의 필요 조건은 다음과 같으며, 아래의 조건이 단 하나라도 만족하지 않는다면 Deadlock은 발생하지 않는다.
- 상호 배제
- 비선점
- 점유와 대기
- 원형 대기

<br />

## Solution

---

- 4명의 철학자만 테이블에 동시에 앉을 수 있게 한다
- 젓가락을 두 개 모두 집을 수 있을 때만 젓가락을 집을 수 있게 한다
- 비대칭
  - 짝수(홀수) 철학자는 왼쪽(오른쪽) 젓가락부터 집도록 방향을 정해준다

<br />

## 세마포어 예제

---

```c
enum {thinking, hungry, earting} state[5]; // 5명의 철학자들이 가질 수 있는 상태
semaphore self[5] = 0; // 5명의 철학자들이 젓가락 2개를 모두 들 수 있는 지를 판단 (0이면 불가, 1이면 가능)
semaphore mutex = 1; // 5명의 철학자들이 state에 동시에 접근하지 못하도록 상호 배제

do {
    pickup(i); // 젓가락을 든다
    eat(); // 먹는다
    putdown(i); // 젓가락을 내린다
    think(); // 생각한다
} while (1);

void pickup(int i) {
    P(mutex); // state에 lock을 걸고 임계구역에 진입
    state[i] = hungry; // 철학자의 상태를 hungry로 변경
    test(i); // 젓가락 2개를 들 수 있는지 확인하고 가능하면 상태를 eating으로 변경한다
    V(mutex); // state의 lock을 풀고 임계 구역을 빠져나옴
    P(self[i]); // 젓가락 2개를 들 수 없는 상태로 변경
}

void putdown(int i) {
    P(mutex); // state에 lock을 걸고 임계구역에 진입
    state[i] = thinking; // 철학자의 상태를 thinking으로 변경
    test((i + 4) % 5); // 양 옆 철학자가 식사할 수 있는 상태인지 확인하고
    test((i + 1) % 5); // 식사할 수 있는 상태라면 상태를 eating으로 변경해줌 
    V(mutex); // state의 lock을 풀고 임계 구역을 빠져나옴
}

void test(int i) {
    if (state[(i + 4) % 5] != eating && state[i] == hungry && state[(i + 1) % 5] != eating) {
        state[i] = eating;
        V(self[i]); // 젓가락 2개를 들 수 있는 상태로 변경
    }
}
```

<br />

# Monitor

## The problem with semaphores

---

![image](https://user-images.githubusercontent.com/71188307/155874777-d0c177ef-3e39-404a-9197-071fced9340d.png)

<br />

## Concept

---

모니터는 동시 수행중인 프로세스 사이에서 추상 데이터 타입의 안전한 공유를 보장하기 위한 고수준의 동기화 도구이다.

<br />

```c
monitor monitor-name
{
    shared variable declarations
    procedure body P1 (...) {
        ...
    }
    procedure body P2 (...) {
        ...
    }
    procedure body Pn (...) {
        ...
    }
    {
        initialization code
    }
}
```

<br />

프로세스가 공유 데이터에 접근하기 위해서는 위와 같이 모니터 내부의 프로시저를 통해서만 공유 데이터를 접근할 수 있도록 설계한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/155874896-4cbd61d1-35aa-4ccd-860b-63957f0cab39.png)

<br />

예를 들어 공유 데이터들이 있으면 밖에서 아무나 접근할 수 있는 것이 아니라 모니터 내부에 공유 데이터에 접근하는 프로시저를 정의해 놓고 이 프로시저를 통해서만 접근할 수 있게 제어한다.

모니터가 내부에 있는 프로시저는 동시에 여러 개가 실행되지 않도록 통제하는 권한을 준다.

즉, 모니터 내에서는 한 번에 하나의 프로세스만이 활동이 가능하도록 제어하므로 프로그래머 입장에서 lock을 임의로 걸 필요가 없다는 장점이 있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/155874970-5d99706d-9baf-47eb-b92e-fad18ceabf32.png)

<br />

### Producer-Consumer Problem

---

![image](https://user-images.githubusercontent.com/71188307/155875039-5169f69b-f4db-4280-a3c0-f332dc83b82f.png)

<br />

- Producer
  - empty buffer가 없으면 empty buffer를 기다리는 큐에서 대기
  - empty buffer가 있다면 empty buffer에 데이터를 집어넣는다
  - 작업이 끝나면 `full.signal()`을 통해 full buffer를 기다리는 큐에 프로세스 하나를 깨우라고 알림

<br />

- Consumer
  - full buffer가 없으면 full buffer를 기다리는 큐에서 대기
  - full buffer가 있다면 full buffer의 데이터를 꺼내서 *x에 값을 저장한다
  - 작업이 끝나면 `empty.signal()`을 통해 empty buffer를 기다리는 큐에 프로세스 하나를 깨우라고 알림

<br />

## Dining-Philosopher Problem

---

```c
monitor dining_philosopher
{
    enum {thinking, hungry, eating} state[5]; // 5명의 철학자들이 가질 수 있는 상태
    condition self[5]; // 5명의 철학자들이 젓가락 2개를 모두 들 수 있는 지를 판단

    void pickup(int i) {
        state[i] = hungry; // 철학자 자신의 상태를 hungry로 변경
        test(i); // 철학자 자신에게 식사할 수 있는 기회를 준다 (test 함수 참고)
        
        // 식사를 하지 못했다면 상태가 eating으로 변경되지 않았음을 의미한다
        // 따라서 wait 큐에서 대기한다
        if (state[i] != eating) {
            self[i].wait();
        }
    }

    void putdown(int i) {
        state[i] = thinking; // 식사를 마쳤으므로 상태를 thinking으로 변경한다
        test[(i + 4) % 5]; // 자신의 왼쪽 철학자에게 식사할 수 있는 기회를 준다 (test 함수 참고)
        test[(i + 1) % 5]; // 자신의 오른쪽 철학자에게 식사할 수 있는 기회를 준다 (test 함수 참고)
    }

    void test(int i) {
        // 자신의 왼쪽 젓가락과 오른쪽 젓가락을 모두 들 수 있는지 확인
        if ((state[(i + 4) % 5] != eating) && (state[i] == hungry) && (state[(i + 1) % 5] != eating) {
            // 모두 들 수 있다면 수행
            state[i] = eating; // 상태를 eating으로 변경한다 
            self[i].signal(); // wait 큐에서 자신을 깨운다
        }
    }
}

Each Philosopher:
{
    pickup(i);
    eat();
    putdown(i);
    think();
} while (1)
```

<br />
