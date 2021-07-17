---
layout: post
category:
  - backend
  - test
title: Spring Rest Docs와 Swagger 조합하기
description: |
  `API 문서 자동화`를 도와주는 `Spring Rest Docs`와 `Swagger`의 장점만을 누려봅시다.
image: /assets/img/backend/test-logo.png
related_posts:
  - null
published: true
---

* toc
{:toc}
  
<br />

가장 많이 사용되는 API 문서를 자동화 해주는 프레임워크로 `Swagger`와 `Spring Rest Docs` 두개가 있다.

문제는 두 프레임워크의 장단점이 너무 명확하다는데서 발생한다.

<br />

<u>이 포스팅에서는 필자가 생각하는 두 프레임워크의 장단점과 이로 인해 느끼는 불편, 그리고 이를 어떻게 극복했는지에 대해 기록 할 것이다.</u> 

<br />

# 🙄 Spring Rest Docs

---

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

# 🙄 Swagger

---

> [📜 Swagger 문서 예시](/assets/docs/swagger.html){:target="_blank"}

<br />

## 👍 장점

---

- <u>API 문서에서 API 테스트를 즉시 해볼 수 있다</u>
- 커스터마이징이 상대적으로 간편하다
- 문서가 아주 이쁘다 ~~(굉장히 주관적인 생각입니다.)~~

<br />

## 😣 단점

---

- <u>테스트 코드없이도 문서를 생성할 수 있기 때문에, API 문서를 신뢰하기 어렵다</u>
- `컨트롤러` 코드에 `Swagger` 코드가 아주 많이 작성되어야 한다.

<br />

# 🤔 문제점

---

`Swagger`를 사용할 경우 느끼는 가장 큰 불편은 `컨트롤러 계층`과 `요청`, `응답 객체`에 `Swagger` 코드를 떡칠해야 한다는 것이다.

이로 인해 코드가 쓸데없이 비대해지고 가독성이 큰 폭으로 떨어진다.

그리고 새로운 코드를 작성할 때마다 매번 `Swagger` 코드를 추가적으로 작성해야 하는게 매우매우매우 번거롭고 귀찮다.

<br />

또한, `API 검증`을 하지 않더라도 개발자가 마음대로 문서를 작성할 수 있기 때문에 역설적으로 API 문서를 신뢰하기 어렵다는 문제가 있다.

실제로 `Swagger` 문서를 참고해서 API를 개발하다가 버그를 마주친 개발자도 많을거라 생각된다.

<br />

`Spring Rest Docs`의 경우 `Swagger`와 다르게 문서 작성을 위한 코드가 거의 없다시피하다.

하지만 가장 큰 문제점은 `테스트 코드가 강제`된다는 것이다.

필자는 요즘들어 이게 오히려 장점이라고 보긴 하는데, 테스트 코드. 그중에서도 통합 테스트 코드를 잘 못 짜던 시절에는 이게 너무 큰 단점이었다.

<br />

테스트 코드를 잘 짜지 못하니 테스트 코드 작성을 위해 많은 시간을 할애해야 했고, 이로 인한 진입장벽이 매우매우 높았다.

<br />

하지만 요즘 들어 테스트 코드 작성하는 것에 매우 익숙해졌기에 `Spring Rest Docs`가 굉장히 좋다는 생각이 들었다.

일단 문서를 최소한이나마 신뢰할 수 있다는 것이 굉장히 큰 장점으로 느껴졌기 때문이다.

<br />

하지만 큰 단점이 있었다.

바로 `Spring Rest Docs`로 생성된 문서는 `Swagger` 문서와 다르게 <u>문서에서 API 테스트가 불가능하다는 것이었다.</u>

<br />

그래서 두 프레임워크를 모두 사용하여 서로의 단점은 모두 버리고 장점만 취할 수 있는 방법을 강구하게 됐다.

<br />

# 🤔 발상

---

`Swagger`는 `Swagger`와 `Swagger-UI`로 나뉜다.

`Swagger`로 코드를 작성하면 `OpenAPI` 코드가 작성되고, 이를 `Swagger-UI`로 시각화 해주는식으로 동작한다.

즉, 가장 큰 장점이라고 생각되는 `Swagger-UI`와 가장 큰 불편을 느끼는 `Swagger` 코드 작성을 따로 놓고 볼 수 있다는 뜻이다.

<br />

그렇다면 OpenAPI 작성을 `Spring Rest Docs`의 테스트 코드로 작성하고, 이렇게 작성된 `OpenAPI`를 `Swagger-UI`와 연동하면 되지 않을까?

그러면 모든 API를 테스트 코드로 검증할 수 있고, `OpenAPI` 작성을 위한 `Swagger` 코드 작성을 스킵할 수 있게되며, `Swagger-UI`로 API 문서를 만들 수 있을 것 같았다.

<br />

항상 그렇듯이 분명 이런 고민을 한 사람이 있을거라 생각했고, 구글링 결과 아주 좋은 오픈소스를 찾았다.

<br />

> [😎 ePages-de/restdocs-api-spec GitHub](https://github.com/ePages-de/restdocs-api-spec){:target="_blank"}

<br />

`Spring Rest Docs`의 테스트 코드를 활용해 `OpenAPI`를 생성해주는 오픈소스 라이브러리이다.

`Spring Rest Docs`의 스펙을 최대한 따라가기 위해 작성됐으며 `Spring Rest Docs`와 동일하게 `MockMvc`, `WebTestClient`, `RestAssured`를 모두 지원한다.

그리고 결과는 `OpenAPI`와 `OpenAPI3.0`으로 둘다 생성할 수 있다.

<br />

사용 방법도 매우 간단하다. 기존에 작성된 `Spring Rest Docs`의 코드를 거의 건드리지 않게 만들어져 있기 때문이다.

단지 기존 테스트 코드의 API 문서 생성부의 구현체를 이 라이브러리에서 제공하는 구현체로 바꾸기만 하면 된다.

<br />

`README`가 꽤 잘 되있어서 적용하는데 큰 문제는 없었으나, 개인적으로 아쉬웠던 것은 내부 구현이 모두 `코틀린`으로 돼있어서 소스코드 분석은 거의 하지 못한부분이다.

필자가 아직 코틀린에 대해 모르기 때문이다.

<br />

# 💡 설정

---

> 모든 소스코드는 [깃허브](https://github.com/shirohoo/spring-rest-docs)에 공개되어 있습니다.

<br />

우선 빌드 스크립트를 작성해야 한다.

플러그인을 먼저 적용한다.

<br />

```groovy
// file: 'build.gradle'
// Gradle Plugin DSL을 사용하는 경우
plugins {
    id 'com.epages.restdocs-api-spec' version '0.11.4'
}

// buildscript를 사용하는 경우
buildscript {
    repositories {
        maven {
            url "https://plugins.gradle.org/m2/" 
        }
    }
    dependencies {
        classpath "com.epages:restdocs-api-spec-gradle-plugin:0.11.4"
    }
}

apply plugin: 'com.epages.restdocs-api-spec'
```

<br />

플러그인을 사용하기 위한 설정을 추가한다.

<br />

```groovy
// file: 'build.gradle'
repositories {
    mavenCentral()
}

dependencies {
    // ...
    
    // 자신이 사용하는 테스트 방식에 따라 택일
    testCompile('com.epages:restdocs-api-spec-mockmvc:0.11.4')
    testCompile('com.epages:restdocs-api-spec-webtestclient:0.11.4')
    testCompile('com.epages:restdocs-api-spec-restassured:0.11.4')
}

// openapi를 사용하는 경우 설정
openapi {
    host = 'localhost:8080'
    basePath = '/api'
    title = 'My API'
    description = 'My API description'
    tagDescriptionsPropertiesFile = 'src/docs/tag-descriptions.yaml'
    version = '1.0.0'
    format = 'json'
}

// openapi3.0을 사용하는 경우 설정
openapi3 {
    server = 'https://localhost:8080'
    title = 'My API'
    description = 'My API description'
    tagDescriptionsPropertiesFile = 'src/docs/tag-descriptions.yaml'
    version = '0.1.0'
    format = 'yaml'
}
```

<br />

이외에 `Postman` 관련해서도 뭘 지원하는 것 같은데 일단 필자한테는 필요없는 것 같으므로 제외했다.

궁금하신 분은 따로 문서를 읽어보셔도 좋을 것 같다.

<br />

# 💡 테스트 코드 작성

---

필자는 하기와 같이 빌드 스크립트를 구성하였다.

<br />

```groovy
// file: 'build.gradle'
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.5.2'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'com.epages.restdocs-api-spec' version '0.11.3' // OpenAPI 작성을 위한 오픈소스 라이브러리
}

ext {
    set('staticsDir', file('src/main/resources/static')) // OpenAPI가 생성될 위치
}

group = 'io.shirohoo.docs'
archivesBaseName = 'spring-rest-docs'
version = '0.0.1'
sourceCompatibility = '11'

jar {
    enabled = false
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    annotationProcessor(
            'org.springframework.boot:spring-boot-configuration-processor',
            'org.projectlombok:lombok'
    )
    implementation(
            'org.springframework.boot:spring-boot-starter-web',
            'org.springframework.boot:spring-boot-starter-webflux', // WebClient 사용을 위한 의존성 추가
            'org.springframework.boot:spring-boot-starter-data-jpa',
            'org.springframework.boot:spring-boot-starter-validation',
            'org.modelmapper:modelmapper:2.4.4'
    )
    testImplementation(
            'org.springframework.boot:spring-boot-starter-test',
            'org.springframework.restdocs:spring-restdocs-webtestclient', // WebClient 사용을 위한 의존성 추가
            'com.epages:restdocs-api-spec-webtestclient:0.11.3' // WebClient 사용을 위한 의존성 추가
    )
    testImplementation("org.springframework.boot:spring-boot-starter-test") { // JUnit4 제외
        exclude group: "junit", module: "junit"
    }
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
}

test {
    useJUnitPlatform()
}

bootJar {
    dependsOn(':openapi3') // OpenAPI 작성 자동화를 위해 패키징 전에 openapi3 태스크 선실행을 유발
}

openapi3 { // epages openapi3.0 설정
    server = 'http://localhost:8080'
    title = 'Spring-Rest-Docs + Swagger-UI + Open-API-3.0.1'
    description 'Spring-Rest-Docs의 장점과 Swagger의 장점을 모두 가져갈 수 있는 아키텍처를 구축한다'
    version = '0.0.1'
    outputFileNamePrefix = 'open-api-3.0.1'
    format = 'json'
    outputDirectory = "$staticsDir/docs" // src/main/resources/static/docs/open-api-3.0.1.json 생성
}
```

<br />

그리고 아주 간단한 CRUD API를 작성하였다.

<br />

```java
// file: 'UserApiController.java'
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserApiController {
    private final ModelMapper mapper;
    private final UserService service;

    @PostMapping("")
    public ResponseEntity<UserResponse> create(@RequestBody UserRequest request) {
        return ResponseEntity.ok(mapper.map(service.create(request), UserResponse.class));
    }

    @GetMapping("{id}")
    public ResponseEntity<UserResponse> read(@PathVariable("id") Optional<User> user) {
        try {
            return ResponseEntity.ok(mapper.map(user.orElseThrow(() -> new NullPointerException()), UserResponse.class));
        }
        catch(NullPointerException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("")
    public ResponseEntity<UserResponse> update(@RequestBody UserRequest request) {
        return ResponseEntity.ok(mapper.map(service.update(request), UserResponse.class));
    }

    @DeleteMapping("{id}")
    public ResponseEntity delete(@PathVariable Long id) {
        boolean result = service.delete(id);
        if(!result) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(null);
    }
}
```

<br />

그리고 이에 대한 테스트 코드를 작성한다.

***(우선 구조같은건 신경쓰지 않고 단순히 테스트가 성공하게끔만 작성하였으므로 양해 바랍니다.)***

<br />

```java
// file: 'UserApiControllerTest.java'
import com.epages.restdocs.apispec.ResourceSnippetParameters;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.shirohoo.docs.domain.UserRequest;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.restdocs.RestDocumentationContextProvider;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.client.MockMvcWebTestClient;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.reactive.function.BodyInserters;
import reactor.core.publisher.Mono;

import static com.epages.restdocs.apispec.ResourceDocumentation.parameterWithName;
import static com.epages.restdocs.apispec.ResourceDocumentation.resource;
import static com.epages.restdocs.apispec.Schema.schema;
import static com.epages.restdocs.apispec.WebTestClientRestDocumentationWrapper.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation.*;
import static org.springframework.test.web.reactive.server.WebTestClient.*;
import static org.springframework.web.reactive.function.BodyInserters.*;

@ExtendWith(RestDocumentationExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserApiControllerTest {
    @Autowired
    ObjectMapper mapper; // json string 변환을 위해 주입

    WebTestClient webTestClient;

    @BeforeEach
    void setUp(WebApplicationContext context, RestDocumentationContextProvider restDocumentation) {
        webTestClient = MockMvcWebTestClient.bindToApplicationContext(context) // 서블릿 컨테이너 바인딩
                                            .configureClient() // 설정 추가
                                            .filter(documentationConfiguration(restDocumentation)) // epages 문서 설정을 추가
                                            .build();
    }

    @Test
    @Order(1)
    @Rollback(false)
    void 사용자_정보를_생성한다() throws Exception {
        // given
        Mono<String> request = Mono.just(mapper.writeValueAsString(UserRequest.builder()
                                                                              .name("홍길동")
                                                                              .email("hong@email.com")
                                                                              .phoneNumber("01012341234")
                                                                              .build())
                                        );

        String expected = mapper.writeValueAsString(UserRequest.builder()
                                                               .id(1L)
                                                               .name("홍길동")
                                                               .email("hong@email.com")
                                                               .phoneNumber("01012341234")
                                                               .build());

        // when
        ResponseSpec exchange = webTestClient.post()
                                             .uri("/api/v1/user")
                                             .contentType(MediaType.APPLICATION_JSON)
                                             .accept(MediaType.APPLICATION_JSON)
                                             .body(fromProducer(request, String.class))
                                             .exchange();

        // then
        exchange.expectStatus().isOk() // 응답 상태코드가 200이면 통과
                .expectBody().json(expected) // 응답 바디가 예상한 json string과 같으면 통과
                .consumeWith(document("create", // 문서 작성 및 추가 검증 작업
                                      preprocessRequest(prettyPrint()), // 문서에 json 출력을 이쁘게 해준다
                                      preprocessResponse(prettyPrint()), // 문서에 json 출력을 이쁘게 해준다
                                      resource(
                                              ResourceSnippetParameters.builder()
                                                                       .tag("User") // 문서에 표시될 태그
                                                                       .summary("사용자 정보 생성") // 문서에 표시될 요약정보
                                                                       .description("사용자 정보를 생성한다") // 문서에 표시될 상세정보
                                                                       .requestSchema(schema("UserRequest")) // 문서에 표시될 요청객체 정보
                                                                       .responseSchema(schema("UserResponse")) // 문서에 표시될 응답객체 정보
                                                                       .requestFields( // 요청 field 검증 및 문서화
                                                                                       fieldWithPath("id").description("식별자"),
                                                                                       fieldWithPath("name").description("이름"),
                                                                                       fieldWithPath("email").description("이메일"),
                                                                                       fieldWithPath("phoneNumber").description("전화번호")
                                                                                     )
                                                                       .responseFields( // 응답 field 검증 및 문서화
                                                                                        fieldWithPath("id").description("식별자"),
                                                                                        fieldWithPath("name").description("이름"),
                                                                                        fieldWithPath("email").description("이메일"),
                                                                                        fieldWithPath("phoneNumber").description("전화번호"),
                                                                                        fieldWithPath("createAt").description("등록일"),
                                                                                        fieldWithPath("updateAt").description("수정일")
                                                                                      )
                                                                       .build()
                                              )));
    }

    @Test
    @Order(2)
    void 사용자_정보를_조회한다() throws Exception {
        // given
        String expected = mapper.writeValueAsString(UserRequest.builder()
                                                               .id(1L)
                                                               .name("홍길동")
                                                               .email("hong@email.com")
                                                               .phoneNumber("01012341234")
                                                               .build());

        // when
        ResponseSpec exchange = webTestClient.get()
                                             .uri("/api/v1/user/{id}", 1)
                                             .accept(MediaType.APPLICATION_JSON)
                                             .exchange();

        // then
        exchange.expectStatus().isOk()
                .expectBody().json(expected)
                .consumeWith(document("read",
                                      preprocessRequest(prettyPrint()),
                                      preprocessResponse(prettyPrint()),
                                      resource(
                                              ResourceSnippetParameters.builder()
                                                                       .tag("User")
                                                                       .summary("사용자 정보 조회")
                                                                       .description("사용자 정보를 조회한다")
                                                                       .requestSchema(null)
                                                                       .responseSchema(schema("UserResponse"))
                                                                       .pathParameters(
                                                                               parameterWithName("id").description("식별자")
                                                                                      )
                                                                       .responseFields(
                                                                               fieldWithPath("id").description("식별자"),
                                                                               fieldWithPath("name").description("이름"),
                                                                               fieldWithPath("email").description("이메일"),
                                                                               fieldWithPath("phoneNumber").description("전화번호"),
                                                                               fieldWithPath("createAt").description("등록일"),
                                                                               fieldWithPath("updateAt").description("수정일")
                                                                                      )
                                                                       .build()
                                              )));
    }

    @Test
    @Order(3)
    void 사용자_정보를_업데이트한다() throws Exception {
        // given
        Mono<String> request = Mono.just(mapper.writeValueAsString(UserRequest.builder()
                                                                              .id(1L)
                                                                              .name("아무개")
                                                                              .email("hong@email.com")
                                                                              .phoneNumber("01012341234")
                                                                              .build())
                                        );

        // when
        ResponseSpec exchange = webTestClient.put()
                                             .uri("/api/v1/user")
                                             .contentType(MediaType.APPLICATION_JSON)
                                             .accept(MediaType.APPLICATION_JSON)
                                             .body(fromProducer(request, String.class))
                                             .exchange();

        // then
        exchange.expectStatus().isOk()
                .expectBody().json(request.block())
                .consumeWith(document("update",
                                      preprocessRequest(prettyPrint()),
                                      preprocessResponse(prettyPrint()),
                                      resource(
                                              ResourceSnippetParameters.builder()
                                                                       .tag("User")
                                                                       .summary("사용자 정보 수정")
                                                                       .description("사용자 정보를 수정한다")
                                                                       .requestSchema(schema("UserRequest"))
                                                                       .responseSchema(schema("UserResponse"))
                                                                       .requestFields(
                                                                               fieldWithPath("id").description("식별자"),
                                                                               fieldWithPath("name").description("이름"),
                                                                               fieldWithPath("email").description("이메일"),
                                                                               fieldWithPath("phoneNumber").description("전화번호")
                                                                                     )
                                                                       .responseFields(
                                                                               fieldWithPath("id").description("식별자"),
                                                                               fieldWithPath("name").description("이름"),
                                                                               fieldWithPath("email").description("이메일"),
                                                                               fieldWithPath("phoneNumber").description("전화번호"),
                                                                               fieldWithPath("createAt").description("등록일"),
                                                                               fieldWithPath("updateAt").description("수정일")
                                                                                      )
                                                                       .build()
                                              )));
    }

    @Test
    @Order(4)
    void 사용자_정보를_삭제한다() throws Exception {
        // when
        ResponseSpec exchange = webTestClient.delete()
                                             .uri("/api/v1/user/{id}", 1)
                                             .exchange();

        // then
        exchange.expectStatus().isOk()
                .expectBody()
                .consumeWith(document("delete",
                                      preprocessRequest(prettyPrint()),
                                      preprocessResponse(prettyPrint()),
                                      resource(
                                              ResourceSnippetParameters.builder()
                                                                       .tag("User")
                                                                       .summary("사용자 정보 삭제")
                                                                       .description("사용자 정보를 삭제한다")
                                                                       .requestSchema(null)
                                                                       .responseSchema(null)
                                                                       .pathParameters(
                                                                               parameterWithName("id").description("식별자")
                                                                                      )
                                                                       .build()
                                              )));
    }
}
```

<br />

추가로 설명할만한 부분은 두가지다.

<br />

첫째로 테스트코드 작성 중 `import`를 할 때 패키지명에 `epages`가 들어가는 것을 위주로 `import`해야 한다.

관련하여 어려움을 느끼실 분들을 위해 예제 코드에 `import` 블록을 모두 추가하였다.

<br />

둘째로 요청, 응답을 검증하고 문서화하는 부분이다.

위 코드에서는 대체로 요청, 응답 바디에 `JSON`을 넣어 통신했기 때문에 `requestFields`를 사용하였다.

말고도 `requestParameters`와 `pathParameters`가 존재하는데, `requestParameters`는 `get방식`에서 사용하는 `queryString`을 검증하고 문서화하는 메서드다.

그리고 `pathParameters`는 uri에 변수를 사용하는 경우, 그러니까 스프링 컨트롤러의 `@PathVariable`과 같은것들을 검증하기 위한 메서드다.

<br />

`인메모리 DB`로 간단하게 테스트하기 위해 별로 좋아하진 않지만, 임시로 테스트에 순서를 지정하였다.

`생성` -> `조회` -> `업데이트` -> `삭제` 순으로 실행된다.

그리고 테스트를 돌려보면 ...

<br />

{: style="text-align: center" }
![image](https://user-images.githubusercontent.com/71188307/126042792-a920fb3b-bd3f-41f7-8da3-326070a52fa1.png)

<br />

테스트가 성공함을 확인했다.

이제 문서화를 위한 작업에 들어간다.

<br />

# 💡 문서화

---

일단 빌드 스크립트를 모두 작성해두었기 때문에 `build` 태스크를 실행하면 `OpenAPI3.0`까지는 자동으로 만들어진다.

경로는 `src/main/resources/static/docs/open-api-3.0.1.json`이다.

`build` 태스크를 실행하고 `openapi3` 태스크가 실행되는지 확인한다.

<br />

```shell
$ gradle build

Starting Gradle Daemon...
Gradle Daemon started in 1 s 155 ms
Executing task 'build'...

> Task :compileJava
> Task :processResources
> Task :classes
> Task :bootJarMainClassName
> Task :compileTestJava
> Task :processTestResources NO-SOURCE
> Task :testClasses
> Task :test
> Task :check

> Task :openapi3 // 패키징 전 openapi3 태스크 동작 확인

> Task :bootJar 
> Task :jar SKIPPED
> Task :assemble
> Task :build

BUILD SUCCESSFUL in 19s
10 actionable tasks: 10 executed
오전 1:02:54: Task execution finished 'build'.
```

<br />

이제 문서 작성에 필요한 `OpenAPI`를 만들었으니, 이를 시각화해줄 `Swagger-UI`를 설치한다.

<br />

> [📜 Swagger-UI 다운로드 페이지](https://github.com/swagger-api/swagger-ui/releases/tag/v3.51.1)

<br />

압축 파일을 다운받고 압축을 풀면 안에 `dist` 폴더가 있다.

`dist`에 있는 파일들을 모두 `src/main/resources/static/docs`에 풀어준다.

그리고 `index.html`을 열어 스크립트를 변경해준다.

<br />

```javascript
<script>
window.onload = function() {
	
    // omitted for brevity
    
    url: "./open-api-3.0.1.json", // Spring Rest Docs로 생성된 OpenAPI를 연동
    
    // omitted for brevity
    
};
</script>
```

<br />

그리고 `index.html`을 열어보면 다음과 같은 문서가 열린다.

<br />

> [📜 완성된 Swagger API 문서](/assets/docs/swagger.html){:target="_blank"}

<br />
