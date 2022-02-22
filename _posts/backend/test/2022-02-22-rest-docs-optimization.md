---
layout: post
category:
  - backend
  - test
title: 컨트롤러 테스트를 최적화해보기
description: |
  `Spring` 환경에서 컨트롤러 테스트를 더욱 깔끔한 구조로, 더욱 빠르게 실행되게 작성해보기
image: /assets/img/backend/test-logo.png
published: true
---

* toc
{:toc}
  
<br />

# 컨트롤러 테스트시 문제점?

---

저는 주로 `HTTP 계층 테스트` + `API 문서화` 용도로 `Spring Rest Docs`를 사용합니다.

그리고 위 목적을 이루기 위해 <u>컨트롤러 테스트를 필수적으로 작성하게 됩니다.</u>

<br />

> `Swagger`는 이쁘고 사용하기 편리하지만, 테스트 코드가 없어도 문서를 작성할 수 있다는 특징으로 인해, 실제 API 스펙과 API 문서의 스펙이 다른 문제가 발생할 수 있고, 컨트롤러에 `Swagger` 코드가 침투한다는 점으로 인해 제가 선호하지 않습니다.

<br />

`Spring Rest Docs`를 사용하는 경우, 보통 `@SpringBootTest`를 사용하여 통합 테스트를 진행하거나, HTTP 계층만 테스트하기 위해 `슬라이싱 테스트`인 `@WebMvcTest`를 사용하게 됩니다.

저 같은 경우엔 `@WebMvcTest`를 사용하고 있었습니다.

왜냐하면 `@SpringBootTest`를 사용해 통합 테스트를 진행하게 되면 테스트에서 영속성 계층에 의존성이 생겨 골치아파지는 경우가 많았기 때문입니다. 

즉, 저는 `HTTP 계층`, `서비스 계층`, `영속성 계층`을 모두 따로 테스트하는것을 선호하며, 그중에서도 영속성 계층은 `Spring Data JPA` 프로젝트에 이미 테스트 코드가 매우 잘 작성돼있기 때문에, JPA를 사용하는 경우에는 이마저도 잘 테스트하지 않고, 쿼리가 실제로 어떻게 발생하는지 궁금할때만 작성해보는 편입니다.

아무튼, 위와 같은 이유들로 슬라이싱 테스트를 매우 선호하는데, 슬라이싱 테스트를 하는 경우에는 계층간의 의존성을 끊어내기 위해 `@MockBean`을 사용하게 되는 경우가 많습니다.

<br />

문제는, 이렇게 `Mocking`하는것이 과도하게 많아지게 되면 컨텍스트를 매번 새롭게 로딩하게 되기 때문에 테스트가 심각하게 느려지게 됩니다.

그리고 이러한 문제를 해결하기 위해 컨텍스트 재사용을 위한 추상 클래스를 하나 작성하게 됩니다.

이 경우 추상 클래스는 대략 다음과 같은 모양새가 나오게 됩니다.

<br />

```java
@AutoConfigureRestDocs
@ExtendWith(RestDocumentationExtension.class)
@WebMvcTest(controllers = {
    SomeController1.class,
    SomeController2.class,
    SomeController3.class
    // ... 컨트롤러 계속 추가 ...
})
public class RestDocsSpecification {
    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected SomeService1 someService1;

    @MockBean
    protected SomeService2 someService2;

    @MockBean
    protected SomeService3 someService3;
    
    // ... MockBean 계속 추가 ...

    protected static OperationRequestPreprocessor documentRequest() {
        return Preprocessors.preprocessRequest(prettyPrint());
    }

    protected static OperationResponsePreprocessor documentResponse() {
        return Preprocessors.preprocessResponse(prettyPrint());
    }
}
```

<br />

가장 큰 문제는 매번 테스트 케이스가 추가될때마다 추상 클래스에 그에 해당하는 `Controller`와 `@MockBean`을 계속해서 추가해줘야만 한다는 것입니다.

즉, 새로운 테스트를 작성할 때 이러한 작업이 누락될 가능성이 충분히 높다는 것입니다.

부차적으로 코드가 매우 지저분하기도 하고요.

<br />

그렇다면 이러한 구조적인 문제도 해결하면서, 테스트 속도를 더 빠르게 가져갈 수 있는 방법이 무엇이 있을까 고민해보았는데, `@WebMvcTest`를 사용하지 않고 컨트롤러 인스턴스를 자체적으로 생성해 테스트한다면 어떨까 싶었습니다.

즉, 컨트롤러 테스트를 일반적인 유닛 테스트 하듯이 하는 것이죠.

관련 내용을 찾아보니 `MockMvc`를 `standaloneSetup`으로 설정하면 가능할 것 같았습니다.

`@WebMvcTest`를 사용하게 되면 기본적으로 `MockMvc`, `Controller`, `Filter`, `Interceptor`등의, 컨트롤러 계층에 관련된 모든 `Spring Bean`을 등록해주는데, 사실 이러한 것들이 과연 내가 하는 테스트에 모두 필요한가? 라는 의문을 가져볼 수 있습니다.

저같은 경우는 주로 `JSON`을 사용하는 `API 서버`를 개발하기 때문에 `HTTP Body`를 파싱해주는 `HttpMessageConverter`, 그중에서도 JSON을 파싱해주는 `MappingJackson2HttpMessageConverter` 하나만 있어도 무방하거든요.

그렇습니다. 

유닛 테스트를 하는데 너무 과도한 설정을 하게되고, 이로인해 테스트 시간이 불필요하게 늘어난다는 문제가 생긴다는 것입니다.

<br />

# 솔루션

---

제가 사용하던 기존 방식의 코드는 다음과 같습니다.

<br />

```java
@AutoConfigureRestDocs
@ExtendWith(RestDocumentationExtension.class)
@WebMvcTest(controllers = {EmployeeController.class})
public abstract class RestDocsSpecification {
    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected EmployeeService employeeService;

    protected static OperationRequestPreprocessor documentRequest() {
        return Preprocessors.preprocessRequest(prettyPrint());
    }

    protected static OperationResponsePreprocessor documentResponse() {
        return Preprocessors.preprocessResponse(prettyPrint());
    }
}
```

<br />

`@WebMvcTest`가 만들어주는, 제 기준으로 과도한 설정이 추가된 `MockMvc`와 각종 `Bean`, `MockBean`들을 모두 셋업합니다.

즉, 매 테스트마다 스프링 컨텍스트를 로딩하는 과정이 발생합니다.

<br />

```shell
21:59:55.016 [main] DEBUG org.springframework.test.context.BootstrapUtils - Instantiating CacheAwareContextLoaderDelegate from class [org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate]
21:59:55.023 [main] DEBUG org.springframework.test.context.BootstrapUtils - Instantiating BootstrapContext using constructor [public org.springframework.test.context.support.DefaultBootstrapContext(java.lang.Class,org.springframework.test.context.CacheAwareContextLoaderDelegate)]
21:59:55.062 [main] DEBUG org.springframework.test.context.BootstrapUtils - Instantiating TestContextBootstrapper for test class [com.example.restdocs.v1.EmployeeControllerTests] from class [org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper]
21:59:55.074 [main] INFO org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper - Neither @ContextConfiguration nor @ContextHierarchy found for test class [com.example.restdocs.v1.EmployeeControllerTests], using SpringBootContextLoader
21:59:55.077 [main] DEBUG org.springframework.test.context.support.AbstractContextLoader - Did not detect default resource location for test class [com.example.restdocs.v1.EmployeeControllerTests]: class path resource [com/example/restdocs/v1/EmployeeControllerTests-context.xml] does not exist
21:59:55.077 [main] DEBUG org.springframework.test.context.support.AbstractContextLoader - Did not detect default resource location for test class [com.example.restdocs.v1.EmployeeControllerTests]: class path resource [com/example/restdocs/v1/EmployeeControllerTestsContext.groovy] does not exist
21:59:55.078 [main] INFO org.springframework.test.context.support.AbstractContextLoader - Could not detect default resource locations for test class [com.example.restdocs.v1.EmployeeControllerTests]: no resource found for suffixes {-context.xml, Context.groovy}.
21:59:55.078 [main] INFO org.springframework.test.context.support.AnnotationConfigContextLoaderUtils - Could not detect default configuration classes for test class [com.example.restdocs.v1.EmployeeControllerTests]: EmployeeControllerTests does not declare any static, non-private, non-final, nested classes annotated with @Configuration.
21:59:55.138 [main] DEBUG org.springframework.test.context.support.ActiveProfilesUtils - Could not find an 'annotation declaring class' for annotation type [org.springframework.test.context.ActiveProfiles] and class [com.example.restdocs.v1.EmployeeControllerTests]
21:59:55.205 [main] DEBUG org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider - Identified candidate component class: file [D:\sample\restdocs\out\production\classes\com\example\restdocs\RestdocsApplication.class]
21:59:55.212 [main] INFO org.springframework.boot.test.context.SpringBootTestContextBootstrapper - Found @SpringBootConfiguration com.example.restdocs.RestdocsApplication for test class com.example.restdocs.v1.EmployeeControllerTests
21:59:55.220 [main] DEBUG org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper - @TestExecutionListeners is not present for class [com.example.restdocs.v1.EmployeeControllerTests]: using defaults.
21:59:55.221 [main] INFO org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper - Loaded default TestExecutionListener class names from location [META-INF/spring.factories]: [org.springframework.boot.test.autoconfigure.restdocs.RestDocsTestExecutionListener, org.springframework.boot.test.autoconfigure.web.client.MockRestServiceServerResetTestExecutionListener, org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrintOnlyOnFailureTestExecutionListener, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverTestExecutionListener, org.springframework.boot.test.autoconfigure.webservices.client.MockWebServiceServerTestExecutionListener, org.springframework.boot.test.mock.mockito.MockitoTestExecutionListener, org.springframework.boot.test.mock.mockito.ResetMocksTestExecutionListener, org.springframework.test.context.web.ServletTestExecutionListener, org.springframework.test.context.support.DirtiesContextBeforeModesTestExecutionListener, org.springframework.test.context.event.ApplicationEventsTestExecutionListener, org.springframework.test.context.support.DependencyInjectionTestExecutionListener, org.springframework.test.context.support.DirtiesContextTestExecutionListener, org.springframework.test.context.transaction.TransactionalTestExecutionListener, org.springframework.test.context.jdbc.SqlScriptsTestExecutionListener, org.springframework.test.context.event.EventPublishingTestExecutionListener]
21:59:55.233 [main] DEBUG org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper - Skipping candidate TestExecutionListener [org.springframework.test.context.transaction.TransactionalTestExecutionListener] due to a missing dependency. Specify custom listener classes or make the default listener classes and their required dependencies available. Offending class: [org/springframework/transaction/interceptor/TransactionAttributeSource]
21:59:55.235 [main] DEBUG org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper - Skipping candidate TestExecutionListener [org.springframework.test.context.jdbc.SqlScriptsTestExecutionListener] due to a missing dependency. Specify custom listener classes or make the default listener classes and their required dependencies available. Offending class: [org/springframework/transaction/interceptor/TransactionAttribute]
21:59:55.236 [main] INFO org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper - Using TestExecutionListeners: [org.springframework.test.context.web.ServletTestExecutionListener@51acdf2e, org.springframework.test.context.support.DirtiesContextBeforeModesTestExecutionListener@6a55299e, org.springframework.test.context.event.ApplicationEventsTestExecutionListener@2f1de2d6, org.springframework.boot.test.mock.mockito.MockitoTestExecutionListener@4eb386df, org.springframework.boot.test.autoconfigure.SpringBootDependencyInjectionTestExecutionListener@79517588, org.springframework.test.context.support.DirtiesContextTestExecutionListener@3a0baae5, org.springframework.test.context.event.EventPublishingTestExecutionListener@7ac0e420, org.springframework.boot.test.autoconfigure.restdocs.RestDocsTestExecutionListener@289710d9, org.springframework.boot.test.autoconfigure.web.client.MockRestServiceServerResetTestExecutionListener@5a18cd76, org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrintOnlyOnFailureTestExecutionListener@3da30852, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverTestExecutionListener@403f0a22, org.springframework.boot.test.autoconfigure.webservices.client.MockWebServiceServerTestExecutionListener@503ecb24, org.springframework.boot.test.mock.mockito.ResetMocksTestExecutionListener@4c51cf28]
21:59:55.252 [main] DEBUG org.springframework.test.context.support.AbstractDirtiesContextTestExecutionListener - Before test class: context [DefaultTestContext@4b14918a testClass = EmployeeControllerTests, testInstance = [null], testMethod = [null], testException = [null], mergedContextConfiguration = [WebMergedContextConfiguration@6d1ef78d testClass = EmployeeControllerTests, locations = '{}', classes = '{class com.example.restdocs.RestdocsApplication}', contextInitializerClasses = '[]', activeProfiles = '{}', propertySourceLocations = '{}', propertySourceProperties = '{org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper=true}', contextCustomizers = set[org.springframework.boot.test.autoconfigure.OverrideAutoConfigurationContextCustomizerFactory$DisableAutoConfigurationContextCustomizer@6ea2bc93, org.springframework.boot.test.autoconfigure.actuate.metrics.MetricsExportContextCustomizerFactory$DisableMetricExportContextCustomizer@3224a577, org.springframework.boot.test.autoconfigure.filter.TypeExcludeFiltersContextCustomizer@8fa62a15, org.springframework.boot.test.autoconfigure.properties.PropertyMappingContextCustomizer@31ca6936, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverContextCustomizerFactory$Customizer@11bb571c, [ImportsContextCustomizer@1a6c1270 key = [@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc(), @org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(webDriverEnabled=true, print=DEFAULT, webClientEnabled=true, addFilters=true, printOnlyOnFailure=true), @org.springframework.boot.test.autoconfigure.properties.PropertyMapping(value="spring.test.mockmvc", skip=NO), @org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(useDefaultFilters=true, excludeFilters={}, controllers={com.example.restdocs.controller.EmployeeController.class}, excludeAutoConfiguration={}, value={}, includeFilters={}, properties={}), @org.springframework.boot.test.autoconfigure.core.AutoConfigureCache(cacheProvider=NONE), @org.springframework.boot.autoconfigure.ImportAutoConfiguration(value={}, exclude={}, classes={}), @org.springframework.context.annotation.Import(value={org.springframework.boot.autoconfigure.ImportAutoConfigurationImportSelector.class}), @org.springframework.context.annotation.Import(value={org.springframework.boot.test.autoconfigure.restdocs.RestDocumentationContextProviderRegistrar.class}), @org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs(uriScheme="http", outputDir="", uriPort=8080, value="", uriHost="localhost"), @org.springframework.boot.test.autoconfigure.filter.TypeExcludeFilters(value={org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTypeExcludeFilter.class}), @org.springframework.boot.test.autoconfigure.properties.PropertyMapping(value="spring.test.restdocs", skip=NO), @org.springframework.test.context.BootstrapWith(value=org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTestContextBootstrapper.class), @org.springframework.boot.test.autoconfigure.OverrideAutoConfiguration(enabled=false)]], org.springframework.boot.test.context.filter.ExcludeFilterContextCustomizer@7cbd9d24, org.springframework.boot.test.json.DuplicateJsonObjectContextCustomizerFactory$DuplicateJsonObjectContextCustomizer@1b45c0e, org.springframework.boot.test.mock.mockito.MockitoContextCustomizer@91577190, org.springframework.boot.test.context.SpringBootTestArgs@1, org.springframework.boot.test.context.SpringBootTestWebEnvironment@0], resourceBasePath = 'src/main/webapp', contextLoader = 'org.springframework.boot.test.context.SpringBootContextLoader', parent = [null]], attributes = map[[empty]]], class annotated with @DirtiesContext [false] with mode [null].

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v2.6.3)

2022-02-22 21:59:55.703  INFO 16876 --- [           main] c.e.restdocs.v1.EmployeeControllerTests  : Starting EmployeeControllerTests using Java 11.0.11 on DESKTOP-Q76TMR6 with PID 16876 (started by hch41 in D:\sample\restdocs)
2022-02-22 21:59:55.703  INFO 16876 --- [           main] c.e.restdocs.v1.EmployeeControllerTests  : No active profile set, falling back to default profiles: default
2022-02-22 21:59:57.048  INFO 16876 --- [           main] o.s.b.t.m.w.SpringBootMockServletContext : Initializing Spring TestDispatcherServlet ''
2022-02-22 21:59:57.048  INFO 16876 --- [           main] o.s.t.web.servlet.TestDispatcherServlet  : Initializing Servlet ''
2022-02-22 21:59:57.049  INFO 16876 --- [           main] o.s.t.web.servlet.TestDispatcherServlet  : Completed initialization in 1 ms
2022-02-22 21:59:57.091  INFO 16876 --- [           main] c.e.restdocs.v1.EmployeeControllerTests  : Started EmployeeControllerTests in 1.785 seconds (JVM running for 2.906)
```

<br />

테스트 코드는 다음과 같습니다.

<br />

```java
@ExtendWith(MockitoExtension.class)
class EmployeeControllerTests extends RestDocsSpecification {
    @Test
    void save() throws Exception {
        Employee request = Employee.builder()
            .name("employee1")
            .email("employee1@mail.com")
            .phone("010-1234-5678")
            .build();

        Employee response = Employee.builder()
            .id(UUID.randomUUID())
            .name("employee1")
            .email("employee1@mail.com")
            .phone("010-1234-5678")
            .build();

        given(employeeService.save(any())).willReturn(response);

        mockMvc.perform(post("/api/v1/employee")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andDo(document("employee",
                documentRequest(),
                documentResponse(),
                requestFields(
                    fieldWithPath("name").description("이름"),
                    fieldWithPath("email").description("이메일"),
                    fieldWithPath("phone").description("휴대폰번호")
                ),
                responseFields(
                    fieldWithPath("id").description("식별자"),
                    fieldWithPath("name").description("이름"),
                    fieldWithPath("email").description("이메일"),
                    fieldWithPath("phone").description("휴대폰번호")
                )
            ));
    }
}
```

<br />

`MockBean`을 사용했기 때문에 필연적으로 `Mockito`를 사용하게 되며, 따라서 테스트 코드 상단부에 `Mocking`을 하기 위한 코드들이 상당수 추가됩니다.

그리고 이러한 코드들은 테스트 코드가 무엇을 검증하고 있는지 눈에 잘 안들어오게 방해합니다.

<br />

개선된 코드는 다음과 같습니다.

<br />

```java
@AutoConfigureRestDocs
@ExtendWith({RestDocumentationExtension.class, ObjectMapperResolver.class})
public abstract class RestDocsSpecification {
    protected ObjectMapper objectMapper;
    private RestDocumentationContextProvider contextProvider;

    @BeforeEach
    private void setUp(ObjectMapper objectMapper, RestDocumentationContextProvider contextProvider) {
        this.objectMapper = objectMapper;
        this.contextProvider = contextProvider;
    }

    protected MockMvc mockMvc(Object controller) {
        return MockMvcBuilders.standaloneSetup(controller)
            .setMessageConverters(jackson2HttpMessageConverter())
            .apply(documentationConfiguration(contextProvider))
            .build();
    }

    private MappingJackson2HttpMessageConverter jackson2HttpMessageConverter() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        return converter;
    }

    protected static OperationRequestPreprocessor documentRequest() {
        return Preprocessors.preprocessRequest(prettyPrint());
    }

    protected static OperationResponsePreprocessor documentResponse() {
        return Preprocessors.preprocessResponse(prettyPrint());
    }
}
```

<br />

```java
public class ObjectMapperResolver implements ParameterResolver {
    @Override
    public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) throws ParameterResolutionException {
        return parameterContext.getParameter().getType() == ObjectMapper.class;
    }

    @Override
    public Object resolveParameter(ParameterContext parameterContext, ExtensionContext extensionContext) throws ParameterResolutionException {
        return Jackson2ObjectMapperBuilder.json()
            .modules(new JavaTimeModule())
            .visibility(PropertyAccessor.FIELD, Visibility.ANY)
            .featuresToDisable(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL)
            .featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();
    }
}
```

<br />

`protected MockMvc mockMvc(Object controller)`에서 컨트롤러 인스턴스를 받아 `MockMvc`에 셋업합니다.

그리고 위에서 언급했듯, 제게 필요한 `MappingJackson2HttpMessageConverter` 인스턴스를 하나 생성하여 넣어줍니다.

위 코드의 세팅은 단순히 `HTTP Body`에 들어있는 JSON이 정상인지 테스트하기 위한 목적이기 때문에, 만약 `@RestControllerAdvice` 등을 별도로 만들어 사용하고 계신다면 빌더에 인스턴스를 만들어 넣어주셔야만 합니다.

<br />

테스트 코드는 다음과 같습니다.

<br />

```java
class EmployeeControllerTests extends RestDocsSpecification {
    @Test
    void save() throws Exception {
        mockMvc(new EmployeeController(new EmployeeService()))
            .perform(post("/api/v1/employee")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Employee.builder()
                    .name("employee1")
                    .email("employee1@mail.com")
                    .phone("010-1234-5678")
                    .build())))
            .andExpect(status().isCreated())
            .andDo(document("employee",
                documentRequest(),
                documentResponse(),
                requestFields(
                    fieldWithPath("name").description("이름"),
                    fieldWithPath("email").description("이메일"),
                    fieldWithPath("phone").description("휴대폰번호")
                ),
                responseFields(
                    fieldWithPath("id").description("식별자"),
                    fieldWithPath("name").description("이름"),
                    fieldWithPath("email").description("이메일"),
                    fieldWithPath("phone").description("휴대폰번호")
                )
            ));
    }
}
```

<br />

기존의 코드와 다르게, 컨트롤러 인스턴스를 직접 생성하여 슈퍼 클래스에 넘겨주고, 슈퍼 클래스에서는 넘겨받은 컨트롤러 인스턴스를 `MockMvc`에 탑재한 후 반환해주고 있습니다.

이 경우엔 단순 예제이기 때문에 서비스 클래스에 별도의 의존성이 없도록 하였으나, 실무에서는 보통 인터페이스를 두어 결합도를 느슨하게 가져가기 때문에 익명 클래스를 넘겨 `Mockito`를 대신할 수도 있습니다. 

혹은 구조 문제로 인해 위와 같은 방식을 시도할 수 없다면 `Mockito`를 사용할수도 있겠죠. (별로 좋다고 생각되진 않습니다.)

<br />

두 테스트를 실행하면 다음과 같은 결과가 나옵니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/155138530-dd957f9f-396f-4909-a5d9-2ea2041b97b1.png)

<br />

`v1`이 기존의 방식이며, `v2`는 `standaloneSetup`을 사용한 개선된 방식입니다.

`v2`의 경우 실제로 스프링 컨텍스트를 로딩하는 과정 자체가 스킵되기 때문에 실 체감상으로도 테스트 속도가 매우 빨라짐을 느낄 수 있으며(과장 조금 보태 버튼 누르자마자 완료되는 수준으로 POJO 테스트보다 약간 느립니다), 테스트 리포트 상으로도 `약 10배`에 가까운 속도차이가 발생하고 있음을 확인 할 수 있습니다.

<br />




