---
layout: post
category:
    - backend
    - server-side
title: HTTP 캐시
description: >
    불필요한 네트워크 비용을 줄이는 효율적인 방법
image: /assets/img/common/code1.png
related_posts:
    - _posts/backend/server-side/2021-11-05-http2_0.md
    - _posts/backend/server-side/2021-10-09-url-resource.md
---

* toc 
{:toc}

<br />

# 💡 Cache

---

캐시라는 것은 매우 많은 분야에서 사용되는 개념이다.

캐시에 대해 러프하게 설명해보자면, 원본을 복제한 사본을 만들고 이를 가까운곳에 저장해 사용하는것을 의미한다.

캐시는 기본적으로 `데이터 지역성(Locality)`의 원리를 이용하는데, 그 내용은 다음과 같다.

<br />

- `시간 지역성(Temporal locality)`
  - `for`, `while` 같은 반복문에 사용되는 조건 변수처럼 한번 참조된 데이터는 잠시 후에 다시 참조될 가능성이 높다.

<br />

- `공간 지역성(Spatial Locality)`
  - 메모리에 접근할 때 참조된 데이터 근처에 있는 데이터가 잠시 후에 다시 참조될 가능성이 높다.
  - 대표적으로 `배열`이 있으며, list\[0\]이 참조되면 잠시 후 list\[1\]이 참조될 가능성이 높다는 것이다.

<br />

- `순차적 지역성(Sequential Locality)`
  - 분기가 발생하는 비순차적 실행이 아닌 이상 명령어들이 메모리에 저장된 순서대로 실행하는 특성을 이용한 원리로 순차적일수록 다음 순서의 데이터가 사용될 가능성이 높다.
  - 즉, 프로세스는 위에서 아래로 순차적으로 실행되므로, 어떤 코드라인 한줄이 실행되면 짧은 시간 안에 바로 아래 위치한 코드라인이 실행될 가능성이 높다는 것이다. 

<br />

# 😄 캐시는 어려운게 아니다

---

<u>딱딱하기만 한 교과서적인 이야기는 잠시 치워두고 캐시를 조금 더 쉽게 이해해보자.</u>

<br />

첫번째 예로 지갑을 들 수 있다.

지갑이 없다면 우리는 `현금`이 필요할 때마다 `ATM`이나 `은행`에 가서 돈을 인출해야 한다.

하지만 미리 돈을 인출해서 지갑에 넣어둔다면 현금이 필요할 때 ATM이나 은행을 찾지 않고 즉시 현금을 사용할 수 있다.

<br />

두번째 예로 식당에서 미리 테이블을 세팅해두는 것을 들 수 있다.

보통 회사 근처의 식당들은 점심시간에 손님이 몰리는데, 손님이 올때마다 테이블을 세팅하면 매번 움직이는데 적지 않은 시간적, 체력적인 비용이 발생한다.

따라서, 점심시간이 되기 전 모든 테이블을 미리 세팅해둔다면 이러한 비용을 아낄 수 있을 것이다.

<br />

이러한 개념들을 우리가 개발하는것들에 접목한 것이 캐시이다.

즉, <u>~을 캐시한다</u> 라는 것은 <u>~을 미리 저장 해둔다</u> 혹은 <u>~을 미리 해둔다</u> 정도의 의미로 받아들여도 무방하다.

<br />

다음과 같은 것들을 떠올려 보자.

<br />

- CPU와 RAM 사이에 위치한 캐시메모리
- 넷플릭스, 유튜브 등의 다국적 기업들이 각 국가에 구축해둔 CDN
- 데이터베이스는 가장 최근에 실행된 쿼리에 대한 결과를 캐시해둔다
- DNS 서버는 최근에 실행된 쿼리에 대한 결과를 캐시해둔다

<br />

마찬가지로 이러한 개념을 HTTP에 접목한 것을 HTTP 캐시라 하며, 이 포스팅에서 다룰 내용이기도 하다.

<br />

# 🚀 HTTP 캐시

---

웹이나 모바일에서 화면의 어떤 버튼을 누를때마다 필요한 모든 리소스를 다시 다운받아야 한다면 이는 매우 비효율적인 일이다.

특히 `TCP`에 대해 어느정도 이해하고 있는 사람이라면 이러한 이벤트가 발생할때 처리해야 하는 `Handshaking`이 얼마나 비싼 비용을 지불하는지 알 것이다.

<br />

`css`, `javascript` 파일들은 크면 코드라인만 만단위로 작성되기도 한다.

`image`의 경우 그 자체로 용량이 `kb` 혹은 `MB`단위가 되는 경우도 허다하다.

그렇다면 용량이 큰 이런 정적 파일들을 브라우저에 캐시해놓는다면 어떨까?

이것이 바로 `HTTP 캐시`이다.

브라우저는 이러한 용량이 큰 파일들을 처음 다운받을 때 브라우저 내부 어딘가에 캐시해두고, 사용자가 어떤 버튼을 클릭하면 서버로 요청을 보내기 전 브라우저 캐시를 먼저 확인해본다.

그리고 이미 브라우저가 해당 파일(=리소스)을 캐시했다면 이는 서버에 요청하지 않고 갖고 있는 것을 그대로 사용하는 것이다.

<br />

그렇다면 HTTP 캐시는 어떻게 사용해야 할까?

`HTTP 캐시`를 사용하기 위해서는 `Cache-Control` 이라는 `HTTP 헤더`를 사용하면 된다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670690-2c382a9a-7546-4f71-9f10-9869bfb74d89.png)

<br />

위 내용이 아직 무슨 말인지 몰라도 괜찮다.

하나씩 차근차근 테스트해보면서 감을 잡을 수 있을 것이다.

<br />

위 이미지에서 `Expires`는 생각보다 중요하진 않지만, `max-age`와의 우선순위 문제가 있어 추가해두었다. 주로 사용되는 헤더는 `max-age`임을 기억하자 !
{:.note}

<br />

![image](https://user-images.githubusercontent.com/71188307/145670696-325f43c0-3a15-458a-b2ae-9a619520e685.png)

<br />

아주 간단하게 위와 같은 HTML을 작성하고 `localhost:8080/`에 접근하면 HTML을 반환하게 하였다. 

잡다한 텍스트와 커다란 이미지 하나를 포함하는 심플한 HTML이며, 이 HTML을 가지고 몇가지 시나리오를 테스트하면서 HTTP 캐시가 무엇인지 감을 잡아볼 것이다.

<br />

# 📜 시나리오 1: no-store

---

아주 간단하게 스프링 MVC 프로젝트를 생성하고 응답 헤더에 `Cache-Control: no-store`를 추가했다.

이는 해당 컨텐츠를 브라우저가 캐시하지 않을것임을 명시하는 헤더이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670700-9e9d3d8c-6760-4330-a22d-a61f16f79df8.png)

<br />

HTML은 <u>절대 캐시되지 않을 것</u>이며, URL을 입력할때마다 새로운 HTML을 다운받을 것을 예상할 수 있다.

정말 그럴까?

<br />

![image](https://user-images.githubusercontent.com/71188307/145670701-5d9fc250-2717-4231-8bb5-860f4a30cc18.png)

<br />

이미지의 크기는 `460kb`이며, 다운받아오는데 `7ms`가 걸렸다.

브라우저에 캐시 되지 않았을 것이므로, 페이지를 새로고침하면 새로운 컨텐츠를 다시 다운받아올 것을 예상한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670703-b34c884f-8767-4947-8b82-b73dee2b4d24.png)

<br />

페이지를 새로고침 할때마다 계속해서 `460kb`의 이미지를 새로 다운받고 있음을 확인할 수 있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670704-68aaacff-9155-4cad-9b44-9f9175a6d3cb.png)

<br />

HTTP 헤더를 까보니 `Cache-Control: no-store`가 제대로 들어있음을 확인할 수 있다.

<br />

# 📜 시나리오 2: no-cache

---

`Cache-Control: no-cache`는 캐시를 하지 않는다는 뜻이 아니고, 기본적으로 컨텐츠를 캐시하되 매번 서버에 사용해도 되는 캐시인지 물어본다는 의미이다.

브라우저가 캐시한 컨텐츠가 브라우저에 캐시된 이후로 변경된 적이 없다면 브라우저가 갖고있는 캐시를 사용하고, 변경된 적이 있다면 새로운 컨텐츠를 다운받아 다시 캐시하는 것이다. 

<br />

![image](https://user-images.githubusercontent.com/71188307/145670706-cb774df9-5b67-4ca9-a542-1ab825b1dff3.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/145670707-6149e0b4-2cf3-453a-b71b-9b426d64df18.png)

<br />

인터넷의 상태를 `느린 3G`로 변경하고 `localhost:8080/`에 접근하니 이미지를 다운받는데 `11.22s`가 걸렸다.

최초 접근이니 브라우저에 캐시된 것이 없어 새로 다운받는 것은 당연한 현상이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670711-e5229043-7b08-41cb-bc95-3d8067ff731e.png)

<br />

페이지를 새로고침했더니 상태코드 `304 Not Modified`와 함께 `279B`의 통신이 발생했다.

상태코드 `304`가 응답됐다는 것은 컨텐츠가 변경되지 않았음을 의미하며, `279B`의 통신비용은 브라우저가 서버에 자신이 갖고 있는 캐시가 가장 최신의 컨텐츠인지를 물어보면서 발생한 것이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670713-a5c1f8e1-617f-40df-b328-505bd5f7af47.png)

<br />

HTTP 헤더를 까보니 `If-Modified-Since`라는 요청 헤더가 추가돼있음을 확인할 수 있다.

이는 브라우저가 추가한 것으로 자신이 갖고 있는 컨텐츠가 해당 시점에 마지막으로 수정됐음을 의미한다.

서버에서 응답한 `Last-Modified`는 서버에서 갖고 있는 컨텐츠가 해당 시점에 마지막으로 수정됐음을 의미하기 때문에, `If-Modified-Since`와 `Last-Modified`가 동일하다면 브라우저가 캐시한 컨텐츠는 가장 최신의 컨텐츠라고 봐도 무방할 것이다.

따라서 새로운 컨텐츠를 다운받는 절차가 생략되었으며, 이 말인즉슨 이미지를 새로 다운받아 발생하는 `460kb`의 통신비용이 아닌, 서로의 상태를 확인하는 텍스트를 주고받아 통신을 끝내어 `279B`의 통신 비용이 발생했음이다.

<br />

# 📜 시나리오 3: max-age

---

`Cache-Control: max-age`는 캐시가 어느정도의 기간동안 유효한지를 서버에서 마킹하여 응답하는 것이다.

이는 초(Second) 단위로 사용되며, 주로 사용되는 단위는 다음과 같다.

<br />

- 1일: 86,400
- 7일: 604,800
- 30일: 2,592,000
- 1년: 31,536,000

<br />

브라우저는 캐시한 컨텐츠에 `max-age`가 붙어있고, 캐시가 유효하다면 서버에 사용해도 되는 컨텐츠인지 물어보는 과정조차 생략된다.

이는 매우 중요한 것으로, `TCP 커넥션`이 아예 맺어지지 않음을 의미하고, 이 말인즉슨 값 비싼 `Handshaking`과정이 아예 일어나지 않음과 일맥상통한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670715-ce3f0d0c-6fcb-4b64-8ec4-c006e84e726d.png)

<br />

`20s` 동안 캐시가 유효할 것이라고 마킹하여 응답했다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670716-65165da6-c6be-41e3-ae7b-67b3dd243172.png)

<br />

역시 최초 요청이므로 이미지를 다운받는 `460kb`의 통신비용이 발생한다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670720-2367c337-04d4-4743-9fb9-588dd15c1624.png)

<br />

이후 주기적으로 페이지를 새로고침했는데, 여태까지와는 다르게 `(메모리 캐시)`라는 텍스트가 뜨는것을 확인할 수 있다.

즉, 브라우저 캐시를 그대로 사용했음을 의미한다.

캐시가 만료되는 시점마다 `280B`정도의 통신비용이 발생했는데, 이는 `max-age`에 지정된 시간이 만료되어 브라우저가 서버에 자신이 캐시한 컨텐츠가 최신의 컨텐츠인지를 물어보는 과정이 발생했기 때문이다.

원래라면 `max-age`가 만료된 시점에는 무조건적으로 `최신 컨텐츠인지 확인(279B~280B)`가 아닌 `이미지 다운로드(460kb)`가 발생해야만 하는데, 헤더에 `Cache-Control: must-revalidate`를 추가했기 때문에, 매번 새로 다운받는 것이 아닌 브라우저가 캐시한 컨텐츠가 최신인지를 서버에 확인하는 과정이 추가된 것이다.

<br />

`(메모리 캐시)`가 아닌 `(하드디스크 캐시)`가 뜨는 경우도 있는데, 이는 브라우저가 알아서 판단해 적용하는 부분이며 어쨋건 둘다 캐시가 되긴 한 것이다.
{:.note}

<br />

![image](https://user-images.githubusercontent.com/71188307/145670722-99f9838e-be54-48bb-bea0-7cbbfd962c2c.png)

<br />

기본적으로 `max-age`와 `must-revalidate`를 조합해서 사용하되, 컨텐츠의 이름으로 버저닝하는 것도 아주 좋은 방법이다.

예를 들어 1만줄이 넘어가는 `style.css`라는 파일이 있다고 가정하고, 이 파일의 max-age를 1년으로 설정해두었다고 가정하자.

이후 `style.css`가 수정되어도 1년이 지나지 않았다면 서버에 확인조차 안할것이기 때문에 파일이 변경되어도 실제로 적용되지 않는 치명적인 문제가 발생한다.

하지만 `style-0.0.1.css` 처럼 파일명으로 버저닝을 한다면, 캐시는 문제없이 되면서도 컨텐츠가 변경됐을때 기존 캐시의 업데이트 또한 수월하게 될 수 있다.

<br />

# 📜 시나리오 4: ETag

---

`ETag`는 서버가 컨텐츠의 내용에 서버의 어떤 값을 추가하여 고유한 해시값을 만들어 낸 것이다. (MD5 digest)

하지만 이는 `Cache-Control`에서 우선순위가 가장 높기 때문에 잘못 사용하면 캐시가 되지 않는 경우도 존재한다.

일례로 웹 서버를 여러개 사용하고 있을 경우 실제 컨텐츠는 같더라도 각 웹 서버별로 생성해내는 ETag가 달라 캐시가 되지 않는 경우가 존재할 수 있다.

따라서 ETag를 사용한다면 이러한 부분을 숙지하고 사용하도록 하자.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670723-5ef797fc-0ca6-42c0-acb1-81d4c0a4b61b.png)

<br />

컨텐츠의 내용을 해싱하여 `ETag`를 생성하도록 코드를 작성했다. 

<br />

![image](https://user-images.githubusercontent.com/71188307/145670725-a87945b1-b295-45a9-8ab9-7342a86951b8.png)

<br />

최초 요청 시 서버에서 응답한 컨텐츠에 `ETag` 헤더가 달려있음을 확인할 수 있다.

ETag는 컨텐츠의 내용이 바뀌어야만 하기 때문에 이번에는 이미지가 아닌 텍스트를 변경하였다.

HTML 좌측에 `Added ETag`라는 글자가 삽입된 것을 볼 수 있다. 

<br />

![image](https://user-images.githubusercontent.com/71188307/145670726-52a25f78-219d-441d-a71d-3934b393a14e.png)

<br />

페이지를 새로고침했다.

아직은 컨텐츠가 변경되지 않았으므로, 브라우저가 캐시한것을 사용했다.

이를 서버에 확인하는 과정을 거쳐 `279B`의 통신비용이 발생했다.

만약 HTML을 새로 다운받았다면 `5.3kb`의 통신비용이 발생했을 것이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670728-161adb89-31d0-41dc-aaf1-31816b942d73.png)

<br />

HTTP 헤더를 까보니 브라우저가 서버로 보낸 요청 헤더에 `If-None-Match`에 컨텐츠의 `ETag`가 붙은채로 요청이 간 것을 볼 수 있다.

이름 그대로 서버가 갖고있는 컨텐츠와 자신이 보낸 ETag가 일치하지 않는다면 새로운 컨텐츠를 응답해달라는 의미이다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670730-db8a77b7-2d66-4966-9a04-281497f1c3d9.png)

<br />

이번에는 서버에서 `Added ETag`라는 글자를 제거하였다.

즉시 새로운 컨텐츠를 다운받아 `5.3kb`의 통신비용이 발생했음을 확인할 수 있다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670733-cfd22663-dac3-42e8-8382-237f4e4ff91e.png)

<br />

HTTP 헤더를 까보니 역시 브라우저는 요청 헤더에 `If-None-Match`를 달아서 요청을 보냈고, 서버가 갖고 있는 HTML은 이미 변경되어 ETag도 함께 변경됐기 때문에 브라우저가 보낸 ETag와 일치하지 않았다.

따라서 서버는 가장 최근에 생성된 ETag와 함께 최신 컨텐츠를 응답했다.

<br />

# 🚧 HTTP 캐시 Policy

---

위에서 캐시가 무엇인지, HTTP 캐시를 어떻게 사용해야 하는지에 대한 간략한 테스트를 해보았다.

각 캐시 헤더는 장단점이 분명히 존재하며, 이러한 캐시 헤더의 장단점을 명확히 파악하고 적절하게 사용하는 것은 매우 중요하다고 볼 수 있다.

구글 개발자 페이지에서 이러한 HTTP캐시를 어떻게 사용할 것인지에 대해 아주 알아보기 쉬운 가이드를 제시한 내용이 있어 발췌해왔다.

<br />

![image](https://user-images.githubusercontent.com/71188307/145670738-6284e0a8-1702-46e6-b5ad-4509c2899fd0.png)
이미지 출처: [구글 개발자 페이지](https://web.dev/http-cache/#invalidating-and-updating-cached-responses)
{:.figcaption}

<br />

# 📕 참고

---

- [HTTP 완벽 가이드 7장 - 캐시](http://www.kyobobook.co.kr/product/detailViewKor.laf?mallGb=KOR&ejkGb=KOR&barcode=9788966261208)
- [구글 개발자 페이지 - HTTP 캐시](https://web.dev/http-cache/#invalidating-and-updating-cached-responses)
- [Nginx - Cache-Control 설정](http://nginx.org/en/docs/http/ngx_http_headers_module.html)
- [RFC-2616](https://www.ietf.org/rfc/rfc2616.txt)

<br />