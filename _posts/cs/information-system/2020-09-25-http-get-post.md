---
layout: post
category:
  - cs
  - information-system
date: 2021-01-10 21:05
title: HTTP / GET / POST
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

공부한걸 틈틈이 포스팅하며 정리와 복습을 해야 하는데, 

워낙 학습량이 많다 보니 포스팅하는 게 생각보다 쉽지가 않다.

그래도 미래의 나를 위해서 힘들더라도 조금씩이나마 꾸준히 포스팅해야겠다고 생각했다.

`Servlet`을 처음 공부할 때 `DNS` & `HTTP 프로토콜`과 `GET/ Post` 방식에 대해 공부했었는데, 

당시에는 ***"아~ 이런 것도 있구나"*** 하고 가볍게 넘어갔었다.

그때는 자바에서 웹 통신을 하기 위한 입출력 장치가 없기 때문에

WAS의 `Servlet`을 가져와 입출력 장치(HttpRequest, HttpResponse)를 자바로 구현한다는 게 보다 더 핵심적인 기능이라고 생각했기 때문이다.

&nbsp;  

***물론 이 생각은 아직도 유효하다..!***

&nbsp;  

사실 이때 처음 안 사실이 하나 있는데, 

그게 뭐냐 하면 자바는 `javax(자바 extension)`라는 확장 패키지를 통해 

이기종 시스템의 기능을 자바에서 구현한다는 사실이었다. 

대표적인 녀석으로 `Swing`이라는 자바의 UI 라이브러리가 있겠다.

그 유명하고 우리가 많이 사용하는 `인텔리제이(IntelliJ)`가 바로 이 `Swing`으로 만들어진 대표적인 프로그램이다.

&nbsp;  

아무튼 각설하고, `AJAX(Asynchronous javascript and XML)`를 처음 구현하고 

`Spring Security`를 막 사용할 때 이 `GET`과 `Post`에 대해 진지하게 찾아보게된 계기가 있는데 그 이유가 뭐냐하면 통신이 되질 않아서였다.

`Spring Security`는 `XSS` 공격을 방지하기 위해 ``Post`` 방식으로 통신할 경우 매번 `CSRF Token`을 주고받아야 했고

HTTP 헤더에 `Content Type`을 명시해야 했는데 당시엔 이를 몰랐기 때문이다.

`GET`은 설계 자체가 조회를 위해 만들어진 방식이기 때문에 위의 내용과는 상관이 없는 것 같았다.

아무튼 매번 이렇게 통신이 안돼 구글링을 하느니 차라리 이걸 내가 확실하게 이해해놔야 겠다는 생각이 강하게 들었었다.

&nbsp;  

# HTTP

---

HTTP는 웹 통신을 위한 국제적인 약속의 일종이다.

웹 개발자라면 모두 이 HTTP의 요구사항에 맞추어 개발을 해야 한다.

이런 약속을 어겨서 모두가 피해를 보는 경우가 있는데

범주는 약간 다르지만 웹 브라우저 표준을 지키지 않는 대표적인 예가 있다.

바로 `MS`의 `IE(Internet Explorer)`이다. ***(크로스 브라우징 이슈)***

&nbsp;  

이 HTTP는 `Header`와 `Body`로 구성되는데

HTTP Header는 `General Header`와 `Request/Response Header` 로 나뉜다.

`General Header`에는 간략한 요청정보와 통신의 상태 코드등의 정보가 들어있고

`Request/Response Header`에는 더 자세한 내용들이 담겨있으며,

`HTTP Body`에는 요청 정보에 대한 상세한 내용이 담겨있다.

즉 `HTML`, `JSON`, `XML` 등의 메시지가 들어간다.

&nbsp;  

# GET

---

```text
  -General Header
  Request URL: http://localhost:8090/member/user-ask-list?pageNum=1&pageNumReview=1&amount=10
  Request Method: GET
  Status Code: 200 
  Remote Address: [::1]:8090
  Referrer Policy: strict-origin-when-cross-origin

  -Request Header
  Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
  Accept-Encoding: gzip, deflate, br
  Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
  Connection: keep-alive
  Cookie: JSESSIONID=B8E6104ABE710304CEDBD46DE2FDB17F
  Host: localhost:8090
  Referer: http://localhost:8090/member/my-page
  sec-ch-ua: "Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"
  sec-ch-ua-mobile: ?0
  Sec-Fetch-Dest: document
  Sec-Fetch-Mode: navigate
  Sec-Fetch-Site: same-origin
  Sec-Fetch-User: ?1
  Upgrade-Insecure-Requests: 1
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36

  -Query String 파라미터s
  pageNum: 1
  pageNumReview: 1
  amount: 10
```

GET은 서버로부터 데이터를 조회할 때 사용하도록 만들어진 녀석이다. 

이 녀석은 `멱등(Idempotent)` 하게 설계되었다.

> ***📜 멱등(Idempotent)***
> 
> 수학이나 전산학에서 연산의 한 성질을 나타내는 것으로, 연산을 여러 번 적용하더라도 결과가 달라지지 않는 성질 
> 동일한 연산을 여러 번 수행해도 동일한 값이 나와야 함을 의미함

## GET의 특징

### 📜 파라미터가 URL을 통해 외부에 노출된다

---

```text
http://localhost:8090/member/user-ask-list?pageNum=1&pageNumReview=1&amount=10
```

위와 같은 URL이 GET방식의 URL인데 user-ask-list 다음 `?`로 시작하는 부분이 있다. 

`?`는 이제부턴 파라미터라는 뜻이고 `&`는 파라미터를 구분하는 구분자다. 

각 파라미터는 `키(Key)=값(Value)`의 쌍으로 표시된다.

이 파라미터의 표시를 `쿼리스트링(Querystring)` 이라고 부른다.

&nbsp;  

결론적으로 위 URL의 파라미터는

<u>pageNum=1, pageNumReview=1, amount=10</u>

이며, 어떤 요청(Request)에 위와 같은 값들을 서버로 함께 보내는 것이다. 

서버에서는 이 값들을 전달받아 비즈니스 로직을 처리하여 처리된 데이터를 Client에게 되돌려준다.

실제로 위 코드블럭을 보면 최하단에

```text
 -Query String parameters  
  pageNum: 1  
  pageNumReview: 1  
  amount: 10
```

라는 문구를 볼 수 있다.

&nbsp;  

### 📜 쿼리스트링(Querystring)의 길이는 한계가 있다

---

웹 브라우저에 입력되는 URL의 길이는 무한할 수 없다

&nbsp;  

### 📜 브라우저에 캐시 될 수 있다

---

조회(GET) 시 주로 `js`, `css`, `image` 등의 크기가 크고 변동될 사항이 적은 정적 파일들을 가져오기 때문에

브라우저는 이 파일들을 브라우저가 깔린 하드디스크 경로에 저장해 두고

이를 재사용하기 때문에 통신속도의 향상을 기대할 수 있다.

다만 캐시 된 파일을 사용하기 때문에 수정사항이 생겨 정적 파일에 변동사항이 생겼음에도

변경되기 전의 파일이 웹 브라우저에 캐시 되어있어 변경사항이 반영되지 않는 경우가 있을 수 있는데,

이때는 당황하지 말고 브라우저의 캐시를 초기화시켜주면 반영된 결과를 볼 수 있을 것이다. 

***(브라우저 강력 새로고침 기능)***

&nbsp;  

# POST

---

```text
  -General Header
  Request URL: http://localhost:8090/login
  Request Method: POST
  Status Code: 200 
  Remote Address: [::1]:8090
  Referrer Policy: strict-origin-when-cross-origin

  -Request Header
  Accept: application/json, text/자바script, */*; q=0.01
  Accept-Encoding: gzip, deflate, br
  Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
  Connection: keep-alive
  Content-Length: 37
  Content-Type: application/x-www-form-urlencoded; charset=UTF-8
  Cookie: JSESSIONID=0000000038AB0E7D556C6D68F0A
  Host: localhost:8090
  Origin: http://localhost:8090
  Referer: http://localhost:8090/member/login-page
  sec-ch-ua: "Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"
  sec-ch-ua-mobile: ?0
  Sec-Fetch-Dest: empty
  Sec-Fetch-Mode: cors
  Sec-Fetch-Site: same-origin
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36
  X-CSRF-TOKEN: 61a8cec2-efff-47ce-b644-77cd5425ac3c
  X-Requested-With: XMLHttpRequest

  -Form Data
  memberId: tester
  memberPw: QWERASDF!
```

이 녀석은 주로 데이터의 입력/수정을 위해 사용된다.

그래서 GET과 반대로 `Non-Idempotent` 하게 설계되었다. 

항상 값이 변할 수 있다는 이야기이다.

&nbsp;  

POST는 GET과 다르게 파라미터의 크기에 제한이 없다.

```text
http://localhost:8090/login
```

위는 POST방식의 URL인데 보다시피 외부로 노출된 파라미터가 없다.

주의할 점은 명확하게 `Content Type`을 명시해줘야 <u>타입 추론으로 인한 장애가 발생하지 않는다.</u>

이를 명시하지 않을 경우 통신에 실패하는 경우가 생길 수 있다. 

~~(나는 이걸 명시해주지 않아서 AJAX 구현 할 때 물을 먹었다)~~

&nbsp;  

또한 파라미터가 바디에 숨겨진다고는 하나 개발자 도구나, 피들러같은 툴을 사용하여 작정하고 보려고 하면 쉽게 볼 수 있기 때문에

보안을 생각한다면 추가적인 암호화를 반드시 해줘야 한다.

&nbsp;  

위 코드블럭은 웹 브라우저의 개발자 도구로 본 POST방식 Request Header의 상세정보이다.

보다시피 최하단에

```text
\-Form Data-Form Data  
memberId: tester  
memberPw: QWERASDF!
```

라 하여 서버에 보내는 정보를 눈으로 바로 확인할 수 있음을 알 수 있다.