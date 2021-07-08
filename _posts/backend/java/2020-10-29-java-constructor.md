---
layout: post
category:
    - backend
    - java
date: 2020-10-29 23:22
title: 생성자(Constructor)
description: >
     `Java`의 `생성자(Constructor)`에 대한 정리
image: /assets/img/backend/java.png
related_posts:
    - _posts/backend/java/2020-10-29-java-object.md
---

* toc
{:toc}
  
&nbsp;  

자바 생성자의 문법은 `new ClassName();` 이다.

&nbsp;  

```java
public class TestMain {     
    public static void main(String[] args) { 
        TestClass testA = new TestClass("아반떼", "검은색");
    }
}
```

&nbsp;  

생성자는 클래스의 사용을 위해 객체를 생성할 때 사용한다.

기본적으로 개발자가 따로 생성자를 작성해주지 않는다면 자바 컴파일러는 소스코드를 컴파일링 하며 기본 생성자를 작성하여 준다. 이것이 우리의 눈에는 직접적으로 보이지 않을 뿐이다.

이 기본 생성자를 이용하여 객체를 생성한다면 객체를 만든 클래스의 필드를 모두 자동으로 초기화시켜주는데, 이 말은

`int`의 경우 값이 0으로 초기화가 될 것이고, `String` 같은 경우 `null`로 초기화가 되는 것을 말한다.

생성자를 개발자가 직접 작성하는 경우는 객체가 생성되는 시점에 특정 필드를 이러한 기본값이 아닌 원하는 값으로 지정하여 초기화하고자 함이다.

예를 들어 위 코드 블록과 같이 매개변수를 지정하여 생성자를 호출할 경우 TestClass에는

&nbsp;  

```java
public class TestClass {
    String model;
    String color;
    int a;

    TestClass(String model, String color){
        this.model = model;
        this.color = color;
    }
}
```

&nbsp;  

위와 같이 시그니처가 동일한 생성자가 따로 작성되어 있어야 한다.

그리고 위와같이 작성하여 매개변수를 보낼 경우, 객체가 생성되는 시점에 `String model`과 `String color` 필드는 

각각 `null`, `null`이 아닌 `아반떼`, `검은색`으로 초기화된다. 

물론 int a 필드의 경우 따로 생성자에서 지정해준 값이 없으므로 자동적으로 0으로 초기화가 될 것이다.

그리고 이 생성자는 개발자가 원하는 대로 여러 개를 작성할 수 있는데, 이를 `생성자 오버로딩`이라고 부른다.

&nbsp;  
