---
layout: post
category:
    - spring
    - spring-boot
title: 실무용 이벤트 큐 구현
description: |
  Spring Boot에서 Event Queue를 구현하는 방법
image: /assets/img/spring/spring-boot/spring-boot-logo.png
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

# 이벤트 큐

## 실행방법

---

[📦 GitHub - shirohoo/spring-event-queue](https://github.com/shirohoo/spring-boot-examples/tree/main/spring-event-queue)

프로젝트를 클론하고 데이터베이스를 설정한다.

기본적으로 H2 인메모리로 설정돼있다.

서버모드를 사용하겠다면 본인이 사용하고있는 머신에 H2 서버모드 설정을 하고 하기의 주석을 변경하라.

<br />

```yaml
# file: 'application.yaml'
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    # url: jdbc:h2:tcp://localhost/~/test
    username: sa
    password:
```

<br />

이후 프로젝트를 실행하고 웹 브라우저를 열어 주소창에 `localhost:8080/transactions`를 입력하라.

기본적으로 위 주소로 접근시 50번의 거래가 발생하도록 설정돼있다.

만약 단건 요청을 하고 싶다면 주소창에 `localhost:8080/transaction`을 입력하면 된다

서버로 요청을 보낸 후 콘솔창의 로그를 확인하면 다음과 유사한 모습을 볼 수 있을 것이다.

<br />

![queue_console](https://user-images.githubusercontent.com/71188307/147808230-bea4644f-1262-431c-b29a-cf87f865026e.gif)

<br />

## 유스케이스

---

다음과 같은 `유스케이스`가 있다고 가정하자

<br />

1. 사용자가 결제를 요청
2. 컨트롤러가 결제 요청을 받음
3. 사용자 요청의 유효성 검증
4. `STANDBY` 상태의 유효한 결제거래 생성
5. 결제거래를 데이터베이스에 저장
6. 이벤트 퍼블리셔가 결제거래 이벤트를 퍼블리싱
7. 사용자에게 결제거래 요청에 대한 응답을 보내고 HTTP 통신을 종료
8. 발생된 결제거래 이벤트를 이벤트 리스너가 감지하고 결제거래 이벤트에서 결제거래 정보를 추출
9. 큐가 꽉 차있지 않다면 결제거래 정보를 큐에 입력하고 결제거래의 상태를 `QUEUE`로 데이터베이스 업데이트
10. 큐가 꽉 차있다면 상태를 `QUEUE_WAIT`으로 데이터베이스 업데이트
11. 백그라운드 스레드에서 큐에 있는 결제거래들을 처리하고 상태를 `SUCCESS` 혹은 `FAILURE`로 업데이트
12. 결제거래 완료에 대한 후처리를 진행(ex. 결제 결과를 사용자의 앱으로 푸쉬)

<br />

이렇게 비동기로 처리하지 않는다고 가정하면, 거래 처리시간이 길어질때 사용자는 거래가 끝날때까지 거래화면을 쳐다보고 있어야만 한다.

따라서 요청을 받자마자 응답하여 사용자와의 커넥션을 빠르게 끊고, 이후 백그라운드에서 처리를 한 후 사용자에게 응답을 주면 사용자 경험이 더 좋아질 것이다.

이 저장소의 코드는 위의 구조를 구축하기 위한 방법이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147805081-0189c549-dfaf-4d4f-86c2-ca64babfd80b.png)

<br />

## 스레드풀

---

### ThreadPoolTaskExecutor

---

일반적인 작업을 처리할 때 사용할 스레드풀이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147806206-5f3386ec-f93b-4cac-ab40-baec9a29c358.png)

<br />

### ThreadPoolTaskScheduler

---

스케쥴링을 처리할때 사용할 스레드풀이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147806290-f0e1d576-0177-44cd-b556-d7f093a854d7.png)

<br />

## 도메인

---

### Transaction

---

사용자의 요청이 유효하다면 생성시킬 결제거래 객체다.

혹시모를 동시성 이슈를 고려해 불변객체로 설계했다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147805700-2dead34b-7eba-4a7e-997d-6b2a2baeb7cc.png)

<br />

## 이벤트

---

### TransactionEvent

---

유효한 결제거래 객체가 생성되면 생성될 이벤트 객체다.

딱히 없어도 되긴 하지만 간접참조 계층을 만들어두는게 좋을 것 같아 추가했다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147805774-25ef4174-6af6-4e93-981e-077d6fa4ada8.png)

<br />

### TransactionEventQueue

---

결제거래 이벤트가 대기할 큐이다.

구현체는 `LinkedBlockingQueue`로 결정하였다.

이에 대한 이유가 궁금하다면 아래의 아티클을 확인하라.

[📜 LinkedBlockingQueue vs ConcurrentLinkedQueue](https://www.baeldung.com/java-queue-linkedblocking-concurrentlinked)

API는 심플하다.

`큐에 넣는것(offer)`, `큐에서 빼내는것(poll)`이 있으며, 이벤트가 큐에 들어가면 `true`를, 그렇지 않다면 `false`를 반환한다.

여기서 false가 반환됐다는 것은 큐가 가득 찼다는것과 같은 의미이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147806354-5cf38c17-7052-4413-9b70-34d9d2af73ed.png)

<br />

그리고 이벤트 큐를 초기화하여 Bean으로 등록한다.

이때 큐의 사이즈는 `1,000`으로 설정하였다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147806712-63973e0c-de43-4f30-8898-8c4a2622d93f.png)

<br />

### EventPublisher

---

이벤트 객체가 생성되면 이를 `publishing`해주는 역할을 담당한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147805834-14e011d6-256a-41e6-b9ac-8b266bc063c3.png)

<br />

### TransactionEventListener

---

`TransactionEvent`가 `publishing`되면 어떤 처리를 담당할 이벤트 리스너이다.

여기서 처리는 아주 심플하다.

<br />

1. `TransactionEventQueue`에 이벤트를 집어넣어본다.
2. `true`가 반환된다면 데이터베이스속 결제거래의 상태를 QUEUE로 변경하고 작업을 종료한다.
3. `false`가 반환된다면 `true`가 반환될때까지 계속해서 큐에 이벤트를 집어넣어본다. (=큐에 공간이 남을때까지)
4. 이때 이벤트의 상태가 `QUEUE_WAIT`이 아니라면(`=STANDBY`라면) `QUEUE_WAIT`로 데이터베이스를 업데이트한다. 조건문이 있는 이유는 업데이트 쿼리가 계속해서 발생하지 않도록 하기 위함이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147806553-53920532-4824-4af1-9c4a-238ff922a4e5.png)

<br />

### TransactionEventScheduler

---

큐를 polling 할 스케쥴러이다.

단지 주기적으로 `polling`만 하며, 모든 처리를 `TransactionEventWorker`에 위임한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147806822-b0c1bc8a-c97f-4a43-94ac-1c0be743aa1d.png)

<br />

### TransactionEventWorker

---

이벤트를 처리할 워커이다.

순서는 다음과 같다.

<br />

1. 큐 사이즈가 0보다 작다면 큐에 처리할 이벤트가 없다는 의미이므로 아무것도 하지 않는다.
2. 큐 사이즈가 0보다 크다면 큐에서 이벤트를 꺼낸 후 이벤트에서 결제거래 정보를 가져온다.
3. 데이터베이스 속 결제거래의 상태를 `PROGRESS`로 업데이트한다.
4. 모종의 처리를 한다. 여기서는 이 처리가 1초(1000ms) 걸린다고 가정하였다.
5. 처리가 50:50 의 확률로 성공, 혹은 실패된다. 이때 결과에 따라 데이터베이스 속 결제거래의 상태를 `SUCCESS` 혹은 `FAILURE`로 업데이트한다.
6. 작업을 종료한다. (여기서 후속 처리를 진행해도 좋다.)
7. 3~6 작업 중 예외가 발생한다면 즉시 결제거래의 상태를 `FAILURE`로 업데이트하고 작업을 종료한다.

<br />

중요하게 봐야 할 것은, `@Transactional`이 선언돼있는 점이다.

작업을 진행할 때 이미 큐에서 할당량을 꺼내온 상태이므로, 예외가 발생한다면 데이터베이스의 상태를 별도로 업데이트하는 부분이 필요해진다.

왜냐하면 `@Transactional`이 있기 때문에 예외가 발생한다면 롤백이 될 것이다. 즉, `PROGRESS`로 커밋한게 롤백되어 데이터베이스에는 상태가 `PROGRESS`가 아닌 `QUEUE`로 되면서도 큐에 있던 작업은 유실되는 문제가 생길수 있다.

따라서 실무에 사용하려면 이 부분은 별도의 핸들링이 필요하다는 점을 명심하자.

<br />

![image](https://user-images.githubusercontent.com/71188307/147808802-4c92abab-a800-46c9-a1d4-bc1c53057621.png)

<br />

