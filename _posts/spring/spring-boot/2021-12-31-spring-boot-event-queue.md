---
layout: post
category:
    - spring
    - spring-boot
title: 실무용 이벤트 큐 구현
description: |
  `Spring Boot`에서 간단한 `Event Queue`를 구현하는 방법
image: /assets/img/spring/spring-boot/spring-boot-logo.png
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

# 이벤트 큐

## 실행

---

[📦 GitHub - shirohoo/spring-event-queue](https://github.com/shirohoo/spring-boot-examples/tree/main/spring-event-queue){:target="_blank"}

프로젝트를 클론하고 데이터베이스를 설정한다.

기본적으로 H2 인메모리로 설정돼있다.

서버모드를 사용하겠다면 본인이 사용하고있는 머신에 H2 서버모드 설정을 하고 하기의 주석을 변경하라.

애플리케이션이 종료될때 백그라운드 처리가 끝나기 전에 데이터베이스 커넥션이 먼저 닫히지 않도록 `;DB_CLOSE_ON_EXIT=FALSE` 옵션을 추가해주었다.

<br />

```yaml
#application.yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_ON_EXIT=FALSE
    # url: jdbc:h2:tcp://localhost/~/test;DB_CLOSE_ON_EXIT=FALSE
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

### ThreadPoolConfig

---

스케쥴링을 처리할때 사용할 스레드풀이다.

`ThreadPoolTaskScheduler`를 사용할것이고, 주로 더 범용적으로 사용되는 `ThreadPoolTaskExecutor`에 대한 설정도 추가해보았다. (이 코드에서 사용하진 않는다)

<br />

```java
@EnableAsync
@Configuration
@EnableScheduling
public class ThreadPoolConfig {
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();

        // 스케쥴러 스레드풀의 사이즈. 여기서는 머신의 프로세서 수로 하였다.
        taskScheduler.setPoolSize(Runtime.getRuntime().availableProcessors());

        // 로그에 찍힐 스케쥴러 스레드의 접두사
        taskScheduler.setThreadNamePrefix("Scheduler-Thread-");

        // 모든 설정을 적용하고 ThreadPoolTaskScheduler를 초기화
        taskScheduler.initialize();

        return taskScheduler;
    }

    @Bean
    public ThreadPoolTaskExecutor threadPoolTaskExecutor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();

        // 로그에 찍힐 스레드의 접두사
        taskExecutor.setThreadNamePrefix("Async-Thread-");

        // 기본적으로 유지할 스레드풀의 사이즈. 설정값은 머신의 프로세서 수로 하였다.
        taskExecutor.setCorePoolSize(Runtime.getRuntime().availableProcessors());

        // 최대 스레드풀 사이즈
        taskExecutor.setMaxPoolSize(200);

        // 최대 스레드풀 사이즈만큼 스레드가 생성되면 생성을 대기시킬 스레드의 수
        taskExecutor.setQueueCapacity(1_000);

        // MaxPoolSize와 QueueCapacity이상으로 스레드가 생성되야 할 경우의 정책
        // CallerRunsPolicy는 스레드를 생성하고 처리를 위임하려고 한 스레드가 직접 모든 처리를 다하도록 하는 정책
        taskExecutor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        // 어플리케이션 종료시 동작중이던 스레드가 모든 처리를 완료할때까지 대기한 후 종료한다
        taskExecutor.setWaitForTasksToCompleteOnShutdown(true);

        // CorePool 스레드의 유휴시간(기본 60s)이 지나면 kill할지 여부.
        // 기본값은 false이며, true로 설정하면 스레드를 kill한다.
        taskExecutor.setAllowCoreThreadTimeOut(true);

        // 모든 설정을 적용하고 ThreadPoolTaskExecutor를 초기화
        taskExecutor.initialize();

        return taskExecutor;
    }
}
```

<br />

## 도메인

---

### Transaction

---

사용자의 요청이 유효하다면 생성시킬 결제거래 객체다.

혹시모를 동시성 이슈를 고려해 불변객체로 설계했다.

<br />

```java
/**
 * 결제거래를 표현하는 클래스.
 */
@Value(staticConstructor = "of")
public class Transaction {
    Long id;
    TransactionStatus status;

    /**
     * 새로운 결제거래가 생성되어야 할 경우 호출해야 하는 정적 팩토리 메서드.
     * @return STANDBY 상태의 인스턴스를 반환
     */
    public static Transaction create() {
        return Transaction.of(null, TransactionStatus.STANDBY);
    }

    /**
     * 객체의 상태가 업데이트되야 할 경우 새로운 객체를 생성하여 반환한다
     * @param status 업데이트되어야 할 상태
     * @return 상태가 업데이트된 새로운 인스턴스
     */
    public Transaction update(TransactionStatus status) {
        return Transaction.of(id, status);
    }

    /**
     * 객체의 상태가 STANDBY 인지?
     * @return STANDBY라면 true를 반환
     */
    public boolean isStandBy(){
        return status == TransactionStatus.STANDBY;
    }

    /**
     * 객체의 상태가 QUEUE_WAIT 인지?
     * @return QUEUE_WAIT이라면 true를 반환
     */
    public boolean isQueueWait() {
        return status == TransactionStatus.QUEUE_WAIT;
    }

    /**
     * 결제 거래의 상태를 나타내는 enum 클래스
     */
    public enum TransactionStatus {
        STANDBY,
        QUEUE_WAIT,
        QUEUE,
        PROGRESS,
        SUCCESS,
        FAILURE
    }
}
```

<br />

## 이벤트

---

### TransactionEventQueue

---

결제거래 이벤트가 대기할 큐이다.

구현체는 `LinkedBlockingQueue`로 결정하였다.

이에 대한 이유가 궁금하다면 아래의 아티클을 확인하라.

<br />

[📜 LinkedBlockingQueue vs ConcurrentLinkedQueue](https://www.baeldung.com/java-queue-linkedblocking-concurrentlinked)

<br />

API는 심플하다.

`큐에 넣는것(offer)`, `큐에서 빼내는것(poll)`이 있으며, 이벤트가 큐에 들어가면 `true`를, 그렇지 않다면 `false`를 반환한다.

여기서 false가 반환됐다는 것은 큐가 가득 찼다는것과 같은 의미이다.

<br />

```java
@Slf4j
public class TransactionEventQueue {
    private final Queue<Transaction> queue;
    private final int queueSize;

    private TransactionEventQueue(int size) {
        this.queueSize = size;
        this.queue = new LinkedBlockingQueue<>(queueSize);
    }

    public static TransactionEventQueue of(int size) {
        return new TransactionEventQueue(size);
    }

    public boolean offer(Transaction transaction) {
        boolean returnValue = queue.offer(transaction);
        healthCheck();
        return returnValue;
    }


    public Transaction poll() {
        if (queue.size() <= 0) {
            throw new IllegalStateException("No events in the queue !");
        }
        Transaction transaction = queue.poll();
        healthCheck();
        return transaction;
    }

    private int size() {
        return queue.size();
    }

    public boolean isFull() {
        return size() == queueSize;
    }

    public boolean isRemaining() {
        return size() > 0;
    }

    private void healthCheck() {
        log.info("{\"totalQueueSize\":{}, \"currentQueueSize\":{}}", queueSize, size());
    }
}
```

<br />

그리고 이벤트 큐를 초기화하여 Bean으로 등록한다.

이때 큐의 사이즈는 `1,000`으로 설정하였다.

<br />

### EventPublisher

---

이벤트 객체가 생성되면 이를 `publishing`해주는 역할을 담당한다.

<br />

```java
@Component
@RequiredArgsConstructor
public class EventPublisher {
    private final ApplicationEventPublisher publisher;

    public void publish(Transaction transaction) {
        publisher.publishEvent(transaction);
    }
}
```

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

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionEventListener {
    private final TransactionEventQueue eventQueue;
    private final TransactionRepository repository;

    @EventListener
    public void onEvent(Transaction transaction) {
        if (!transaction.isStandBy()) {
            log.info("Transaction(id:{}) status is not STANDBY!", transaction.getId());
            return;
        }

        while (eventQueue.isFull()) {
            if (!transaction.isQueueWait()) {
                transaction = updateStatus(transaction, TransactionStatus.QUEUE_WAIT);
            }
        }
        transaction = updateStatus(transaction, TransactionStatus.QUEUE);
        eventQueue.offer(transaction);
    }

    private Transaction updateStatus(Transaction transaction, TransactionStatus status) {
        TransactionStatus beforeStatus = transaction.getStatus();
        Transaction updatedTransaction = transaction.update(status);
        log.info("{\"transactionId\": {},\"before\":\"{}\", \"after\":\"{}\"}", transaction.getId(), beforeStatus, status);
        return repository.update(updatedTransaction);
    }
}
```

<br />

### TransactionEventScheduler

---

큐를 polling 할 스케쥴러이다.

단지 주기적으로 `polling`만 하며, 모든 처리를 `TransactionEventWorker`에 위임한다.

<br />

```java
@Component
@RequiredArgsConstructor
public class TransactionEventScheduler {
    private final TransactionEventQueue eventQueue;
    private final TransactionRepository repository;

    @Async("taskScheduler")
    @Scheduled(fixedRate = 100)
    public void schedule() {
        new TransactionEventWorker(eventQueue, repository)
            .run();
    }
}
```

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

```java
@Slf4j
@RequiredArgsConstructor
public class TransactionEventWorker implements Runnable {
    private final TransactionEventQueue eventQueue;
    private final TransactionRepository repository;

    @Override
    @Transactional
    public void run() {
        if (eventQueue.isRemaining()) {
            Transaction transaction = eventQueue.poll();
            try {
                transaction = updateStatus(transaction, TransactionStatus.PROGRESS);
                processing(1_000);
                successOrFailure(transaction);
            } catch (Exception e) {
                handlingInCaseOfFailure(transaction);
                log.error(e.getMessage());
            }
        }
    }

    private void processing(int processingTimeInMs) {
        try {
            Thread.sleep(processingTimeInMs);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void successOrFailure(Transaction transaction) {
        if (Math.random() < 0.5) {
            updateStatus(transaction, TransactionStatus.SUCCESS);
        } else {
            updateStatus(transaction, TransactionStatus.FAILURE);
        }
    }

    private void handlingInCaseOfFailure(Transaction transaction) {
        updateStatus(transaction, TransactionStatus.FAILURE);
    }

    private Transaction updateStatus(Transaction transaction, TransactionStatus status) {
        TransactionStatus beforeStatus = transaction.getStatus();
        Transaction updatedTransaction = transaction.update(status);
        log.info("{\"transactionId\": {},\"before\":\"{}\", \"after\":\"{}\"}", transaction.getId(), beforeStatus, status);
        return repository.update(updatedTransaction);
    }
}

```

<br />

