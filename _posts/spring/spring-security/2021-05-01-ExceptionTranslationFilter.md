---
layout: post
category:
    - spring
    - spring-security
date: 2021-05-01 18:52
title: Spring Security - ExceptionTranslationFilter
description: >
    예외 처리를 도와주는 `ExceptionTranslationFilter`에 대해 알아봅니다
image: /assets/img/spring/spring-security/security-logo.png
related_posts:
    - _posts/spring/spring-security/2021-04-29-security-basic.md
---

* toc
{:toc}
  
&nbsp;  

# ✅ ExceptionTranslationFilter

---

`ExceptionTranslationFilter`는 `FilterChainProxy`의 보안필터 중 하나로

`AccessDeniedException` 과 `AuthenticationException`을 HTTP 응답으로 변환해주는 역할을 한다.

&nbsp;  

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FduJsIx%2Fbtq3XseglLQ%2FLZYjkIcOVfTR79zyM3GkvK%2Fimg.png)

&nbsp;  

1. 먼저 `ExceptionTranslationFilter`는 `FilterChain.doFilter(request, response)`를 호출하여 애플리케이션의 나머지 작업을 처리한다.
2. 만약 인증되지 않은 사용자였거나, `AuthenticationException`이 발생한다면 인증절차를 시작한다.
    - [SecurityContextHolder](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authentication-securitycontextholder) 를 비운다
    - [RequestCache](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/web/savedrequest/RequestCache.html) 에 `HttpServletRequest`를 저장하고 사용자임이 인증되면 이후의 요청에 `RequestCache`를 사용한다
    - `AuthenticationEntryPoint`는 클라이언트에 자격증명을 요청할 때 사용된다. 예를 들자면, 로그인 페이지로 리다이렉트하거나 `WWW-Authenticate 헤더`를 보낸다
3. 반대로 `AccessDeniedException`이 발생한 경우, 접근을 거부하고 `AccessDeniedHandler`를 호출하여 이후의 처리를 위임한다.

> 애플리케이션에서 `AccessDeniedException`이나 `AuthenticationException`이 발생하지 않는다면,  
> `ExceptionTranslationFilter`는 아무런 동작도 하지 않는다.

`ExceptionTranslationFilter` 의 의사코드는 다음과 같다.

&nbsp;  

```java
try {

    // 1
    filterChain.doFilter(request, response);
} 
catch (AccessDeniedException | AuthenticationException ex) {

    // 2
    if (!authenticated || ex instanceof AuthenticationException) {
        startAuthentication();
    } 
    
    // 3
    else {
        accessDenied();
    }
}
```

&nbsp;  

1. 이전 내용에서 `FilterChain.doFilter(request, response)`를 호출하여 애플리케이션의 나머지 작업을 처리한다고 한 것을 기억할 것이다. 즉, 애플리케이션의 다른 코드에서 (i.e.[FilterSecurityInterceptor](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authorization-filtersecurityinterceptor) 나 시큐리티 메소드) `AuthenticationException`이나 `AccessDeniedException`을 발생시키면 이 부분에서 예외를 포착하고 처리한다.
2. 인증되지 않은 사용자거나, `AuthenticationException`이 발생한다면 인증 절차를 시작한다.
3. 이도저도 아니므로 접근을 거부한다.

&nbsp;  