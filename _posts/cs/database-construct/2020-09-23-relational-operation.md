---
layout: post
category:
    - cs
    - database-construct
date: 2020-09-23 09:46
title: 순수 관계 연산자(Relational Operation)
description: >
    <u>교과서 기초 개념 정리</u> 
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
    - _posts/cs/database-construct/2020-09-23-schema.md
    - _posts/cs/database-construct/2020-09-30-sql-syntax.md
---

* toc
{:toc}

&nbsp;  

# **순수 관계 연산자(Relational Operation)**

`관계형 데이터베이스(RDB)`에 적용 할 수 있도록 특별히 개발한 연산자를 말한다.

|연산자|표기|키워드|
|:---:|:---:|:---:|
|Select|시그마(σ)|선택 / 수평 연산 / 시그마(σ)|
|Project(≒Product)|파이(π)|추출 / 수직 연산 / 파이(δ)|
|Join|보타이(⋈)|공통 / 합치다 / 자연 / 보타이(⋈)|
|Division|나누기(÷)|제외 / 나누기(÷)|

---

## **Select**

- 릴레이션에 존재하는 튜플 중에서 선택 조건을 만족하는 튜플의 부분집합을 구하여 새로운 릴레이션으로 만든다
- 릴레이션의 가로(행)에 해당하는 튜플을 구하는 것이므로 수평 연산자라고도 한다
- 연산자의 기호는 그리스 문자 `시그마(σ)`

> σ 점수 > 70 (학생) : 학생 릴레이션에서 점수가 70 초과인 튜플을 선택

---

## **Project(≒Product)**

- 주어진 릴레이션에서 속성 리스트(Attribute List)에 제시된 속성만을 추출하는 연산이다
- 릴레이션의 세로(열)에 해당하는 속성을 추출하는 것이므로 수직 연산자라고도 한다
- 연산자의 기호는 그리스 문자 `파이(π)`

> π 학번, 이름 (학생) : 학생 릴레이션에서 해당하는 학번과 이름 속성을 추출

---

## **Join**

- 공통 속성을 중심으로 2개의 릴레이션을 하나로 합쳐 새로운 릴레이션을 만드는 연산
- 조인 조건이 '=' 일 때 동일한 속성이 두 번 나타나게 되는데 이 때 중복된 속성을 제거하여 같은 속성을 한 번만 표기하는 방법을 자연(Natural) 조인이라고 한다
- 연산자의 기호는 그리스 문자 `보타이(⋈)`

> 학생 ⋈ 학번 = 학번 대여 : 학생 릴레이션과 대여 릴레이션을 학번 기준으로 합체

---

## **Division**

- X⊃Y인 2개의 릴레이션에서 R(X)와 S(Y)가 있을 때, R의 속성이 S의 속성값을 모두 가진 튜플에서 S가 가진 속성을 제외한 속성만을 구하는 연산
- 연산자의 기호는 수학 수식 `나누기(÷)`

> 학생 학번 ÷ 학번 출석체크 : 학생 릴레이션에서 출석체크 릴레이션에 있는 학번을 구한다