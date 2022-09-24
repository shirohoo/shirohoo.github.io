---
layout: post
category:
  - backend
  - python
title: 파이썬 내장 함수 round()는 왜 생각과 다르게 동작하는가?
description: |
    사사오입? 오사오입?
image: /assets/img/backend/python.png
related_posts:
  - null
published: true
---

* toc
{:toc}

# 사사오입? 오사오입?

파이썬 내장함수 학습 테스트 도중 알게 된 내용이다. 보통 round 함수는 반올림으로 사용 되는데, 파이썬에서는 생각과 다르게 동작하는 부분이 있었다.

파이썬 인터프리터에 round(1.5)라는 코드를 넘기면 예상대로 반올림 된 값인 2가 반환된다.

![image](https://user-images.githubusercontent.com/71188307/191527526-dc146bea-eeeb-4caa-9da2-793f7b01875e.png)

하지만 round(2.5)를 넘기면 3이 아닌 2가 반환된다.

![image](https://user-images.githubusercontent.com/71188307/191527572-9bab1272-02e7-4502-9348-b7315752a6a9.png)

왜 이러한 현상이 발생하는지 문서를 찾아봤다.

> [📜 Built-in Functions - Python 3.10.7 documentation](https://docs.python.org/3/library/functions.html#round){:target="_blank"}
> 
> Return number rounded to ndigits precision after the decimal point. If ndigits is omitted or is None, it returns the nearest integer to its input.
> For the built-in types supporting round(), values are rounded to the closest multiple of 10 to the power minus ndigits; if two multiples are equally close, rounding is done toward the even choice (so, for example, both round(0.5) and round(-0.5) are 0, and round(1.5) is 2).

대상 값이 정확히 중간값이면 짝수가 나오는 방향으로 반올림한다는 내용이다.
즉, 2.5는 2와 3의 중간값이며 올림 할 경우 홀수인 3이 나오기 때문에, 2.5에서 내림하여 짝수인 2가 나오는 방향으로 연산이 된다는 것이다.

이러한 방식을 오사오입이라고 부르는 듯하다. 
그리고 1~4면 버리고 5~9면 올리는, 흔히 우리가 생각하는 반올림을 옛날 용어로 사사오입이라고 불러왔으며, 이 용어를 대신해 사용되기 시작한 용어가 반올림이라고 한다. 

주변 아는 사람들 대여섯 명에게 round(2.5)를 실행하면 어떤 값이 반환될 것 같느냐고 질문했을 때, 모든 사람이 3이 반환 될 것이라고 대답했다. 물론 나도 그러했고... 
그럼 파이썬은 왜 이렇게 사람들의 직관에 반하는 이러한 연산 방식을 표준 내장 함수에 적용했을까?

![image](https://user-images.githubusercontent.com/71188307/191527593-558c579e-d74e-41dc-8fe9-486025b4e062.png)

그러니까 통계학에서는 변량이 홀수보다 짝수가 많아야 오차가 더 작기 때문에 오사오입이 합리적인데, 파이썬이 수학과 통계 분야에서 많이 사용되기 때문인 듯 하다.

그렇다면 대부분의 일반인들은 왜 수학과 통계 분야에서 사용되는 합리적인(?) 오사오입 방식이 아닌 사사오입 방식을 배우고 사용해왔는가?

![image](https://user-images.githubusercontent.com/71188307/191527618-e16aeb4e-e9dd-40bd-8b96-0246525d4de7.png)

맞는지는 잘 모르겠고, 내 주변 사람들에게 물어본 바, 단 한명의 예외도 없이 1~4는 버리고 5~9는 올린다고 답하는 것을 보면 그냥 이 방식이 사람한테 직관적이기 때문인 게 아닐까 싶기도 하다.

# 참고
- [📜 Built-in Functions - Python 3.10.7 documentation](https://docs.python.org/3/library/functions.html#round){:target="_blank"}
- [📜 반올림하는 두 가지 방법 (Round-off(사사오입), Round-to-nearest-even(오사오입))](https://blog.naver.com/PostView.naver?blogId=noseoul1&logNo=221592047071&redirect=Dlog&widgetTypeCall=true&directAccess=false){:target="_blank"}