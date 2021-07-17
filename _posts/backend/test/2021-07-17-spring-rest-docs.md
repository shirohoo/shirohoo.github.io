---
layout: post
category:
  - backend
  - test
title: Spring Rest Docs로 API 문서작성 자동화하기
description: |
  개발자간 협업에 아주 큰 도움이 되는 `API 문서`작성을 자동화 합니다
image: /assets/img/backend/test-logo.png
related_posts:
  - null
published: true
---

* toc
{:toc}
  
<br />

# 🤔 Spring Rest Docs ? 

---

개발자간 협업에서 API 문서는 굉장히 중요하다.

개발자는 API 문서를 보면 서버에 어떤 요청을 보내면 어떤 응답이 오는지를 한눈에 알 수 있기 때문에 API 문서가 얼마나 가독성이 좋고, 정확하냐에 따라 개발 생산성의 차이가 눈에띄게 변하기 때문이다.

<br />

가장 원시적인 방법으로 API를 개발하고, 이를 개발자가 직접 문서로 작성하여 공유하는 방법이 있다.

이 방법의 경우 API 스펙이 변하게 되면 문서도 따라서 변경해줘야 하기 때문에 시간이 지날수록 점점 관리되지 않는 문서가 될 가능성이 높다.

<br />

이러한 문제를 해결하기 위해 API 문서를 자동으로 작성해주는 방법이 존재하는데, API 문서 프레임워크의 양대 산맥으로 `Swagger`와 `Spring Rest Docs`가 있다.

두 프레임워크는 서로 장단점이 명확하기 때문에 개발자마다 호불호가 갈리며, 개발자의 취향에 맞게 선택하여 사용하는게 일반적이다.

<br />

이 포스팅에서는 `Spring Rest Docs`로 문서를 생성하는 방법에 대해 다룰것이다.

<br />

# 🤔 Spring Rest Docs의 장단점

---

필자는 `Swagger`의 UI가 더 이쁘다고 생각하는데, 이는 지극히 주관적인 관점이므로 이에 대해 따로 적지 않을 것이다.

누군가는 `Spring Rest Docs`의 문서가 더 이쁘다고 생각할수도 있기 때문이다.

<br />

> [📜 Spring Rest Docs 문서 예시](/assets/html/api-docs.html){:target="_blank"}

<br />

## 👍 장점

---

- <u>API 문서를 작성하기 위해 테스트 코드가 강제되므로 문서의 신뢰성이 매우 높다</u>
- `Spring Boot Starter`로 매우 간편하게 설정할 수 있다
- 문서가 매우 직관적이다

<br />

## 😣 단점

---

- 테스트 코드가 강제되기 때문에 테스트 코드에 익숙하지 않다면 도입 난이도가 굉장히 높다
- 문서를 커스터마이징 하려면 `AsciiDoc` 문법을 알아야 한다
- `Swagger` 문서와 다르게 문서에서 API를 즉석으로 테스트 할 수 없다

<br />

# 📕 Spring Rest Docs 적용

Spring Rest Docs를 적용하기 위한 방법에 대해 설명한다.

<br />

## 🚀 개발환경

--- 

|항목|버전|
|:---:|:---:|
|java|11|
|gradle|6.8|
|spring-boot|2.5.2|
|asciidoctor convert plugin|1.5.8|

<br />

## 🚀 설정

--- 

`Spring5`부터 `RestTemplate`이 `Deprecated`되고 `WebClient` 사용을 권장하고 있으므로 WebClient 테스트로 진행 할 것이다.

`Spring Rest Docs`는 테스트 결과를 여러개의 `adoc 스니펫(조각)`으로 생성해준다.

이후 개발자가 생성된 스니펫들을 `AsciiDoc` 문법을 사용해 하나의 문서로 조합하는 방식으로 동작한다.

<br />

{: style="text-align: center" }
![image](https://user-images.githubusercontent.com/71188307/126029898-15cc6b90-a6b3-461d-8bb8-f70926d646af.png)

<br />

아래는 Spring Rest Docs를 적용하기 위한 필수적인 설정들이다.

<br />

```groovy
// file: 'build.gradle'
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.5.2'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'org.asciidoctor.convert' version '1.5.8' // API 문서를 생성하기 위한 플러그인
}

ext {
    set('snippetsDir', file('build/generated-snippets')) // API 문서 스니펫을 생성할 위치를 전역 변수로 지정
}

dependencies {
    testImplementation(
            'org.springframework.boot:spring-boot-starter-test', // 테스트 코드 작성을 위한 의존성. 여기선 JUnit5로 설정된다.
            'org.springframework.restdocs:spring-restdocs-webtestclient', // Spring Rest Doc WebClient 의존성 설정
    )
    
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude group: "junit", module: "junit" // JUnit4를 프로젝트에서 제거
    }
    
    asciidoctor 'org.springframework.restdocs:spring-restdocs-asciidoctor' // API 문서를 생성하기 위한 의존성 설정
}

test {
    outputs.dir snippetsDir
    useJUnitPlatform()
}

asciidoctor {
    inputs.dir snippetsDir
    dependsOn test
}
```

<br />

필수적인 빌드 스크립트 설정을 하였다면 `main/src/docs/asciidoc/api-docs.adoc` 파일을 작성해준다.

`main/src/docs/asciidoc` 까지의 경로는 고정이며, 하위 adoc 파일의 이름은 개발자 마음대로 작명해도 된다.

<br />

```java
// file: 'main/src/docs/asciidoc/api-docs.adoc')
:basedir: {docdir}/../../../
:snippets: {basedir}/build/generated-snippets

= RESTful API Guide
:doctype: user
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 4
:sectnums:
:sectlinks:
:sectanchors:

[[api]]

== User Api

// Spring Rest Docs로 생성된 스니펫을 조합한다
// 경로에서 특히 user는 추후 설정에 따라 변경하여야 할 수 있다
include::{snippets}/user/curl-request.adoc[]
include::{snippets}/user/http-request.adoc[]
include::{snippets}/user/request-fields.adoc[]
include::{snippets}/user/http-response.adoc[]
include::{snippets}/user/response-fields.adoc[]
```

<br />

여기까지 완료하면 모든 설정이 끝났다.

문서를 작성하기 위해서는 `컨트롤러`에 대한 테스트코드가 반드시 필요하다.

예시를 위해 아주 간단한 컨트롤러를 하나 작성하고 이를 테스트하는 테스트 코드를 작성할 것이다.

<br />

전체 소스 코드는 [깃허브](https://github.com/shirohoo/spring-rest-docs/tree/spring-rest-docs)에 공개돼있습니다.

<br />

```java
// file: 'UserApiController.java'
import io.shirohoo.docs.domain.UserRequest;
import io.shirohoo.docs.domain.UserResponse;
import io.shirohoo.docs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserApiController {
    private final UserService service;
    private final ModelMapper mapper;

    @PostMapping("")
    public ResponseEntity<UserResponse> create(@RequestBody UserRequest request) {
        return ResponseEntity.ok(mapper.map(service.create(request), UserResponse.class));
    }
}
```

<br />

```java
// file: 'UserApiControllerTest.java'
import com.fasterxml.jackson.databind.ObjectMapper;
import io.shirohoo.docs.domain.UserRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.restdocs.RestDocumentationContextProvider;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.client.MockMvcWebTestClient;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.reactive.function.BodyInserters;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation.document;
import static org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation.documentationConfiguration;

@ExtendWith(RestDocumentationExtension.class) // Spring Rest Docs를 사용하기 위한 확장
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT) // 통합 테스트를 위해 선언
class UserApiControllerTest {
    @Autowired
    ObjectMapper mapper; // 테스트코드 작성을 편하게 하기 위함

    WebTestClient webTestClient; // 테스트 전용 WebClient인 WebTestClient 선언

    @BeforeEach
    void setUp(WebApplicationContext context, RestDocumentationContextProvider restDocumentation) {
        webTestClient = MockMvcWebTestClient.bindToApplicationContext(context) // WebTestClient에 Spring Web Container를 바인딩
                                            .configureClient()
                                            .filter(documentationConfiguration(restDocumentation)) // Spring Rest Docs를 바인딩
                                            .build();
    }

    @Test
    void create() throws Exception {
        // given
        // http 요청할 json string
        Mono<String> request = Mono.just(mapper.writeValueAsString(UserRequest.builder()
                                                                              .name("홍길동")
                                                                              .email("hong@email.com")
                                                                              .phoneNumber("01012341234")
                                                                              .build())
                                        );

        // http 응답으로 예상되는 json string
        String expected = mapper.writeValueAsString(UserRequest.builder()
                                                               .id(1L)
                                                               .name("홍길동")
                                                               .email("hong@email.com")
                                                               .phoneNumber("01012341234")
                                                               .build());

        // when
        WebTestClient.ResponseSpec exchange = webTestClient.post() // http method
                                                           .uri("/api/v1/user") // request uri
                                                           .contentType(MediaType.APPLICATION_JSON) // request content type
                                                           .accept(MediaType.APPLICATION_JSON) // response content type
                                                           .body(BodyInserters.fromProducer(request, String.class)) // request body (json string)
                                                           .exchange(); // execute

        // then
        exchange.expectStatus().isOk() // http status가 200이면 통과
                .expectBody().json(expected) // http response body가 예상값과 같으면 통과
                .consumeWith(document("user", // API 문서 작성 및 추가적인 검증을 위한 코드
                                      preprocessRequest(prettyPrint()), // 문서에 json string을 이쁘게 출력한다
                                      preprocessResponse(prettyPrint()), // 문서에 json string을 이쁘게 출력한다
                                      requestFields( // 문서에 표시 될 http request field. 실제 요청과 일치하지 않으면 테스트가 실패한다.
                                              fieldWithPath("id").description("식별자").type(Long.class),
                                              fieldWithPath("name").description("이름").type(String.class),
                                              fieldWithPath("email").description("이메일").type(String.class),
                                              fieldWithPath("phoneNumber").description("전화번호").type(String.class)
                                                   ),
                                      responseFields( // 문서에 표시 될 http response field. 실제 응답과 일치하지 않으면 테스트가 실패한다.
                                              fieldWithPath("id").description("식별자").type(Long.class),
                                              fieldWithPath("name").description("이름").type(String.class),
                                              fieldWithPath("email").description("이메일").type(String.class),
                                              fieldWithPath("phoneNumber").description("전화번호").type(String.class),
                                              fieldWithPath("createAt").description("등록일").type(LocalDateTime.class),
                                              fieldWithPath("updateAt").description("수정일").type(LocalDateTime.class)
                                                    )
                                     ));
    }
}
```

<br />

테스트가 통과하면 `빌드`를 한다.

빌드에 성공하면 `Spring Rest Docs` 코드에 명시한 대로 `adoc 스니펫`이 생성된다.

<br />

```shell
$ gradle clean build

Starting a Gradle Daemon, 1 incompatible and 1 stopped Daemons could not be reused, use --status for details
> Task :test

...

BUILD SUCCESSFUL in 28s
8 actionable tasks: 8 executed
```
<br />

빌드가 성공하면 문서 작성을 위한 `asciidoctor task`를 실행한다.

<br />

```shell
$ gradle asciidoctor

BUILD SUCCESSFUL in 1s
5 actionable tasks: 5 up-to-date
```

<br />

`build/asciidoc/html5/api-docs.html`이 생성된다.

<br />

{: style="text-align: center" }
![image](https://user-images.githubusercontent.com/71188307/126030349-708875a5-5f96-4910-97d0-e534f70f9f82.png)

<br />

여기까지 완료하면 생성되는 `api-docs.html`은 다음과 같다

<br />

> [📜 api-docs.html](/assets/html/api-docs.html){:target="_blank"}

<br />

여기서 문제가 하나 있는데, 문서 작성을 위한 gradle task는 수동으로 실행해줘야 한다는 것이다.

이를 자동화하기 위한 빌드 스크립트를 추가한다.

<br />

```groovy
// file: 'build.gradle'
bootJar {
    dependsOn(':asciidoctor')
}
```

<br />

문서를 생성하는 `asciidoctor task`는 `test task`가 완료된 후에 실행되어야 한다.

따라서 최종 패키징 단계인 `bootJar task`가 실행되기 전에 `asciidoctor task`가 먼저 유발될 수 있도록 해준다.

이후부터는 `build task`만 실행시키면 문서 생성작업이 자동화된다.

<br />
