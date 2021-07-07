---
layout: post
category:
    - spring
    - spring-security
date: 2021-04-29 21:39
title: Spring Security 개요
description: >
    `Spring Security`란 무엇일까?
image: /assets/img/spring/spring-security/security-logo.png
related_posts:
    - 
---

* toc
{:toc}
  
&nbsp;  

# ✅ 개요

스프링 시큐리티는 필터를 기반으로 동작한다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FuKn3s%2Fbtq3Kd378yJ%2FkatqDVjCDXJiXHWLIUUqt1%2Fimg.jpg)

프로젝트에 스프링 시큐리티의 의존성을 추가하면 `Spring seucurity filterchain`이 필터 계층에 추가된다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcQM3dJ%2Fbtq3I7i8sSA%2FtlZ2ZtcKHzvuCNyaueGzK0%2Fimg.jpg)

이를 실제로 확인해보려면 애플리케이션 내부 스프링 시큐리티 설정 파일에 `debug = true` 옵션을 지정해주면 아래와 같이 콘솔에서도 확인할 수 있다.

```java
@EnableWebSecurity(debug = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    …
}
```

```text
Request received for GET '/':

org.apache.catalina.connector.RequestFacade@26e603b1

servletPath:/
pathInfo:null
headers: 
host: localhost:8080
connection: keep-alive
sec-ch-ua: "Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"
sec-ch-ua-mobile: ?0
upgrade-insecure-requests: 1
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
sec-fetch-site: none
sec-fetch-mode: navigate
sec-fetch-user: ?1
sec-fetch-dest: document
accept-encoding: gzip, deflate, br
accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
cookie: Idea-f86efe9=a6990472-c796-42ff-9425-84f5743f5e79


Security filter chain: [
  WebAsyncManagerIntegrationFilter
  SecurityContextPersistenceFilter
  HeaderWriterFilter
  CsrfFilter
  LogoutFilter
  UsernamePasswordAuthenticationFilter
  ConcurrentSessionFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  SessionManagementFilter
  ExceptionTranslationFilter
  FilterSecurityInterceptor
]

```

`/` URL로 접속했을 때의 접속 정보들이 콘솔에 표시된다.

필터가 굉장히 많고 복잡하고 어렵지만 간단하게 생각하자면 어차피 프레임워크이기 때문에 개발자는 필요한 부분만을 커스터마이징 할 줄 알면 사용하는 데는 큰 지장이 없다.

&nbsp;  

그러기 위해서 스프링 시큐리티의 전체적인 윤곽을 머릿속에 그리고 있어야 하고, 이를 이해하려는 노력이 필요하다고 생각된다.

&nbsp;  

그리고 스프링 시큐리티를 커스터마이징 한다는 것은 결국 원하는 이벤트를 핸들링해주는 필터를 커스터마이징 한다고 생각하면 될 것 같다.

아래는 스프링 시큐리티 필터들의 순서를 나타낸 목록이다.

&nbsp;  

- ChannelProcessingFilter
- WebAsyncManagerIntegrationFilter
- SecurityContextPersistenceFilter
- HeaderWriterFilter
- CorsFilter
- CsrfFilter
- LogoutFilter
- OAuth2AuthorizationRequestRedirectFilter
- Saml2WebSsoAuthenticationRequestFilter
- X509AuthenticationFilter
- AbstractPreAuthenticatedProcessingFilter
- CasAuthenticationFilter
- OAuth2LoginAuthenticationFilter
- Saml2WebSsoAuthenticationFilter
- [UsernamePasswordAuthenticationFilter](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authentication-usernamepasswordauthenticationfilter)
- OpenIDAuthenticationFilter
- DefaultLoginPageGeneratingFilter
- DefaultLogoutPageGeneratingFilter
- ConcurrentSessionFilter
- [DigestAuthenticationFilter](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authentication-digest)
- BearerTokenAuthenticationFilter
- [BasicAuthenticationFilter](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authentication-basic)
- RequestCacheAwareFilter
- SecurityContextHolderAwareRequestFilter
- JaasApiIntegrationFilter
- RememberMeAuthenticationFilter
- AnonymousAuthenticationFilter
- OAuth2AuthorizationCodeGrantFilter
- SessionManagementFilter
- [ExceptionTranslationFilter](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-exceptiontranslationfilter)
- [FilterSecurityInterceptor](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authorization-filtersecurityinterceptor)
- SwitchUserFilter

&nbsp;  

---

&nbsp;  

기본적으로 클라이언트에서 어떤 요청이 올 때 해당 요청은 각 필터를 거쳐 모든 필터에 대한 검사가 통과되야만 해당 요청이 애플리케이션에서 처리되는 방식으로 동작한다.

그러니까 요청 한 번이 오면 저 위의 수십개가 넘어가는 필터에 대한 모든 검사가 통과되어야 하기 때문에 기본적인 보안이 보장된다고 말하는 것이다.

이 스프링 시큐리티를 애플리케이션에 도입하게 되면

- 서블릿 API 통합
- 인증과 권한 부여에 대한 지원과 유연한 확장
- 세션 고정 공격 방지
- 클릭 재킹 공격 방지
- 무차별 대입 공격(Brute force) 방지
- CSRF 공격 방지
- XSS 공격 방지
- Java 설정 지원
- Spring MVC 통합

등의 장점들이 있다.

&nbsp;  

# ✅ DelegatingFilterProxy

## Servelt Filter

---

- `Servlet Container`에 속한 `Filter`
- 표준 서블릿 스펙을 지원한다

&nbsp;  

## DelegatingFilterProxy

---

- `springframework.web.filter`의 `Servlet Filter` 구현체이다
- 이름 그대로 불특정 필터에 위임하는 객체이다. 위임을 하기 위해선 필터의 이름이 필요하다
- `Spring Security`는 이 객체를 이용하여 동작한다
- `Spring Security`는 `springSecurityFilterChain`라는 이름을 갖고있다
- `Spring Security` 사용 시 `Spring`이라면 `DelgatingFilterProxy`가 `springSecurityFilterChain`라는 이름을 갖는 클래스에게 위임하도록 직접 설정해야 한다
- `Spring Boot`이라면 `starter`로 인해 자동설정 된다

![](https://user-images.githubusercontent.com/71188307/124721829-6a5a3900-df44-11eb-8c17-db59b60232af.png)

&nbsp;  

## FilterChainProxy

---

- `Spring Security` 설정 시 기본적으로 사용되는 필터들은 위의 이미지와 같다
- 추가적으로 사용자 정의 필터를 구현하여 추가 할 수 있다***(순서를 신중히 배치하는게 중요하다)***
- `WebSecurityConfigurerAdapter`를 상속하거나 `WebSecurityConfigurer`를 구현한 클래스에서 사용자 설정이 가능하다. 이 경우 `@EnableWebSecurity`이 필요하다
- `Spring Security`의 대부분의 보안 기능은 `FilterChainProxy`에 들어 있으며 `FilterChainProxy`의 아키텍처를 이해하고 커스터마이징 하는 것이 `Spring Security` 사용의 핵심이다

```java
public class SecurityConfig implements WebSecurityConfigurer {

    @Override public void init(SecurityBuilder builder) throws Exception {
        
    }

    @Override public void configure(SecurityBuilder builder) throws Exception {

    }

}

```

`WebSecurityConfigurer`를 구현한 경우 기본 구성

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        super.configure(auth);
    }

    @Override public void configure(WebSecurity web) throws Exception {
        super.configure(web);
    }

    @Override protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);
    }

}
```

`WebSecurityConfigurerAdapter`를 상속한 경우 기본 구성

일반적으로는 `WebSecurityConfigurerAdapter`를 상속하여 필요한 부분만 커스터마이징해 사용한다.

&nbsp;  