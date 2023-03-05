---
layout: post
category:
    - backend
    - test
title: Spring REST Docs로 API 문서작성 자동화하기
description: >
  개발자간 협업에 아주 큰 도움이 되는 `API 문서`작성을 자동화 합니다
image: /assets/img/backend/test-logo.png
related_posts:
  - _posts/backend/test/2021-07-17-swagger-rest-docs.md
  - _posts/backend/test/2021-07-18-jacoco.md
---

* toc
{:toc}
  
<br />

포스팅에 사용된 예제 코드는 [🚀GitHub](https://github.com/shirohoo/spring-rest-docs-examples/tree/main/spring-rest-docs){:target="_blank"} 를 참고해주세요.
{:.note}


# 🤔 Spring REST Docs ? 

---

개발자간 협업에서 API 문서는 굉장히 중요하다.

개발자는 API 문서를 보면 서버에 어떤 요청을 보내면 어떤 응답이 오는지를 한눈에 알 수 있기 때문에 API 문서가 얼마나 가독성이 좋고, 정확하냐에 따라 개발 생산성의 차이가 눈에띄게 변하기 때문이다.

<br />

가장 원시적인 방법으로 API를 개발하고, 이를 개발자가 직접 문서로 작성하여(wiki같은...) 공유하는 방법이 있다.

이 방법의 경우 API 스펙이 변하게 되면 문서도 따라서 변경해줘야 하기 때문에 시간이 지날수록 점점 관리되지 않는 문서가 될 가능성이 높다.

<br />

이러한 문제를 해결하기 위해 API 문서를 자동으로 작성해주는 방법이 존재하는데, API 문서 프레임워크의 양대 산맥으로 `Swagger`와 `Spring REST Docs`가 있다.

두 프레임워크는 서로 장단점이 명확하기 때문에 개발자마다 호불호가 갈리는 것 같다.

<br />

이 포스팅에서는 `Spring REST Docs`로 문서를 생성하는 방법에 대해 다룰것이다.

<br />

# 🤔 Spring REST Docs의 장단점

---

필자는 `Swagger`의 UI가 더 이쁘다고 생각하는데, 이는 지극히 주관적인 관점이므로 이에 대해 따로 적지 않을 것이다.

누군가는 `Spring Rest Docs`의 문서가 더 이쁘다고 생각할수도 있기 때문이다.

<br />

> [📜 Spring REST Docs 문서 예시](/assets/docs/rest/api-docs.html){:target="_blank"}

<br />

## 👍 장점

---

- <u>API 문서를 작성하기 위해 테스트 코드가 강제되므로 문서의 신뢰성이 매우 높다</u>
- `Spring Boot Starter`로 매우 간편하게 설정할 수 있다
- 문서가 매우 직관적이다

<br />

## 😣 단점

---

- 문서를 작성하려면 테스트 코드가 강제되기 때문에 테스트 코드에 익숙하지 않다면 도입 난이도가 굉장히 높다
- 문서를 커스터마이징 하려면 `Asciidoc` 문법을 알아야 한다
- `Swagger` 문서와 다르게 문서에서 API를 즉석으로 테스트 할 수 없다 (Curl 커맨드를 제공해주긴 한다)

<br />

# 📕 Spring REST Docs 적용

---

`Spring REST Docs`를 적용하기 위한 방법에 대해 설명한다.

<br />

## 🚀 개발환경

--- 

|항목|버전|
|:---:|:--:|
|java|11|
|gradle|6.9|
|spring-boot|2.6.1|
|asciidoctor convert plugin|1.5.8|

<br />

## 🚀 설정

--- 

테스트하는데 사용할 수 있는 구현체가 `MockMvc`, `Restassured`, `WebClient`로 총 세개 존재한다.

취향껏 골라 사용하면 되겠다. 각 의존성은 하기와 같다.

<br />

```groovy
// file: 'build.gradle'
dependencies {
    testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
    testImplementation 'org.springframework.restdocs:spring-restdocs-restassured'
    testImplementation 'org.springframework.restdocs:spring-restdocs-webtestclient'
}
```

<br />

`Spring REST Docs`는 테스트 결과를 여러개의 `adoc 스니펫(조각)`으로 생성해준다.

이후 개발자가 생성된 스니펫들을 `Asciidoc` 문법을 사용해 하나의 문서로 조합하는 방식으로 동작한다.

<u>즉, 책을 하나 만든다고 생각하면 편하다.</u>

책에는 챕터가 있으며, 각 챕터에는 세부 내용들이 있을것이다.

그러니까 기본적으로 3개의 `depth`가 생길 수 있다.

<br />

아래는 `Spring REST Docs`를 적용하기 위한 필수적인 설정들이다.

<br />

```groovy
// file: 'build.gradle'
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.6.1'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'org.asciidoctor.convert' version '1.5.8' // API 문서를 생성하기 위한 플러그인
}

ext {
    set('snippetsDir', file('build/generated-snippets')) // API 문서 스니펫을 생성할 위치를 전역 변수로 지정
}

dependencies {
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
}

test {
    outputs.dir snippetsDir // Spring REST Docs가 생성하는 스니펫을 작성할 위치  
    useJUnitPlatform()
}

asciidoctor {
    inputs.dir snippetsDir // Asciidoctor가 문서를 생성해낼 때 필요한 스니펫을 읽어들일 위치
    dependsOn test
}

bootJar {
    dependsOn asciidoctor
    from("${asciidoctor.outputDir}/html5") { // 빌드할 때 Asciidoctor가 만들어낸 HTML 문서를 jar파일에 포함시킨다
        into 'BOOT-INF/classes/static/docs'
    }
}

task copyDocument(type: Copy) { // Asciidoctor가 build 디렉토리에 생성해낸 HTML 문서를 Spring의 정적 리소스 위치로 복사한다
    dependsOn asciidoctor

    from file('build/asciidoc/html5/')
    into file('src/main/resources/static/docs')
}

build {
    dependsOn copyDocument // build 태스크 실행되면 copyDocument 태스크를 먼저 유발시킨다
}
```

<br />

필수적인 빌드 스크립트 설정을 하였다면 `src/docs/asciidoc/{document-name}.adoc` 파일을 작성해준다.

`src/docs/asciidoc` 까지의 경로는 고정이며, 하위 adoc 파일의 이름은 개발자 마음대로 작명해도 된다.

나는 `유저 조회`, `유저 생성`이라는 두개의 API를 만들것이다.

따라서 API 문서는 총 두개가 나올것이며, 이들을 묶어줄 `색인(index.html)`도 필요하다.

<br />

`src/docs/asciidoc` 경로는 버전마다 다를 수 있으니 잘 안된다면 공식문서를 참고하자!
{:.note}

<br />

```java
// file: 'src/docs/asciidoc/user-find.adoc'
=== 조회
:basedir: {docdir}/../../../
:snippets: {basedir}/build/generated-snippets
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 4

==== 설명

유저 조회에 성공한 경우

==== 요청

===== 요청 필드

include::{snippets}/user-find/request-parameters.adoc[]

===== Curl 요청 코드

include::{snippets}/user-find/curl-request.adoc[]

===== 요청 예제

include::{snippets}/user-find/http-request.adoc[]

==== 응답

===== 응답 필드

include::{snippets}/user-find/response-fields.adoc[]

===== 응답 예제

include::{snippets}/user-find/http-response.adoc[]
```

<br />

```java
// file: 'src/docs/asciidoc/user-create.adoc'
=== 생성
:basedir: {docdir}/../../../
:snippets: {basedir}/build/generated-snippets
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 4

==== 설명

유저 추가에 성공한 경우

==== 요청

===== 요청 필드

include::{snippets}/user-create/request-fields.adoc[]

===== Curl 요청 코드

include::{snippets}/user-create/curl-request.adoc[]

===== 요청 예제

include::{snippets}/user-create/http-request.adoc[]

==== 응답

===== 응답 필드

include::{snippets}/user-create/response-fields.adoc[]

===== 응답 예제

include::{snippets}/user-create/http-response.adoc[]
```

<br />

그리고 이 문서들을 묶어줄 챕터격의 문서를 하나 더 만든다.

<br />

```java
// file: 'src/docs/asciidoc/user.adoc'
== 유저 API
:basedir: {docdir}/../../../
:snippets: {basedir}/build/generated-snippets
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 4

include::./user-find.adoc[]

include::./user-create.adoc[]
```

<br />

마지막으로 챕터들이 묶여있는 책의 역할을 하는 `색인(index.html)`을 만들어야 한다.

<br />

```java
// file: 'src/docs/asciidoc/index.adoc'
= API DOCUMENTATION
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 4
:sectlinks: /build/asciidoc/html5/
:sectnums:

== 소개

유저 API 입니다.

== 환경

서비스의 각종 환경에 대한 정보를 표시합니다.

=== 도메인

서비스의 도메인 호스트는 다음과 같습니다.

NOTE: 인프라 팀에서 설정합니다.

|===
| 환경 | URI

| 개발서버
| `io.github.shirohoo-dev`

| 운영서버
| `io.github.shirohoo`
|===

include::./user.adoc[]
```

<br />

여기까지 완료하면 모든 설정이 끝났다.

<br />

`Asciidoc` 문법에 대한 자세한 내용은 [📜여기](https://narusas.github.io/2018/03/21/Asciidoc-basic.html){:target="_blank"} 와 [📜여기](https://docs.asciidoctor.org/asciidoc/latest/document-structure/){:target="_blank"} 를 참고하세요.
{:.note}

<br />

문서를 작성하기 위해서는 `컨트롤러`에 대한 테스트코드가 반드시 필요하다.

예시를 위해 아주 간단한 컨트롤러를 하나 작성하고 이를 테스트하는 테스트 코드를 작성할 것이다.

<br />

```java
@RestController
public class ApiController {

    @GetMapping
    public ResponseEntity<User> get(@RequestParam String phoneNumber) {
        Map<String, User> users = getRepository();

        if (users.containsKey(phoneNumber)) {
            return ResponseEntity.ok(users.get(phoneNumber));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<User> post(@RequestBody User user) {
        Map<String, User> users = getRepository();

        if (users.containsKey(user)) {
            return ResponseEntity.badRequest().build();
        }
        users.put(user.getPhoneNumber(), user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(user);
    }

    private Map<String, User> getRepository() {
        Map<String, User> users = new HashMap<>();
        users.put("010-1234-5678", new User("user1", 11, "010-1234-5678", LocalDate.of(2000, 1, 1)));
        users.put("010-1111-1111", new User("user2", 22, "010-1111-1111", LocalDate.of(2000, 1, 1)));
        users.put("010-1234-1111", new User("user3", 33, "010-1234-1111", LocalDate.of(2000, 1, 1)));
        return users;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {

        private String name;

        private int age;

        private String phoneNumber;

        private LocalDate birthDay;

    }

}
```

<br />

이제 테스트 코드를 작성해야 하는데, `JUnit`을 사용해보신 독자라면 <u>스프링 컨텍스트를 매 테스트마다 리로딩하는것이 얼마나 테스트를 느리게 만드는지</u> 잘 알것이다.

이 문제를 해결하기 위해 `Spring REST Docs` 테스트를 실행할 때 사용할 추상 클래스를 하나 정의하도록 한다.

이 추상 클래스를 사용해 테스트를 실행시키면 스프링 컨텍스트를 단 한번만 로딩한 후 이를 재사용함으로써 테스트 시간을 대폭 단축시킬 수 있게된다.

<br />

```java
@WebMvcTest(controllers = {
    ApiController.class // 여기에 테스트 대상 컨트롤러들을 추가
})
@ExtendWith(RestDocumentationExtension.class)
@AutoConfigureRestDocs(uriScheme = SCHEME, uriHost = HOST)
public class AbstractControllerTests {

    // 여기서 문서에 표시될 정보들을 정의
    public static final String SCHEME = "https";  
    public static final String HOST = "io.github.shirohoo";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    // 나중에 테스트 코드 중 문서작성부에 사용될 편의성 메서드들을 정의
    protected static OperationRequestPreprocessor documentRequest() {
        return Preprocessors.preprocessRequest(
            Preprocessors.modifyUris()
                .scheme(SCHEME)
                .host(HOST)
                .removePort(),
            prettyPrint());
    }

    protected static OperationResponsePreprocessor documentResponse() {
        return Preprocessors.preprocessResponse(prettyPrint());
    }

    protected static StatusResultMatchers status() {
        return MockMvcResultMatchers.status();
    }

    protected static ContentResultMatchers content() {
        return MockMvcResultMatchers.content();
    }

}
```

<br />

이후로 위 추상 클래스에 테스트 할 컨트롤러를 추가하고, 다른 객체를 모킹해야 한다면 `@MockBean`도 여기에 선언하도록 하자.

그리고 다음과 같은 테스트 코드를 작성한다.

<br />

```java
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import io.github.shirohoo.springrestdocs.api.ApiController.User;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.restdocs.payload.JsonFieldType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

class ApiControllerTest extends AbstractControllerTests {

    @Test
    void get() throws Exception {
        // ...given
        String request = "010-1234-5678";
        String response = objectMapper.writeValueAsString(
                new User("user1", 11, "010-1234-5678", LocalDate.of(2000, 1, 1))
        );

        // ...when
        ResultActions actions = mockMvc.perform(MockMvcRequestBuilders.get("/?phoneNumber=" + request));

        // ...then
        actions.andExpect(status().isOk())
                .andExpect(content().json(response))
                .andDo(document("user-find", // 여기부터 Spring REST Docs의 문서화 코드
                        documentRequest(), // 요청부를 전처리하고 문서에 기록한다
                        documentResponse(), // 응답부를 전처리하고 문서에 기록한다
                        requestParameters( // 여기부터 검증 및 문서화 코드. 검증에 실패하면 테스트도 실패한다
                                parameterWithName("phoneNumber").description("휴대폰 번호")
                        ),
                        responseFields(
                                fieldWithPath("name").type(JsonFieldType.STRING).description("이름"),
                                fieldWithPath("age").type(JsonFieldType.NUMBER).description("나이"),
                                fieldWithPath("phoneNumber").type(JsonFieldType.STRING).description("휴대폰 번호"),
                                fieldWithPath("birthDay").type(JsonFieldType.STRING).description("생일")
                        )
                ));
    }

    @Test
    void post() throws Exception {
        // ...given
        String request = objectMapper.writeValueAsString(
                new User("user4", 44, "010-5678-5678", LocalDate.of(2000, 1, 1))
        );

        // ...when
        ResultActions actions = mockMvc.perform(MockMvcRequestBuilders.post("/")
                .content(request)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
        );

        // ...then
        actions.andExpect(status().isCreated())
                .andExpect(content().json(request))
                .andDo(document("user-create", // 여기부터 Spring REST Docs의 문서화 코드
                        documentRequest(), // 요청부를 전처리하고 문서에 기록한다
                        documentResponse(), // 응답부를 전처리하고 문서에 기록한다
                        requestFields( // 여기부터 검증 및 문서화 코드. 검증에 실패하면 테스트도 실패한다
                                fieldWithPath("name").type(JsonFieldType.STRING).description("이름"),
                                fieldWithPath("age").type(JsonFieldType.NUMBER).description("나이"),
                                fieldWithPath("phoneNumber").type(JsonFieldType.STRING).description("휴대폰 번호"),
                                fieldWithPath("birthDay").type(JsonFieldType.STRING).description("생일")
                        ),
                        responseFields(
                                fieldWithPath("name").type(JsonFieldType.STRING).description("이름"),
                                fieldWithPath("age").type(JsonFieldType.NUMBER).description("나이"),
                                fieldWithPath("phoneNumber").type(JsonFieldType.STRING).description("휴대폰 번호"),
                                fieldWithPath("birthDay").type(JsonFieldType.STRING).description("생일")
                        )
                ));
    }

}
```

<br />

테스트가 통과하면 `빌드`를 한다.

빌드에 성공하면 `Spring REST Docs` 코드에 명시한 대로 `build/generated-snippets` 경로에 `Asciidoc 스니펫`이 생성돼있을 것이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/146929753-cbcb2ed7-851f-4ea5-8cbb-d4a3f0adf510.png)

<br />

또한, `src/main/resources/static/docs` 에 몇가지 HTML 문서도 생성되어 있을 것이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/146929784-f602d331-060b-4171-b03c-b27b1a2c9227.png)

<br />

여기까지 완료하면 생성되는 `index.html`은 다음과 같다

<br />

> [📜 index.html](/assets/docs/rest/api-docs.html){:target="_blank"}

<br />

# 참고

---

- [Spring REST Docs Document](https://docs.spring.io/spring-restdocs/docs/1.0.0.M1/reference/html5/){:target="_blank"}

<br />
