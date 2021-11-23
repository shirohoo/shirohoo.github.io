---
layout: post
category:
    - spring
    - spring-mvc
title: ArgumentResolver
description: >
    `Spring MVC`의 `ArgumentResolver` 가 하는 일
image: /assets/img/spring/spring-mvc/spring-boot-logo.png
related_posts:
    - 
---

* toc
{:toc}

# 💡 ArgumentResolver

---

![spring-mvc](https://user-images.githubusercontent.com/71188307/143034392-8d728cd9-edce-46fe-b98c-6c4fd829c0c4.jpg)

<br />

`ArgumentResolver`는 클라이언트가 서버로 보낸 데이터를 핸들러(여기서 말하는 핸들러는 우리가 흔히 이야기하는 컨트롤러이다)의 매개변수 인스턴스로 생성해주는 역할을 담당한다.

이때 만약 클라이언트가 `POST` 등의 `HTTP Method`를 통해 요청을 보내어 데이터가 `HTTP Body`에 존재하는 경우엔 `MessageConverter`에게 처리를 위임한다.

위 경우에는 `HTTP Body`의 데이터를 받겠다는 의미의 `@RequestBody`를 선언해주어야 한다.

<br />

무슨 말인지 잘 모르겠다면 역시 코드를 보자 !

`ArgumentResolver`에 대한 포스팅이니 **상단 이미지의 5번부터 보면 되겠다.**

<br />

```java
@Slf4j
@RestController
public class HelloApiController {

    @GetMapping("/v1/hello")
    public Person helloV1(@ModelAttribute Person person) { // Person을 ArgumentResolver가 만들어준다 !
        log.info("person={}", person);
        return person;
    }
    
}

@Setter
@ToString
public class Person {

    private String name;
    private int age;

}
```

<br />

서버를 기동하고 브라우저에 `localhost:8080/v1/hello?name=siro&age=11`을 입력하면 데이터가 서버로 전송되고, 핸들러 매핑을 통해 결국 위 컨트롤러 코드에 도달할 것이다.

이때 `Person`이라는 객체를 만들고 이곳에 핸들러 어댑터에게 전달받은 데이터들을 바인딩한 후 컨트롤러로 넘겨주는 역할을 `ArgumentResolver`가 한다.

그러면 개발자는 그냥 `Person`을 바로 사용하기만 하면 된다. 굉장히 편리하다.

테스트를 하기에 앞서 매번 서버를 껏다켰다하는 노가다를 할 수는 없으니 간단한 테스트 코드를 작성했다.

<br />

```java
// file: 'HelloApiControllerTest.class'
@WebMvcTest(HelloApiController.class)
class HelloApiControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void helloV1() throws Exception {
        mvc.perform(get("/v1/hello?name=siro&age=11"))
            .andDo(print())
            .andExpect(status().isOk());
    }

}
```

<br />

# ✨ 코드분석

---

코드에 이해한 내용을 주석으로 달았다.

<br />

```java
// file: 'InvocableHandlerMethod.class'
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
				args[i] = this.resolvers.resolveArgument(parameter, mavContainer, request, this.dataBinderFactory); // 실제로 컨트롤러에 전달될 매개변수를 만들어내는 부분
			}
			catch (Exception ex) {
				// Leave stack trace for later, exception may actually be resolved and handled...
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
```

<br />

```java
// file: 'HandlerMethodArgumentResolverComposite.class'
@Override
@Nullable
public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
        NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {

        HandlerMethodArgumentResolver resolver = getArgumentResolver(parameter); // 매개변수를 생성해낼 ArgumentResolver를 가져온다 
        if (resolver == null) { // ArgumentResolver가 null이면 예외를 던진다
            throw new IllegalArgumentException("Unsupported parameter type [" +
                parameter.getParameterType().getName() + "]. supportsParameter should be called first.");
        }
    return resolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory); // ArgumentResolver가 존재한다면 매개변수 생성을 위임한다
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

    String name = ModelFactory.getNameForParameter(parameter); // 컨트롤러에 선언된 매개변수의 이름을 가져온다. 컨트롤러 매개변수를 Person person으로 선언했으므로 person이 나오게 된다.
    ModelAttribute ann = parameter.getParameterAnnotation(ModelAttribute.class); // @ModelAttribute가 컨트롤러 매개변수에 선언돼있는지 체크한다
    if (ann != null) { // @ModelAttribute가 있다면 ModelAndViewContainer에 객체를 바인딩한다. 이는 SSR시 View에 데이터가 바인딩되는 부분을 처리하는 듯 싶다.
        mavContainer.setBinding(name, ann.binding());
    }

    Object attribute = null; // 실제로 생성될 매개변수 인스턴스를 참조할 변수
    BindingResult bindingResult = null; // 바인딩 결과를 캡슐화한 클래스

    if (mavContainer.containsAttribute(name)) { // ModelAndViewContainer에 person을 키로 갖는 인스턴스가 존재하면 꺼내온다 (HashMap)
        attribute = mavContainer.getModel().get(name);
    }
    else {
        // Create attribute instance
        try {
            attribute = createAttribute(name, parameter, binderFactory, webRequest); // 인스턴스가 없다면 컨트롤러의 매개변수가 될 인스턴스를 새로 만들어야 할 것이므로 생성한다
        }
        catch (BindException ex) {
            if (isBindExceptionRequired(parameter)) {
                // No BindingResult parameter -> fail with BindException
                throw ex;
        }
        // Otherwise, expose null/empty value and associated BindingResult
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

    MethodParameter nestedParameter = parameter.nestedIfOptional(); // 생성해야 할 매개변수의 타입이 Optional인 경우 별도의 처리를 진행하는걸로 보인다
    Class<?> clazz = nestedParameter.getNestedParameterType(); // 생성해야 할 매개변수의 타입이 Optional인 경우 별도의 처리를 진행하는걸로 보인다

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

# 🤔 정리

---

- 코드상으로 보기에 `@ModelAttribute`가 하는 일이 `ModelAndView`에 데이터를 바인딩해주는 것이 주 목적으로 보이는데 약간 혼선이 온다.
  - 실제로 `@ModelAttribute`가 없어도 `QueryString`으로 넘어오는 데이터들은 바인딩이 아주 잘 된다. 
  - 그렇다면 만약 `SSR` 방식이 아니고 `CSR` 방식이라 `@RestController`를 사용한다면 `@ModelAttribute`를 생략하는 것이 조금 더 효율적일까?  
    - 이렇게 보기엔 `RequestMappingHandlerAdapter`가 처음에는 `@ModelAttribute`가 없는 매개변수를 조회하고, 마지막에는 `@ModelAttribute`가 있는 매개변수를 다시 조회한다.
    - 따라서 어차피 `@ModelAttribute`가 있든 없든 무조건 조회되므로 효율적이라고 보기 힘들 것 같다.
    - 이런 구조로 만든 이유가 무엇일까? 지금 내 수준으로선 짐작하기 어렵다.

```java
// file: 'RequestMappingHandlerAdapter.class'
private List<HandlerMethodArgumentResolver> getDefaultArgumentResolvers() {
	List<HandlerMethodArgumentResolver> resolvers = new ArrayList<>(30);

	// Annotation-based argument resolution

	...
	
	resolvers.add(new ServletModelAttributeMethodProcessor(false)); // @ModelAttribute가 없는 경우
	
	...

	// Type-based argument resolution
	
	... 

	// Custom arguments
	
	...

	// Catch-all
	
	...
	
	resolvers.add(new ServletModelAttributeMethodProcessor(true)); // @ModelAttribute가 없는 경우

	return resolvers;
}
```

<br />

- 정적 팩토리 메서드를 사용해 생성자의 접근제한자가 `private`이나 `protected`가 되더라도 상관없다. 리플렉션을 통해 별도의 설정을 하고 접근하기 때문에 접근가능하다.
  - 즉, 기본 생성자를 숨기고 정적팩토리 메서드를 생성해도 바인딩이 아주 잘 된다.

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
