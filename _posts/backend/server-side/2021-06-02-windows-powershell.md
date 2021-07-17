---
layout: post
category:
    - backend
    - server-side
date: 2021-06-02 20:57
title: Windows10 Powershell 테마 적용하기
description: >
    Windows10 Powershell
image: /assets/img/common/code1.png
accent_image:
    background: url('/assets/img/common/code1.png') center/cover
related_posts:
    - 
---

* toc
{:toc}

<br />

# 📕 참고

---

- [https://docs.microsoft.com/ko-kr/windows/terminal/tutorials/powerline-setup](https://docs.microsoft.com/ko-kr/windows/terminal/tutorials/powerline-setup)

<br />

# 💡 적용

---

`Microsoft Stroe` -> `Windows Terminal` 설치

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbfni3J%2Fbtq6pUG9jgV%2FbPSRfqko0KSw0FRtJQnO81%2Fimg.jpg)

<br />

`Windows Terminal`을 관리자 권한으로 실행하여 `Powershell`을 연다.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FL7pYT%2Fbtq6lYp1432%2FNKkSnKwZlIMP8a2HDoGhbk%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F91Adg%2Fbtq6pVMPyR6%2FMVBr8xqEigk2ICdeuoTZm1%2Fimg.png)

<br />

아래 명령어를 순서대로 입력하며,

뭘 묻는 텍스트가 나타나면 Y를 입력 후 엔터를 친다.

<br />

```shell
Install-Module posh-git -Scope CurrentUser
Install-Module oh-my-posh -Scope CurrentUser
```

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbnqoQ9%2Fbtq6lk7ZjZJ%2FrjmTdNqEYZZVzL43tKy19K%2Fimg.png)

<br />

아래 명령어를 입력해준다

<br />

```shell
notepad $profile
```

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FO0mi2%2Fbtq6p9xiB3D%2FxR8jOOwKGcspWCk2FFPoxk%2Fimg.png)

<br />

`예`를 선택

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FkZv5q%2Fbtq6lk7Zu6c%2FAOIRHZ3onKIov6kWx3BTkK%2Fimg.png)

<br />

아래의 내용을 입력 후 저장하고 닫는다.

<br />

```shell
$env:LC_ALL='C.UTF-8'

Import-Module posh-git
Import-Module oh-my-posh
Set-PoshPrompt -Theme powerline
```

<br />

새로운 `Powershell`을 연다.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fm0DGY%2Fbtq6oDTcl7e%2FegIqavFrEBZ0gOpGk28As0%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb0CLzS%2Fbtq6qnPCNEr%2FCSiTgEAjk4T3NgROiJYhck%2Fimg.png)

<br />

에러가 발생할 텐데, 아래의 명령어를 입력해주고 다시 새로운 `Powershell`을 연다.

<br />

```shell
Set-ExecutionPolicy RemoteSigned
```

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F3bSHO%2Fbtq6mGo9X49%2F5xCM3Nma155hi5LJihMPk1%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FehL7du%2Fbtq6p0tEruo%2F7mM6S7RO3yYdrFhVC9ZW30%2Fimg.png)

<br />

테마가 폴더나, 브랜치 등의 이모티콘을 사용하는데

대부분의 폰트가 이러한 이모티콘을 지원하지 않으므로

특수한 폰트를 설치하고 설정해야 한다.

<br />

> [https://www.nerdfonts.com/font-downloads](https://www.nerdfonts.com/font-downloads)

<br />

사이트에 접속하여 마음에 드는 폰트를 다운로드한 후 설치해준다.

필자는 `CaskaydiaCove Nerd`를 다운로드하여서 설치했다.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FI9H3Y%2Fbtq6pY3DjhW%2Fx1kOa8iDuuX4tlfkOxkzpk%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbHplW8%2Fbtq6pVF1FMR%2FZvlkrxov9wKAIocFU0w2J1%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FmSKe4%2Fbtq6rvflbRr%2F5iOUhapwY5dKrFRavQl3ek%2Fimg.png)

<br />

**만약 다른 테마를 적용하고 싶다면, 아래의 사이트에서 마음에 드는 테마를 고른다.**

<br />

> [https://ohmyposh.dev/docs/themes/](https://ohmyposh.dev/docs/themes/)

<br />

테마의 이름을 복사한 후

<br />

```shell
notepad $profile
```

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcOuQJv%2Fbtq6qShxNOc%2Fq6NUHS685oHPNSXP9dpOe0%2Fimg.png)

<br />

테마의 이름을 바꿔주면 된다.

<br />
