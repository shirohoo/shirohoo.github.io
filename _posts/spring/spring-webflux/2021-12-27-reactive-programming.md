---
layout: post
category:
  - spring
  - spring-webflux
title: Reactive Programming
description: |
  반응형 프로그래밍에 대한 정리
image: /assets/img/spring/spring-webflux/spring-webflux.jpg
related_posts:
  - _posts/spring/spring-security/2021-05-02-authentication.md
  - _posts/spring/spring-security/2021-08-30-rest-login.md
published: true
---

* toc
{:toc}
  
<br />

# Reactive Programming

---

`반응형 프로그래밍`의 사전적인 정의를 찾아보면 <u>비동기 데이터 스트림을 이용한 프로그래밍이라고 한다.</u>

역시 이런 전형적인 교과서적인 정의는 잘 이해도 안되고 왠지모를 거부감만 잔뜩 생긴다.

<br />

우선 반응형 프로그램이 무엇인지에 대해 알아보기 전에 이것을 왜 사용해야 하는지, 사용하면 어떤 문제를 해결 할 수 있는지를 알아봤다.

<br />

1. 여러 유저가 보고있는 게시글에 누군가가 좋아요를 누를 경우 해당 게시글을 보고있는 유저들이 새로고침을 하지 않더라도 그들이 보고있는 화면속 좋아요가 동시에 1만큼 증가한다
2. 메일이 오면 실시간으로 새로운 메일이 표시된다
3. 누군가 댓글을 달면 해당 글을 보고있는 사람들에게 새로운 댓글이 실시간으로 보여진다

<br />

이런것들이 가능해진다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147461619-cb1c5626-0706-4e2c-a8ea-643ef3928c73.png)

이정도면 군침이 싹 돈다.
{:.figcaption}

<br />

자바 개발자들이 주로 사용하는 `Spring MVC`를 보자.

<br />

![image](https://user-images.githubusercontent.com/71188307/147461878-e4e46fc8-ee50-4b38-b4d9-eead42a42d54.png)

발퀄 그림 ㅈㅅ...
{:.figcaption}

<br />

스프링으로 개발하는 전형적인 웹 어플리케이션의 구조이다.

<br />

1. 브라우저가 서버로 어떤 요청을 보낸다
2. 서버는 RDBMS에 쿼리한다
3. 데이터가 너무 많고, 쿼리가 비효율적이여서 RDBMS에서 30초가 걸렸다
4. 서버는 RDBMS에 요청을 보낸 후 30초동안 놀고있다가 RDBMS의 응답을 받았다
5. 서버는 RDBMS에서 받은 응답을 브라우저에 전달했다

<br />

이때 문제가 무엇인가?

최소한 두가지의 문제가 있다.

<br />

1. 반드시 `먼저` 물어봐야만 한다
2. 물어봤다면 답이 나올때까지 `손가락 빨며 기다려야만 한다`

<br />

즉, RDBMS에 요청을 보낸 후(물어봄) 기다리는 30초동안 다른 일을 할 수 없다는 것이다.(정확히는 스레드가)

이러한 방식을 `동기+블로킹 방식`이라고 볼 수 있다.

이러한 방식을 사용할때 위 문제를 해결하기 위해 스레드를 이빠이 만들어놓고(_**톰캣의 기본 스레드는 200개다**_) `시분할(Time Sharing)` 처리를 한다.

이에 대한 설명은 아래 그림을 보자.

<br />

![image](https://user-images.githubusercontent.com/71188307/147462440-ad1aacc3-6b98-41aa-937a-9df5b45f24f1.png)

<br />

예를 들어 커다란 담벼락을 3분할하여 각각 `빨간색`, `초록색`, `파란색` 페인트를 칠해야한다고 가정해보자.

이때 가장 효율적인 방법은 빨간색 페인트를 쭉 칠하고, 페인트를 초록색으로 바꾼다.

이후 초록색을 쭉 칠하고 페인트를 파란색으로 바꾼다.

이렇게 하면 <u>페인트를 단 두번만 교체하면 된다.</u>

그리고 여기서 페인트를 교체하는 작업이 바로 컴퓨터과학에서 말하는 `컨텍스트 스위칭(Context Switching)`이라고 볼 수 있겠다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147462586-b94821b0-4cea-4b17-9ecf-ee02f99115df.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/147462664-0e9f70a6-0022-42e0-b0fe-87c38088364e.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/147462724-f5582960-147b-44c0-a04d-182c6f84c583.png)

<br />

이 개념을 우리가 개발하는 웹 어플리케이션에 그대로 대입해보자.

사용자에게 보여줘야 할 화면이 크게 3분할 (헤더, 바디, 푸터) 돼있다고 가정하면, 사용자는 헤더가 다 그려지기 전까지는 바디와 푸터를 볼수가 없다.

마찬가지로 헤더가 다 그려지고 나면 바디를 그리기 시작할것이므로 푸터를 보기까지 한참이 걸린다.

이러한 것은 `사용자 경험(UX)`에 굉장히 치명적이다.

사용자님들은 참을성이 부족하기 때문이다.

그래서 이 문제를 아래와 같이 해결했다.

<br />

![image](https://user-images.githubusercontent.com/71188307/152805576-1cefe8c4-779f-41c1-98b2-2ba210e8ad96.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/152805450-6d9df712-7740-4a9f-b45f-8b2916116ab0.png)

<br />

...

<br />

![image](https://user-images.githubusercontent.com/71188307/152805925-61c9f5fd-a8c1-4acd-b720-7b245b58535d.png)

<br />

위에서는 페인트 교체를 2번해서 담벼락을 다 칠했는데, 여기서는 벽을 조금 칠하고 페인트를 바꿔서 다른 벽을 칠하는 식으로 모든 벽을 동시에 칠했다.

그래서 페인트를 14번이나 교체하고서야 벽을 다 칠할수 있었다.

<br />

정말 정신나간 짓이지만, 현대 하드웨어의 정신나간 성능과 조금이라도 더 좋은 사용자 경험을 위해서라면 충분히 할 수 있는 짓이기도 하다.

이것이 현재 `Spring MVC`가 동작하는 방식이다.

<br />

그럼 비동기 방식의 `WebFlux`는 어떻게 동작할까?

<br />

![image](https://user-images.githubusercontent.com/71188307/147468147-0eb424f1-f766-40a5-a5e2-fe60374f8b09.png)

<br />

몇가지 작업이 더 있지만 우선 큰 틀은 위와 같다.

서버는 다른 시스템에 작업을 맡긴 후 해당 작업이 끝날때까지 목빼고 기다리고 있지 않는다.

단지 작업을 맡긴 후 <u>"작업 다 끝나면 나한테 알려줘. 나는 다른거 하고 있을게."</u> 라고 할 뿐이다.

따라서 <u>서버는 다른 시스템에 어떤 작업을 맡겼는지 반드시 기억하고 있어야만 한다.</u>

이러한 작업들을 `이벤트(Event)`라고 부르며, 이러한 작업들을 저장해놓는 공간을 `이벤트 루프(Event Loop)` 라고 부른다.

<br />

![image](https://user-images.githubusercontent.com/71188307/147468587-d67ec008-ef6e-4c6b-97a6-8acc111aa1f7.png)

`RDBMS`는 기본적으로 비동기를 지원하지 않는다. 이러한 특징으로 인해 `JPA(Hibernate)` 역시 비동기를 지원하지 않으며, 이러한 문제를 해결하기 위해 `Spring R2DBC` 라는것이 나왔다.
{:.figcaption}

<br />

하지만 여기서 문제가 있다.

우리가 사용하는 `HTTP 프로토콜`은 기본적으로 `무상태성(stateless)`을 지향하므로, `요청(Request)`과 이에 대응되는 `응답(Response)`이 이루어지면 <u>연결이 끊어진다.</u>

<u>따라서, 위 그림의 플로우가 끝나고 나면 서버가 브라우저에 능동적으로 무언가를 전해줄수가 없게된다.</u>

즉, HTTP 프로토콜이 아닌 다른 방식이 필요해지는 것이다.

<br />

# SSE(Server Sent Events)

---

![image](https://user-images.githubusercontent.com/71188307/147470098-a53d89c9-6b4b-428a-8e26-f32b9ee0f595.png)

<br />

클라이언트에게 요청을 받으면 서버는 언제든지 클라이언트에 추가적인 응답을 줄 수 있게 `응답용 커넥션`을 남겨둔다.

단, 이때 클라이언트에서 보내온 요청 커넥션은 끊어버린다.

이를 `SSE 프로토콜`이라 하며, 콜백이 발생했을 때 클라이언트로 응답을 보내주기 위해 남겨둔 응답용 커넥션을 `스트림(흐름, Stream)`이라고 부른다.

<br />

소켓과 SSE의 차이라고 할 수 있는 부분이다. 소켓은 요청, 응답 커넥션이 모두 존재한다. 실시간 채팅을 연상하면 조금 더 이해가 수월할 것 같다.
{:.note}

<br />

그리고 이 `스트림`의 동의어가 바로 `Flux`이다. _**(Spring WebFlux의 Flux가 맞다)**_

또한 `Flux`와 `Mono`는 `Reactor` 에서 정의한 `Publisher` 인터페이스의 구현체이기도 한데, 두 구현체의 차이는 다음과 같다.

<br />

- Flux: 0...N 을 표현
- Mono: 0...1 을 표현

<br />

이렇게 보니 무슨말인지 잘 모르겟다. 코드를 보자.

코드로 보 다음과 같다고 할 수 있다.

일단 단일 객체를 반환하는것을 `Mono`로 표현할수 있는데 `Java 8`의 `Optional`로 비교해보자.

<br />

```java
public Optional<Person> findById(Long id) {
    if(map.contains(id)) {
        return Optional.of(map.get(id));
    }
    return Optional.empty();
}
```

<br />

이를 `Mono`로 표현하면 다음과 같다.

<br />

```java
public Mono<Person> findById(Long id) {
    if(map.contains(id)) {
        return Mono.just(map.get(id));
    }
    return Mono.empty();
}
```

<br />

`Flux`는 `Collection` 혹은 `Stream` 이라고 볼수 있을 것 같다. (하지만 무한일지도 모르는...?)

역시 코드로 보자.

<br />

```java
public Stream<Person> findAll() {
    return Stream.of(
        new Person("james"),
        new Person("charles)
    );
}
```

<br />

이를 `Flux`로 표현하면,

<br />

```java
public Flux<Person> findAll() {
    return Flux.just(
        new Person("james"),
        new Person("charles)
    );
}
```

<br />

일단 기초적인 컨셉은 이렇게 이해를 하였으니, 차차 API도 구성해보면서 더 깊게 알아봐야겠다.

<br />
