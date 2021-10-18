---
layout: post
category:
    - cs
    - data-structure-algorithm
title: 에라토스테네스의 체
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

<br />

# 소수(Prime Number)

---

우선 `소수(Prime Number)`의 사전적 정의를 찾아보니 <u>1과 자기 자신으로밖에 나누어 떨어지지 않고 자기 자신의 곱셈의 역수가 없는 수</u> 라고 합니다.

여기서 1은 `기초수`라 부르며, 소수도 합성수도 아니라고 합니다.

일단 항상 뭔가를 학습하기 전 `왜 배워야 하는가?`와 그 이유가 타당하다면 그 이유에 대한 수용으로 인해 발생하는 `동기부여`가 중요하다고 생각하기 때문에, 우선 <u>소수를 왜 구해야 하는가?</u>가 궁금해 찾아보니, `소인수 분해`에 쓰이기 때문이라고 하네요.

그럼 `소인수 분해`는 무엇인가?

단어만 보면 `소인수`를 분해한다는 것인데, 저는 소인수가 정확히 무슨 의미를 갖는 단어인지 기억이 안났습니다.

그래서 `소인수`의 사전적 정의를 찾아보니 <u>어떤 수의 약수인 소수를 소인수</u>라고 한다고 합니다.

그렇다면 `인수`는 어떤 수의 약수를 뜻하며, 그 약수가 소수라면 소인수라는 것임을 알 수 있습니다.

문제는 여기까지 이해하고서 <u>그럼 소인수분해는 왜 알아야하고 왜 배워야하는가?</u> 에 대한 답을 찾지 못했기 때문에, 이후로 동기부여가 썩 잘되진 않았습니다.

아무튼 이렇다고 하니 이제 이 소수를 찾는 알고리즘인 `에라토스테네스의 체`를 알아봅시다.

<br />

# 에라토스테네스의 체

---

![Sieve_of_Eratosthenes_animation](https://user-images.githubusercontent.com/71188307/137669257-76612cc8-b9e9-4ef3-adec-ced17067f6d8.gif)

<br />

자연수 n이 주어지면 1부터 n까지의 수 중 `소수(Prime Number)`를 구하는 현존하는 가장 빠른 알고리즘이라고 합니다.

좀 찾아보니 수식이 굉장히 많은데, 저는 이런걸 잘 못하기 때문에 나름대로 최대한 쉽게 이해해서 구현했습니다.

<br />

우선 소수를 구하기 위해서는 1과 자기자신만을 약수로 갖는지를 판별하면 됩니다.

예를 들어 n=20 이라고 쳤을 때 20의 약수는 다음과 같습니다.

<br />

> 1 2 4 5 10 20

<br />

1과 20만 약수로 가지면 20은 소수인데, 그렇지 않으니 20은 소수가 아닌 합성수입니다.

n=30일 경우의 약수를 구해보면,

<br />

> 1 2 3 5 6 10 15 30

<br />

역시 30도 소수가 아닙니다.

위의 간단한 연산에서 알 수 있는 사실이 있는데, 약수를 구하는 것은 대칭성을 갖는다는 것입니다.

약수는 1부터 시작하는데, 가장 큰 약수는 n을 1로 나누었을 때의 값인 30입니다.

따라서 다음과 같습니다.

<br />

> 1                 30

<br />

다음으로 30을 2로 나누어 보면 15로 나누어 떨어지기 때문에 두 수도 30의 약수입니다.

<br />

> 1 2            15 30

<br />

이런식으로 대칭성을 띄게 됩니다.

이렇게 약수의 대칭성에 소수는 소수로 나누어떨어지지 않는다는 특징을 더하면 아래와 같은 방식이 됩니다.

<br />

1은 기초수이니 제외하고 2부터 n-1의 범위에 속하는 수가 약수로 존재하지 않는다면 소수이며, 최단 연산을 하려면 2부터 n의 제곱근 미만인 소수로 n을 모조리 나눠보면 됩니다.

그리고 나누어떨어지지 않고 살아남은 수는 모두 소수가 되는것이죠.

<br />

1부터 10까지의 모든 소수를 구한다고 가정합니다.

10의 제곱근은 3.16입니다. 따라서 3.16보다 작은 소수인 3까지만 연산하면 됩니다.

<br />

> 1 2 3 4 5 6 7 8 9 10

기초수인 1을 지웁니다.

> 2 3 4 5 6 7 8 9 10

2를 제외한 2의 배수를 모두 지웁니다.

> 1 2 3 5 7 9

3을 제외한 3의 배수를 모두 지웁니다.

> 1 2 3 5 7

4는 소수가 아니며, 이미 2의 배수를 지울때 지워졌으니 스킵합니다.

5는 소수이지만 10의 제곱근인 3.16보다 높은 수 이므로 역시 더이상 연산 할 필요가 없으며, 이미 구해진 위의 수는 모두 소수입니다.

이를 코드로 구현하면 다음과 같습니다.

<br />

# 구현

---

```java
public class PrimeNumberTest {

    @Test
    void getPrimeNumber() throws Exception {
        final int range = 50;

        List<Integer> primeNumbers = new ArrayList<>(range);
        for (int i = 2; i < range; i++) {
            if (isPrimeNumber(i)) {
                primeNumbers.add(i);
            }
        }

        // 50이하의 모든 소수 출력
        // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
        System.out.println(primeNumbers);
    }

    private boolean isPrimeNumber(final int number) {
        int divider = 2;
        while (divider * divider <= number) { // 약수는 대칭성을 보이므로 n의 제곱근만큼 순회하면 모든 약수를 판별할 수 있다
            if (number % divider == 0) { // 1과 자기자신을 제외한 어떤수로도 나누어 떨어지기만 하면 소수가 아님
                return false;
            }
            divider++; // 나누어 떨어지지 않았다면 나눔수를 1증가시키고 다음 루프를 시작한다
        }
        return true; // number 의 제곱근만큼 순회하며 모두 나누었음에도 나누어 떨어지지 않았다면 소수이다
    }

}
```

<br />

n까지의 모든 소수를 구하고, 구한 소수의 개수를 반환하는 알고리즘을 `자바 8` 스타일로 구현한다면 다음과 같습니다.

<br />

```java
public class SieveOfEratosthenes {

    public long solution(final int value) {
        return range(2, value + 1) // value가 20일 경우 2~20까지의 수를 생성해야하는데, 레인지 함수는 인덱스 시작이 0부터이므로 +1 연산을 해준다.
            .filter(this::isPrimeNumber)
            .count();
    }

    private boolean isPrimeNumber(final int number) {
        return range(2, getRangeEnd(number) + 1) // 레인지 함수는 인덱스 시작이 0부터이므로 +1 연산을 해준다.
            .noneMatch(divisorOf(number));
    }

    private int getRangeEnd(final int number) {
        return toIntExact(round(sqrt(number)));
    }

    private IntPredicate divisorOf(final int number) {
        return divider -> number % divider == 0;
    }

}
```

<br />

