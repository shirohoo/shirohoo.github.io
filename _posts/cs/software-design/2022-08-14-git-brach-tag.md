---
layout: post
category:
  - cs
  - software-design
title: Git - HEAD & Branch & Tag
description: |
    작업한게 날아갔어요
image: /assets/img/cs/git.png
related_posts:
    - _posts/cs/software-design/2022-07-21-git-objects.md
published: true
---

* toc
{:toc}

# Git의 구조 - HEAD & Branch & Tag

---

git은 이 글을 쓰는 시점(2022년 8월), 세계에서 가장 많이 쓰이는 VCS(Version Control System)중 하나이며, 실무에서는 원활한 협업을 위해 아주 많이 쓰이고 있다. 

그리고 원활한 협업을 위해 보통 branching을 통해서 작업을 하게 되는데, git에 대한 이해가 부족하다면 굉장히 곤혹스러운 상황들이 많이 생길 수 있다. 그런 상황을 미연에 방지하기 위해, 혹은 이미 한번이상 겪어봤다면 이후에는 곤혹스럽지 않기 위해 git에 대한 깊은 이해가 필요하다.

## HEAD

---

우선 HEAD에 대해 알아야 한다.

HEAD는 아주 단순하다. HEAD는 현재 우리가 바라보고 있는 commit을 의미한다.

그냥 단순히 git checkout 명령어를 통해 특정 commit, branch, tag등으로 이동하면 HEAD가 옮겨진다고 이해하면 되겠다.

다음과 같은 git history가 존재한다.

![image](https://user-images.githubusercontent.com/71188307/184530841-6582a16f-152e-4c23-8d4a-eb7b80712426.png)

여기서 `cd ./git` 명령을 통해 이동하면 `HEAD`라는 파일이 존재하는데, 해당 파일의 내용을 출력해보면 main branch를 가리키고 있음을 알 수 있다.

![image](https://user-images.githubusercontent.com/71188307/184531114-bac061f1-7a82-43df-b1be-0922002fb82b.png)

이후 `git checkout de70330`을 입력하여 HEAD를 옮긴 후 다시 HEAD 파일의 내용을 출력해보면 어떻게 될까?

![image](https://user-images.githubusercontent.com/71188307/184531283-99174eb7-e251-485f-b711-0d566991b753.png)

이전에는 `refs/heads/main`을 가리키고 있었지만, 이제는 그냥 특정 commit을 가리키게 바뀌었음을 알 수 있다.

## Branch

---

branch도 정말 별거 없다.

git은 단순히 `단방향 연결리스트(Singly Linked List)`구조로 만들어져있는 commit의 나열일 뿐이며, branch는 특정 commit을 기록하고 있는 파일일 뿐이다. 최초의 commit을 제외한 모든 commit은 부모 commit이 존재하며, 모든 commit의 부모 commit은 일반적으로 1개이고, merge commit에 한해 최대 2개까지만 존재할 수 있다. (두 부모 commit을 병합(merge)하여 만들어내는 commit이기 때문)

즉, 모든 commit이 가질 수 있는 최대 부모의 개수는 2개이다.

또한, 모든 commit은 오직 자신의 부모만 알 수 있으며, 자식의 존재는 알지 못한다. 즉, 자식 commit으로 탐색을 해나갈 수 없기 때문에 특정 commit을 참조하는 포인터에서 history를 출력하면 실제로는 .git 디렉토리에 모두 저장돼있지만 화면에서는 자식 commit들을 볼 수 없는것이다. 그리고 우리는 이것을 작업이 날아갔다고 인식하게 된다. (실제로는 그렇지 않다. 명심하자!)

![image](https://user-images.githubusercontent.com/71188307/184530841-6582a16f-152e-4c23-8d4a-eb7b80712426.png)

위 git history 이미지를 보면 HEAD가 main branch를 가리키고 있고(HEAD -> main), main branch가 `aa28560` commit을 가리키고 있음을 알 수 있다.

`git reset`명령어등을 통해 이 branch가 가리키고 있는 commit을 변경할 수 있다. 

그리고 `git log`명령어를 입력하면 branch가 가리키고 있는 commit의 시조(??) commit까지의 그래프를 보여주는것이다.

모든 branch의 정보는 `[project]/.git/refs/heads`에 파일로 존재하며, 현재 데모 프로젝트에는 main밖에 없으므로 main 파일하나만 존재함을 볼 수 있다.

![image](https://user-images.githubusercontent.com/71188307/184531493-4ae7eb7e-8065-4eb3-8cb9-682da08d5f4a.png)

## Tag

---

같이 협업을 하다가 동료와 커뮤니케이션이 잘 되지 않아 merge가 잘못 된 경우 이를 해결하기 위해서나, 본인이 commit을 잘못하여 reset등의 작업을 하는 경우가 종종있는데, 이때 실수하여 작업이 날아가는 경우가 존재한다.

하지만 걱정마시라, 이전 포스팅에서 git의 가장 기본적인 요소가 되는 object들인 `commit`, `tree`, `blob`에 대해 작성했었는데, 이전 글에서는 다음과 같이 이야기했었다.

> 위의 세 가지 오브젝트들은 사용자가 `.git` 디렉토리를 직접적으로 조작(예: rm -rf .git)하지만 않는다면 절대 수정되거나 삭제되지 않으며, 유일하다.

즉, 이미 한번이라도 commit된 것은 .git 디렉토리를 직접적으로, 그리고 잘못된 방향으로 조작한게 아니고서야 절대 날아가지 않는다.

단지, 우리의 눈에 보이지만 않고 있을 뿐이다.

한마디로 commit의 해시코드만 알고있다면 언제라도 작업을 복구할 수 있음을 의미한다. 하지만, commit의 해시코드는 40자리의 랜덤한 문자열이므로 사람이 기억하는것이 불가능에 가깝다.

따라서 작업을 추적하기 위해 `git reflog`를 통해 commit log를 보여주기도 하지만, 더 간편한 방법이 있다. 바로, commit에 사람이 기억하기 쉬운 이름을 박아버리는 것이다.

이는 DNS와 완벽에 가까우리만큼 같은 개념인데, IP주소(ex 192.168.0.1 etc)를 사람이 기억하기 힘들기 때문에 `www.naver.com`과 같은 도메인 네임을 IP에 매핑하는것이다. tag와 같지 않은가?

tag는 `git tag [tagname]` 명령어를 통해 생성할 수 있다. 이 명령어를 입력하면 현재 HEAD가 바라보고 있는 commit을 바라보는 tag를 생성해낸다.

나는 `aa28560` commit에 `git tag save-point`명령어를 통해 tag를 생성했다.

![image](https://user-images.githubusercontent.com/71188307/184531697-48630e6e-9916-40fd-a457-fc9bc983268c.png)

이후 `[project]/.git/refs/tags`에 진입해보면 save-point라는 파일이 생성돼있고, 내용을 확인해보면 `aa28560` commit을 가리키고 있음을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/71188307/184531809-e292342e-a8d6-4f40-afbe-643477700548.png)

이제 tag를 생성했으니 `git reset --hard de70330`를 입력하여 branch의 참조를 이전 commit으로 돌린 후 `git log`를 입력하면 `aa28560`가 삭제된것처럼 보인다.

![image](https://user-images.githubusercontent.com/71188307/184531947-2834c4e1-0c60-4093-82ac-1108fd5d815a.png)

하지만 `aa28560` commit에 tag를 남겨두었으니, `git reset --hard save-point`를 입력하게 된다면 삭제된것처럼 보이는 commit을 언제든지 다시 복구(사실은 그냥 다시 보이게 한것에 불과하다)할 수 있다.

혹은 해시코드를 알고 있으니 `git reset --hard aa28560`를 입력해도 똑같은 결과가 나타난다.

![image](https://user-images.githubusercontent.com/71188307/184532011-d22c702a-57c3-4dda-91d9-00cce80f72d8.png)
![image](https://user-images.githubusercontent.com/71188307/184532013-5f66ffb4-2fad-4294-8615-dc8b3cdedbf4.png)

<br />

Git은 리눅스를 개발한 리누스 토발즈가 개발한 것인데(그것도 단 몇일만에...), 이러한 구조를 보면서 운영체제 책에서 보았던 inode-dentry가 살짝 연상됐다. 아마 리누스 토발즈가 리눅스를 개발하며 활용했던 설계를 Git에 일부 차용한게 아닐까? 라는 생각이 들었다.