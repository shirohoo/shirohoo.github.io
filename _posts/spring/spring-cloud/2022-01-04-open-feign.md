---
layout: post
category:
  - spring
  - spring-webflux
title: 오픈페인(OpenFeign)
description: |
  혹은 `페인 클라이언트(Feign Client)`로 불리는 프로젝트
image: /assets/img/spring/spring-cloud/spring-cloud.png
related_posts:
  - 
---

* toc
{:toc}
  
<br />

- [📦 GitHub - shirohoo/spring-cloud-openfeign](https://github.com/shirohoo/spring-cloud-examples/tree/main/spring-cloud-openfeign){:target="_blank"}
- [📦 Spring Cloud OpenFeign Docs](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/){:target="_blank"}
- [📦 우아한 feign 적용기](https://techblog.woowahan.com/2630/){:target="_blank"}
- [📦 feign 좀더 나아가기](https://techblog.woowahan.com/2657/){:target="_blank"}

<br />

# Open Feign

---

MSA환경에서 디스커버리 서비스와 연동하여 각 마이크로 서비스간의 통신을 원활하게 하기위해 탄생한 목적의 프로젝트이다.

하지만 오픈페인은 단독으로도 사용할 수 있으며, 이 경우 `RestTemplate`, `WebClient` 등을 대체할 수도 있게 된다.

`JPA Repository` 와 `Spring Controller` 를 합쳐놓은 듯한 느낌으로 편안하고 가독성 좋게 사용할 수 있다.



<br />

## 의존성

---

기본적으로 `Spring Initializer`를 사용하면 아주 쉽게 설정할 수 있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/148057268-51fe17ac-8758-4fe5-a9b0-af3935b3ce91.png)

<br />

직접 설정하려면 다음과 같이 하면 된다.

<br />

```groovy
// file: 'build.gradle'
dependencyManagement {
    imports {
        mavenBom 'org.springframework.cloud:spring-cloud-dependencies:2020.0.3'
    }
}

dependencies {
    implementation 'org.springframework.cloud:spring-cloud-starter-openfeign'
}
```

<br />

## 기본설정

---

우선 `ObjectMapper`때문에 열받는 상황이 종종 생길 수 있으므로 아래 설정을 추가해주면 많이 편해진다.

설정이 좀 과한감이 없지않아 있으니, 최적화를 원한다면 옵션에 대해 찾아보고 디테일하게 설정하도록 하자.

<br />

```java
// file: 'ObjectMapperConfig'
@Configuration
public class ObjectMapperConfig implements Jackson2ObjectMapperBuilderCustomizer {
    @Override
    public void customize(Jackson2ObjectMapperBuilder jacksonObjectMapperBuilder) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
        objectMapper.configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, false);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        jacksonObjectMapperBuilder.configure(objectMapper);
    }
}
```

<br />

```java
// file: 'OpenFeignConfig'
@Configuration
// 페인 클라이언트를 활성화. @SpringBootApplication이 달린 메인 클래스가 아닌 별도의 설정클래스에 추가했으므로 콤포넌트 스캔을 위해 베이스패키지를 지정
@EnableFeignClients(basePackages = "io.github.shirohoo.openfeign.client") 
public class OpenFeignConfig { 
    // 페인 클라이언트가 제공하는 모든 레벨의 로그를 사용 (자세한건 하기 내용 참고)
    @Bean
    public Level feignLoggerLevel() {
        return Level.FULL; 
    }

    // Error가 발생 할 경우 재시도에 대한 설정
    // 파라미터는 순서대로 각 시도간의 차이(period), 모든 재시도간의 차이(maxPeriod), 재시도 횟수(maxAttempts) 이다
    // 만약 HTTP 호출 실패 시 리트라이를 하고싶지 않다면 Retryer.NEVER_RETRY로 설정하자 
    // 후술할 디코더에서 RetryableException가 발생해야만 동작한다 ! 
    @Bean
    public Retryer retryer() {
        return new Default(1_000, 2_000, 3); 
    }
    
    // LocalDate, LocalDateTime 핸들링 시 URL 인코딩으로 인해 문제가 생길 수 있다.
    // 이러한 불편함이 이 설정을 추가함으로서 상당부분 해소될 수 있다
    @Bean
    public FeignFormatterRegistrar localDateFeignFormatterRegister() {
        return registry -> {
             DateTimeFormatterRegistrar registrar = new DateTimeFormatterRegistrar();
             registrar.setUseIsoFormat(true);
             registrar.registerFormatters(registry);
         };
    }
    
    // 모든 페인 클라이언트가 공통으로 사용할 헤더를 설정할 수 있다
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
             requestTemplate.header("commonHeader", "shirohoo"); // 모든 페인 클라이언트에 적용될 헤더
             requestTemplate.query("commonQueryParam", "shirohoo"); // 모든 페인 클라이언트에 적용될 쿼리스트링
        };
    }
}
```

<br />

`OpenFeign`이 제공하는 `Logger.Level` 설정은 다음과 같다

- NONE : 로깅을 하지 않는다
- BASIC : 요청 방법 및 URL, 상태 코드 및 실행 시간만 기록한다
- HEADERS : 요청 및 응답 헤더와 함께 BASIC의 항목을 기록한다
- FULL : 요청과 응답 모두에 대한 헤더, 본문 및 메타데이터를 기록한다. (즉, HTTP 메시지를 통째로 다찍는다)

<br />

위 설정을 온전히 적용하려면 프로젝트의 로깅 레벨을 `DEBUG`까지 허용해줘야 한다.

`application.yaml`이나 `application.properties`에서 `logging.level.root=debug`로 설정하면 된다.

하지만 프로젝트 전체의 로깅 레벨을 DEBUG로 설정하는 것은 무리가 있으므로, <u>아래와 같이 페인 클라이언트가 몰려있는 특정 패키지의 로깅 레벨만 DEBUG로 적용하는 방식이 주로 사용된다.</u>

<br />

```yaml
# file: 'application.yaml'
logging:
  level:
    # 이렇게 FeignClient가 위치한 패키지별로 로깅 레벨을 설정할수도 있다
    io.github.shirohoo.openfeign.client: DEBUG
```

<br />

`OpenFeign`이 제공하는 기본 로거 구현체가 찍어주는 로그의 포맷은 다음과 같다.

--> 

HTTP Request

-->

<--

HTTP Response

<--

<br />

```shell
i.g.s.c.FeignClient - [FeignClient#method] ---> GET https://jsonplaceholder.typicode.com/todos HTTP/1.1
i.g.s.c.FeignClient - [FeignClient#method] Content-Length: 277
i.g.s.c.FeignClient - [FeignClient#method] Content-Type: application/json
i.g.s.c.FeignClient - [FeignClient#method]
i.g.s.c.FeignClient - [FeignClient#method] {}
i.g.s.c.FeignClient - [FeignClient#method] ---> END HTTP (277-byte body)
i.g.s.c.FeignClient - [FeignClient#method] <--- HTTP/1.1 200 200 (737ms)
i.g.s.c.FeignClient - [FeignClient#method] connection: Keep-Alive
i.g.s.c.FeignClient - [FeignClient#method] content-type: application/json;charset=UTF-8
i.g.s.c.FeignClient - [FeignClient#method] date: Fri, 12 Nov 2021 03:51:08 GMT
i.g.s.c.FeignClient - [FeignClient#method] keep-alive: timeout=5, max=100
i.g.s.c.FeignClient - [FeignClient#method] server: Apache
i.g.s.c.FeignClient - [FeignClient#method] transfer-encoding: chunked
i.g.s.c.FeignClient - [FeignClient#method]
i.g.s.c.FeignClient - [FeignClient#method] {"data":"data"}
i.g.s.c.FeignClient - [FeignClient#method] <--- END HTTP (310-byte body)
```

<br />

HTTP 메시지에 별도의 헤더를 추가하겠다면 Spring MVC Controller에서 사용하듯이 페인 클라이언트 내부에서 `@RequestHeader`를 사용할 수 있다.

하지만 모든 페인 클라이언트가 공통으로 사용하는 헤더가 있다면 매번 `@RequestHeader`로 추가하는게 번거롭다.

그럴때 하기 설정을 추가하면 된다.

헤더 뿐만아니고 쿼리스트링, 바디등도 설정할 수 있으니 참고하자 !

<br />

```java
@Bean
public RequestInterceptor requestInterceptor() {
    return requestTemplate -> {
        requestTemplate.header("commonHeader", "shirohoo"); // 모든 페인 클라이언트에 적용될 헤더
        requestTemplate.query("commonQueryParam", "shirohoo"); // 모든 페인 클라이언트에 적용될 쿼리스트링
    };
}
```

<br />

## 클라이언트

---

```java
// 필수 속성은 name과 url이며, OpenFeign을 디스커버리 서비스 없이 단독으로 사용 할 경우 name도 크게 신경쓰지 않아도 된다
// 단, 그래도 name은 필수속성이다
@FeignClient(
    name = "jsonPlaceHolder",
    url = "${feign.client.url.jsonPlaceHolder}", // application.yaml에 정의한 url을 SpEL을 통해 참조할 수 있다
    configuration = { // 여러 설정파일을 페인 클라이언트에 탑재할 수 있다
        // 이전에 설정한 로그, 재시도 관련 설정을 사용하고 싶다면 탑재    
        // 주로 클라이언트 벤더별로 별도의 Config 클래스를 만들고 각각의 페인 클라이언트에 탑재하는 방식을 사용한다
        OpenFeignConfig.class,
            
        // 별도로 구현한 디코더를 탑재하여 더 디테일한 에러 핸들링도 가능하다
        // 아무런 디코더를 설정하지 않을 경우 OpenFeign에서 제공하는 기본 디코더가 동작한다
        CustomErrorDecoder.class 
    }
)
public interface JsonPlaceHolderClient { // JPA Repository와 마찬가지로 인터페이스로 생성한다

    // Spring Controller와 같은 패턴을 사용한다.
    // Get방식으로 ${feign.client.url.jsonPlaceHolder}/posts에 요청을 보내고 List<Post> 로 응답을 받는다
    @GetMapping("/posts")
    List<Post> getPosts();

    @GetMapping("/comments")
    List<Comment> getComment();

    @GetMapping("/albums")
    List<Album> getAlbums();

    @GetMapping("/photos")
    List<Photo> getPhotos();

    @GetMapping("/todos")
    List<Todo> getTodos();

    @GetMapping("/users")
    List<User> getUsers();

}
```

<br />

`Post`나 `Put`처럼 요청 파라미터가 있는 경우 메서드 파라미터에 추가한다.

`@PathVariable`, `@ReuqestHeader`, `@RequestBody` 등 Spring MVC에서 사용하던 모든 애노테이션을 사용할 수 있다.

이부분이 `OpenFeign`을 사용하면서 가장 주의해야 할 부분중 하나인데, `OpenFeign`을 처음 사용하시는 분들이 가장 많이 헤매는 부분이기 때문이다.

예를 들어 하기와 같은 경우에는 `String idValue`와 시그니처가 일치하지 않기 때문에 `("id")` 를 생략할 수 없다.

<br />

```java
@GetMapping("/api/v1/{id}")
public ResponseEntity<Void> api(@PathVariable("id") String idValue) {
    // do something...
}
```

<br />

하지만 하기와 같은 경우에는 시그니처가 일치하기 때문에 생략할 수 있다.

<br />

```java
@GetMapping("/api/v1/{id}")
public ResponseEntity<Void> api(@PathVariable String id) {
    // do something...
}
```

<br />

<u>하지만 OpenFeign에서는 위처럼 절대 생략할수가 없다</u>

이는 `@RequestParam`등도 마찬가지이다.

<br />

```java
@PostMapping("/users/{id}")
void getUsers(@PathVariable Long id); // OpenFeign에서는 불가능

@PostMapping("/users/{id}")
void getUsers(@PathVariable("id") Long id); // OpenFeign에서는 이렇게 사용해야만 한다 !
```

<br />

`OpenFeign`의 경우 많은 애노테이션 속성을 생략할수가 없다. 😂
{:.note}

<br />

### @SpringQueryMap

---

일반적으로 `Get 방식`의 요청을 보낼 때 `queryString`을 자주 사용한다.

이때 일반적으로 `@RequestParam`을 여러개 추가해서 사용하게 된다.

<br />

```java
@GetMapping("/users")
List<User> getUsersWithQueryParamsBasic(
        @RequestParam("param1") String param1,
        @RequestParam("param2") String param2
);
```

<br />

`@ReuqestParam`이 많아지면 코드의 가독성이 매우 안좋아지고, 코드를 작성하기도 지루해진다.

이 때 `@SpringQueryMap`을 사용할 수 있다.

<br />

```java
@Data
public class QueryParams {
    private String param1;
    private String param2;
}

@GetMapping("/users")
List<User> getUsersWithQueryParams(@SpringQueryMap QueryParams queryParams);
```

<br />

`getUsersWithQueryParams(QueryParams)`를 호출하면 다음과 같은 요청이 발생한다.

<br />

```shell
[JsonPlaceHolderClient#getUsersWithQueryParams] ---> GET https://jsonplaceholder.typicode.com/users?param1=param1&param2=param2 HTTP/1.1
```

<br />

## 예외 핸들링(디코더)

---

별도의 에러 핸들링이 필요하다면 `ErrorDecoder` 를 확장한다.

이후 Client 클래스에 구현한 디코더를 탑재하면 된다.

만약 별도의 디코더를 탑재하지 않을 경우 `OpenFeign`이 제공하는 기본 디코더가 동작한다.

디코더는 기본적으로 HTTP 상태코드가 400~500일 경우에만 동작하며 상태코드에 따라 다음과 같은 예외를 반환한다.

상태코드가 400번대이면 `FeignClientException`가 반환되며,

상태코드가 500번대이면 `FeignServerException`가 반환된다.

하지만 Retry는 `RetryableException`가 반환되어야만 동작하기 때문에, 만약 재시도를 하고싶다면 `RetryableException`를 반환하도록 해주자.

문서에서는 기본적으로 상태코드가 `503(Service Unavailable)` 일때 발생한다고 되어있다.

<br />

```java
// FeignClient 가 API 호출 중 발생하는 에러를 처리할 커스텀 클래스. 
// Bean 으로 등록되어 있으면 페인 클라이언트에 탑재하지 않더라도 기본 디코더 대신 동작한다.
@Slf4j
@Component
public class CustomErrorDecoder implements ErrorDecoder {
  @Override
  public Exception decode(String methodKey, Response response) {
    String requestPayload = new String(response.request().body(), StandardCharsets.UTF_8);
    int responseStatus = response.status();

    log.info("request payload={}, response status={}, response payload={}", requestPayload, responseStatus, response.body());

    switch (responseStatus) {
      case 400:
        return new BadRequestException();
      case 401:
        return new UnauthorizedException();
      case 403:
        return new ForbiddenException();
      case 404:
        return new NotFoundException();
      case 405:
        return new MethodNotAllowedException();
      case 406:
        return new NotAcceptableException();
      case 409:
        return new ConflictException();
      case 410:
        return new GoneException();
      case 415:
        return new UnsupportedMediaTypeException();
      case 429:
        return new TooManyRequestsException();
      case 422:
        return new UnprocessableEntityException();
      case 500:
        // RetryableException을 던지면 Retry 설정이 동작한다. 
        return new RetryableException(responseStatus, "to retry", HttpMethod.GET, null, response.request());
      default:
        return FeignException.errorStatus(methodKey, response);
    }
  }
}
```

<br />

## 사용

---

아주 심플하다.

클라이언트를 DI하고 메소드를 호출하면 된다.

본 예제에서는 그냥 인터페이스상태로 사용했지만, 별도의 래퍼 클래스를 만들어 사용하면 효과가 더 좋다.

<br />

```java
@SpringBootTest
class JsonPlaceHolderClientTest {
  @Autowired
  JsonPlaceHolderClient client;

  @Test
  void getPosts() throws Exception {
    List<Post> posts = client.getPosts();
    assertThat(posts.size()).isEqualTo(100);
  }

  @Test
  void getComments() throws Exception {
    List<Comment> posts = client.getComment();
    assertThat(posts.size()).isEqualTo(500);
  }

  @Test
  void getAlbums() throws Exception {
    List<Album> posts = client.getAlbums();
    assertThat(posts.size()).isEqualTo(100);
  }

  @Test
  void getPhotos() throws Exception {
    List<Photo> posts = client.getPhotos();
    assertThat(posts.size()).isEqualTo(5000);
  }

  @Test
  void getTodos() throws Exception {
    List<Todo> posts = client.getTodos();
    assertThat(posts.size()).isEqualTo(200);
  }

  @Test
  void getUsers() throws Exception {
    List<User> posts = client.getUsers();
    assertThat(posts.size()).isEqualTo(10);
  }

  @Test
  void getUsersWithQueryParams() throws Exception {
    // ...given
    QueryParams queryParams = new QueryParams();
    queryParams.setParam1("param1");
    queryParams.setParam2("param2");

    // ...when
    List<User> posts = client.getUsersWithQueryParams(queryParams);

    // ...then
    assertThat(posts.size()).isEqualTo(10);
  }
}
```

<br />
