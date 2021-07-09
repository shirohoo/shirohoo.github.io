---
layout: post
category:
    - backend
    - java
date: 2021-05-19 20:46
title: 자바 리터럴(literal) 표기법과 String
description: >
    자바에서 문자열을 담당하는`String`에 대한 탐구
image: /assets/img/backend/java.png
related_posts:
    - _posts/backend/java/2021-01-17-dto-vo.md
    - _posts/backend/java/2021-01-16-java-jvm.md
---

* toc
{:toc}
  
&nbsp;  

# 📕 리터럴(literal)

---

> 컴퓨터 과학 분야에서 리터럴(literal) 이란 소스 코드의 고정된 값을 대표하는 용어다. 거의 모든 프로그래밍 언어는 정수, 부동소수점, 숫자, 문자열, 불린 자료형과 같은 용어를 가지고 있다. 어떤 언어는 열거 타입이나, 배열, 자료형, 객체와 같은 용어도 있다. 리터럴과 대조적으로, 고정된 값을 가질 수 있는 변수나 변경되지 않는 상수가 있다. 다음의 예제와 같이, 리터럴은 변수 초기화에 종종 사용된다.

&nbsp;  

```java
int i = 1;
String s = "봄싹";
```

{: style="text-align: right" }
_📜 출처 - 위치백과_

&nbsp;  

자바를 공부하다 보면 책에서, 강의에서, 주변 사람에 의해서

리터럴, 리터럴 표기법이라는 용어를 종종 쓰곤 한다.

자바의 인스턴스가 뭔지 알면 아주 쉽게 이해할 수 있는 내용이다.

반대로 자바의 인스턴스가 뭔지 아직 모른다면 절대 제대로 이해할 수 없는 내용이기도 하다.

&nbsp;  

자바에서 문자열을 담당하는 객체는 `String`이다.

또한 String은 아주 대표적인 `VO(Value Object)`이다.

VO가 뭔지 모른다면 [DTO 와 VO의 차이](/backend/java/2021-01-17-dto-vo/)를 참고하기 바란다.

VO는 객체를 값으로 사용하기 때문에 불변성을 갖는다.

&nbsp;  

VO의 이름은 100원인데 런타임에 이 값이 변경되어 

내부적으로 100원의 값이 50원으로 변경됐다고 가정해보자.

그럼 이 VO를 사용하는 모든 로직에서 엉뚱한 결과들이 나올 것이다.

100원은 어떤 상황이더라도 100원의 가치를 해야만 한다.

따라서 VO는 불변해야한다.

&nbsp;  

VO의 공통점은 `수정자(Setter)`가 없거나, `final`로 선언되어 있어

아예 값을 수정하지 못하거나 값을 수정하려고 들면 `에러`가 발생한다는 것이다.

String 객체를 선언하는 데는 여러 가지 방법이 있다.

&nbsp;  

```java
String str = "abc"; // 리터럴 표기법

String str = new String(data); // 생성자 사용

char data[] = {'a', 'b', 'c'};
String s = String.valueOf(data); // valueOf 사용(=생성자사용)
```

&nbsp;  

valueOf 메서드 또한 내부적으로 생성자를 이용한다.

&nbsp;  

```java
public static String valueOf(char data[]) {
    return new String(data);
}
```

&nbsp;  

`java.lang.String`을 찾아보면 최상단에 이런 문구가 있다.

> The String class represents character strings. All string literals in Java programs, such as "abc", are implemented as instances of this class. Strings are constant; their values cannot be changed after they are created. String buffers support mutable strings. Because String objects are immutable they can be shared.

&nbsp;  

이곳에서도 리터럴이라는 용어가 나온다.

여기서 공식문서는 몇 가지 아주 중요한 내용을 말하고 있다.

- `abc`와 같은 자바 프로그램의 모든 문자열 리터럴은 이 클래스의 인스턴스로 구현된다.
- 문자열은 생성된 뒤 값을 변경할 수 없다
- 문자열 객체는 불변하므로 공유할 수 있다

이게 무슨 말일까?

&nbsp;  

## 💡 자바 프로그램의 모든 문자열 리터럴은 이 클래스의 인스턴스로 구현된다. | 문자열 객체는 불변하므로 공유할 수 있다.

---

자바에서는 객체의 인스턴스를 생성하기 위해 생성자(new)를 이용하는데,

이 리터럴 표기법을 사용할 수 있는 String 클래스는 예외가 된다. **(이외에 몇 가지 더 있다)**

&nbsp;  

```java
String s1 = "123";
String s2 = "123";

System.out.println("s1 == s2 ? " + (s1 == s2));
```

&nbsp;  

String은 Object이므로 equals 메서드로 비교하는 게 정석이다.

하지만 이렇게 s1과 s2를 리터럴 표기법으로 선언하고 동일 비교 연산(==)을 수행하면 어떤 결과가 나올까?

&nbsp;  

```java
s1 == s2 // true
```

&nbsp;  

true가 나오게 된다.

Object끼리 동일 비교 연산을 했는데 true라는 결과가 나오는 것부터

두 객체의 주소 값이 같다는 말과 일맥상통하나, 아직 잘 이해가 되지 않는다.

직접 주소 값을 출력해보자.

&nbsp;  

```java
System.out.println("System.identityHashCode(s1) = " + System.identityHashCode(s1));
System.out.println("System.identityHashCode(s2) = " + System.identityHashCode(s2));


System.identityHashCode(s1) = 1626877848
System.identityHashCode(s2) = 1626877848
```

&nbsp;  

볼 것도 없이 같다.

그렇다면 리터럴 표기법이 아닌 생성자를 사용한다면?

&nbsp;  

```java
String s1 = "123";
String s2 = new String("123");
    
System.out.println("s1 == s2 ? " + (s1 == s2)); // false
```

&nbsp;  

이와 같이 false가 출력된다.

생성자로 생성하는 String 객체는 힙 메모리에 생성되기 때문에,

리터럴 표기법으로 작성한 s1과 다른 객체가 된다.

&nbsp;  

```java
String str = "abc"; // 리터럴 표기법
```

&nbsp;  

리터럴 표기법으로 선언한 경우 생성자를 사용하지 않고도 인스턴스가 생성되며 이 인스턴스는 싱글톤이 된다.

따라서 한번 리터럴 표기법으로 생성한 객체는 단 한 번만 생성되며,

여러 클래스에서 같이 정의하더라도 이 객체는 모두 동일한 인스턴스(싱글톤)이다.

&nbsp;  

```java
public class Test1 {
    
    String s = "abc";
}

public class Test2 {
    
    String s = "abc";
}


public class StringTest {
    
    public static void main(String[] args) {
        Test1 test1 = new Test1();
        Test2 test2 = new Test2();
    
        System.out.println(test1.s == test2.s); // true
    }
    
}
```

&nbsp;  

String은 여타 Object와 크게 다를 게 없지만, 이 리터럴 표기법만큼은 굉장히 신기하게 동작한다.

String을 호출하거나 리터럴 표기법으로 선언할 경우 String에 정의된 `intern`이 실행된다.

&nbsp;  

```java
public native String intern();
```

&nbsp;  

시그니처에 `native`라는 키워드가 들어가 있는데,

나는 자바를 공부할 때 native 키워드에 대해 

자바 외의 언어로 작성된 코드를 자바에서 사용하고자 할 때 사용되는 키워드라고 배웠었다.

추적해보니 C계열 언어로 뭔가 많이 적혀있었는데

이쯤 되니 너무 멀리 나가는 것 같기도 하고, 능력 밖인 것 같기도 하여 일단 보류하고

intern의 Docs를 첨부한다.

&nbsp;  

> Returns a canonical representation for the string object. A pool of strings, initially empty, is maintained privately by the class String. When the intern method is invoked, if the pool already contains a string equal to this String object as determined by the equals(Object) method, then the string from the pool is returned. Otherwise, this String object is added to the pool and a reference to this String object is returned. It follows that for any two strings s and t, s.intern() == t.intern() is true if and only if s.equals(t) is true. All literal strings and string-valued constant expressions are interned. String literals are defined in section 3.10.5 of the The Java™ Language Specification.

&nbsp;  

즉 리터럴 표기법으로 String을 선언하거나, String을 호출했을 때

JVM 문자열 풀에 해당 문자열이 존재하면 해당 문자열을 바로 반환해주고,

만약 문자열 풀에 해당 문자열이 없다면 문자열을 풀에 등록하고 등록된 문자열을 반환해준다고 한다.

리터럴 표기법으로 String 객체를 선언하고 자바 역어셈블러를 이용해 코드를 뜯어봤다.

&nbsp;  

```shell
javap -verbose StringTest
Warning: Binary file StringTest contains DataStructure.StringTest
Classfile /mnt/d/development/JavaPractice/out/production/JavaPractice/DataStructure/StringTest.class
  Last modified May 19, 2021; size 527 bytes
  MD5 checksum de12796c5d61a5bdd6c8e440e84fbb6e
  Compiled from "StringTest.java"
public class DataStructure.StringTest
  minor version: 0
  major version: 55
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #6.#22         // java/lang/Object."<init>":()V
   #2 = Class              #23            // java/lang/String
   #3 = String             #24            // 안녕하세요
   #4 = Methodref          #2.#25         // java/lang/String."<init>":(Ljava/lang/String;)V
   #5 = Class              #26            // DataStructure/StringTest
   #6 = Class              #27            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               LDataStructure/StringTest;
  #14 = Utf8               main
  #15 = Utf8               ([Ljava/lang/String;)V
  #16 = Utf8               args
  #17 = Utf8               [Ljava/lang/String;
  #18 = Utf8               s
  #19 = Utf8               Ljava/lang/String;
  #20 = Utf8               SourceFile
  #21 = Utf8               StringTest.java
  #22 = NameAndType        #7:#8          // "<init>":()V
  #23 = Utf8               java/lang/String
  #24 = Utf8               안녕하세요
  #25 = NameAndType        #7:#28         // "<init>":(Ljava/lang/String;)V
  #26 = Utf8               DataStructure/StringTest
  #27 = Utf8               java/lang/Object
  #28 = Utf8               (Ljava/lang/String;)V
{
  public DataStructure.StringTest();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 3: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   LDataStructure/StringTest;

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=3, locals=2, args_size=1
         0: new           #2                  // class java/lang/String
         3: dup
         4: ldc           #3                  // String 안녕하세요
         6: invokespecial #4                  // Method java/lang/String."<init>":(Ljava/lang/String;)V
         9: astore_1
        10: return
      LineNumberTable:
        line 6: 0
        line 9: 10
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      11     0  args   [Ljava/lang/String;
           10       1     1     s   Ljava/lang/String;
}
SourceFile: "StringTest.java"
```

&nbsp;  

JVM 상수풀로 보이는 `Constant pool`이라고 적혀있는 부분에

내가 리터럴 표기법으로 선언한 모든 문자열이 들어있음을 확인할 수 있었다.

즉 이 Constant pool에서 문자열을 검색하거나 등록하고 반환한다는 뜻으로 생각된다.

&nbsp;  

## 💡 문자열은 리터럴로 생성된 뒤 값을 변경할 수 없다

---

String은 불변 객체답게 역시나 수정자(Setter)가 없다.

또한 내부적으로 작성된 코드를 보면

&nbsp;  

```java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {

    @Stable
    private final byte[] value;
    
    ...
    
}
```

&nbsp;  

이와 같이 `final`로 선언돼있음을 알 수 있다.

즉 값을 바꾸고 싶어도 바꿀 수가 없다.

값을 바꾸고 싶다면 아예 새로운 인스턴스를 만들어서 주소를 참조해야만 한다.

&nbsp;  
