---
layout: post
category:
    - backend
    - java
date: 2020-10-29 23:22
title: 객체(Object)
description: >
    `객체지향언어`인 `Java`의 `객체(Object)`에 대한 정리
image: /assets/img/backend/java.png
related_posts:
    - 
---

* toc
{:toc}
  
&nbsp;  

자바의 클래스는 `속성(Field)`과 `기능(Method)`을 갖는다.

자바에서 객체라 함은 일반적으로 이 클래스의 인스턴스를 말한다.

우리는 자바로 프로그래밍을 하면서 우리가 만들고자 하는 것의 기능들을 각 책임 별로 나누어 클래스로 서술한다.

다만 착각하지 않아야 할 것은 이것은 단순히 `서술`하였을 뿐이지 `사용`하는 단계는 아니다.

이 클래스를 실제적으로 사용하기 위해서는 클래스를 인스턴스화 하여야만 한다.

이때 우리는 클래스의 생성자를 이용하여 인스턴스를 생성하는 것을 객체를 생성한다고 이야기한다.

혹은 클래스를 인스턴스화 한다고 표현한다.

이는 클래스에 메모리를 할당하는 물리적인 현상을 뜻한다.

보통 프로젝트를 실행하면 JVM은 해당 패키지에서 Main 메서드를 찾아 실행하는데 이때 메모리에는 Main메서드가 등록되어 프로세스로서 실행되는 것이다.

이 프로세스에서 타 클래스의 객체를 생성하면 힙 메모리 영역에 해당 객체가 물리적으로 등록되며, 만들어진 객체가 참조되지 않을 경우 Garbage Collector는 해당 객체를 메모리에서 삭제하여 메모리의 누수를 방지한다.

```java
package test;

public class TestMain {
	public static void main(String[] args) {
		TestClass testA = new TestClass("아반떼", "검은색");
		TestClass testB = new TestClass("코나", "빨간색");
		
		System.out.println(testA);
		System.out.println(testB);
		
		System.out.println("testA의 모델명 : " + testA.model);
		System.out.println("testA의 색상 : " + testA.color);
		System.out.println("testB의 모델명 : " + testB.model);
		System.out.println("testB의 색상 : " + testB.color);
	}
}

```

```java
package test;

public class TestClass {
	String model;
	String color;
	
	TestClass(String model, String color){
		this.model = model;
		this.color = color;
	}
}

```

&nbsp;  

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FKaF41%2FbtqL7wsp229%2FhNTReUUhCuVYKdGHL0jkU0%2Fimg.png)

&nbsp;  

정말 간단하게 테스트코드를 작성하였다.

일련의 과정을 간단하게 설명해보자면,

1. `TestClass testA = new TestClass("아반떼", "검은색");` 이 실행되는 순간 힙 메모리 영역에 파라미터로 `아반떼`, `검은색`을 전달받은 TestClass의 객체가 생성되고(인스턴스화) 이 객체의 힙 메모리 영역 주소를 TestClass타입의 변수 testA에 할당한다.

2. `System.out.println(testA);` 로 testA의 값을 출력하면 힙 메모리 영역의 주소 값이 출력된다. 그것이 `test.TestClass@5aaa6d82`라는 결과값으로 나타나는 것

3. testA는 힙 메모리 영역(생성된 객체)을 참조하고 있으므로, testA와 `.(마침표)`를 입력하면 해당 클래스의 필드와 메서드를 호출할 수 있게 된다. 그 소스코드와 결과값은 하기와 같다.

&nbsp;  

```java
System.out.println("testA의 모델명 : " + testA.model); // testA의 모델명 : 아반떼
System.out.println("testA의 색상 : " + testA.color); // testA의 색상 : 검은색
```

&nbsp;  

결론적으로 쉽게 비유하여 서술하자면, 클래스를 작성하는 것은 붕어빵 틀을 만든 것과 같고, 객체를 실제로 생성하는 것은 붕어빵 틀에서 붕어빵을 구워낸 것과 같은 것이다.

실제로 콘솔 창의 1,2번째 줄을 보면 각 객체는 같은 클래스에서 생성되었지만 서로 다른 주소 값을 갖고 있다. 이는 힙 메모리 영역에 두개의 객체가 생성되었음을 뜻하고, 두 객체는 상호 독립적인 존재임을 확인 할 수 있다.

마지막으로 2번 항목에 대해 추가적으로 이야기해보자면, 주소 값은 16진수의 해쉬 코드로 출력되는데 이는 Object의 toString() 메서드가 실행되기 때문이다. 모든 요소의 조상인 Object 클래스의 Java API를 참조하면

&nbsp;  

> public [String](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/String.html) toString()
> 
> Returns a string representation of the object. In general, the toString method returns a string that "textually represents" this object. The result should be a concise but informative representation that is easy for a person to read. It is recommended that all subclasses override this method.
> 
> The toString method for class Object returns a string consisting of the name of the class of which the object is an instance, the at-sign character \`@', and the unsigned hexadecimal representation of the hash code of the object. In other words, this method returns a string equal to the value of:
> 
> getClass(). getName() + '@' + Integer.toHexString(hashCode())
> 
> Returns:a string representation of the object.
> 

&nbsp;  

위와 같은 내용을 확인할 수 있다. 리턴되는 값은 하기와 같다.

&nbsp;  

```text
getClass()  .   getName() + '@' + Integer.toHexString(hashCode())

test            .    TestClass      @        5aaa6d82   (16진수(Hex) 해쉬 코드)
```

&nbsp;  

자바의 모든의 요소는 Object 클래스를 상속받고 

`System.out.println();` 메서드는 해당 요소의 `toString()` 메서드를 실행하여 출력해주는데, 

toString(); 메서드를 따로 오버라이딩하지 않았기 때문에 Object 클래스의 toString() 메서드가 실행되는 것이다.
