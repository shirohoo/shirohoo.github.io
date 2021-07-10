---
layout: post
category:
    - backend
    - test
date: 2021-01-24 02:24
title: Test 용어 정리
description: >
    Test 용어들에 대한 정리
image: /assets/img/backend/test-logo.png
related_posts:
    - 
---

* toc
{:toc}
  
&nbsp;  

> 📜 참고 - [Code Utopia](https://codeutopia.net/blog/2015/04/11/what-are-unit-testing-integration-testing-and-functional-testing/)

&nbsp;  

# 📜 단위 테스트(Unit Test)

---

JUnit 4 or 5의 `@Test`를 말함.

혹은 테스트 케이스(Test Case)라고도 부름

&nbsp;  

# 📜 통합 테스트(Integration Test)

---

여러 단위 코드(Unit)를 묶어서 해보는 것.

각 코드가 복합적으로 실행됐을 때 잘 동작하는지 여부를 확인함.

&nbsp;  

# 📜 기능 테스트(Functional Test)

---

정보처리기사에서 `블랙박스 테스트(Black Box Test)`라고 부르는 기법과 동일하다.

그냥 애플리케이션을 실행시켜서 어떤 기능을 실행했을 때 원하는 결과가 나오는지 확인하는 것이다.

`경계값 분석`, `동등분할` 등의 테스트 기법이 있다.

&nbsp;  

# 📜 테스트 스위트(Test Suite)

---

테스트 스위트는 테스트 케이스들을 하나로 묶은 것이다.

JUnit 5의 `@TestTemplate`과 같은 것을 말하는 듯. ~~(왠지 옛날 용어 같음)~~

&nbsp;  

# 📜 공유 픽스처(Share Fixture)

---

테스트 케이스를 실행하기 전이나 후에 필요한 모든 것들을 `테스트 픽스처(Test Fixture)`라고 부름.

이를 JUnit 5에서는 `@BeforeEach`나 `@AfterEach` 같은 애노테이션으로 작성한다.

<u>공유 픽스처라는 것은 모든 테스트 케이스가 공유하는 픽스처</u>를 말하는데

JUnit 5의 `@BeforeAll`이나 `@AfterAll`과 같다고 보면 된다.

잘못 작성된 공유 픽스처는 반복되지 않는 테스트, 

`테스트 실행 전쟁` 같은 부작용(Side Effect)을 낳을 수 있다.

&nbsp;  

> 💡 테스트 실행 전쟁(Test Run War)
>
> 각 테스트에서 동시에 같은 픽스처를 사용하려고 하면서 테스트가 무작위로 실패하게 되는 문제
 
&nbsp;  
