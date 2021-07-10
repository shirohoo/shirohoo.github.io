---
layout: post
category:
    - backend
    - test
date: 2021-01-15 16:14
title: JUnit 5 Life Cycle
description: >
    `JUnit 5` 생명주기에 대한 이해
image: /assets/img/backend/test-logo.png
related_posts:
    - 
---

* toc
{:toc}
  
&nbsp;  

> 📜 참고 - [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)

&nbsp;  

# 📕 JUnit 5 Life Cycle

JUnit은 객체의 생명주기(Life Cycle) 관리를 지원한다.

이 기능을 이용하면 각 테스트 케이스마다 새로운 객체를 생성해주므로

각 테스트 케이스의 독립성을 확보 할 수 있다.

&nbsp;  

```java
// file: 'WhatJUnit.class'
@DisplayName("JUnit은 어떻게 돌아갈까?")
public class WhatJUnit extends SpringbootApplicationTests {
    @BeforeAll
    @DisplayName("BeforeAll Method")
    public static void beforeAll() {
        System.out.println("BeforeAll.............!");
    }

    @BeforeEach
    @DisplayName("BeforeEach Method")
    public void init() {
        System.out.println("init...........!");
    }

    @Test
    @DisplayName("첫번째_테스트 Method")
    public void 첫번째_테스트() {
        System.out.println("test1 run..........!");
    }

    @Test
    @DisplayName("두번째_테스트 Method")
    public void 두번째_테스트() {
        System.out.println("test2 run..........!");
    }

    @AfterEach
    @DisplayName("AfterEach Method")
    public void exit() {
        System.out.println("exit...........!");
    }

    @AfterAll
    @DisplayName("AfterAll Method")
    public static void afterAll() {
        System.out.println("AfterAll.............!");
    }
}
```

&nbsp;  

`@DisplayName`은 각 요소에 일종의 이름표를 붙여주는 기능을 한다.

`@BeforeAll`은 모든 테스트가 시작하기전에 딱 한 번만 실행되는 메소드다.

이곳에서 초기화 같은 작업을 해주면 좋다.

여기서 주의해야 할 점은 `@BeforeAll`은 반드시 `static`을 명시해줘야한다.

왜냐하면 JUnit은 각 테스트 케이스마다 새로운 객체를 생성해서

각 케이스간의 독립성을 얻기 때문에 테스트 케이스간 정보의 공유가 안된다.

실제로 [JUnit5 docs](https://junit.org/junit5/docs/current/user-guide/)에는 이 애노테이션은 반드시 `static`으로 사용하라고 되어있다.

&nbsp;  

`@AfterAll`은 반대로 모든 테스트가 종료되면 마지막으로 딱 한번 실행되는 메소드다.

마찬가지로 모든 자원의 반납 같은 기능을 작성하면 좋겠다.

이 역시 마찬가지로 `static`으로 선언해야만 한다.

`@BeforeEach`는 `JUnit4`의 `@Before`와 같은 기능을 한다.

테스트 케이스가 실행되기 전에 실행될 코드를 작성하면 된다.

각 테스트 케이스가 실행되기직전에 한번 실행된다.

&nbsp;  

`@AfterEach`는 JUnit4의 `@After`와 같은 기능을 한다

테스트 케이스가 끝난 후 실행될 코드를 작성하면 된다.

각 테스트케이스가 실행된 후에 한번 실행된다.

&nbsp;  

`@Test`는 테스트의 단위를 뜻한다.

&nbsp;  

우선 실행 순서를 보자면

&nbsp;  

1. `@BeforeAll` 실행
2. `@BeforeEach` 실행
3. 첫번째 `@Test` 실행
4. `@AfterEach` 실행
5. 모든 `@Test`가 완료될 때까지 2~4를 반복
6. `@AfterAll` 실행
7. 테스트 종료

&nbsp;  

그러면 예상되는 출력값은

&nbsp;  

> BeforeAll.............!  
> init...........!  
> test1 run..........!  
> exit...........!  
> init...........!  
> test2 run..........!  
> exit...........!  
> AfterAll.............!

&nbsp;  

이다.

테스트를 진행해보자.

&nbsp;  

```shell
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v2.4.1)
BeforeAll.............!
2021-01-15 16:05:18.561  INFO 4104 --- [    Test worker] com.springboot.service.WhatJUnit         : Starting WhatJUnit using Java 11.0.8 on Changhoon-Han with PID 4104 (started by Han in D:\Project\springboot)
2021-01-15 16:05:18.563  INFO 4104 --- [    Test worker] com.springboot.service.WhatJUnit         : No active profile set, falling back to default profiles: default
2021-01-15 16:05:19.527  INFO 4104 --- [    Test worker] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2021-01-15 16:05:19.846  INFO 4104 --- [    Test worker] com.springboot.service.WhatJUnit         : Started WhatJUnit in 1.453 seconds (JVM running for 2.333)
init...........!
test1 run..........!
exit...........!
init...........!
test2 run..........!
exit...........!
AfterAll.............!
2021-01-15 16:05:20.169  INFO 4104 --- [extShutdownHook] o.s.s.concurrent.ThreadPoolTaskExecutor  : Shutting down ExecutorService 'applicationTaskExecutor'
BUILD SUCCESSFUL in 3s
4 actionable tasks: 2 executed, 2 up-to-date
오후 4:05:20: 작업 실행이 완료되었습니다 ':test --tests "com.springboot.service.WhatJUnit"'.
```

&nbsp;  

예상과 같은 결과값이 나온다.

이번엔 `@DisplayName`이 어떻게 동작하는지 확인해보자.

&nbsp;  

```java
 @Test
 @DisplayName("두번째_테스트 Method")
 public void 두번째_테스트() {
   assertEquals(1, 0);
   System.out.println("test2 run..........!");
 }
```

&nbsp;  

`두번째\_테스트()` 가 실패하게끔 코드를 작성한다.

&nbsp;  

```shell
2021-01-15 16:11:36.472  INFO 9700 --- [extShutdownHook] o.s.s.concurrent.ThreadPoolTaskExecutor  : Shutting down ExecutorService 'applicationTaskExecutor'
JUnit은 어떻게 돌아갈까? > 두번째_테스트 Method FAILED
    org.opentest4j.AssertionFailedError at WhatJUnit.java:32
2 tests completed, 1 failed
> Task :test FAILED
```

&nbsp;  

달아준 이름표대로 콘솔에 로그가 출력된다.

&nbsp;  
