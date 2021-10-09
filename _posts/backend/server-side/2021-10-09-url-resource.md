---
layout: post
category:
    - backend
    - server-side
title: URL과 리소스
description: >
    HTTP 완벽 가이드 2장
image: /assets/img/common/code1.png
related_posts:
    - 
---

* toc
{:toc}
  
<br />

# URI(Uniform Resource Identifier)

---

책에서는 `URI(Uniform Resource Identifier)` 는 `URL(Uniform Resource Locator)`, `URN(Uniform Resource Name)` 로 이루어진 종합적인 개념이라고 소개합니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/136654494-59404f09-affb-4850-a55f-a1774d7b371f.png)

<br />

URI는 한국어로 표현하면 `통합 자원 식별자` 정도로 표현할 수 있을 것 같은데, 이 용어 역시 제대로 와닿는 용어는 아닙니다.

제가 생각하는 URI는 `리소스를 식별할 수 있는 문자의 나열`입니다.

여기서 `리소스(Resource)`가 아주 핵심적인데, 이 리소스가 무엇이냐 ?

[RFC-2396 Overview of URI](https://datatracker.ietf.org/doc/html/rfc2396#section-1.1) 에서는 리소스에 대해 다음과 같이 말합니다.

<br />

> Resource
> 
> A resource can be anything that has identity. 
> 
> Familiar
> examples include an electronic document, an image, a service
> (e.g., "today's weather report for Los Angeles"), and a
> collection of other resources. 
> 
> Not all resources are network
> "retrievable"; e.g., human beings, corporations, and bound
> books in a library can also be considered resources.

<br />

동영상, 이미지, 전자문서, 실시간 교통흐름, 환율 등 식별할 수 있는 모든것은 `리소스(자원)`가 될 수 있다고 합니다.

단, 모든 리소스가 항상 검색엔진에서 검색 가능하지는 않다고 하네요.

<br />

즉, 웹에서 사용되는 리소스를 식별하기 위한 모든 문자열의 나열은 URI라고 불러도 무방할 것 같습니다.

<br />

# URL(Uniform Resource Locator)

---

URL은 많이 들어보셨을 것입니다.

URL은 리소스의 정확한 위치를 표현한 것입니다.

여기서 URI와 URL의 차이점이 무엇이냐? 라는 의문이 드실 수 있습니다.

일단 URL은 URI의 부분집합으로서 모든 URL은 URI라고 불러도 무방합니다.

<br />

더 자세한 차이에 대해 설명드리자면 제 `블로그(https://shirohoo.github.io/)` 에서 `index.html` 이라는 리소스를 찾고자 할 때 웹 브라우저에 다음과 같은 문자열들을 입력할 수 있습니다.

<br />

- URI: https://shirohoo.github.io/index
- URL: https://shirohoo.github.io/index.html

<br />

URI와 URL은 이 정도의 차이라고 볼 수 있습니다.

위의 URI와 URL은 웹 브라우저에 입력 시 같은 결과를 반환하며, URL은 보시다시피 `index.html`이라는 리소스의 위치까지 정확하게 표현한 것이고, URI는 리소스의 정확한 위치를 표현하지 않더라도 내부적인 매핑등으로 인해 어느정도 해당 리소스의 위치를 파악할 수 있기 때문에 역시 `index.html`을 반환합니다.

즉, 완벽하게 다 입력하지 않더라도 이미 해당 리소스를 식별할 수 있다는 뜻입니다.

<br />

## URL 상세

---

URL 문법은 대체로 9개의 컴포넌트로 나눠집니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/136656473-e60782a3-92f5-477d-b690-6af0a6a2573e.png)

<br />

|         컴포넌트         |                                                 설명                                                 |           기본값           |
|:-----------------------:|:----------------------------------------------------------------------------------------------------:|:-------------------------:|
|scheme(=protocol)|리소스를 가져오기 위해 어떤 프로토콜을 사용해 서버에 접근할지를 기술합니다.|-|
|username|특정 프로토콜은 사용자 이름을 요구하는 경우가 있습니다.|anonymous|
|password|사용자의 비밀번호를 의미합니다.|email|
|host|리소스를 호스팅하는 서버의 `IP`나 `도메인`을 의미합니다.|-|
|port|리소스를 호스팅하는 서버가 오픈한 포트 번호 입니다. 프로토콜에 따라 다를 수 있고, `Well Known Port`의 경우 생략 가능합니다.|프로토콜에 따라 다름|
|path|해당 리소스가 서버의 어떤 위치에 존재하는지에 대한 표현으로, `/`표시로 구분됩니다.|-|
|parameter|특정 프로토콜에서 필요한 입력 파라미터를 기술하는 용도로 쓰입니다.|-|
|query|서버에 찾고자하는 리소스에 대한 정보를 보낼때 사용합니다. `키=값`으로 이루어져 있으며, `?`문자로 시작되며 쿼리를 추가할 때 `&`를 통해 이어붙입니다. 보통 쿼리스트링이라고도 부릅니다.|-|
|fragment|리소스의 특정 부분에 대한것을 기술할 때 사용됩니다. 주로 ToC와 같이 문서의 목차등에서 사용되며 `#`문자로 구분됩니다.|-|

<br />

### 상대경로

---

URL에서 사용되는걸 본적은 많이 없는 것 같고, 오히려 프로그래밍을 할 때 많이 사용되는 부분인 것 같습니다.

두가지만 기억하면 됩니다.

- `.` 은 현재 위치를 기준으로 합니다.
- `..` 은 현재 위치의 상위 경로를 기준으로 합니다.

<br />

### URL 예제

---

- Web 1

![image](https://user-images.githubusercontent.com/71188307/136655447-a05587a8-b1c3-4747-9fa1-02a319cc2eea.png)

- Web 2

![image](https://user-images.githubusercontent.com/71188307/136655566-665303df-a68f-4cc8-b23b-2aa91b967d8c.png)

- Database

![image](https://user-images.githubusercontent.com/71188307/136655372-5aa758cc-2d6d-4ec5-bdec-3b92ceaf27a1.png)

<br />

### URL 인코딩

---

특정 프로토콜에서 URL이 소실되는 경우를 방지하기 위해 URL에 안전하지 않은 문자가 포함 된 경우 이를 인코딩합니다.

여기서 안전하지 않은 문자라 하면, ASCII로 대체할 수 없는 문자를 의미하며, 이러한 모든 안전하지 않은 문자를 `%`와 `ASCII 코드로 시작되는 두 개의 16진수 숫자`로 변경합니다.

이를 `URL Encoding` 혹은 `Percent Encoding` 이라고 부릅니다.

인코딩 방식은 주로 `UTF-8`이 사용되며, `EUC-KR`도 종종 사용됩니다.

<br >

아래와 같은 URL이 있다고 가정합니다.

> http://www.example.com/?value=">"

이 URL에는 안전하지 않은 문자가 포함되므로 아래와 같이 인코딩 됩니다.

> http://www.example.com/?value=%22%3E%22

<br />

#### 제한된 문자

---

프로그래밍에는 흔히 `예약어`라고 불리는, 어떤 특수한 목적을 갖는 문자들이 반드시 존재합니다.

URL에도 이와 비슷한 개념이 존재합니다.

관련 내용은 [RFC-3986 Percent-Encoding](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1) 에 아주 상세히 작성돼있으며, 간략한 내용은 위키백과의 내용을 첨부합니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/136656072-43db6faa-1246-4524-a0ed-2247badd3998.png)

<br />

# URN(Uniform Resource Name)

---

URL의 단점을 해결하기 위해 나온 방식입니다.

URL의 경우 리소스의 정확한 위치를 표현하는데, 만약 서버에서 해당 리소스의 실제 위치가 바뀐다면?

그 즉시 해당 리소스의 위치를 표현하던 URL은 아무런 의미를 갖지 못하게 됩니다.

따라서 서버에서 URL을 한번 외부로 노출시키면 해당 URL은 하위호환성을 고려할 때 함부로 변경할 수 없어지게 되는 것이죠.

<br />

URN은 이러한 문제에서 자유롭습니다. 

URN은 문법상 `urn:카테고리:식별자`로 사용된다고 하는데, 저는 아직 URN을 사용하는 경우를 단 한번도 보지 못했습니다.

예제는 다음과 같습니다.

<br />

- urn:isbn:1251795 - 어떤 ISBN 번호로 책을 식별합니다. 
- urn:uuid:7e3bd412-2n5a-23h9-3769-1950342c9a51 - 어디서나 사용 가능한 중복되지 않는 고유한 식별자입니다.

<br />

이전에 URL을 URN으로 대체하려는 시도가 한번 있었다고 하는데, 잘 되지 않았다고 합니다.

URL에 분명한 한계가 존재하긴 하지만, 이미 범용적으로 잘 사용되고 있는 상황에 세계적인 범위로 이를 대체하는게 쉽지 않은 작업이었다고 하네요.

하지만 먼 미래에는 URN으로 모두 대체될 것이라는 이야기가 분명히 존재하는 만큼, 이러한 것도 있다는 것은 알고 있어야 할 것 같습니다.

<br />
