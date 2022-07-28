---
layout: post
category:
  - cs
  - software-design
title: Git의 구조 - Objects
description: |
    Git은 어떤 원리로 동작하는가?
image: /assets/img/cs/git.png
related_posts:
  - null
published: true
---

* toc
{:toc}

# Git의 구조 - Objects

---

`git`을 이루고 있는 가장 기본적인 단위는 `commit`, `tree`, `blob`이다.

commit은 몇가지 재료를 합성해 만들어지고, 이 commit의 재료들이 바로 tree와 blob이다.

위의 세 가지 오브젝트들은 사용자가 `.git` 디렉토리를 직접적으로 조작(예: rm -rf .git)하지만 않는다면 절대 수정되거나 삭제되지 않으며, 유일하다.

또한, treecommit을 포함한 모든 오브젝트들은 0-9a-z로 이뤄진 40자리의 해시코드(SHA1)를 식별자로 갖는다.

그리고 40자리중 맨 앞의 2자리는 오브젝트가 저장된 디렉토리의 이름이 되고 뒤의 38자리는 오브젝트 파일의 이름이 된다.

다음과 같은 디렉토리가 있다.

```shell
.
└── src
    └── a.txt
```

## Blob (Binary Large Object)

---

blob은 `파일`과 매핑된 오브젝트이다.

위 . 디렉토리의 최하위에는 `a.txt`라는 이름의 텍스트 파일이 존재하는데 git은 이 파일의 이름과 내용등을 취합하여 blob 타입의 오브젝트로 만들어 저장한다.

## Tree

---

tree는 `디렉토리`와 매핑된 오브젝트이다.

위 . 디렉토리의 하위에는 `src`라는 이름의 디렉토리가 하나 존재한다.

git은 이러한 디렉토리들을 tree 타입의 오브젝트로 만드는데, 이때 tree의 재료는 `src` 디렉토리의 하위에 있는 `a.txt`의 blob 오브젝트를 포함한다.

## Commit

---

commit은 위 계층 구조에서 . 디렉토리의 tree 오브젝트와 커미터의 정보를 포함한 오브젝트이다.

commit은 tree와 blob, 커미터 정보의 집합으로 이루어져 있다.

## 결론

![image](https://user-images.githubusercontent.com/71188307/181572179-4536ada5-8afd-49a9-b4bd-e28249408483.png)

`git log`를 입력해 출력된 treecommit 히스토리는 다음과 같다.

![image](https://user-images.githubusercontent.com/71188307/181574214-e2040768-4126-4f65-a3a4-31a8e1b68887.png)

조금 더 보기전에 먼저 방금 생성한 treecommit을 눈으로 직접 확인해보기 위해 `.git/objects`로 들어가 `tree` 명령어를 입력하면 다음과 같이 출력된다.

![image](https://user-images.githubusercontent.com/71188307/181575168-cc6ef9bd-8fa1-4b88-b58d-1cbca65f5dab.png)

위에서 모든 오브젝트는 40자리의 SHA1 해시코드로 생성되며, 가장 앞 2자리는 디렉토리명, 나머지 38자리는 파일명이 된다고 하였다.

실제로 그러하다.

방금 생성한 treecommit은 `baf09e6`으로 시작하는 해시코드를 가지며, `.git/objects/ba/f09e6...` 이 존재함을 확인 할 수 있다.

`file` 명령어를 통해 treecommit의 파일 정보를 출력하면 다음과 같이 출력된다.

![image](https://user-images.githubusercontent.com/71188307/181576387-4bd4da2d-cb0f-4a13-9a4f-9fff6ed1e81e.png)

zlib 방식으로 압축된 파일임을 알 수 있는데, 이를 해석할 수 있는 저수준 명령어를 git이 지원한다.

`git cat-file -p baf09e6` 를 입력하면 다음과 같은 데이터가 출력된다.

![image](https://user-images.githubusercontent.com/71188307/181576868-61e59dd4-e1f7-4503-99d0-a33572f7efcd.png)

baf09e6 treecommit에 2092b97로 시작하는 tree 타입의 오브젝트가 포함되어 있음을 알 수 있다.

위의 설명을 대입시켜보면 위의 tree 오브젝트는 `src` 디렉토리일것이다.

이어서 쭉쭉 파고들어가보자.

![image](https://user-images.githubusercontent.com/71188307/181577332-78e3edfa-b7cc-473a-aca7-efac24497815.png)

`src` 디렉토리는 `a.txt` 파일을 포함하고 있으므로, 해당 파일에 매핑된 blob 타입의 오브젝트가 존재함을 알 수 있다.

이어서 blob 타입의 오브젝트도 풀어보면 `a.txt` 파일의 데이터가 출력되게 된다.

# 결론

---

결과를 비교해보면...

![image](https://user-images.githubusercontent.com/71188307/181576868-61e59dd4-e1f7-4503-99d0-a33572f7efcd.png)

![image](https://user-images.githubusercontent.com/71188307/181577332-78e3edfa-b7cc-473a-aca7-efac24497815.png)

<u>1개의 commit</u> - create src/a.txt(ba4f09e)

<u>2개의 tree</u> - . 디렉토리(2092b97), src 디렉토리(924b0f9)

<u>1개의 blob</u> - a.txt(b5e4569)

총 4개의 git 오브젝트가 생성되었음을 알 수 있으며...

![image](https://user-images.githubusercontent.com/71188307/181575168-cc6ef9bd-8fa1-4b88-b58d-1cbca65f5dab.png)

.git/objects에도 마찬가지로 4개의 오브젝트가 실제로 존재함을 확인 할 수 있다.

