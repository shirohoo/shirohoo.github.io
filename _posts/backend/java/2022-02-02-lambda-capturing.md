---
layout: post
category:
  - backend
  - java
title: 람다 캡처링(Lambda Capturing)
description: |
    자바 람다 캡처링의 의미와 제약 조건
image: /assets/img/backend/java.png
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

# 람다 캡처링(Capturing Lambda)

---

```java
public class Lambda {
    public void capturingLambda() {
        int portNumber = 8080;
        Runnable runnable = () -> System.out.println(portNumber);
    }
}
```

람다 관점에서 봤을 때 위와 같이 람다 파라미터로 넘겨진 변수가 아닌, 람다 외부의 변수(portNumber)들을 `자유 변수(Free Variable)`라 칭하며, 이러한 자유 변수들을 참조하는 행위를 `람다 캡처링(Capturing Lambda)`이라고 부른다.

람다는 기본적으로 `인스턴스 변수(클래스 멤버 변수)`와 `정적 변수(static으로 선언된 변수)`를 자유롭게 참조할 수 있다.

하지만 지역 변수의 경우에는 약간의 제약이 있다.

<br />

> 지역변수는 명시적으로 final로 선언되거나, 실질적으로 final로 선언된 변수와 똑같이 사용되어야 한다. 

<br />

final로 선언된 변수와 똑같이 사용되어야 한다는 말은 쉽게 이야기하면 재할당되면 안된다는 말이다.

무슨 말인지 이해가 안된다면 아래 코드를 보자.

<br />

```java
public class Lambda {
    public void capturingLambda() {
        int portNumber = 8080;
        Runnable runnable = () -> System.out.println(portNumber); // portNumber가 재할당됐으므로 컴파일 에러 발생
        portNumber = 8081; // 재할당
    }
}
```

<br />

인스턴스 변수에는 이런 제약조건이 없는데, 지역 변수에는 이러한 제약 조건이 있는 이유가 뭘까?

프로세스는 운영체제로부터 메모리를 할당받으며, 이 메모리는 `Code`, `Data`, `Stack`, `Heap` 네개의 구조로 이뤄져있다.

그리고 프로세스 내부의 스레드는 각 스레드별로 고유한 `Stack`을 가지며 부모 프로세스의 `Heap`을 공유할 수 있으며, 자바의 인스턴스 변수는 `Heap`에 저장되고, 지역 변수는 `Stack`에 저장된다.

즉, `Heap`에 할당된 인스턴스 변수는 모든 스레드가 자유롭게 공유할 수 있기 때문에 위와 같은 제약이 없다. (final이 아니어도 컴파일 에러가 발생하지 않는다.)

하지만 지역 변수는 `Stack`에 저장되는데 `Stack`은 각 스레드별로 고유하기 때문에 스레드들이 공유할수가 없다.

<br />

람다는 함수를 다른 함수에 넘기는 동작 파라미터화이므로 람다는 실제로 자신이 선언된 스레드와 다른 별도의 스레드로 넘겨져 실행될수가 있다.

즉, 원래 지역 변수와 람다를 선언했던 스레드의 모든 작업이 끝나 스레드에 할당된 메모리가 해제되어 해당 스레드의 데이터들이 사라졌지만, 람다는 다른 스레드 넘겨져 살아있을 가능성이 존재하며 이 경우 람다가 이미 메모리가 해제되어 사라진 지역 변수를 참조하려하는 문제가 생길 수 있다.

그래서 이러한 문제가 생기지 않게 람다는 최초 자신을 선언해 넘긴 스레드의 스택에 저장된 지역 변수를 자신이 넘겨질 때 넘겨지는 스레드의 스택으로 복사해온다.

이러한 이유로 람다는 별도의 스레드에 존재하는 지역 변수와 동일한 값을 참조할 수 있으며(실제로는 넘겨질 때 복사해온 값), 원래 스레드가 사라져도 자신이 넘겨진 스레드에서 자신이 해야 할 작업을 문제 없이 수행 할 수 있는 것이다.

<br />

하지만 이렇게 지역 변수를 공유해서 사용할 수 없기 때문에 지역 변수를 복사해와 사용하는데 그 변수의 값이 변경된다면 역시 문제가 생길 수 있기 때문에, <u>명시적으로 final이거나 final 처럼 사용되어야 한다는 제약이 생긴 것이다.</u>

<br />

# 참고

- [📕 모던 자바 인 액션](http://www.kyobobook.co.kr/product/detailViewKor.laf?mallGb=KOR&ejkGb=KOR&barcode=9791162242025)
- [📜 Lambda Expression and Variable Capture](https://stackoverflow.com/questions/32272713/lambda-expression-and-variable-capture)
- [📜 Java 8 Lambdas - A Peek Under the Hood](https://www.infoq.com/articles/Java-8-Lambdas-A-Peek-Under-the-Hood/)

<br />
