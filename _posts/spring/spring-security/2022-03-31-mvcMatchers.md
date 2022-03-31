---
layout: post
category:
  - spring
  - spring-security
title: antMatchers vs. mvcMatchers
description: |
  CVE-2016-5007 
image: /assets/img/spring/spring-security/security-logo.png
related_posts:
  - _posts/spring/spring-security/2021-10-08-remember-me.md
published: true
---

* toc
{:toc}
  
<br />

# CVE-2016-5007

---

> Both Spring Security 3.2.x, 4.0.x, 4.1.0 and the Spring Framework 3.2.x, 4.0.x, 4.1.x, 4.2.x rely on URL pattern mappings for authorization and for mapping requests to controllers respectively. Differences in the strictness of the pattern matching mechanisms, for example with regards to space trimming in path segments, can lead Spring Security to not recognize certain paths as not protected that are in fact mapped to Spring MVC controllers that should be protected. The problem is compounded by the fact that the Spring Framework provides richer features with regards to pattern matching as well as by the fact that pattern matching in each Spring Security and the Spring Framework can easily be customized creating additional differences.

<br />

업계에서 흔히 RESTful이라고 부르는 API 설계 방식에서는 `슬래시(/)`를 통해 리소스 구조를 표현한다.

흔히 볼 수 있는 방식인데, 리눅스의 파일 시스템도 이와 같은 방식으로 구분을 하고 있다.

궁금하다면, 터미널에서 pwd를 입력해보자.

아무튼, URI에서 슬래시는 이렇게 특별한 역할을 하고 있기 때문에, 이를 URI 맨 뒤쪽에 넣는다면 혼동이 생길 수 있다.

위와 같은 이유로 스프링 시큐리티에서 기본적으로 사용하는 `antMatchers`는 URI 맨 뒤에 슬래시가 붙어있다면, 이를 제대로 검증하지 못한다.

이게 무슨 말이냐면, 코드로 보자.

<br />

```java
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.httpBasic().disable()
            .csrf().disable()
                
            // 블랙리스트 방식
            .authorizeRequests()
            .antMatchers(GET, "/v1/api/members").authenticated()
            .anyRequest().permitAll();
    }
}
```

<br />

`/v1/api/members`로 오는 `GET` 방식의 요청은 인증된 상태여야만 허용되게끔 설정돼있다.

이 상태에서 다음과 같은 요청을 보내보았다.

<br />

```java
@SpringBootTest
@AutoConfigureMockMvc
class DemoApplicationTests {
    @Autowired
    MockMvc mockMvc;

    @Test
    void contextLoads() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/v1/api/members/"))
            .andDo(print());
    }
}
```

<br />

보다시피 요청 URI 맨 뒤에 슬래시를 하나 더 붙여버렸다.

실행하면 403이 응답될까? 아닐까?

<br />

```shell
MockHttpServletRequest:
      HTTP Method = GET
      Request URI = /v1/api/members/
       Parameters = {}
          Headers = []
             Body = null
    Session Attrs = {}

Handler:
             Type = me.siro.demo.MemberController
           Method = me.siro.demo.MemberController#members()

Async:
    Async started = false
     Async result = null

Resolved Exception:
             Type = null

ModelAndView:
        View name = null
             View = null
            Model = null

FlashMap:
       Attributes = null

MockHttpServletResponse:
           Status = 200
    Error message = null
          Headers = [Content-Type:"application/json", X-Content-Type-Options:"nosniff", X-XSS-Protection:"1; mode=block", Cache-Control:"no-cache, no-store, max-age=0, must-revalidate", Pragma:"no-cache", Expires:"0", X-Frame-Options:"DENY"]
     Content type = application/json
             Body = [{"name":"Liam"},{"name":"\tNoah"},{"name":"\tOliver"},{"name":"\tElijah"},{"name":"\tWilliam"},{"name":"\tJames"},{"name":"\tBenjamin"},{"name":"\tLucas"},{"name":"\tHenry"},{"name":"\tAlexander"},{"name":"Olivia"},{"name":"Emma"},{"name":"Ava"},{"name":"Charlotte"},{"name":"Sophia"},{"name":"Amelia"},{"name":"Isabella"},{"name":"Mia"},{"name":"Evelyn"},{"name":"Harper"}]
    Forwarded URL = null
   Redirected URL = null
          Cookies = []
```

<br />

놀랍게도 403이 아닌 200이 응답됐으며, 모든 사용자의 정보가 외부에 노출되어버렸다.

이처럼 모든 엔드포인트를 `허용` 상태로 두고 몇몇 엔드포인트만 콕 집어서 `인증필요` 상태로 관리하는 방식을 `블랙리스트 방식`이라고 부르는데, 이는 스프링 시큐리티에서 권장하는 방식이 아니다.

스프링 시큐리티에서는 모든 엔드포인트를 `인증필요` 상태로 관리하고, 몇몇 엔드포인트만 콕 집어서 `허용` 상태로 관리하는 `화이트리스트 방식`을 권장하고 있다.

즉, 화이트리스트 방식으로 코드를 작성했다면 일단 위와 같은 취약점이 생기지는 않는다.

<br />

```java
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.httpBasic().disable()
            .csrf().disable()
                
            // 화이트리스트 방식
            .authorizeRequests()
            .antMatchers(POST, "/v1/api/members").permitAll()
            .anyRequest().authenticated();
    }
}
```

<br />

하지만, 업무규칙으로 인해 블랙리스트 방식으로 코드를 작성해야만 하는 경우도 있을것이다.

그리고 그런 상황에 위와 같은 정보를 알지 못한다면, 보다시피 보안 취약점이 생길 여지가 분명히 존재한다.

이러한 상황에 대처하기 위해 두가지 방법이 존재한다.

<br />

## 방법 1. URI에 와일드카드를 붙인다

---

```java
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.httpBasic().disable()
            .csrf().disable()
            .authorizeRequests()
            .antMatchers(GET, "/v1/api/members/**").authenticated()
//                                            ^^^ - 와일드카드 추가
            .anyRequest().permitAll();
    }
}
```

<br />

URI 맨 뒤에 `/**`를 추가했다.

이렇게 하면 `antMatchers`로도 위와 같은 보안 취약점이 발생하지 않는다.

<br />

```shell
MockHttpServletRequest:
      HTTP Method = GET
      Request URI = /v1/api/members/
       Parameters = {}
          Headers = []
             Body = null
    Session Attrs = {SPRING_SECURITY_SAVED_REQUEST=DefaultSavedRequest [http://localhost/v1/api/members/]}

Handler:
             Type = null

Async:
    Async started = false
     Async result = null

Resolved Exception:
             Type = null

ModelAndView:
        View name = null
             View = null
            Model = null

FlashMap:
       Attributes = null

MockHttpServletResponse:
           Status = 403
    Error message = Access Denied
          Headers = [X-Content-Type-Options:"nosniff", X-XSS-Protection:"1; mode=block", Cache-Control:"no-cache, no-store, max-age=0, must-revalidate", Pragma:"no-cache", Expires:"0", X-Frame-Options:"DENY"]
     Content type = null
             Body = 
    Forwarded URL = null
   Redirected URL = null
          Cookies = []
```

<br />

요청 URI 맨 뒤에 슬래시를 추가하여 요청했음에도 403과 함께 요청이 디나이 된 모습을 볼 수 있다.

<br />

## 방법 2. mvcMatchers를 사용한다

---

```java
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.httpBasic().disable()
            .csrf().disable()
            .authorizeRequests()
            .mvcMatchers(GET, "/v1/api/members").authenticated()
//           ^^^^^^^^^^^ - antMatchers 대체
            .anyRequest().permitAll();
    }
}
```

<br />

```shell
MockHttpServletRequest:
      HTTP Method = GET
      Request URI = /v1/api/members/
       Parameters = {}
          Headers = []
             Body = null
    Session Attrs = {SPRING_SECURITY_SAVED_REQUEST=DefaultSavedRequest [http://localhost/v1/api/members/]}

Handler:
             Type = null

Async:
    Async started = false
     Async result = null

Resolved Exception:
             Type = null

ModelAndView:
        View name = null
             View = null
            Model = null

FlashMap:
       Attributes = null

MockHttpServletResponse:
           Status = 403
    Error message = Access Denied
          Headers = [X-Content-Type-Options:"nosniff", X-XSS-Protection:"1; mode=block", Cache-Control:"no-cache, no-store, max-age=0, must-revalidate", Pragma:"no-cache", Expires:"0", X-Frame-Options:"DENY"]
     Content type = null
             Body = 
    Forwarded URL = null
   Redirected URL = null
          Cookies = []
```

<br />

역시 마찬가지로 요청 URI 맨 뒤에 슬래시를 추가하여 요청했음에도 403과 함께 요청이 디나이 된 모습을 볼 수 있다.

<br />

# 📕 Reference

---

- [📜 CVE-2016-5007](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2016-5007)
- [📜 Stackoverflow - Difference between antMatcher and mvcMatcher](https://stackoverflow.com/questions/50536292/difference-between-antmatcher-and-mvcmatcher)
- [📜 Spring docs - RequestMatcherConfigurer](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/config/annotation/web/builders/HttpSecurity.RequestMatcherConfigurer.html#mvcMatchers(java.lang.String...))
- [📜 Spring Boot 2.6 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.6-Release-Notes#pathpattern-based-path-matching-strategy-for-spring-mvc)

<br />
