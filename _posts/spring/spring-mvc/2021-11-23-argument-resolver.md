---
layout: post
category:
    - spring
    - spring-mvc
title: HandlerMethodArgumentResolver
description: >
    `Spring MVC`의 `HandlerMethodArgumentResolver` 가 하는 일
image: /assets/img/spring/spring-mvc/spring-boot-logo.png
related_posts:
    - _posts/spring/spring-mvc/2021-11-29-http-message-converter.md
---

* toc
{:toc}

# 💡 HandlerMethodArgumentResolver

---

![spring-mvc](https://user-images.githubusercontent.com/71188307/143034392-8d728cd9-edce-46fe-b98c-6c4fd829c0c4.jpg)

<br />

- **코드는 [📦 깃허브](https://github.com/shirohoo/spring-boot-examples/tree/main/spring-mvc){:target="_blank"} 에 있습니다.**

<br />

스프링 MVC 프로젝트에는 사용자의 HTTP 요청을 파싱하고 처리한 후 컨트롤러에 값을 넘겨주는 `HandlerMethodArgumentResolver` 인터페이스가 있으며 **(여기서 말하는 핸들러는 우리가 흔히 이야기하는 컨트롤러이다)**, `HandlerMethodArgumentResolver`의 콘크리트 클래스는 20종이 넘게 존재한다.

<br />

`HandlerMethodArgumentResolver`는 데이터가 HTTP 헤더에 존재하는 경우 알아서 데이터를 파싱하고 객체에 바인딩 하지만, 만약 클라이언트가 `POST` 등의 방식을 통해 요청을 보내어 데이터가 `HTTP 바디`에 존재하는 경우엔  `MessageConverter`에게 처리를 위임한다. (응답도 마찬가지다.)

위 경우에는 `HTTP 바디`의 데이터를 받겠다는 의미의 `@RequestBody`를 선언해주어야 한다. 

마찬가지로 응답에는 `@ResponseBody`를 선언하며 `@RestController`를 사용한다면 `@ResponseBody`를 생략할 수 있다.

<br />

무슨 말인지 잘 모르겠다면 역시 코드를 보자 !

`HandlerMethodArgumentResolver`에 대한 포스팅이니 **상단 이미지의 5번부터 보면 되겠다.**

또한 이 포스팅에서는 가장 많이 사용하는 `@ModelAttribute`와 `@RequestParam`에 대해서만 다룰 것이다.

<br />

```java
@Slf4j
@RestController
public class HelloApiController {

    // 사용자의 요청을 파싱해 helloV1()에 선언된 Person을 만들고 데이터를 바인딩해준다
    @GetMapping("/v1/hello")  
    public Person helloV1(Person person) { // @ModelAttribute가 없는 경우
        log.info("person={}", person);
        return person;
    }

    @GetMapping("/v2/hello")
    public Person helloV2(@ModelAttribute Person person) { // @ModelAttribute가 있는 경우
        log.info("person={}", person);
        return person;
    }

    @GetMapping("/v3/hello")
    public String helloV3(String name, int age) { // @RequestParam이 없는 경우
        log.info("name={}, age={}", name, age);
        return "ok";
    }

    @GetMapping("/v4/hello")
    public String helloV4(@RequestParam String name, @RequestParam int age) { // @RequestParam이 있는 경우
        log.info("name={}, age={}", name, age);
        return "ok";
    }

}

@Getter
@Setter
@ToString
public class Person {

    private String name;
    private int age;

}
```

<br />

서버를 기동하고 브라우저에 `localhost:8080/v1/hello?name=siro&age=11`을 입력하면 데이터가 서버로 전송되고(GET), 핸들러 매핑을 통해 결국 위 컨트롤러 코드에 도달할 것이다.

이때 `Person`이라는 객체를 만들고 이곳에 핸들러 어댑터에게 전달받은 데이터들을 바인딩한 후 컨트롤러로 넘겨주는 역할을 `HandlerMethodArgumentResolver`가 한다.

그러면 개발자는 그냥 쿼리스트링을 전달받을 `Person` 클래스를 생성해서 선언하거나 혹은, 스칼라타입인 `String`과 `int`만 선언하면 하면 된다. 굉장히 편리하다.

테스트를 하기에 앞서 매번 서버를 껏다켰다하는 노가다를 할 수는 없으니 간단한 테스트 코드를 작성했다.

<br />

```java
// file: 'HelloApiControllerTest.class'
@WebMvcTest(HelloApiController.class)
class HelloApiControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    @DisplayName("@ModelAttribute가 존재하지 않는 경우")
    void helloV1() throws Exception {
        performGet("v1");
    }

    @Test
    @DisplayName("@ModelAttribute가 존재하는 경우")
    void helloV2() throws Exception {
        performGet("v2");
    }

    @Test
    @DisplayName("@RequestParam이 존재하는 경우")
    void helloV3() throws Exception {
        performGet("v3");
    }

    @Test
    @DisplayName("@RequestParam이 존재하지 않는 경우")
    void helloV4() throws Exception {
        performGet("v4");
    }

    private void performGet(String version) throws Exception {
        mvc.perform(get("/" + version + "/hello?name=siro&age=11"))
            .andDo(print())
            .andExpect(status().isOk());
    }

}
```

<br />

# ⚙ 구조

---

러프하게 봤을 때,

<br />

1. 사용자의 요청을 받아 관리하는 `DispatcherServlet` <u>(Dispatcher는 관제탑에서 앞에 모니터 여러개 두고 헤드셋 낀 상태로 ~하세요. ~하세요. 하는 사람들을 연상하면 된다.)</u>
2. 사용자의 요청을 처리할 핸들러(=컨트롤러)를 찾아주는 `HandlerMapping`
3. 사용자의 요청을 처리할 핸들러를 `DispatcherServlet`와 연결해주는 `HandlerAdapter`
4. `HandlerAdapter`의 요청(메시지)를 받아 요청을 파싱해 핸들러에 넘어갈 매개변수로 만들어주는 `HandlerMethodArgumentResolver`
5. `HandlerMethodArgumentResolver`가 처리하지 못하는 경우(=데이터가 HTTP 바디에 들어있는 경우), 이를 대신 처리해줄 `MessageConverter`

<br />

가 있다, 물론 훨씬 더 많은 클래스가 존재하지만 다 보기에는 너무너무 방대하므로 일단 이정도만 보자.

`HandlerAdapter`의 콘크리트 클래스중에는 `@RequestMapping`이 달려있는 컨트롤러들을 처리하는 `RequestMappingHandlerAdapter`가 존재하며, 이녀석이 가장 높은 우선순위를 갖고 호출된다.

`RequestMappingHandlerAdapter`는 매개변수 생성을 `ModelFactory`에 의존하며, `ModelFactory`는 `HandlerMethod`의 콘크리트 클래스인 `InvocableHandlerMethod`을 의존한다.

그리고 `InvocableHandlerMethod`는 내부 필드로 `HandlerMethodArgumentResolverComposite`를 갖는데, 이름에서 이녀석이 하는 역할을 아주 극명하게 나타내고 있다.(여기서 `이펙티브 자바`의 <u>상속보다는 컴포지션을 활용하라</u>라는 문구가 떠올랐다.)

`HandlerMethodArgumentResolverComposite`는 내부적으로 `HandlerMethodArgumentResolver`의 모든 콘크리트 클래스를 `ArrayList`로 갖고 있으며(27개), 요청을 받으면 루프를 돌며 알맞은 `HandlerMethodArgumentResolver`를 찾고 처리를 위임한다.(=커맨드 패턴)

<br />

# ✨ ModelAttributeMethodProcessor

---

그중 `ModelAttributeMethodProcessor`는 `@ModelAttribute`를 처리해주는 `HandlerMethodArgumentResolver`의 콘크리트 클래스 중 하나이다.

코드에 이해한 내용을 주석으로 달았다.

<br />

```java
// file: 'InvocableHandlerMethod.class'
public class InvocableHandlerMethod extends HandlerMethod {
    protected Object[] getMethodArgumentValues(NativeWebRequest request, @Nullable ModelAndViewContainer mavContainer,
        Object... providedArgs) throws Exception {

        MethodParameter[] parameters = getMethodParameters(); // 컨트롤러의 메서드에 선언된 매개변수의 개수를 의미한다. 여기선 1개(Person)가 되겠다
        if (ObjectUtils.isEmpty(parameters)) { // 컨트롤러의 메서드에 선언된 매개변수의 개수가 0개라면 ArgumentResolver가 어떤 처리를 할 필요가 없다
            return EMPTY_ARGS;
        }

        Object[] args = new Object[parameters.length]; // 만들어야 할 매개변수의 수만큼의 길이를 갖는 정적배열을 생성한다
        for (int i = 0; i < parameters.length; i++) {
            MethodParameter parameter = parameters[i];
            parameter.initParameterNameDiscovery(this.parameterNameDiscoverer);
            args[i] = findProvidedArgument(parameter, providedArgs); // 커스텀 확장을 위해 열어둔 부분으로 사료된다
            if (args[i] != null) {
                continue;
            }
            if (!this.resolvers.supportsParameter(parameter)) { // ArgumentResolver가 해당 매개변수를 만들어낼 수 있는지를 체크
                throw new IllegalStateException(formatArgumentError(parameter, "No suitable resolver")); // 만들어낼 수 없다면 예외를 던진다
            }
            try {
                // 실제로 컨트롤러에 전달될 매개변수를 만들어내는 부분으로 내부 구현은 커맨드 패턴으로 이루어져있다.
                // resolveArgument()는 HandlerMethodArgumentResolverComposite.getArgumentResolver()를 호출한다
                // getArgumentResolver()는 ArgumentResolver가 들어있는 List를 순회하며 resolver.supportsParameter()를 호출한다
                // 해당 매개변수를 생성 할 수 있는 ArgumentResolver를 찾아 반환한다. 없다면 null을 반환한다.
                // resolveArgument()는 반환받은 ArgumentResolver의 resolveArgument()를 호출해 데이터가 바인딩 된 매개변수 인스턴스를 생성하고 반환한다.
                args[i] = this.resolvers.resolveArgument(parameter, mavContainer, request, this.dataBinderFactory);
            }
            catch (Exception ex) {
                if (logger.isDebugEnabled()) {
                    String exMsg = ex.getMessage();
                    if (exMsg != null && !exMsg.contains(parameter.getExecutable().toGenericString())) {
                        logger.debug(formatArgumentError(parameter, exMsg));
                    }
                }
                throw ex;
            }
        }
        return args;
    }
}
```

<br />

```java
// file: 'HandlerMethodArgumentResolverComposite.class'
public class HandlerMethodArgumentResolverComposite implements HandlerMethodArgumentResolver { 
    
    ...

    @Override
    @Nullable
    public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
        NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {

        HandlerMethodArgumentResolver resolver = getArgumentResolver(parameter); // 매개변수를 생성해낼 ArgumentResolver를 가져온다 
        if (resolver == null) { // 매개변수를 생성할 수 있는 ArgumentResolver가 없다면 예외를 던진다
            throw new IllegalArgumentException("Unsupported parameter type [" +
                parameter.getParameterType().getName() + "]. supportsParameter should be called first.");
        }
        return resolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory); // ArgumentResolver가 존재한다면 매개변수 생성을 위임한다
    }

    @Nullable
    private HandlerMethodArgumentResolver getArgumentResolver(MethodParameter parameter) {
        HandlerMethodArgumentResolver result = this.argumentResolverCache.get(parameter);
        if (result == null) {
            for (HandlerMethodArgumentResolver resolver : this.argumentResolvers) {
                // ArgumentResolver가 들어있는 List를 순회하며 매개변수를 생성할 수 있는 ArgumentResolver를 찾는다
                if (resolver.supportsParameter(parameter)) { 
                    result = resolver;
                    this.argumentResolverCache.put(parameter, result);
                    break;
                }
            }
        }
        return result;
    }

}
```

<br />

`@ModelAttribute`를 처리하는 `ArgumentResolver`는 `ModelAttributeMethodProcessor`이다.

<br />

```java
// file: 'ModelAttributeMethodProcessor.class'
@Override
@Nullable
public final Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
    NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {

    Assert.state(mavContainer != null, "ModelAttributeMethodProcessor requires ModelAndViewContainer");
    Assert.state(binderFactory != null, "ModelAttributeMethodProcessor requires WebDataBinderFactory");

    // 컨트롤러에 선언된 매개변수명을 가져온다. 컨트롤러 매개변수에 Person person으로 선언했으므로 "person"이 나오게 된다.
    String name = ModelFactory.getNameForParameter(parameter); 
    ModelAttribute ann = parameter.getParameterAnnotation(ModelAttribute.class); // @ModelAttribute가 컨트롤러 매개변수에 선언돼있는지 체크한다
    if (ann != null) { // @ModelAttribute가 있다면 ModelAndViewContainer에 별도의 설정을한다. 이 부분은 SSR시 View에 데이터가 바인딩되는 부분을 처리하는 것 같다.
        mavContainer.setBinding(name, ann.binding());
    }

    Object attribute = null; // 실제로 생성될 매개변수 인스턴스를 담을 변수
    BindingResult bindingResult = null; // ModelAndView 바인딩 결과를 캡슐화한 클래스

    if (mavContainer.containsAttribute(name)) { // ModelAndViewContainer에 person을 키로 갖는 인스턴스가 존재하면 꺼내온다 (HashMap)
        attribute = mavContainer.getModel().get(name);
    }
    else {
        try {
            attribute = createAttribute(name, parameter, binderFactory, webRequest); // 인스턴스가 없다면 컨트롤러의 매개변수가 될 인스턴스를 새로 만들어야 할 것이므로 생성한다
        }
        catch (BindException ex) {
            if (isBindExceptionRequired(parameter)) {
                throw ex;
        }
        if (parameter.getParameterType() == Optional.class) {
            attribute = Optional.empty();
        }
        else {
            attribute = ex.getTarget();
        }
        bindingResult = ex.getBindingResult();
        }
    }

    // ... 아래 메서드로 잠시 이동
}

protected Object createAttribute(String attributeName, MethodParameter parameter,
    WebDataBinderFactory binderFactory, NativeWebRequest webRequest) throws Exception {

    // 생성해야 할 매개변수의 타입이 Optional인 경우 별도의 처리를 진행하는걸로 보인다
    MethodParameter nestedParameter = parameter.nestedIfOptional();
    Class<?> clazz = nestedParameter.getNestedParameterType();

    // 생성해야 할 매개변수의 생성자를 가져온다. 기본적으로 기본생성자를 가져오지만, AllArgumentConstructor가 있다면 이것을 가져온다.
    Constructor<?> ctor = BeanUtils.getResolvableConstructor(clazz);  
    
    // 가져온 생성자에 클라이언트가 보낸 요청 데이터를 모두 바인딩한다. 위에서 AllArgumentConstructor가 아닌 생성자를 가져왔다면 별도의 Setter가 필요하다.
    // Setter가 없다면 null이나 기본값으로 바인딩하며, 인수 타입이 맞지 않다면 BindException을 던지고, 생성자를 호출하지 못했다면 Exception을 던진다.
    Object attribute = constructAttribute(ctor, attributeName, parameter, binderFactory, webRequest);
    
    if (parameter != nestedParameter) { 
        attribute = Optional.of(attribute);
    }
    return attribute;
}

@Override
@Nullable
public final Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
        NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
    
    // ... 다시 돌아옴
    // 이 시점에서 기본생성자를 호출했기 때문에 attribute = Person(name=null, age=0) 이며,
    // 만약 AllArgumentConstructor를 가져와 만들었다면 이 시점에서 Person(name=siro, age=11)이다.
    // mavContainer에 대한 처리가 아직 완료되지 않았으므로 이 시점에서 bindingResult는 항상 null 이다.
    
    // 어찌됐든 이 시점에서는 attribute = Person(name=null, age=0)이다.
        
    if (bindingResult == null) {
        WebDataBinder binder = binderFactory.createBinder(webRequest, attribute, name);
        if (binder.getTarget() != null) {
            if (!mavContainer.isBindingDisabled(name)) {
                bindRequestParameters(binder, webRequest); // Setter를 호출해서 데이터를 모두 바인딩한다. 이 시점에서 Person(name=siro, age=11)이다.
            }
            validateIfApplicable(binder, parameter); // 유효성 검증 로직
            if (binder.getBindingResult().hasErrors() && isBindExceptionRequired(binder, parameter)) { // 유효성 검증 로직
                throw new BindException(binder.getBindingResult());
            }
        }
        if (!parameter.getParameterType().isInstance(attribute)) { // 유효성 검증 로직
            attribute = binder.convertIfNecessary(binder.getTarget(), parameter.getParameterType(), parameter);
        }
        bindingResult = binder.getBindingResult();
    }

    // 만약 반환타입이 ModelAndView일 경우를 대비해 ModelAndViewContainer에 데이터를 함께 바인딩해준다
    Map<String, Object> bindingResultModel = bindingResult.getModel();
    mavContainer.removeAttributes(bindingResultModel);
    mavContainer.addAllAttributes(bindingResultModel);

    // 컨트롤러에 전달되어야 할 매개변수가 만들어졌고, 모든 데이터가 바안딩되었다. 이를 반환한다.
    return attribute;
}
```

<br />

# ✨ RequestParamMethodArgumentResolver

---

그중 `RequestParamMethodArgumentResolver`는 `@RequestParam`을 처리해주는 `HandlerMethodArgumentResolver`의 콘크리트 클래스 중 하나이다.

`RequestParamMethodArgumentResolver`는 대부분의 처리를 상위 추상 클래스인 `AbstractNamedValueMethodArgumentResolver`에 의존하며 핵심 처리는 자신이 오버라이딩한 메서드를 통해 처리한다.

역시 이해한 내용을 코드에 주석으로 달았다.

<br />

```java
// file: 'AbstractNamedValueMethodArgumentResolver.class'
public abstract class AbstractNamedValueMethodArgumentResolver implements HandlerMethodArgumentResolver {
    @Override
    @Nullable
    public final Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
        NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
        
        NamedValueInfo namedValueInfo = getNamedValueInfo(parameter); // 주어진 메소드 매개변수에 대해 명명된 값을 얻는다.
        MethodParameter nestedParameter = parameter.nestedIfOptional(); // 매개변수가 Optional로 선언된 경우 별도의 처리를 하고, 아닐경우 그냥 반환한다.

        // 유효성 검사
        Object resolvedName = resolveEmbeddedValuesAndExpressions(namedValueInfo.name); 
        if (resolvedName == null) {
            throw new IllegalArgumentException(
                "Specified name must not resolve to null: [" + namedValueInfo.name + "]");
        }

        // 이곳에서 RequestParamMethodArgumentResolver이 오버라이딩한 곳으로 넘어간다.
        // 컨트롤러에 선언된 매개변수 타입과 변수명을 넘긴다.
        // 첫번째 인수는 변수명인데 사용자가 보낸 변수명과 컨트롤러 메서드에 선언된 매개변수의 변수명을 둘다 의미한다
        // 두번째 인수는 컨트롤러에 선언된 매개변수를 추상화한 클래스
        // 세번째 인수는 사용자의 요청 그 자체를 의미한다
        Object arg = resolveName(resolvedName.toString(), nestedParameter, webRequest);
        
        ...

        return arg;
    }
}
```

<br />

```java
// file: 'RequestParamMethodArgumentResolver.class'
public class RequestParamMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver
    implements UriComponentsContributor {
    
    // 어떤 경우 RequestParamMethodArgumentResolver가 처리를 진행할지에 대한 코드이다
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
    
        // 매개변수에 @RequestParam 이 선언된 경우 
        if (parameter.hasParameterAnnotation(RequestParam.class)) {
	
            // @RequestParam Optional<E> var 식으로 선언된 경우 별도의 처리를 하고 결과를 반환
            if (Map.class.isAssignableFrom(parameter.nestedIfOptional().getNestedParameterType())) {
                RequestParam requestParam = parameter.getParameterAnnotation(RequestParam.class);
                return (requestParam != null && StringUtils.hasText(requestParam.name()));
            }
	    
            // @RequestParam이 달려있으면서 Optional이 아닌 경우 true를 반환
            else {
                return true;
            }
        }
        else {
	
            // 매개변수에 @RequestPart가 선언된 경우 false를 반환
            if (parameter.hasParameterAnnotation(RequestPart.class)) {
                return false;
            }

            // 매개변수에 @RequestPart가 선언돼있지 않으면서, Optional이고 Multipart 관련된 타입인 경우 true를 반환
            parameter = parameter.nestedIfOptional();
            if (MultipartResolutionDelegate.isMultipartArgument(parameter)) {
                return true;
            }
            
            // RequestParamMethodArgumentResolver는 useDefaultResolution라는 이름의 boolean 상태값을 갖는다.
            // useDefaultResolution=false이면 @RequestParam이 존재하는 경우 처리한다는 뜻이다
            // useDefaultResolution=true이면 개발자가 @RequestParam을 생략한 경우 처리한다는 뜻이다
            
            // useDefaultResolution=true 인 경우이므로 @RequestParam이 없으면서, SimpleProperty인 경우 true를 반환한다는 뜻이다
            // 문서에 의하면 SimpleProperty의 정의는 다음과 같다
            // - primitive or primitive wrapper
            // - enum
            // - String or other CharSequence
            // - Number
            // - Date or Temporal            
            // - URI or URL
            // - Locale or a Class.
            else if (this.useDefaultResolution) { 
                return BeanUtils.isSimpleProperty(parameter.getNestedParameterType());
            }
            
            // 모두 아니라면 false를 반환한다 (자신이 처리하지 않겠다는 뜻)
            else {
                return false;
            }
        }
    }
    @Override
    @Nullable
    protected Object resolveName(String name, MethodParameter parameter, NativeWebRequest request) throws Exception {
        HttpServletRequest servletRequest = request.getNativeRequest(HttpServletRequest.class);

        // 선언된 매개변수가 Multipart 관련된 타입이라면 여기서 처리한다
        if (servletRequest != null) {
            Object mpArg = MultipartResolutionDelegate.resolveMultipartArgument(name, parameter, servletRequest);
            if (mpArg != MultipartResolutionDelegate.UNRESOLVABLE) {
                return mpArg;
            }
        }

        Object arg = null;

        // 요청이 Multipart 관련된 타입이라면 여기서 처리한다
        MultipartRequest multipartRequest = request.getNativeRequest(MultipartRequest.class);
        if (multipartRequest != null) {
            List<MultipartFile> files = multipartRequest.getFiles(name);
            if (!files.isEmpty()) {
                arg = (files.size() == 1 ? files.get(0) : files);
            }
        }
        
        // Multipart가 아닌 경우라면 여기서 처리한다
        if (arg == null) {
            String[] paramValues = request.getParameterValues(name);
            if (paramValues != null) {
                arg = (paramValues.length == 1 ? paramValues[0] : paramValues);
            }
        }
	
        // 생성된 매개변수의 인스턴스를 반환한다
        return arg;
    }
}
```

<br />

# 🤔 정리

---

- `@RequestParam`은 생략하지 않고 붙여주면 쓸데없는 루프 순회를 줄이는데 도움을 준다.
- `@RequestParam`을 생략하면 스레드당 필요없는 루프 순회를 적게는 수십번, 많게는 수백번 더 돌지만 코드가 더 간결해진다.
- 코드상으로 보기에 `@ModelAttribute`가 하는 일이 `ModelAndView`를 설정하는 것이 주 목적으로 보이는데 이 부분에서 약간 혼선이 온다.
    - 실제로 `@ModelAttribute`가 없어도 쿼리스트링으로 넘어오는 데이터들은 바인딩이 아주 잘 된다.
    - 결국 `@ModelAttribute`가 있고 없고의 차이는 `mavContainer(ModelAndViewContainer)`를 어떻게 처리하는가이다.
    - 그렇다면 만약 `SSR` 방식이 아니고 `CSR` 방식이라 `@RestController`를 사용한다면 `@ModelAttribute`를 생략하는 것이 조금 더 효율적일까? `CSR` 방식이라면 `ModelAndView`를 신경쓰지 않아도 .
        - 이렇게 보기엔 `RequestMappingHandlerAdapter`가 처음에는 `@ModelAttribute`가 있는 매개변수를 조회하고, 마지막에는 `@ModelAttribute`가 없는 매개변수를 다시 조회한다.
        - 따라서 어차피 `@ModelAttribute`가 있든 없든 무조건 조회되므로 효율적이라고 보기 힘들 것 같다.
        - 이런 구조로 만든 이유가 무엇일까? 지금 내 수준으로선 짐작하기 어렵다.

```java
// file: 'RequestMappingHandlerAdapter.class'
private List<HandlerMethodArgumentResolver> getDefaultArgumentResolvers() {
    List<HandlerMethodArgumentResolver> resolvers = new ArrayList<>(30);

    // Annotation-based argument resolution
    resolvers.add(new RequestParamMethodArgumentResolver(getBeanFactory(), false)); // @RequestParam이 있는 경우
    resolvers.add(new RequestParamMapMethodArgumentResolver());
    resolvers.add(new PathVariableMethodArgumentResolver());
    resolvers.add(new PathVariableMapMethodArgumentResolver());
    resolvers.add(new MatrixVariableMethodArgumentResolver());
    resolvers.add(new MatrixVariableMapMethodArgumentResolver());
    resolvers.add(new ServletModelAttributeMethodProcessor(false)); // @ModelAttribute가 있는 경우
    resolvers.add(new RequestResponseBodyMethodProcessor(getMessageConverters(), this.requestResponseBodyAdvice));
    resolvers.add(new RequestPartMethodArgumentResolver(getMessageConverters(), this.requestResponseBodyAdvice));
    resolvers.add(new RequestHeaderMethodArgumentResolver(getBeanFactory()));
    resolvers.add(new RequestHeaderMapMethodArgumentResolver());
    resolvers.add(new ServletCookieValueMethodArgumentResolver(getBeanFactory()));
    resolvers.add(new ExpressionValueMethodArgumentResolver(getBeanFactory()));
    resolvers.add(new SessionAttributeMethodArgumentResolver());
    resolvers.add(new RequestAttributeMethodArgumentResolver());
    
    ...

    // Type-based argument resolution
	
    ... 

    // Custom arguments
	
    ...

    // Catch-all
    resolvers.add(new PrincipalMethodArgumentResolver());
    resolvers.add(new RequestParamMethodArgumentResolver(getBeanFactory(), true)); // @RequestParam이 없는 경우
    resolvers.add(new ServletModelAttributeMethodProcessor(true)); // @ModelAttribute가 없는 경우
	
    return resolvers;
}
```

<br />

- 정적 팩토리 메서드를 사용해 생성자의 접근제한자가 `private`이나 `protected`가 되더라도 상관없다. 
- 리플렉션을 통해 별도의 설정을 하고 접근하기 때문에 접근가능하다.
    - 즉, 생성자를 숨기고 정적팩토리 메서드를 노출해도 바인딩이 아주 잘 된다.

<br />

- `수정자(Setter)`를 무조건 달아야 하는 줄 알았어서 객체지향을 공부하다 보니 이게 매우 불-편했는데, **코드를 뜯어보니 수정자가 항상 필요한건 아니다.**
    - 즉, 생성자로 데이터 바인딩을 커버칠 수 있다면 수정자는 아예 없어도 된다
    - 다만 `접근자(Getter)`는 무조건 있어야만 하는데, 이유는 데이터를 반환할때 데이터를 꺼내야하기 때문이다.
    - 접근자를 제거했더니 하기와 같은 예외가 발생했다.

> DefaultHandlerExceptionResolver : Resolved [org.springframework.web.HttpMediaTypeNotAcceptableException: Could not find acceptable representation]

<br />

- 굉장히 웃기지만 하기와 같은 방식으로도 바인딩이 가능하다.
    - 생성자를 통해 `String name`에 `siro`를 바인딩한다.
    - 수정자를 통해 `int age`에 `11`을 바인딩한다.

```java
@ToString
public class Person {

    private String name; // 생성자를 통해 객체 생성과 동시에 바인딩
    private int age; // 이후 수정자를 통해 바인딩

    public Person(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }

}
```

<br />
