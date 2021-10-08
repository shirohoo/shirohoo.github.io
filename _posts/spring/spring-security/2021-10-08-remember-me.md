---
layout: post
category:
    - spring
    - spring-security
title: Remember-Me
description: >
    주로 자동로그인 등에 사용되는 `Remember-Me` 기능에 대해 알아봅시다.
image: /assets/img/spring/spring-security/security-logo.png
related_posts:
    - _posts/spring/spring-security/2021-05-02-authentication.md
    - _posts/spring/spring-security/2021-08-30-rest-login.md
---

* toc
{:toc}
  
<br />

# Dependencies

---

이 글의 예제 코드를 적용하기 위해서는 다음과 같은 의존성을 빌드 스크립트에 추가해야만 합니다.

빌드툴은 `Gradle`을 기준으로 작성하며, `Spring Boot 2.5.5` 기반입니다.

웹 브라우저는 `크롬`을 사용하였습니다.

<br />

```groovy
// file: 'build.gradle'
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    
    ...

    runtimeOnly 'com.h2database:h2'
}
```

<br />

# ✅ Remember-Me

---

`Java Servlet` 기반의 `WAS`를 사용 할 경우 인증 요청 대한 인증 성공 시 발급되는 쿠키의 기본 이름은 `JSESSIONID` 입니다.

이것은 `Java Servlet` 표준 스펙에 정의된 부분이기 때문에 `Java Servlet`을 구현하는 모든 WAS가 동일합니다.

`Spring MVC`를 사용 할 경우 기본적으로 톰캣을 사용하기 때문에 위의 내용이 적용됩니다.

따라서 `Spring Security` 적용 후 발급되는 인증 쿠키의 이름은 `JSESSIONID`가 됩니다.

<br />

> 이 이름은 물론 개발자가 커스터마이징할 수 있습니다.

<br />

`Remember-Me` 기능은 사용자에게 매우 큰 편리성을 제공하는 기능입니다.

사용자가 서버에 인증한 순간 웹 브라우저에 `remember-me` 쿠키를 저장해 놓음으로써 이후 사용자의 세션이 만료되거나, 불특정한 사유로 `JSESSIONID`가 없어졌을 경우에도 해당 사용자를 기억할 수 있게 됩니다.

즉, `Spring Security Filter Chain`에서 유효한 `remember-me` 쿠키를 인식하면 해당 사용자가 현재 인증되지 않은 사용자라고 할지라도 즉시 자동으로 재 인증을 시켜주므로, 사용자는 이 기능을 통해 로그인 시 쿠키가 유효한 시점까지 아이디/패스워드 등의 정보를 다시 입력하지 않아도 되게 됩니다.

단, 사용자에게 편의성을 제공하면 할수록 보안 수준은 반비례하여 점점 떨어질 수 밖에 없기 때문에, 이 부분은 항상 주의해야 합니다.

<br />

스프링 시큐리티는 `Remember-Me` 기능에 대해 기본적으로 두 가지 구현체를 제공합니다.

- 암호화 시그니처를 사용한 `토큰 기반`의 `Remember-Me`, 구현체의 이름은 `TokenBasedRememberMeServices`
- 데이터베이스를 사용한 `영구 토큰` 기반의 `Remember-Me`, 구현체의 이름은 `PersistentTokenBasedRememberMeServices`

그리고 위의 두 구현체는 모두 `UserDetailsService`를 의존하기 때문에 `Remember-Me` 기능을 구현하기 위해서는 `UserDetailsService`를 반드시 설정해주어야만 합니다.

<br />

## 암호화 시그니처를 사용한 토큰 기반

---

기본적인 적용은 아주 심플합니다.

<br />

```java
// file: 'SecurityConfiguration.java'

@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(final AuthenticationManagerBuilder auth) throws Exception {
        auth
            .inMemoryAuthentication()
            .withUser("test").password("{noop}test").authorities("ROLE_USER"); // 개발 편의성을 위한 인메모리 유저를 설정합니다.
    }

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http
            .authorizeRequests() // 서버로 오는 요청들에 대한 보안 정책
            .anyRequest().authenticated() // 모든 요청에 대해 인증이 필요합니다.

            .and()

            .rememberMe().key("key") // remember-me 토큰 암호화에 사용할 키를 설정합니다. 기본값은 무작위로 설정된 문자열입니다.
            .userDetailsService(userDetailsServiceBean()) // Remember-Me 기능 설정에 필요한 필수 옵션

            .and()

            .formLogin()
        ;
    }

}
```

<br />

이후 프로젝트를 실행하고 `/login` 으로 접근하면 다음과 같은 웹 페이지가 뜹니다.

저는 `localhost:8080/login`으로 접근했습니다.

<br />

![기억하기미사용](https://user-images.githubusercontent.com/78329064/136495489-82edda9e-e5d7-4924-9117-f9f68788da57.PNG)

<br />

여기에 위에서 설정한 인메모리 유저정보를 입력하고 로그인을 하면 성공적으로 로그인이 되며, 웹 브라우저의 개발자 도구를 열어 쿠키 정보를 보면 아래와 같은 정보가 뜰 것입니다.

이 때, `Value`는 이미지와 다를 수 있으며, 쿠키 이름이 `JSESSION`이기만 하면 됩니다.

위 정보는 서버에서 `로그인 요청(=인증 요청)`을 성공적으로 받아 처리하였으며, 이에 대한 인증 쿠키를 웹 브라우저에 내려주었음을 의미합니다.

<br />

![기억하기미사용2](https://user-images.githubusercontent.com/78329064/136495483-764fff57-36c7-4ac3-baf4-b925115dbab8.PNG)

<br />

이제 `Remember-Me` 기능을 사용할 것임을 의미하는 아래의 체크박스에 체크를 하고, 동일하게 로그인을 시도해봅니다.

아래의 과정을 진행하기 전 `/logout`으로 접근하여 서버에 로그아웃 요청을 보내 세션을 지워주어야 합니다.

저는 `localhost:8080/logout`으로 접근하였습니다.

<br />

![기억하기사용](https://user-images.githubusercontent.com/78329064/136495487-e6747e09-73bc-4022-8a66-a76eecf9dbce.PNG)

<br />

![기억하기사용2](https://user-images.githubusercontent.com/78329064/136495488-acb5ca81-1e86-4f55-8f9f-042badf124a9.PNG)

<br />

역시 성공적으로 로그인이 되며 아까와 다르게 `remember-me` 라는 이름의 새로운 쿠키가 하나 더 생겨있음을 알 수 있습니다.

여기서 한가지 짚고 넘어갈 것이 있는데, 로그인 페이지의 HTML을 살펴보면,

<br />

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>Please sign in</title>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
    <link href="https://getbootstrap.com/docs/4.0/examples/signin/signin.css" rel="stylesheet" crossorigin="anonymous"/>
  </head>
  <body>
     <div class="container">
      <form class="form-signin" method="post" action="/login">
        <h2 class="form-signin-heading">Please sign in</h2>
        <p>
          <label for="username" class="sr-only">Username</label>
          <input type="text" id="username" name="username" class="form-control" placeholder="Username" required autofocus>
        </p>
        <p>
          <label for="password" class="sr-only">Password</label>
          <input type="password" id="password" name="password" class="form-control" placeholder="Password" required>
        </p>
        <p>
          <input type='checkbox' name='remember-me'/> Remember me on this computer.
        </p>
          <input name="_csrf" type="hidden" value="facf4bbf-4c91-455f-8ee2-ac777f8e901c" />
          <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
      </form>
     </div>
</body>
</html>
```

<br />

체크박스 관련 HTML에 `name`이 `remember-me`로 돼있음을 볼 수 있습니다.

만약 서버에서 `Remember-Me` 파라미터 이름을 변경한다면, HTML도 함께 변경되어야만 합니다.

스프링 시큐리티의 기본 설정 파라미터명은 `remember-me`이며, 이 이름은 기본 쿠키 이름과도 동일합니다.

<br />

```java
public final class RememberMeConfigurer<H extends HttpSecurityBuilder<H>> extends AbstractHttpConfigurer<RememberMeConfigurer<H>, H> {

    /**
     * The default name for remember me parameter name and remember me cookie name
     */
    private static final String DEFAULT_REMEMBER_ME_NAME = "remember-me";
  
    ...
}
```

<br />

이제 웹 브라우저 개발자 모드에서 `JSESSIONID` 쿠키를 강제로 제거한다면 웹 브라우저에서는 인증 쿠키가 사라지는 것이므로, 서버는 당연히 이후 요청에 대해 인증 요청을 강제할 것입니다.

하지만 웹 브라우저에는 아직 `remember-me` 쿠키가 남아있으므로, 추가적인 로그인과정 없이도 다시 로그인이 될 것임을 예상해볼 수 있습니다.

<br />

![제거전](https://user-images.githubusercontent.com/78329064/136500362-059eaa64-64af-4470-ae95-f52b93619a16.PNG)

<br >

`JSESSIONID` 쿠키를 클릭하여 키보드의 `delete`키를 입력하면 쿠키가 강제로 제거됩니다.

<br />

![제거후](https://user-images.githubusercontent.com/78329064/136500364-ff0da379-69b1-42fb-96d9-a5c92b4c68b8.PNG)

<br />

그리고 다시 서버에 임의의 요청을 보낸다면, 자동적으로 로그인처리가 될 것이므로 `JSESSIONID` 쿠키가 다시 생겨야만 합니다.

크롬의 `강력 새로고침(SHIFT + CTRL + R)`기능을 이용하여 서버에 임의의 요청을 보내면...

<br />

![image](https://user-images.githubusercontent.com/78329064/136500550-ea78a920-bf9a-4265-b56d-754cf517c819.png)

<br />

다시 인증 처리가 되어 새로운 쿠키가 생성돼있음을 확인할 수 있습니다.

이전에 한 설정으로 인해 서버로 오는 모든 요청은 인증이 필요하므로 원래라면 인증 쿠키가 없어 로그인 페이지로 리다이렉트 됐어야 했으나, `remember-me` 쿠키로 인해 그러한 과정 없이 재 인증이 된 것입니다.

<br />

### 토큰 기반 Remember-Me 기능의 원리

---

`remember-me`는 인증된 사용자에 대한 여러 정보를 담아 `MD5` 방식으로 암호화한 토큰입니다.

최초 인증시 인증에 성공할 경우 해당 사용자의 여러 정보를 모아 설정한 `키(Key)`를 사용해 암호화 하고 해당 값을 사용자에게 돌려주는 것이죠.

사용자가 받는 쿠키는 아래의 정보들을 담고 있습니다.

<br />

![image](https://user-images.githubusercontent.com/78329064/136502100-82d3d60b-aa14-4205-b3e4-44188241231b.png)

<br />

사용자는 인증 성공 시 인증 성공에 대한 `JSESSIONID`라는 쿠키와, 자동로그인을 위한 `remember-me` 라는 이름의 쿠키를 받는 것입니다. (2개)

또한, `remember-me` 쿠키가 갖고있는 토큰값은 만료날짜, 사용자의 정보등을 추가적으로 집어넣어 암호화함으로써 레인보우 테이블 공격에 대비합니다.

> 레인보우 테이블
>
> 해커들이 수백만개 이상의 임의의 데이터를 단방향 암호화하여 기록한 테이블이 레인보우 테이블입니다.
> 보통 사용자의 민감정보를 안전하게 보관하기 위해 데이터를 단방향으로 암호화 하는데, 암호화를 하였더라도 해당 정보가 탈취된다면,
> 이후 레인보우 테이블에서 해당 정보를 검색해보고 일치하는 값이 있을 경우 보안 공격에 노출되게 됩니다.

<br />

이후 임의의 사용자로부터 `remember-me` 쿠키를 이용한 요청이 들어 올 경우, 기본적으로 쿠키는 신뢰할 수 없는 데이터이기 때문에 검증에 들어갑니다.

<br />

![image](https://user-images.githubusercontent.com/78329064/136502370-58d95b72-ae59-458c-804e-ddf4640b62c9.png)

<br />

`유효한 시그니처`를 만들어내기 위해서는 `4가지의 정보`가 필요합니다.

- 사용자명
- 패스워드
- 만료일
- 키

위의 네가지 정보가 모두 올바른 값이라면, 유효한 시그니처가 생성되게 되고, 이 시그니처를 토대로 `체크섬`하여 유효성을 검증합니다.

<br />

웹 브라우저에서 보내는 `remember-me` 쿠키에는 세가지의 정보가 들어있습니다.

- 사용자명
- 만료일
- 시그니처

웹 브라우저에서 보내오는 쿠키에서 시그니처를 만드는데 필요한 `사용자명`, `만료일`을 얻을 수 있습니다.

그리고 서버는 시그니처를 만들 때 사용한 `키(Key)`를 이미 알고있죠.

따라서 네가지의 정보 중 패스워드만 더 얻으면 시그니처를 만들어낼 수 있으며, 사용자명을 토대로 데이터베이스를 조회하여 패스워드를 얻어올 수 있습니다.

이렇게 `remember-me` 쿠키로 인증 요청이 들어오면 위의 과정을 거쳐 유효한 시그니처를 만들어내며, 생성된 유효한 시그니처와 `remember-me` 쿠키에 들어있는 시그니처를 비교합니다.

만약 두 시그니처가 같다면, 해당 쿠키는 신뢰할 수 있는 쿠키이기 때문에 인증 처리 합니다.

<br />

### Attribute

---

```java
// file: 'SecurityConfiguration.java'
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http
            .rememberMe().key("key") // remember-me 토큰 암호화에 사용할 키를 설정합니다. 기본값은 무작위로 설정된 문자열입니다.
            .userDetailsService(userDetailsServiceBean()) // Remember-Me 기능 설정에 필요한 필수 옵션입니다.

//            .rememberMeParameter("remember-me") // 클라이언트 뷰에서 설정한 파라미터명과 동일해야 합니다. 기본값은 remember-me
//            .tokenValiditySeconds(86400) // 토큰 유효기간을 설정합니다. 기본값은 14일이며 단위는 초입니다. -1로 설정 할 경우 브라우저가 종료되면 함께 사라집니다.
//            .alwaysRemember(true) // Remember-Me 기능이 활성화 되지 않아도(체크박스에 체크하지 않아도, 혹은 체크박스가 아예 없더라도) 항상 적용하도록 합니다.
//            .rememberMeCookieName("remember-me") // Remember-Me 응답 쿠키이름입니다.. 기본값은 remember-me

            .and()

            .formLogin()
        ;
    }

}
```

<br />

## 데이터베이스를 사용한 영구 토큰 기반

---

`작성중 ...`

<br >
