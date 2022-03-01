---
layout: post
category:
  - cs
  - operating-system
title: 운영체제(Operating System) 2강
description: |
    반효경 교수님 - Process & Thread
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - _posts/cs/operating-system/2022-02-07-operating-system.md
  - _posts/cs/operating-system/2022-02-16-process-management.md
published: true
---

* toc
{:toc}

<br />

# Lecture

---

- [운영체제 - 반효경 교수님](http://www.kocw.or.kr/home/cview.do?mty=p&kemId=1046323)
    - Process 1
    - Process 2
    - Process 3

<br />

# Process

---

프로그램은 보조기억장치에 저장돼있는 코드 덩어리이며, 프로세스는 메모리에 올라간 프로그램이다.

보조기억장치에 실행 파일 형태로(exe, jar 등) 존재하던 프로그램이 메모리에 올라가면 비로소 CPU를 할당받을 수 있는 자격을 얻게된다.

<br />

## Context

---

프로세스가 실행돼서 종료될 때까지 항상 CPU에서 명령을 처리하면 좋겠지만, 여러 프로세스가 함께 수행되는 시분할 환경에서는 각 프로세스들이 CPU를 자주 빼앗기고 획득하게 된다.

따라서 CPU를 다시 획득해 명령의 수행을 재개하는 시점이 되면, CPU를 빼앗기기 전에 어느 부분까지 명령을 수행했는지 정확한 프로세스의 상태를 재현할 필요가 있다.

이때 정확한 재현을 위해 필요한 정보가 바로 프로세스의 `문맥(Context)`이다.

즉, 프로세스의 문맥은 프로세스의 메모리(Stack, Data, Code)를 비롯해 CPU 레지스터에 저장된 데이터, 시스템 콜을 통해 커널에서 수행한 작업들의 현황, 프로세스에 대해 커널이 관리하고 있는 각종 정보 등을 포함하게 된다.

프로세스의 문맥은 3가지로 나눌 수 있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/153720072-8915b2dd-3d44-4bf2-8cf5-6751ed7370f4.png)

<br />

### Hardware context

---

CPU에 저장된 여러 데이터들을 의미한다. (프로그램 카운터, 레지스터 등등등)

<br />

### Process memory

---

Stack, Data, Code에 들어 있는 데이터들을 의미한다.

<br />

### Process-related kernel data structures

---

**PCB (Process Control Block)**

PCB는 운영 체제가 프로세스에 대한 관리를 위해 프로세스의 모든 정보를 저장하는 자료구조이다.

PCB는 운영 체제의 메모리에 위치한다.

<br />

## State of the process

---

프로세스의 상태는 계속해서 변경된다.

<br />

- 실행 (Running)
    - CPU를 할당받아 명령이 처리되고 있는 상태
- 준비 (Ready)
    - 메모리에 프로그램이 올라가 있으며, CPU를 할당받기 위해 대기하고 있는 상태
- 봉쇄 (Blocked, Wait, Sleep)
    - 메모리에 프로그램이 올라가 있지만, CPU를 할당받더라도 당장 명령을 실행할 수 없는 상태
    - 프로세스가 요청한 이벤트(I/O 등)가 완료 되지 않아 이를 기다리는 상태
- 시작 (New)
    - 프로세스가 생성 중인 상태
- 완료 (Terminated)
    - 프로세스가 종료되는 상태

<br />

추후 중기 스케쥴러가 등장하며 `Suspended` 상태가 추가된다.

<br />

### State diagram of the process

---

![image](https://user-images.githubusercontent.com/71188307/153720322-d70035ed-a3e2-4f7d-9c63-603cd01ed7f1.png)

- 프로세스가 생성되면 `New` 에서 `Ready` 가 된다.
- `Ready` 에서 CPU를 할당받으면 `Running` 이 된다.
- CPU 얻은 상태에서 내려 놓는 경우
    - `Running` → `Terminated` : 본인의 역할을 다하면 종료됨
    - `Running` → `Waiting` : I/O 같은 작업을 하면, CPU가 `Blocking` 되어 명령을 수행할 수 없으므로 `Waiting` 이 된다.
    - `Running` → `Ready` : `Timer`에 지정 된 CPU 사용시간이 끝나면 `Ready` 가 된다.

<br />

### Example of a process state transition

---

![image](https://user-images.githubusercontent.com/71188307/153720472-f393c3bc-00b9-413d-a1bb-3d9e9bde887f.png)

<br />

놀이동산에서 기구별로 줄 서서 타는것을 생각하면 이해가 편하다.

즉, 사람이 프로세스이며 각 장치들이 놀이동산 기구라고 생각하면 된다.

<br />

## Process Control Block (PCB)

<br />

![image](https://user-images.githubusercontent.com/71188307/153720560-37ceec4a-d487-4bc6-ba08-89d7c5d51717.png)

<br />

PCB란 운영 체제가 프로세스들을 관리하기 위해 각 프로세스들의 정보를 담는 커널 내의 자료구조이다.

<br />

## **`Context Switch`**

<br />

`문맥 교환`이란 하나의 사용자 프로세스로부터 다른 사용자 프로세스로 CPU의 제어권을 넘겨주는 과정으로, CPU의 현재 상태, 프로세스의 현재 상태들을 모두 정리하여 PCB에 저장한 후 캐시 메모리를 비우는 작업이 진행된다.

즉, 오버헤드가 무지막지하게 크게 발생하기 때문에 프로그램 개발 시 이것으로 인해 성능 저하가 매우 크게 일어나므로 아주 중요한 개념이라고 생각된다.

<br />

![문맥교환1](https://user-images.githubusercontent.com/71188307/153720075-03af307f-187b-4bce-8c56-15eb95082618.JPG)

<br />

사용자 프로세스가 CPU를 할당 받고 실행되던 중에 타이머 인터럽트가 발생하면 CPU의 제어권이 운영체제에게 넘어가게 된다.

운영 체제는 ISR을 통해 타이머 인터럽트 처리를 시작하며, 직전까지 수행 중이던 프로세스의 모든 상태를 PCB에 저장하고 `Ready` 상태의 프로세스에게 CPU의 제어권을 넘긴다.

이 과정에서 원래 수행 중이던 프로세스는 `Running`->`Ready`등의 상태로 바뀌고 새롭게 CPU를 할당 받은 프로세스는 `Ready`->`Running` 상태가 된다.

문맥 교환 중 원래 CPU를 할당받았던 프로세스는 자신의 모든 상태를 자신의 PCB에 저장하고, 새롭게 CPU를 할당 받은 프로세스는 예전에 저장했던 자신의 상태를 자신의 PCB로부터 불러오는 과정을 거친다.

<br />

### 시스템 콜이나 인터럽트가 발생하면 항상 문맥 교환이 일어나는가?

---

아니다

<br />

![문맥교환2](https://user-images.githubusercontent.com/71188307/153720076-1aeaf8ad-98bd-4f20-ab9a-1ecf3a80e720.JPG)

<br />

1번의 경우는 프로세스가 `Running` 상태일 때 `시스템 콜`이나 `인터럽트`가 발생하여 CPU의 제어권이 운영 체제로 넘어가 프로세스가 잠시 멈추고 운영 체제의 함수가 실행된 경우다.

이 경우에도 프로세스의 문맥 중 일부를 PCB에 저장한다.

하지만, 프로세스는 계속 `Running`인 상태에 `Mode bit`를 통해 실행 모드가 `사용자 모드`에서 `커널 모드`로 바뀌는 것일 뿐이고, CPU를 점유하는 프로세스가 다른 사용자 프로세스로 변경되는 것이 아니므로 이는 문맥 교환이 아니다.

2번의 경우는 `타이머 인터럽트`가 발생하거나 프로세스가 `Blocked` 상태가 된 경우다.

이 때는 운영 체제의 관리를 통해 다른 사용자 프로세스에게 CPU의 제어권을 넘기게 되므로 문맥 교환이 발생한다.

<br />

## Ready Queue & various Device Queue

---

![레디큐와다양한큐](https://user-images.githubusercontent.com/71188307/153720078-45238949-1d6d-4cde-bcd1-0063f6015fd2.JPG)

<br />

### Job Queue

---

현재 시스템 내에 있는 모든 프로세스 집합으로 `Ready Queue` 와 `Device Queues`를 모두 포함하는 개념이다.

<br />

### Ready Queue

---

상태가 `Ready`인 프로세스의 집합이다.

<br />

### Device Queues

---

상태가 `Blocked`인 프로세스의 집합이다.

<br />

## CPU Scheduler

---

스케줄러란 어떤 프로세스에게 CPU를 할당할지를 결정하는 운영 체제 함수를 의미한다.

스케줄러에는 3가지 스케줄러가 존재한다.

<br />

### Long-Term Scheduler (장기 스케줄러 or Job scheduler)

---

- `New` 상태의 프로세스들 중 어떤 것들을 `Ready Queue`로 보낼지 결정한다.
- 프로세스에 메모리를 할당하는 문제에 관여한다.
- `degree of Multiprogramming`을 제어. 메모리에 프로세스가 10개 올라가있다면 `degree of Multiprogramming` 는 10이다.
- `degree of Multiprogramming`이 너무 낮아도 CPU 효율이 제대로 안나오고(CPU가 놀아서), 너무 높아도 효율이 안나온다(컨텍스트 스위칭 등).
- 현대의 시분할 시스템에는 보통 장기 스케줄러가 없다. `New` 상태의 프로세스는 전부 `Ready Queue`에 삽입한다.

<br />

### Short-Term Scheduler (단기 스케줄러 or CPU scheduler)

---

- 어떤 프로세스를 다음 번에 `Running` 할지 결정
- 프로세스에 CPU를 주는 문제
- 충분히 빨라야 한다. (ms 단위)

<br />

### Medium-Term Scheduler (중기 스케줄러 or Swapper)

---

- 메모리 여유 공간 마련을 위해 프로세스를 통째로 디스크의 스왑 영역으로 밀어낸다. (Swap Out)
- 장기 스케쥴러가 없는 시스템(현대의 컴퓨터 시스템)에서 `degree of Multiprogramming`을 제어
- 주로 `Blocked` 상태에 있는 프로세스들을 `Swap out`하고, 그래도 메모리 공간이 부족하면 `Ready Queue` 후반부에 있는 프로세스들을 `Swap out`한다.

<br />

## State diagram of the process with Suspended added

---

중기 스케줄러의 등장으로 인해 프로세스의 상태에는 `New`, `Ready`, `Running`, `Blocked`, `Terminated` 외에 하나의 상태가 더 추가된다.

외부적인 이유로 프로세스의 수행이 정지된 상태를 나타내는 `중지(Suspended or Stopped)` 상태가 바로 그것이다.

중지 상태에 있는 프로세스는 외부에서 재개해야만 다시 활성화될 수 있다.

이 중지 상태의 프로세스는 메모리를 조금도 할당받지 못한 `swap out`된 프로세스라고 생각하면 된다.

<br />

![image](https://user-images.githubusercontent.com/71188307/153721798-1926060a-fa3d-4802-aae9-448d47364b26.png)

<br />

`중지 상태`는 `중지 준비 상태`와 `중지 봉쇄 상태`로 세분화할 수 있다.

`Ready` 상태에 있던 프로세스가 중기 스케줄러에 의해 디스크로 `swap out`되면 이 프로세스의 상태는 `중지 준비 상태`가 된다.

이에 비해 `Blocked` 상태에 있던 프로세스가 중기 스케줄러에 의해 `swap out`되면 이 프로세스의 상태는 `중지 봉쇄 상태`가 된다.

참고로 중지 봉쇄 상태이던 프로세스가 봉쇄되었던 조건을 만족하게 되면 중지 준비 상태로 바뀐다.

<br />

# Thread

---

## 정의

프로세스 내에서 실행 되는 작업 흐름의 단위, 혹은 프로세스가 할당 받은 자원을 이용하는 실행 흐름의 단위를 뜻한다.

## 구성

![image](https://user-images.githubusercontent.com/71188307/153738921-696d66ac-a7d2-4ac0-be01-5a3e58730292.png)

<br />

각 스레드마다 각자 CPU 관련 정보들을 가지고 있다.

<br />

## The part that one thread shares with other threads

---

![image](https://user-images.githubusercontent.com/71188307/153738962-11d18c58-ae21-43ee-873a-91641e44095e.png)

<br />

- Code section
- Data section
- OS resources

각 스레드는 프로세스의 `Data`, `Code` 영역을 공유하며, `Stack`은 스레드 별로 별도로 할당 받는다.

PCB에서는 프로그램 카운터와 레지스터 셋을 제외한 프로세스 관련 정보를 모두 공유한다.

여기서 스레드들이 공유하는 부분인 `Code section`, `Data section`, `OS resources`를 `task`라고 한다.

그래서 전통적인 개념의 `heavyweight process`는 하나의 스레드를 가지고 있는 task라고 볼 수 있다.

<br />

## 장점

- ### 응답성 (Responsiveness)

멀티 스레드로 구성된 프로세스에서 하나의 스레드가 `Blocked` 상태인 동안에도 동일한 프로세스내의 다른 스레드가 실행되어 프로세스간의 문맥 교환 없이 즉시 처리가 가능하다.

예를 들어 웹 브라우저가 스레드를 여러 개 가지고 있을 때, 하나의 스레드는 이미지등의 데이터를 받기 위해 서버에 I/O 요청을 걸어서 `Blocked` 된 후, 다른 스레드가 이미 받아 놓은 HTML을 화면에 출력할 수 있다.

이렇게 멀티 스레딩을 통한 NIO를 통해 응답성을 높일 수 있다.

<br />

- ### 자원 공유 (Resource Sharing)

하나의 프로세스 안에 여러 스레드를 두게 되면 스레드 간 Code, Data, Resource 를 공유하여 효율적으로 자원 활용이 가능하다.

즉, 한 프로세스 내에서 I/O 작업을 하더라도 프로세스간의 문맥 교환을 일으키지 않으면서 연속적으로 작업을 처리할 수 있다.

<br />

- ### 경제성 (Economy)

동일한 일을 수행하는 여러 스레드가 협력하여 높은 `처리율(throughput)`과 성능 향상을 얻을 수 있다.

또한, 새로운 스레드를 만드는 것은 새로운 프로세스 하나를 만드는 것 보다 훨씬 오버헤드가 적다.

그리고, 스레드 끼리는 프로세스의 Code, Data, Resource 영역을 공유하므로 각자 Stack 영역만 처리하면 되고, 하나의 스레드가 I/O 작업으로 인해 `Blocked` 되더라도 다른 스레드가 CPU를 할당받아 작업을 진행하면 되기 때문에 I/O 작업시 발생하는 비싼 비용의 프로세스 문맥 교환도 일어나지 않으며, 이 때 발생하는 CPU의 캐시 메모리를 초기화할 필요도 없어진다.

즉, 캐시도 훨씬 더 효율적으로 사용할 수 있게 된다. (캐시 히트율)

<br />

- ### 멀티 프로세서 아키텍처에서의 이용성 (Utilization of MP Architectures)

각각의 스레드가 서로 다른 CPU를 할당받아 병렬적으로 작업을 진행해 더 빠르게 작업을 수행할 수 있다.

- 단점
    - 자원의 공유로 인한 동시성 문제가 발생할 수 있다.
    - 절차적이지 않기 때문에 디버깅이 어렵다.
    - 작업량이 너무 적거나 작업을 쪼개기 어려운 경우 `포크&조인`으로 인한 오버헤드가 더 커져 오히려 더 느려질수도 있다.

<br />
