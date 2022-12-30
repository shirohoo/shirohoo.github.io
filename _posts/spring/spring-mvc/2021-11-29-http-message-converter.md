---
layout: post
category:
    - spring
    - spring-mvc
title: HttpMessageConverter
description: >
    `Spring MVC`의 `HttpMessageConverter` 가 하는 일
image: /assets/img/spring/spring-mvc/spring-mvc-logo.png
related_posts:
    - _posts/spring/spring-mvc/2021-11-23-argument-resolver.md
---

* toc
{:toc}

<br />

- **코드는 [📦 깃허브](https://github.com/olivahn/spring-boot-examples/tree/main/spring-mvc){:target="_blank"} 에 있습니다.**

<br />


# 💡 HttpMessageConverter

---

![spring-mvc](https://user-images.githubusercontent.com/71188307/143034392-8d728cd9-edce-46fe-b98c-6c4fd829c0c4.jpg)

<br />

`HttpMessageConverter`는 `HandlerMethodArgumentResolver`가 처리하지 못하는 유형의 요청을 대신 처리해준다.

여기서 `HandlerMethodArgumentResolver`가 처리하지 못하는 유형의 요청이란, 데이터가 HTTP 바디에 들어있는 경우를 의미한다.

(이때, 요청은 처리 주체가 Spring MVC이므로 HTTP 요청임을 가정한다.)

<br />

![image](https://user-images.githubusercontent.com/71188307/143870529-4f7da105-b0d5-4beb-a930-4605c82d671b.png)

- 이미지 출처: https://developer.mozilla.org/ko/docs/Web/HTTP/Messages

<br />

HTTP 메시지는 첫줄에 요청의 핵심정보를 표시하고, 이어서 두번째 줄부터 `HTTP 헤더`라는 이름의 메타데이터를 쭉 나열한다. (요청에 대한 상세 설명이라고 이해하면 되겠다)

이후 공백라인이 한줄 들어가고, 다음부터는 `HTTP 바디`라는 이름의 본격적인 데이터를 담는 공간이 존재한다.

다만 `GET`같은 방식은 HTTP 바디를 사용하지 않고, `URL`에 요청에 필요한 데이터를 나열하는데, 이를 `쿼리스트링` 혹은 `쿼리파라미터`라고 부른다.

일반적으로 `HandlerMethodArgumentResolver`는 이 `쿼리스트링`을 분석해 객체로 변환해주는 역할을 하며, `HttpMessageConverter`는 `HTTP 바디`를 분석해 객체로 변환해주는 역할을 한다.

<br />

`HttpMessageConverter`는 다음과 같은 추상메서드들을 포함한 인터페이스로 정의돼있다.

이름이 매우 직관적이라 따로 설명이 필요할 것 같진 않지만, 혹시 몰라 이에 대한 설명은 코드에 주석으로 작성하였다.

<br />

```java
public interface HttpMessageConverter<T> {

    // HttpMessageConverter가 지정된 타입을 읽을 수 있는지의 여부를 판단한다.
    // 첫번째 인자는 읽고자 하는 타입이며, 두번째 인자는 HTTP 헤더의 Content-Type을 의미한다
    boolean canRead(Class<?> clazz, @Nullable MediaType mediaType);

    // HttpMessageConverter가 지정된 타입을 작성할 수 있는지의 여부를 판단한다.
    // 첫번째 인자는 작성하고자 하는 타입이며, 두번째 인자는 HTTP 헤더의 Accept를 의미한다.
    boolean canWrite(Class<?> clazz, @Nullable MediaType mediaType);

    // HttpMessageConverter가 지원하는 미디어타입의 목록을 반환한다.
    List<MediaType> getSupportedMediaTypes();

    // 인자로 넘어온 타입에 대해 지원(읽기, 쓰기)하는 모든 미디어 타입을 반환한다.
    default List<MediaType> getSupportedMediaTypes(Class<?> clazz) {
	    return (canRead(clazz, null) || canWrite(clazz, null) ?
	    		getSupportedMediaTypes() : Collections.emptyList());
    }

    // HTTP 메시지를 읽고 첫번째 인자로 넘어온 타입의 인스턴스를 생성한 후 데이터를 바인딩해 반환한다
    // 두번째 인자는 클라이언트가 보낸 요청이다.
    T read(Class<? extends T> clazz, HttpInputMessage inputMessage)
		    throws IOException, HttpMessageNotReadableException;

    // 첫번째 인자로 넘어온 타입을 읽어 두번째 인자로 넘어온 Content-Type으로 파싱한다.
    // 이후 세번째 인자로 넘어온, 클라이언트에게 보낼 응답에 작성한다. 
    void write(T t, @Nullable MediaType contentType, HttpOutputMessage outputMessage)
		    throws IOException, HttpMessageNotWritableException;

}
```

<br />

`HttpMessageConverter`에는 10개의 구현체가 존재한다.

약간 첨언하자면, `클라이언트의 요청을 분석`할때는 HTTP 헤더의 `Content-Type`을 참고하며, `클라이언트에게 응답을 반환`할때는 HTTP 헤더의 `Accept`를 참고한다.

<br />

> 💡 Content-Type: 클라이언트가 서버에 보내는 데이터의 타입을 명시한 표준 헤더
>
> 💡 Accept: 클라이언트가 서버에게서 응답받길 원하는 데이터의 타입을 명시한 표준 헤더

<br />

즉, `Content-Type`과 `Accept`에 따라 10개의 `HttpMessageConverter`중 어떤것이 사용될지가 결정된다.

<br />

![image](https://user-images.githubusercontent.com/71188307/143871615-810177aa-6124-4161-8c1a-e6defe35d28f.png)

<br />

이중 경험상 가장 많이 사용되는 구현체는 `MappingJackson2HttpMessageConverter`인데, 이녀석은 이름 그대로 `application/json` 타입의 메시지를 파싱하는 책임을 갖는다. (`Jackson`은 `json`을 처리하는 표준 라이브러리의 이름이다. ex) `ObjectMapper`)

헌데 위 이미지 속 리스트 7,8번 인덱스에 위치한 `MappingJackson2HttpMessageConverter`가 두개인데, 왜 두개인지 살펴보면 `인코딩`이 다르다.

하나는 `ISO-8859-1`이며, 하나는 `UTF-8`인데 관련 히스토리를 찾아보니, 예전 스프링은 `ISO-8859-1`만을 지원하고 있었던 듯 하다.

이후 유니코드가 대세로 사용됨에 따라 추가된것으로 보인다.

관련 커밋은 다음 링크를 참고바란다.

<br />

> 💡 [https://github.com/spring-projects/spring-framework/commit/c38542739734c15e84a28ecc5f575127f25d310a](https://github.com/spring-projects/spring-framework/commit/c38542739734c15e84a28ecc5f575127f25d310a)

<br />

10개의 `HttpMessageConverter`는 ArrayList로 관리되고 있으며, 이 녀석들에게 처리를 위임하는 `HandlerMethodArgumentResolver`의 구현체는 다음 두 종류가 존재하는 것 같다. (~~더 있을 수도 있다.~~)

- RequestResponseBodyMethodProcessor
- HttpEntityMethodProcessor

<br />

## RequestResponseBodyMethodProcessor

---

`RequestResponseBodyMethodProcessor`가 사용되는 경우는 다음과 같다.

<br />

```java
public class RequestResponseBodyMethodProcessor extends AbstractMessageConverterMethodProcessor {

    // 클라이언트의 요청을 분석할때 사용될지 여부
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(RequestBody.class); // @RequestBody가 달려있는 경우
    }

    // 클라이언트에게 응답할 때 사용될지 여부
    @Override
    public boolean supportsReturnType(MethodParameter returnType) {
        return (AnnotatedElementUtils.hasAnnotation(returnType.getContainingClass(), ResponseBody.class) ||
            returnType.hasMethodAnnotation(ResponseBody.class)); // @ResponseBody가 달려있는 경우
    }

}
```

<br />

코드를 보면 인자에 `@RequestBody`가 존재하는 경우와 리턴타입이나 메서드에 `@ResponseBody`가 존재하는 경우 이 구현체가 사용될것임을 알 수 있다.

여기서 `@ResponseBody`가 사용되는 경우가 생각보다 굉장히 많은데, 혹자는 `HTTP API`라고 말하고, 혹자는 `REST API`라고 말하는, 우리가 자주 사용하는 `@RestController`를 사용하게 되면 다음과 같은 코드가 숨겨져있다.

<br />

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody // <- 요녀석
public @interface RestController {
}
```

<br />

즉, `RequestResponseBodyMethodProcessor`는 생각보다 아주 많이 사용되는 구현체이다.

전체적인 세부 동작은 사실 `HandlerMethodArgumentResolver`와 큰 차이가 없고 이에 대한 내용은 이전 문서에 작성하였으니 생략하겠다.

<br />

## HttpEntityMethodProcessor

---

`HttpEntityMethodProcessor`가 사용되는 경우는 다음과 같다.

<br />

```java
public class HttpEntityMethodProcessor extends AbstractMessageConverterMethodProcessor {
    
    // 클라이언트의 요청을 분석할때 사용될지 여부
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return (HttpEntity.class == parameter.getParameterType() ||
            RequestEntity.class == parameter.getParameterType());
    }

    // 클라이언트에게 응답할 때 사용될지 여부
    @Override
    public boolean supportsReturnType(MethodParameter returnType) {
        return (HttpEntity.class.isAssignableFrom(returnType.getParameterType()) &&
            !RequestEntity.class.isAssignableFrom(returnType.getParameterType()));
    }

}
```

<br />

코드를 보면 요청을 처리하는 메서드의 인자가 `HttpEntity` 타입이거나 `RequestEntity` 타입인 경우 동작한다.

클라이언트에게 응답을 반환하는 경우는 `HttpEntity` 타입이면서 `RequestEntity`가 아닌 경우를 의미한다.

즉, `HttpEntity`이거나 `ResponseEntity`인 경우이다.

<br />

여기서 `HttpEntity`는 스프링 프레임워크에서 제공하는 클래스로, HTTP 메시지 자체를 자바 객체로 모델링한 클래스이며, 크게 이를 상속받은 `RequestEntity`와 `ResponseEntity`로 나뉜다.

<br />

![image](https://user-images.githubusercontent.com/71188307/143875877-17d41110-e21d-49dd-b7f4-5c3ec6690dc7.png)

<br />

실제로 다음과 같다. (`HttpMessageConverter`를 사용하기 위해 HTTP 바디에 데이터를 담는 POST 방식의 코드를 예시로 추가합니다.)

<br />

```java
@Slf4j
@RestController
public class PostApiController {
    
    @PostMapping("/v1/hello")
    public String helloV1(@RequestBody Cat cat) {
        log.info("cat={}", cat);
        return "ok";
    }

}

```

<br />

이런 코드도 잘 동작하지만 **_(인자에 `@RequestBody`가 선언돼있으니 `RequestResponseBodyMethodProcessor`가 사용될 것임을 유추할 수 있다.)_**

<br />

```java
@Slf4j
@RestController
public class PostApiController {
    
    @PostMapping("/v1/hello")
    public String helloV1(RequestEntity<Cat> cat) { // RequestEntity<T>인 경우
        log.info("cat={}", cat);
        return "ok";
    }

    @PostMapping("/v2/hello")
    public String helloV2(HttpEntity<Cat> cat) { // HttpEntity<T>인 경우
        log.info("cat={}", cat);
        return "ok";
    }

}

```

<br />

이렇게 작성해도 아주 잘 동작한다.

여기서는 `HttpEntityMethodProcessor` 가 사용될 것을 유추할 수 있다.

<br />

# 정리

---

- `@RequestBody`를 사용할때는 `@RequestParam`처럼 각 키별로 하나하나 떼오기 위해 `Map`을 사용해야 한다.
    - 이게 싫다면 별도의 컨버터를 구현하여 직접 등록해야만 한다 !

![image](https://user-images.githubusercontent.com/71188307/143877917-ed7b5054-b7c2-47fd-bc09-fa2e435d07ab.png)

<br />

- `@RequestBody`를 사용할때는 기본생성자가 반드시 필요하며, 접근제한자는 `private`이여도 무방하다.
    - 구현체마다 조금씩 다르겠지만 일반적으로 리플렉션을 통해 동작하기 때문이며, 특히 우리가 자주 사용하는 `@RestController`에서는 `ObjectMapper`가 사용된다.
    - 이말인즉슨, `수정자(Setter)`가 필요하지 않다는 의미이도 하다.

<br />

- `POST` 방식처럼 `HTTP 바디`에 데이터를 담는 형식의 통신을 하더라도 HTTP 프로토콜의 특성상 여전히 `쿼리스트링`은 사용할 수 있다.
    - 즉, `@PostMapping`에서도 `@RequestParam`을 사용할 수 있다.
    - 단, 이 경우 일반적으로 `SSR(서버사이드렌더링)`을 하지 않으므로 `@ModelAttribute`를 사용해야할 이유가 아예 존재하지 않지만, 일부러 테스트 해본결과 역시 비정상적으로 동작함을 확인했다.

<br />

