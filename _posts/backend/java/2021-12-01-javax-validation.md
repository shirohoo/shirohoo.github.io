---
layout: post
category:
  - backend
  - java
title: javax.validation
description: |
    JSR-380에 정의된 자바 유효성 검사 표준
image: /assets/img/backend/java.png
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

# ✔ Validation

---

`Validation API`는 [JSR-380](https://jcp.org/en/jsr/detail?id=380) 에 정의된 자바 플랫폼의 유효성 검사 표준으로 `javax.validation` 패키지에 위치한다.

<br />

> 💡 JSR(Java Specification Request) ?
>
> 자바 스펙 요구서로 자바 플랫폼에 추가된 사양 및 기술을 정의하는 공식 문서이다.

<br />

다양한 사용 방법이 있으나, 이번 포스팅에서는 별도의 유틸리티 클래스를 통해 도메인 계층에서 유효성을 검증하는 방법을 작성한다.

`Validation API`에 대한 조금 더 자세한 사용방법들은 [Baeldung - Validation](https://www.baeldung.com/javax-validation) 을 참고해보자.

<br />

# 설치

---

```groovy
// file: 'build.gradle'

dependencies {
implementation 'javax.validation:validation-api:2.0.1.Final'
}
```

<br />

만약 스프링 부트를 사용한다면 스타터를 지원한다.

```groovy
// file: 'build.gradle'

dependencies {
implementation 'org.springframework.boot:spring-boot-starter-validation'
}
```

<br />

# 사용

---

다음과 같은 클래스가 있다.

<br />

```java
@Value(staticConstructor = "of")
public class Cat {

    String name;
    Long age;

}
```

<br />

고양이의 이름과 나이가 절대로 비어있으면 안된다고 가정하면 다음과 같은 코드를 매번 작성해야만 한다.

<br />

```java
public class CatService {

    public void doSomething(Cat cat) {
        Objects.requireNonNull(cat, "cat must not be null");
        Objects.requireNonNull(cat.getName(), "cat name must not be null");
        Objects.requireNonNull(cat.getAge(), "cat age must not be null");
        // other codes...
    }

}
```

<br />

이런 귀찮은 작업을 모두 대신 처리해주는게 `Validation API`라고 볼 수 있는데, 이것을 사용하면 다음과 같이 바꿀 수 있다.

<br />

```java
@Value(staticConstructor = "of")
public class Cat {

    @NotNull // 고양이 이름은 null일 수 없다
    String name;

    @NotNull // 고양이 나이는 null일 수 없다
    Long age;

}
```

<br />

이제 어노테이션을 사용하려면 일반적으로 `@Valid`나 `@Validated` 를 사용하면 되는데, 이는 컨트롤러 레이어에 사용시에만 제대로 동작한다.

왜 컨트롤러 레이어에서만 제대로 동작하느냐면, `Spring MVC`를 사용 할 경우 인터셉터에서 위 어노테이션들을 통해 검증하는 상세 구현이 있기 때문이다.

하지만 유효성 검사를 컨트롤러 레이어에 종속시키는 것보다 도메인에서 담당하게 하는 것이 설계상 조금 더 좋다고 보는데, 이 경우 위 어노테이션들은 동작하지 않는다.

서비스 레이어는 `Spring MVC`에서 구현한 인터셉터의 영향을 받지 않기 때문이다. (굳이 동작하게 하려면 번거로운 짓을 좀 해야한다.)

따라서 별도의 검증기를 만들어 주면 매우 유용하다.

<br />

```java
// 일단 정적 메서드로 다 해결할 수 있으므로 추상 클래스로 작성
public abstract class ValidateUtils {

    // 어노테이션 기반으로 검증을 처리해주는 검증기를 선언
    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    // 추후에 확장될수도 있으므로 기본 생성자를 작성
    public ValidateUtils() {
    }

    // 검증 메서드
    public static void validate(@NonNull Object... objects) {
        // 넘어온 인자를 순회하며 검증
        for (Object object : objects) {
            // 인자에 선언된 어노테이션으로 검증. 만약 유효성 검사에 통과하지 못하면 에러메시지를 반환한다
            Set<ConstraintViolation<Object>> violations = VALIDATOR.validate(object);
            
            // 유효성 검사에 통과하지 못했다면 에러메시지가 들어있을 것이다.
            // 즉, isEmpty==true일 경우 유효성 검사에 통과하지 못했음을 의미한다.
            if (!violations.isEmpty()) {
                throw new ConstraintViolationException(violations);
            }
        }
    }

}
```

<br />

이후 도메인 코드는 다음과 같이 바뀔 수 있다.

<br />

```java
public class CatService {

    public void doSomething(Cat cat) {
        ValidateUtils.validate(cat);
        // other codes...
    }

}
```

<br />

```java
class CatServiceTest {

    private CatService catService;

    @BeforeEach
    void setUp() {
        catService = new CatService();
    }

    // 테스트가 성공한다
    @Test
    void doSomething() throws Exception {
        assertThatThrownBy(() -> catService.doSomething(Cat.of(null, null)))
            .isInstanceOf(ConstraintViolationException.class)
            .hasMessage("age: 널이어서는 안됩니다, name: 널이어서는 안됩니다");
    }

}
```

<br />

위 방식에도 큰 단점이 존재하는데, 모든 로직에 매번 검증하는 코드를 추가로 작성해야 한다는 것이다.

이러한 것을 `횡단관심사`라고 부르며 이러한 문제를 해결할 수 있는 아주 좋은 방법이 존재하는데, 그것이 `AOP`이다.

별도의 `Aspect`를 작성하면 위의 단점또한 모두 쉽게 해결할 수 있다.

하지만 `Aspect`는 그 자체로 심오한 내용이 많기 때문에 이 포스팅에서는 더 다루지 않겠다.

그냥 이런 문제가 존재하고, 이런 문제를 어떻게 해결할 수 있다 정도만 알고있도록 하자.

<br />




