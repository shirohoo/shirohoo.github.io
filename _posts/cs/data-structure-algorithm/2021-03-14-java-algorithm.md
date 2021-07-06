---
layout: post
category:
    - cs
    - data-structure-algorithm
date: 2021-03-14 23:16
title: Java로 알고리즘 풀 때 유의사항
description: >
    <u>CS와 PS</u>  
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
    -
---

* toc
{:toc}

&nbsp;  

# ✅ 입력 시간을 단축 시키고 싶다면 BufferdReader 사용

```java
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
```

너무 좋은 글이 있어 링크를 첨부한다.

> ***[JAVA [자바] - 입력 뜯어보기 [Scanner, InputStream, BufferedReader]](https://st-lab.tistory.com/41?category=830901)***

# ✅ 출력 시간을 단축 시키고 싶다면 StringBuilder 사용

- 출력 시간을 단축시키고 싶다면 여러번의 `System.out.print` 가 아닌 `StringBuilder` 혹은 `StringBuffer`를 사용하여 문자열을 완성하고 한번의 `System.out.print` 를 호출한다
- `Java`의 `String`은 대표적인 `VO(Value Object)` 로서 불변성을 갖기 때문에 매번 연산시 새로운 인스턴스를 생성하므로 메모리의 낭비가 심하다
- `StringBuilder`와 `StringBuffer`의 차이는 `Thread Safe` 여부이며, 단일 `Thread`의 경우 `StringBuilder`의 성능이 압도적이므로 알고리즘 풀이 시 `StringBuilder`사용을 권장한다

```java
StringBuilder stringBuilder = new StringBuilder();

stringBuilder.append(" _.-;;-._\n") 
			 .append("'-..-'| || |\n") 
			 .append("'-..-'|_.-;;-._|\n") 
			 .append("'-..-'| || |\n") 
			 .append("'-..-'|_.-''-._|"); 
    
System.out.println(stringBuilder);
```

---

# ✅ 큰 수 계산은 BigInteger, BigDecimal을 사용

-   Java의 각 정수 자료형은 다음과 같은 크기를 갖는다

```java
// 2^31 
// -2,147,483,648 ~ 2,147,483,647 
int iNum; 

// 2^63 
// -9,223,372,036,854,775,808~9,223,372,036,854,775,807 
long lNum;
```

- 이 이상의 크기를 갖는 정수형을 표현하기 위해선 직접정수형↔문자열타입 변환을 통한 문자열 계산을 해야만 한다
- 하지만 이러한 계산을 이미 구현 해놓은 클래스가 바로 `BigInteger` 와 `BigDecimal` 이다
- 내부적으로 문자열 연산을 하기에 일반적인 자료형처럼 +, - , \*, / , % 등의 연산자를 사용 할 수 없으며, 해당 클래스에 정의된 메서드를 통해 연산을 해야만 한다
- 두 객체의 공통점은 내부적으로 모두문자열계산을 통한 값의 표현을 하기에 사실상 무한한 정수를 표현 할 수 있다***(API 문서에 따르면 2^5억의 크기를 표현할 수 있다)***
- 두 객체의 차이점으로 `BigInteger` 는 정수형의 표현을 목표로하며, `BigDecimal` 은 실수형의 표현을 목표로 하고, 무한한 정밀도를 보장한다
- `BigDecimal` 은 완벽에 가까운 정밀도로 인해 돈에 대한 데이터를 다루는 금융권, 핀테크 회사에서 많이 볼 수 있는 자료형이지만, Java에 현존하는 모든 자료형 중 손에 꼽을 만큼 무거운 자료형이므로***(클래스 내부 코드라인만 5,000라인, 대부분의 로직이 문자열 연산)*** PS에 사용 시 `TLE(Time Limit Exceeded)` 혹은 `MLE(Memory Limit Exceeded)`가 발생 할 가능성이 있다
- `BigInteger` 는 상대적으로 가벼워 알고리즘 풀이에 쏠쏠하게 사용할 수 있으나, 역시 TLE가 발생 할 경우 어쩔수 없이 직접 문자열 연산을 구현해야만 한다
- 생성자를 통해 객체를 생성할 경우 인수로 `int`, `long`등의 타입도 넘겨줄 수 있긴하나, <u>API 문서에 따르면 문자열을 넘겨 객체를 생성하는 것을 권장</u>하고 있다

```java
	BigInteger bigInteger1 = new BigInteger("11111111111111111111111111111");
	BigInteger bigInteger2 = new BigInteger("22222222222222222222222222222"); 
	System.out.println("bigInteger1: "+bigInteger1); 
	System.out.println("bigInteger2: "+bigInteger2); 
	System.out.println("더하기: "+bigInteger1.add(bigInteger2)); 
	System.out.println("빼기: "+bigInteger1.subtract(bigInteger2));
	System.out.println("곱하기: "+bigInteger1.multiply(bigInteger2)); 
	System.out.println("나누기: "+bigInteger1.divide(bigInteger2)); 
	System.out.println("나머지: "+bigInteger1.remainder(bigInteger2)); 
	System.out.println("이진수 변환: "+bigInteger1.toString(2)); 
	System.out.println("팔진수 변환: "+bigInteger1.toString(8)); 
	System.out.println("십육진수 변환: "+bigInteger1.toString(16));
	
//	bigInteger1:11111111111111111111111111111
//	bigInteger2:22222222222222222222222222222
//	더하기:33333333333333333333333333333
//	빼기:-11111111111111111111111111111
//	곱하기:246913580246913580246913580241975308641975308641975308642
//	나누기:0
//	나머지:11111111111111111111111111111
//	이진수 변환:10001111100110111001010100110001000101
//             00001100101011010100111101100111000111000111000111000111
//	팔진수 변환:10763345230424145324754707070707
//	십육진수 변환:23e6e54c450cad4f671c71c7
```