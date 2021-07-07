---
layout: post
category:
  - cs
  - information-system
date: 2020-09-24 16:20
title: 소프트웨어 개발 방법론(Software Development Engineering)
description: >
  <u>교과서 기초 개념 정리</u>  
image: /assets/img/cs/cs-logo.jpg
accent_image:
  background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - 
---

* toc
{:toc}

&nbsp;

# 소프트웨어 개발 방법론

---

- 소프트웨어 개발부터 유지보수 등에 필요한 수행 방법과 이러한 일들을 효율적으로 수행하는 과정에서 필요한 각종 기법 및 도구를 체계적으로 정리하여 표준화한 것
- 목적 - 소프트웨어의 생산성 향상, 품질 향상

&nbsp;  

## 구조적 방법론(Structured Development Engineering)

---

- 정형화된 분석 절차에 따라 사용자 요구사항을 파악하여 문서화하는 처리(Process) 중심의 방법론
- 복잡한 문제를 다루기 위해 `분할과 정복(Divide and Conquer)` 원리를 적용
- 쉬운 이해 및 검증이 가능한 프로그램 코드를 생성하는 것이 목적

> 타당성 검토 → 계획 → 요구사항 정리 → 설계 → 구현 → 시험 → 운용/유지보수

&nbsp;  

## 정보공학 방법론(Information Engineering)

---

- 정보 시스템 개발을 위해 계획, 분석, 설계, 구축에 정형화된 기법들을 상호 연관성 있게 통합 및 적용하는 자료 중심의 방법론
- 대규모 정보 시스템을 구축하는데 적합

> 정보전략 계획 수립 → 업무영역 분석 → 업무시스템 설계 → 업무시스템 구축

&nbsp;  

## 객체지향 방법론(Object-Oriented Engineering)

---

- 현실세계의 개체(Entity)를 하나의 객체(Object)로 만든 다음 이들을 조립하여 필요한 소프트웨어를 구현하는 방법론
- 구성요소 - 객체(Object), 클래스(Class), 메시지(Message)

> 요구분석 → 설계 → 구현 → 테스트 및 검증 → 인도

&nbsp;  

## CBD(Component Based Development) 방법론

---

- 기존의 시스템이나 소프트웨어를 구성하는 컴포넌트를 조합하여 하나의 새로운 애플리케이션을 만드는 방법론
- 컴포넌트의 재사용이 가능하여 시간과 노력을 절감할 수 있다
- 유지보수 비용을 최소화하고 생산성 및 품질을 향상 시킬 수 있다

> 준비 → 분석 → 설계 → 구현 → 테스트 → 전개 → 인도

&nbsp;  

## 애자일(Agile) 방법론

---

- 고객의 요구사항 변화에 유연하게 대응할 수 있도록 일정한 주기를 반복하면서 개발 과정을 진행하는 방법론
- 급격한 요구사항의 변경, 소규모 프로젝트, 숙련된 개발자 집단에 적합

> 요구사항 → { 계획 → 개발 → 승인 테스트 }

&nbsp;  

## 제품 계열 방법론

---

- 특정 제품에 적용하고 싶은 공통된 기능을 정의하여 개발하는 방법론
- 임베디드 소프트웨어(Embedded Software)를 만드는데 적합
- 영역 공학과 응용공학으로 분류되며 이들을 연계하기 위해 제품의 요구사항, 아키텍처, 조립 생산이 필요

&nbsp;  