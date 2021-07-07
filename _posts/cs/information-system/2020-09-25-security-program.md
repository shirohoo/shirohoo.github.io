---
layout: post
category:
  - cs
  - information-system
date: 2020-09-25 13:29
title: 보안 프로그램(Security Program)
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

# 보안 프로그램

---

|프로그램명|설명|
|:---:|:---:|
|Tripwire|크래커가 침입하여 백도어를 만들어 놓거나 설정 파일을 변경했을 때 분석하는 도구|
|Cron|유닉스 기반 OS의 작업 예약 스케줄러|
|Aide|Tripwire를 대신할 수 있는 도구로 파일의 무결성을 검사|
|sXid|MD5 Checksum을 사용하여 SUID, SGID파일을 추적하여 루트키트가 설치되어 있는지 검사 및 경고. Cron 작업 형태로 수행 됨|
|Claymore|침입탐지 및 무결성 모니터링 도구. Crontable을 이용하여 주기적으로 파일 시스템의 변조 유무를 확인하고 변조를 탐지할 경우 관리자에게 메일로 통보|
|Samhain|시스템의 무결성을 점검하는 도구. 여러 시스템을 관리할 수 있는 수단을 제공하며 모니터링 에이전트와 중앙 로그서버로 구성 됨|
|Slipwire|파일 시스템의 무결성을 검사하는 도구로 파일의 SHA-1 해쉬값을 비교하여 변경될 경우 사용자에게 경고|
|Fcheck|파일 시스템의 변조유무를 점검하기 위한 PERL Script 도구로 SYSLOG, Console 등으로 관리자에게 파일 시스템 변화를 알림. Tripwire와 비슷한 도구로 보다 설치와 운영이 쉽다|

&nbsp;  

# Cron

---

- 유닉스/리눅스 계열에서 사용하는 스케쥴링 문법이다
- 어떠한 특정한 시점을 가르킨다

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbmm3sL%2FbtqJtZdozVH%2FYqmjJjJFzVBuFNXDerESZ0%2Fimg.png)

```text
분(Min) 시간(Hour) 일(Day) 월(Month) 요일(Day) 명령어(Command)
```

혹은

```text
[초(sec)] 분(Min) 시간(Hour) 일(Day) 월(Month) 요일(Day) 명령어(Command) [연도(Year)]
```

&nbsp;  