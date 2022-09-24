---
layout: post
category:
  - backend
  - python
title: 파이썬 종속성 충돌 문제 원인 및 해결
description: |
    pip install -r requirements.txt 문제
image: /assets/img/backend/python.png
related_posts:
  - null
published: true
---

* toc
{:toc}

# 원인

다음과 같은 모듈간 의존 구조가 있다.
개발중인 프로젝트가 모듈 A를 의존하는데, 모듈 A는  모듈 B(v1.1)을 의존한다. (module A → module B(v1.1))
그리고 프로젝트가 별도로 모듈 B(v1.0)을 직접적으로 의존하는 상태이다. (PROJECT → module(v1.0))

그렇다면 프로젝트는 v1.0과 v1.1의 두 모듈 B중 어떤 모듈을 사용해야 할까?
이러한 상황을 `dependency conflict` 라고 부른다.

![image](https://user-images.githubusercontent.com/71188307/192101675-b53ba734-fd08-4be0-b38c-948365280130.png)

실제로 이러한 상황이 발생하면 pip에서는 다음과 같은 에러 메시지를 출력한다.

```shell
The conflict is caused by:
    The user requested google-auth==2.6.0
    google-api-core 2.2.2 depends on google-auth<3.0dev and >=1.25.0
    google-api-python-client 2.2.0 depends on google-auth<2dev and >=1.16.0
```

해석을 해보면, 유저가 google-auth 2.6.0을 사용하겠다고 requirements.txt에 명시해뒀으나, google-api-core와 google-api-python-client가 google-auth 2.6.0이 아닌 다른 버전을 또 의존하고 있고, 
이러한 다른 버전들을 가져오려고 하고 있기 때문에 google-auth==2.6.0 라는 구문과 충돌이 나는 것이다. 

# 해결

pip는 다음과 같은 해결 방식을 제시한다.

```shell
To fix this you could try to:
1. loosen the range of package versions you've specified
  (종속성 버전을 특정하지 말고 느슨하게 한다)
2. remove package versions to allow pip attempt to solve the dependency conflict
  (pip가 종속성 충돌을 해결할 수 있도록 패키지 버전을 제거한다)
```

![image](https://user-images.githubusercontent.com/71188307/192101769-d6b72149-72bd-4c59-816b-72378a24ec1c.png)

`requirements.txt` 에서 `google-auth==2.6.0` 을 제거한다면 모듈 A가 2.6.0이 아닌 google-auth를 가져오려 해도 충돌날 일이 없다.

혹은, == 연산자로 종속성 버전을 특정하지 말고 >, >=, <, <= 등의 연산자로 느슨하게 잡는다.

최근에 자바 진영에서 많이 사용되는 `Gradle`은 이러한 문제를 해결하기 위해 의존 구조에 `가시성`을 부여하는 방식을 도입했다.
`compile` 함수를 통해 모듈을 가져오면 하위 모듈을 모두 가져오는 셈인데(compile 함수는 최신 버전의 Gradle에서 `deprecated` 되었으며, 이러한 동작을 원한다면 api 함수 사용을 권장한다), 최근 Gradle에서 강력하게 권장하는 함수는 `implementation` 으로 모듈 A를 가져오면, 실제로 모듈 B도 함께 가져와지지만 프로젝트는 모듈 B의 존재를 모르게 된다.
파이썬 진영에서는 이러한 방식을 사용하고 있는지 검색을 해봤으나, 이에 대해 찾지 못했다. 아마 pip의 가이드를 통해 추측하기로는 아직 가시성을 활용하는 방식이 지원되지 않고 있는게 아닐까?