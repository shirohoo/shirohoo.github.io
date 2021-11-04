---
layout: post
category:
  - cs
  - making-computer-system
title: 수의 체계
description: |
  컴퓨터가 사용하는 수의 체계를 이해하자.  
image: /assets/img/cs/cs-logo.jpg
accent_image:
  background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

# 패리티 비트(Parity bit)

---

`패리티 비트(Parity bit)`는 정보의 전달 과정에서 오류가 생겼는지를 검사하기 위해 추가된 비트이다. 문자열 내 1비트의 모든 숫자가 짝수 또는 홀수인지를 보증하기 위해 전송하고자 하는 데이터의 각 문자에 1 비트를 더하여 전송하는 방법으로 2가지 종류의 패리티 비트(홀수, 짝수)가 있다. 패리티 비트는 오류 검출 부호에서 가장 간단한 형태로 쓰인다.

- 짝수(even) 패리티는 전체 비트에서 1의 개수가 짝수가 되도록 패리티 비트를 정하는 것인데, 이를테면 데이터 비트에서 1의 개수가 홀수이면 패리티 비트를 1로 정한다. <u>이미 1의 개수가 짝수이면 패리티 비트를 0으로 정한다.</u>
- 홀수(odd) 패리티는 전체 비트에서 1의 개수가 홀수가 되도록 패리티 비트를 정하는 방법이다. <u>이미 1의 개수가 홀수라면 패리티 비트를 0으로 정한다.</u>

7비트의 0010110라는 데이터에서 짝수 패리티가 되게 하기 위해서는 1의 패리티 비트를 붙여 10010110로 한다. 또 같은 데이터에 대해 홀수 패리티 비트가 되게 하려면 0의 패리티 비트를 붙인다. 이렇게 패리티 비트를 정하여 데이터를 보내면 받는 쪽에서는 수신된 데이터의 전체 비트를 계산하여 패리티 비트를 다시 계산함으로써 데이터 오류 발생 여부를 알 수 있다. 그러나 패리티 비트는 오류 발생 여부만 알 수 있지 오류를 수정할 수는 없다.

<br />

# 진법(Notation)

---

인간들이 일상생활에 사용하는 `10진수(Decimal)`, 컴퓨터가 사용하는 `2진수(Binary)` 등.

진법은 단지 수의 체계에서 사용되는 수가 몇개인지를 말한다.

예를 들자면 10진수는 0~9의 숫자 10개를 사용, 2진수는 0과 1 2개의 숫자를 사용한다.

<br />

진수를 계산하는 방법은 기본적으로 모두 동일하다. 진수에 각 자릿수를 제곱하여 나온 값과 실제값을 곱한다. 

이 때, 가장 낮은 자리는 0으로 시작한다.

이후 나온 값들을 모두 더한다.

<br />

`10진수 958`을 예시로 설명하면,
9는 100의자리, 5는 10의자리, 8은 1의 자리이므로 10에 각 자릿수를 지수로 넘겨준다.



> = 9x10^2 + 5x10^1 + 8x10^0
>
> = 9x100 + 5x10 + 8x1
>
> = 900 + 50 + 8
>
> = 958

<br />

소수점 이하는 -1부터 시작하며, 2진수, 8진수, 16진수 등도 동일하게 계산하면 된다.

<br />

# 보수(Complement)

---

`보수`란, `X와 X의 보수를 합산했을 때 진법의 밑수가 나오는 수`를 의미한다.

예를 들어 10진수 7의 보수는 3이고, 10진수 1의 보수는 9이다.

컴퓨터는 모든 연산을 `가산기(Adder)`만 사용해 처리한다. 즉, 모든 연산을 덧셈으로만 처리하는 셈이다.

따라서 뺄셈의 경우 보수가 필요해진다.

<br />

즉, `X-Y`를 `X+(-Y)`로 처리한다.

<br />

컴퓨터는 `2진수`를 사용하는데, `2진수의 보수`를 구하는 방법에 아래 두 가지 방법을 사용한다.

- **1의 보수**: 1을 0으로, 0을 1로 뒤집는다.
  - 1011의 1의 보수는 0100이다.

- **2의 보수**: 1의 보수를 구한 후 `최하위비트(LSB)`에 1을 더한다.
  - 1011의 2의 보수는 0101이다.
  - 사람이 알아보는데 약간 불편하다는 단점이 있다.
  - 성능이 가장 좋아 `부호있는비트`에서 가장 많이 사용된다.

<br />

## 보수의 표현

---

내가 사용하는 자바는 <u>int를 32비트의 부호있는비트로 표현</u>하며, 자바에서 지원하는 `단항 NOT 연산자(~)`를 사용하면 `1의 보수`를 반환한다.

이를 코드로 나타내면 하기와 같다.

<br />

```java
System.out.println(~25); // -26
```

<br />

위 코드의 연산과정은 아래와 같다.

`25`는 32비트 2진수로 `0000 0000 0000 0000 0000 0000 0001 1001`이며, ~연산자를 적용하면 `1111 1111 1111 1111 1111 1111 1110 0110`이다.

반환된 `1의 보수(=음수로 표현된 2진수)`를 다시 10진수로 표현하려면 아래와 같은 과정을 거친다.

<br />

1. 1의 보수를 취한다. 즉, 0은 1로, 1은 0으로 변환하며 이 때 MSB도 같이 변환한다.
2. 1번 과정에서 나온 결과에 1을 더한다. (2의 보수)
3. 2번 과정에서 나온 결과를 10진수로 변환하고 -부호를 붙인다.

<br />

1번 과정을 진행하면 `1111 1111 1111 1111 1111 1111 1110 0110`의 1의 보수는 원래 값인 `0000 0000 0000 0000 0000 0000 0001 1001`이다.

2번 과정을 진행하면 LSB에 1을 더한 `0000 0000 0000 0000 0000 0000 0001 1010`이다.

3번 과정을 진행하면 `0000 0000 0000 0000 0000 0000 0001 1010`은 10진수 `26`이며, -부호를 붙여 `-26`이 나온다.

<br />

## 감산

---

- **1의 보수 감산**
  - 음수로 표현하려는 수의 1의 보수를 구한 후 더한다.
  - 덧셈 후 `최상위 비트(MSB)`에서 `자리올림(Carry)`이 생겼다면 `최하위 비트(LSB)`에 1을 더한다.
  - 자리올림이 생기지 않았다면 연산 결과에 대해 1의 보수를 구한 후 최상위비트에 `음수부호비트`를 붙인다.
- **2의 보수 감산**
  - 음수로 표현하려는 수의 2의 보수를 구한 후 더한다.
  - 덧셈 후 `최상위 비트(MSB)`에서 `자리올림(Carry)`이 생겼다면 자리올림을 버린 나머지 값이 연산 결과이다.
  - 자리올림이 생기지 않았다면 연산 결과에 대해 2의 보수를 구한 후 최상위비트에 `음수부호비트`를 붙인다.

<br />

![image](https://user-images.githubusercontent.com/71188307/139531667-7e290ae6-69eb-4aef-a33a-adae2959a45e.png)

<br />