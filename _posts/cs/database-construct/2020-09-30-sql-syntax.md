---
layout: post
category:
    - cs
    - database-construct
date: 2020-09-30 19:51
title: SQL 문법(Syntax)
description: >
    <u>교과서 기초 개념 정리</u> 
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
    - _posts/cs/database-construct/2020-09-23-relational-operation.md
    - _posts/cs/database-construct/2020-09-23-schema.md
---

* toc
{:toc}

&nbsp;  

# **구분**

|데이터 정의어 (DDL, Data Definition Language)|CREATE / DROP / ALTER|
|:---:|:---:|
|데이터 조작어 (DML, Data Manipulation Language)|SELECT /  UPDATE / DELETE / INSERT|
|데이터 제어어 (DCL, Data Control Language)|GRANT / REVOKE|

# **속성**
- **NO ACTION** - 참조 릴레이션의 참조 속성 값이 변경되었을 때 기본 릴레이션에는 아무런 조치를 취하지 않음
- **CASCADE** - 참조 릴레이션의 튜플 조작 시 그와 관련된 기본 릴레이션의 튜플들도 연쇄적으로 조작
- **SET NULL** - 참조 릴레이션에 변화가 있으면 기본 릴레이션의 관련 튜플의 값을 NULL로 변경
- **SET DEFAULT** - 참조 릴레이션에 변화가 있으면 기본 릴레이션의 관련 튜플의 값을 기본값으로 변경
- **RESTRICTED** - 변경할 요소를 다른 개체에서 참조하고 있으면 변경하지 못함
- **WITH GRANT OPTION** - 부여된 권한을 다른 사용자에게 다시 부여할 수 있는 권리
- **GRANT OPTION FOR** - 다른 사용자에게 권한을 부여할 수 있는 권한을 박탈
- **DISTINCT** - 중복되는 레코드는 한 개로 표현
- **WHERE** - SQL에 조건을 걸 때 사용
- **AS** - 테이블에 별명(줄임말)을 부여할 때 사용
- **ORDER BY** 필드명 ASC(오름차순) \| DESC(내림차순) - 정렬하여 표시
- **GROUP BY** 필드명 - 특정 필드를 기준으로 그룹화하여 표시
- **HAVING** 그룹조건 - 그룹에 대한 조건을 기술. GROUP BY문에 종속되어 사용됨
- **AVG**(필드명) - 평균으로 표시
- **SUM**(필드명) - 합계로 표시
- **COUNT**(\*) - 개수를 계산하여 표시
- **MAX**(필드명) - 최댓값 표시
- **MIN**(필드명) - 최솟값 표시

---

# **데이터 정의어(DDL, Data Definition Language)**

스키마, 릴레이션, 뷰, 인덱스 등을 정의하거나 변경/제거할 때 사용되는 명령

---

## **CREATE(생성)**

> **CREATE** [데이터베이스 \| 테이블 \| 인덱스 \| 뷰\] **\[속성\]**

---

## **DROP(삭제)**

> **DROP** [데이터베이스 \| 테이블 \| 인덱스 \| 뷰\] **\[속성\]**

---

## **ALTER(변경)**

> **ALTER** [테이블\] [ADD \| ALTER \| DROP\] **\[속성\]**

---

## **데이터 조작어(DML, Data Manipulation Language)**

테이블 내의 Row를 추가, 제거, 변경, 검색할 때 사용되는 명령

---

## **SELECT(조회)**

> **SELECT** 필드명 **FROM** 테이블 \[WHERE\] [필드 명=필드 값\]

---

## **UPDATE(변경)**

**UPDATE** 테이블명 **SET** 필드명=필드 값 \[WHERE\] [필드 명=필드 값\]

> **UPDATE** student SET address='서울';
> 
> **UPDATE** student SET name='홍길동' WHERE id=1;
> 
> **UPDATE** student SET name='홍길동', birthday='2000-1-1' WHERE id=1;

---

## **DELETE(삭제)**

**DELETE FROM** [테이블\]

**DELETE FROM** [테이블\] \[WHERE\] [필드 명=필드 값\]

> **DELETE FROM student WHERE id = 1;**

---

## **INSERT(추가)**

**INSERT INTO** 테이블명 **VALUES** (필드 값, 필드 값, 필드 값)

**INSERT INTO** 테이블명(필드명, 필드명, 필드명) **VALUES** (필드 값, 필드값, 필드 값)

> **INSERT INTO** student **VALUES** ('1', '홍길숙', '여자', '서울', '2000-1-1');
> 
> **INSERT INTO** student (id, name, sex, address, birthday) **VALUES** ('1', '홍길동', '남자', '서울', '2000-1-1');

---

## **데이터 제어어(DCL, Data Control Language)**

데이터베이스의 보안, 무결성을 유지하기 위한 명령

---

## **GRANT(권한 부여)**

**GRANT** 사용자등급 **TO** ID@IP \[IDENTFIED BY PASSWORD\]

---

## **REVOKE(권한 박탈)**

**REVOKE** 사용자등급 **FROM** ID@IP