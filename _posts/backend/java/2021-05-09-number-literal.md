---
layout: post
category:
    - backend
    - java
date: 2021-05-09 13:49
title: Java 숫자 리터럴 언더바(_)에 대하여
description: >
    큰 숫자의 가독성을 개선해봅니다
image: /assets/img/backend/java.png
related_posts:
    -
---

* toc
{:toc}
  
&nbsp;  

# ✅ 숫자 리터럴 언더바

---

```java
long creditCardNumber = 1234_5678_9012_3456L;
long socialSecurityNumber = 999_99_9999L;
float pi = 	3.14_15F;
long hexBytes = 0xFF_EC_DE_5E;
long hexWords = 0xCAFE_BABE;
long maxLong = 0x7fff_ffff_ffff_ffffL;
byte nybbles = 0b0010_0101;
long bytes = 0b11010010_01101001_10010100_10010010;
```

&nbsp;  

<u>우선 이 기능은 자바 7이상에서만 사용 가능한 기능</u>인데,

요즘 대부분은 8이나 11을 사용하므로 이 기능을 사용하는데 문제가 없다.

~~(은행권은 아직 자바 4쓰는데도 있다 카더라...😨)~~

&nbsp;  

아무튼 자바에서는 위 예제처럼 숫자의 가독성을 위해 숫자 사이에 언더바(\_)를 사용할 수 있다.

다만 몇 가지 규칙이 있다.

- 숫자의 시작이나 끝에는 사용할 수 없다 **(ex: int a = \_100\_;)**
- 부동소수점 리터럴의 소수점에 인접하는 경우 **(ex: float pi = 3.\_1415;)**
- 접미사 F 또는 L의 앞 **(ex: long a = 100\_L;)**
- 숫자나 문자열이 예상되는 위치

&nbsp;  

```java
float pi1 = 3_.1415F;      // Invalid; cannot put underscores adjacent to a decimal point
float pi2 = 3._1415F;      // Invalid; cannot put underscores adjacent to a decimal point
long l = 999_99_9999_L;    // Invalid; cannot put underscores prior to an L suffix

int x1 = _52;              // This is an identifier, not a numeric literal
int x2 = 5_2;              // OK (decimal literal)
int x3 = 52_;              // Invalid; cannot put underscores at the end of a literal
int x4 = 5_______2;        // OK (decimal literal)

int x5 = 0_x52;            // Invalid; cannot put underscores in the 0x radix prefix
int x6 = 0x_52;            // Invalid; cannot put underscores at the beginning of a number
int x7 = 0x5_2;            // OK (hexadecimal literal)
int x8 = 0x52_;            // Invalid; cannot put underscores at the end of a number

int x9 = 0_52;             // OK (octal literal)
int x10 = 05_2;            // OK (octal literal)
int x11 = 052_;            // Invalid; cannot put underscores at the end of a number
```

&nbsp;  

## ✅ 사용 예

---

예를 들어 어떤 로직의 대략적인 수행 시간을 알고 싶다고 해보자.

&nbsp;  

```java
public class TimeTest {
    public static void main(String[] args) {
        long start = System.nanoTime();
        
        long count = 0;
        
        for(long i = 0; i < 1000000000; i++) {
            count++;
        }
        
        long end = System.nanoTime();
        
        System.out.println("total count = " + count); // total count = 1000000000
        System.out.println("duration time : " + (double) (end - start) / 1000000000 + " s"); // duration time : 0.3019148 s
    }
}
```

&nbsp;  

`System.nanoTime`의 경우 완벽한 결과를 보장하지 않지만 대략적인 성능에 대한 감을 잡을 수는 있다.

**(완벽한 테스트를 원한다면 `JMH`같은 전문 벤치마킹 라이브러리를 써야 한다)**

위 코드는 루프를 10억번 돌린 후 얻어낸 수행 시간의 단위가 ns(나노초)이므로,

이를 초단위로 바꾸기 위해서는 `10억(10^9)`으로 나누어주어야 한다.

이 경우 10억을 `1,000,000,000`라고 표현하면 정말 알아보기 쉽겠지만

<u>자바는 숫자에 쉼표를 넣으면 컴파일에러가 발생</u>한다.

이럴 때 바로 언더바를 사용할 수 있다.

&nbsp;  

```java
public class TimeTest {
    public static void main(String[] args) {
        long start = System.nanoTime();
        
        long count = 0;
        
        for(long i = 0; i < 1_000_000_000; i++) {
            count++;
        }
        
        long end = System.nanoTime();
        
        System.out.println("total count = " + count); // total count = 1000000000
        System.out.println("duration time : " + (double) (end - start) / 1_000_000_000 + " s"); // duration time : 0.3019148 s
    }
}
```

&nbsp;  
