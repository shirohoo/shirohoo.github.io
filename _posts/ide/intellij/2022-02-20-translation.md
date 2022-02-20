---
layout: post
category:
    - ide
    - intellij
title: Translation
description: >
    젯브레인이 공식 지원하는 번역 플러그인
image: /assets/img/ide/Intellij.png
related_posts:
    - _posts/ide/intellij/2021-01-22-intellij-command.md
    - _posts/ide/intellij/2021-04-19-dto-generator.md
---

* toc
{:toc}

# Translation

---

현 시점 최신 버전의 젯브레인 툴(인텔리제이, 웹스톰 등)을 설치하게 되면 한국어가 지원이 되고 있습니다.

이는 `Translation`이라는 번역 플러그인 덕분입니다.

즉, 현재 젯브레인 툴을 설치하면 이 번역 플러그인도 같이 설치되어있을 확률이 높습니다.

`Translation`은 현재 젯브레인에서 공식적으로 후원하고 있는 플러그인으로, 지원이 쉽게 중단되지는 않을거라고 생각하고 있습니다.

이 플러그인에는 단순히 툴 자체의 언어를 통으로 바꿔주는 것 뿐만 아니라 유용한 기능이 다수 포함돼있는데요, 그 중 제가 주로 사용하는 기능 몇가지를 공유하려고 합니다.

<br />

우선 `Translation` 플러그인을 설치해야합니다.

다만, 최신 툴을 사용하시는 분들은 이미 설치돼있을 확률이 높습니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154848013-7aea49b7-351a-41e6-90d2-eae6b973c4bf.JPG)

<br />

설치를 완료했다면 `Settings - Keymap` 으로 진입하여 다음 두개의 기능에 편한 단축키를 등록해줍니다.

기능이 여러가지 있지만, 이 중 가장 자주 사용하게 되는 기능은 `Translate`, `Translate and Replace` 입니다.

저는 각각 `Alt + Shift + 2`와 `Ctrl + Shift + X`로 설정해주었습니다.

젯브레인 툴은 워낙 단축키가 많아, 기존의 단축키와 중복되지 않으면서도 편한 단축키를 찾는게 생각보다 어려울 수 있습니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154848014-e8cb78dd-0e14-4464-ae05-a88cbbda56f0.JPG)

<br />

여담이지만, `Settings - Tools - Translation` 에서 여러가지 설정을 만질 수 있습니다만, 기본적으로는 별로 건들게 없었습니다.

제 기준으로는 별다른 설정을 해주지 않더라도 `한국어 - 영어`로 세팅이 되어있긴 했는데, 혹시 다를 수도 있으니 한번 확인해보시기 바랍니다. 

<br />

![image](https://user-images.githubusercontent.com/71188307/154848264-51f61004-706f-4a5c-964f-430b4d5e17e2.JPG)

<br />

하기 이미지는 `Translate`에 등록한 단축키인 `Alt + Shift + 2`를 입력하였을 때 발생하는 액션입니다.

번역을 원하는 단어를 하이라이팅 한 후 단축키를 입력하면 아래와 같이 여러가지 정보들이 출력됩니다.

저는 주로 모르는 단어가 나오면 이 기능을 사용하게 되는 것 같습니다.

<u>이미지에서는 영어 -> 한국어로 번역하였으나 반대로도 가능합니다.</u>

<br />

![image](https://user-images.githubusercontent.com/71188307/154848015-80ded8e3-da6a-42fc-9bc1-5ac4bc269928.JPG)

<br />

하기 이미지는 `Translate and Replace`에 등록한 단축키인 `Ctrl + Shift + X`를 입력했을 때의 모습입니다.

단어를 번역하고 치환해줍니다.

저는 주로 마땅한 변수명이 생각나지 않을 경우 이 기능을 사용하게 되는 것 같습니다.

<u>마찬가지로 이미지에서는 한국어 -> 영어로 번역하였으나 반대로도 가능합니다.</u>

<br />

![image](https://user-images.githubusercontent.com/71188307/154848017-353f882c-6e51-46af-a5f9-305dcf18a425.JPG)

<br />

개발을 하다 보면 공식문서를 참고해야 할 일이 많습니다.

자바는 코드 베이스에 `javadoc`이라는 주석으로 된 문서가 기본적으로 많이 작성돼있는데요, 이 `javadoc`도 한국어로 통번역이 가능합니다. 

반대로도 가능하며, 생각보다 번역 퀄리티도 훌륭합니다.

아래와 같이 `javadoc`에 우클릭을 한 후 `Translate Documentation`을 클릭하면...

<br />

![image](https://user-images.githubusercontent.com/71188307/154848018-ce37cfc3-5e04-4a76-9943-fc332e27d237.JPG)

<br />

다음과 같이 번역됩니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154848019-c0b4f206-7fc5-498c-9af1-d53d56377b53.JPG)

<br />


