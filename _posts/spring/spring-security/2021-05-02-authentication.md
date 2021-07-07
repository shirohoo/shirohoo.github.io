---
layout: post
category:
    - spring
    - spring-security
date: 2021-05-02 00:59
title: Spring Security - 인증(Authentication)
description: >
    스프링 시큐리티의 핵심인 `인증(Authentication)`에 대해 정리합니다
image: /assets/img/spring/spring-security/security-logo.png
related_posts:
    - _posts/spring/spring-security/2021-04-29-security-basic.md
---

* toc
{:toc}
  
&nbsp;  

# ✅ 인증(Authentication)

---

> ***📜 인증(Authentication)***
>
> 특정 리소스에 접근하려고 하는 사용자가 `누구인지를 확인`하는 절차다.
>
> 보통 사용자가 이름과 비밀번호를 입력하는 것으로 사용자를 인증하곤 한다. (로그인)
>
> 한 번 인증하고 나면 사용자를 식별하고 권한을 부여할 수 있다. (세션)

> ***📜 인가(Authorization)***
>
> 인증된 사용자가 어떠한 자원(URI)에 접근 할 `권한` 이 있는지 판별.

스프링 시큐리티는 인증절차에 대해 많은 지원을 해준다.

아래는 스프링 시큐리티의 인증을 처리해주는 주요 객체들이다.

&nbsp;  

- **`SecurityContextHolder`** - 인증된 사용자에 대한 정보들을 저장한다. 비유하자면 `SecurityContextHolder`가 카드팩이라면 `SecurityContext`는 카드팩에 들어있는 카드들이다.

- **`SecurityContext`** - `SecurityContextHolder`에서 얻을 수 있으며, 인증된 사용자의 `Authentication`을 갖고있다.

- **`Authentication`** - 사용자가 인증을 위해 입력한 자격증명(아이디, 비밀번호 등)이나 `SecurityContext`에 들어있는 자격증명을 표현하는 일종의 토큰이다. 이 객체는 `AuthenticationManager`의 입력으로 사용될 수 있다.

- **`GrantedAuthority`** - `Authentication`이 갖고있는 유저에게 허용된 권한정보이다. (즉, role, scope 등. 일반적으로 `ROLE_USER` 같은 것들을 말한다)

- **`AuthenticationManager`** - 스프링 시큐리티의 필터가 처리할 인증 절차를 정의한 인터페이스이다.

- **`ProviderManager`** - 스프링 시큐리티에 정의된 `AuthenticationManager`의 기본 콘크리트 클래스

- **`AuthenticationEntryPoint`** - 클라이언트에 자격증명을 요청할 때 사용된다. (즉, 로그인 페이지로 리다이렉트 시키거나, `WWW-Authenticate` 헤더를 전송하는 등)

- **`AbstractAuthenticationProcessingFilter`** - 인증에 사용할 `Filter`의 베이스 추상 클래스이며, 이 추상 클래스의 기본 콘크리트 클래스가 바로 `UsernamePasswordAuthenticationFilter`이다. 즉, 스프링 시큐리티를 프로젝트에 적용할 경우 기본적으로 폼 로그인 방식으로 동작한다. 이 추상 클래스가 정의한 메소드 중 핵심 메소드가 `attemptAuthentication(request, response)`이며, 위의 `Authentication`을 리턴한다. 여기서 리턴되는 `Authentication`은 사용자가 서버에 자격증명을 요청하기 위해 입력한 정보를 의미한다.(아이디, 비밀번호 등). 이 필터를 잘 이해하면 여러가지 인증 객체를 조합하여 고수준의 인증플로우를 구성하는데 유의미한 도움이 될 것이다.

&nbsp;  

```java
@Override
public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
throws AuthenticationException {
  if (this.postOnly && !request.getMethod().equals("POST")) {
  	throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
  }
  String username = obtainUsername(request);
  username = (username != null) ? username : "";
  username = username.trim();
  String password = obtainPassword(request);
  password = (password != null) ? password : "";
  UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password);
  
  // Allow subclasses to set the "details" property
  setDetails(request, authRequest);
  
  return this.getAuthenticationManager().authenticate(authRequest);
}
```

&nbsp;  

# ✅ 인증 메커니즘

## 1. Username and Password

---

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEJDOZ%2Fbtq3OOhx5PX%2Fo14NaNNCmuidO2JDgc4H0k%2Fimg.jpg)

1. 클라이언트 자격증명 요청 발생(ID, PW 입력)

2. `Security filterchain`에서 인증 정보 생성(`Authentication`)

3. `ProviderManager`(`AuthenticationManager`의 콘크리트 클래스)에 클라이언트가 입력한 ID, PW를 전달해줌

4. `ProviderManager`에 정의된 `AuthenticationProvider`에서 자격증명 처리 시작

5. `AuthenticationProvider`에 정의된 `PasswordEncoder`를 초기화(기본 `bcrypt`)

6. `AuthenticationProvider`가 `UserDetailsService`를 호출

7. `UserDetailsService`에서 `UserDetails`를 호출

8. `UserDetails`가 입력받은 ID로 데이터베이스에서 해당 유저에 대한 정보를 조회(ID=기본키)

9. `UserDetails`가 조회해온 유저 정보와 입력받은 ID, PW를 `AuthenticationProvider`에서 비교

10. 인증 성공 시 값을 `ProviderManager`에 리턴

11. `AuthenticationManager`는 해당 값을 필터 체인에 리턴

12. 인증 정보를 `SecurityContextHolder`에 저장

&nbsp;    

## 2. OAuth 2.0 Login

---

- `OpenID Connect`를 이용한 `OAuth 2.0`과, 비표준 OAuth 2.0 로그인 ***(구글, 카카오를 이용한 로그인 같은 표준)***

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fm6jVU%2Fbtq3Ts8eMhs%2FKWvgvpgecle1Kxl0Mng3v1%2Fimg.png)

&nbsp;  

## 3. SAML 2.0 Login

---

[SAML - 위키백과, 우리 모두의 백과사전](https://ko.wikipedia.org/wiki/SAML)

&nbsp;  

## 4. Central Authentication Server (CAS)

---

[중앙 인증 서비스 - 위키백과, 우리 모두의 백과사전](https://ko.wikipedia.org/wiki/%EC%A4%91%EC%95%99_%EC%9D%B8%EC%A6%9D_%EC%84%9C%EB%B9%84%EC%8A%A4)

&nbsp;  

## 5. Remember Me

---

- 세션이 만료된 사용자를 기억하는 방법(로그인 상태 유지같은 기능들)

&nbsp;  

## 6. JAAS Authentication

---

[JAAS - 위키백과, 우리 모두의 백과사전](https://ko.wikipedia.org/wiki/JAAS)

&nbsp;  

## 7. OpenID

---

- `OpenID Connect`와 혼동하지 말 것

&nbsp;  

## 8. Pre-Authentication Scenarios

---

- `SiteMinder`나 `Java EE Security`와 같은 외부 메커니즘으로 인증을 처리하고, 스프링 시큐리티로 `인가(Authorization)` 처리를 하고, 취약점 공격을 대비할 수 있다.

&nbsp;  

## 9. X509 Authentication

---

[X.509 - 위키백과, 우리 모두의 백과사전](https://ko.wikipedia.org/wiki/X.509)

&nbsp;  

# ✅ SecurityContextHolder

---

`SecurityContextHolder`는 스프링 시큐리티 인증모델의 핵심이다.

이것은 `SecurityContext`를 포함하고 있다.

즉, `SecurityContextHolder`가 카드팩이라면, `SecurityContext`는 카드팩에 들어있는 각각의 카드와 같다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FA8ToQ%2Fbtq35DUu208%2F9plqqAtwAygY4a5TmmhMU0%2Fimg.png)

`SecurtyContextHolder`는 인증된 사용자의 상세한 정보들을 저장하는 곳이다.

스프링 시큐리티는 `SecurityContextHolder`가 어떻게 구성되든 신경쓰지 않는다.

오직 인증된 사용자의 정보를 활용하기만 할 뿐이다.

스프링 시큐리티에서 인증된 사용자의 정보에 접근하기 위해서는 아래와 같은 코드를 작성 할 수 있다.

```java
SecurityContext context = SecurityContextHolder.getContext();
Authentication authentication = context.getAuthentication();
String username = authentication.getName();
Object principal = authentication.getPrincipal();
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
```

기본적으로 `SecurityContextHolder`는 `ThreadLocal`을 사용하여 저장되며,

이것은 같은 스레드영역 내에서라면 언제든지 어디서나 접근 할 수 있음을 의미한다.

또한, `ThreadLocal` 방식으로 사용하는 것은 사용자의 요청이 처리되고 난 후 이 스레드를 지우기만 한다면 매우 안전한 방법이며, 

스프링 시큐리티의 `FilterChainProxy`는 항상 `SecurityContext`를 지우도록 설계되어 있다.

이 `ThreadLocal`과 관련하여 스프링 시큐리티는 세가지 방식을 지원한다.

&nbsp;  

1. ***MODE_THREADLOCA***L: 기본값, 각 `Thread`에 `SecurityContext`를 저장하므로 `Thread Safe`하다
   
2. ***MODE_INHERITABLETHREADLOCAL***: 자식 `Thread`까지 `SecurityContext`를 상속
   
3. ***MODE_GLOBAL***: `SecurityContext`를 static으로 사용

&nbsp;  

```java
SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_THREADLOCAL);
SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_GLOBAL);
```

아마도 이 부분은 가급적 건들일이 없지 않을까 싶은데, 그냥 이런것도 있구나 하고 넘어가도록 하자.

&nbsp;  

# ✅ SecurityContext

---

- `SecurityContext`는 `Authentication`을 보관한다
- `ThreadLocal`에 저장되어 아무곳에서나 참조가 가능하며, 기본적으로 `Thread Safe`하게 설계되어 있다
- 정리하자면 `SecurityContextHolder` -> `SecurityContext` -> `Authentication` 순으로 포함한다

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
```

스레드에서 사용자의 정보에 접근할 일이 많다면 유틸리티 클래스를 정의하여 사용하는 것도 좋은 방법이다.

```java
public class SecurityUtils {

    public static String getUserName() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public static Collection<? extends GrantedAuthority> getAuthorities() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities();
    }

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

}
```

&nbsp;  

# ✅ Authentication

---

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb9mFZs%2Fbtq3090K3hs%2F1muU2Y1kbaYiP1KdtAZQpk%2Fimg.png)

`Authentication`는 스프링 시큐리티에서 두 가지의 중요한 목적을 갖는다.

- 사용자가 자격증명을 요청하기 위해 입력한 데이터(ID/PW 등)를 `AuthenticationManager`에 전달해준다.
- 현재 인증된 사용자를 나타낸다. 이 때의 `Authentication`은 `SecurityContext`에서 얻을 수 있다.

```java
SecurityContextHolder.getContext().getAuthentication();
```

또한 `Authentication`은 다음 데이터를 포함한다.

- `principal` - 사용자를 식별한다. 이 정보는 인증시 `UserDetails` 인스턴스로 캐스팅되어 사용된다.
- `credentials` - 사용자가 입력한 암호이다. 일반적으로 이 정보는 사용자 인증이 완료된 후 삭제한다.

```java
credentials = null;
```

- `authorities` - 사용자에게 허락된 권한을 나타낸다. 권한(`ROLE_USER` 같은 것들)이 담긴다.

&nbsp;  

# ✅ GrantedAuthority

---

`GrantedAuthority`는 사용자에게 부여되는 권한이다.

이 객체엔 일반적으로 `ROLE_`이라는 접두사(prefix)가 들어간 권한 표현식이 저장된다.

예를 들자면 `ROLE_USER`, `ROLE_ADMIN`등이 있다.

이 표현식들은 스프링 시큐리티의 콤포넌트들에서 폭넓게 사용되며 특히 `UserDetailsService`에서 빈번하게 사용된다.

`Authentication.getAuthorites()` 메소드에서 얻을 수 있다.

이 메소드를 호출하면 `Collection<GrantedAuthority>`를 반환한다.

```java
Authentication authentication = SecurityUtils.getAuthentication();

Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
```

&nbsp;  

# ✅ AuhenticationManager

---

`AuthenticationManager`는 스프링 시큐리티 필터의 인증절차를 정의한 인터페이스이다.

스프링 시큐리티에는 이 인터페이스를 구현한 콘크리트 클래스가 있는데 이 클래스가 `ProviderManager`이다.

이 인터페이스에서 처리된 인증결과는 `SecurityContextHolder`에 저장되며

콘크리트 클래스는 사용자가 임의로 변경할 수 있다.

&nbsp;  

# ✅ ProviderManager

---

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcYDGro%2Fbtq4kEMGM7y%2FAtD0gzKPzgm2jb45KXx6q0%2Fimg.png)

스프링 시큐리티에서 가장 일반적으로 사용되는 `AuthenticationManager`의 콘크리트 클래스이다.

`ProviderManager`는 `List<AuthenticationProvider>`에 동작을 위임한다.

이 `AuthenticationProvider`는 각각의 인증처리를 수행할 수 있다.

예를들자면 `AuthenticationProvider` A는 아이디/비밀번호로 인증처리를 진행할 수 있고,

`AuthenticationProvider` B는 SAML 인증을 처리할 수 있다.

이런 구조라면 각 인증 유형을 담당하는 `AuthenticationProvider`가 존재하게 되며, `AuthenticationManager` 하나만 외부에 노출하면서도 다양한 인증 유형을 지원할 수 있어진다.

모든 `AuthenticationProvider`는 인증처리의 성공, 실패여부를 결정할 수 있고 아니면 결정을 다음 `AuthenticationProvider`에 떠넘길 수 있다.

```java
public class ProviderManager implements AuthenticationManager, MessageSourceAware, InitializingBean {
	
    ...
    
	private List<AuthenticationProvider> providers = Collections.emptyList();
    
    ...

	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		Class<? extends Authentication> toTest = authentication.getClass();
		AuthenticationException lastException = null;
		AuthenticationException parentException = null;
		Authentication result = null;
		Authentication parentResult = null;
		int currentPosition = 0;
		int size = this.providers.size();
		for (AuthenticationProvider provider : getProviders()) {
			if (!provider.supports(toTest)) {
				continue;
			}
			if (logger.isTraceEnabled()) {
				logger.trace(LogMessage.format("Authenticating request with %s (%d/%d)",
						provider.getClass().getSimpleName(), ++currentPosition, size));
			}
			try {
				result = provider.authenticate(authentication);
				if (result != null) {
					copyDetails(authentication, result);
					break;
				}
			}
			catch (AccountStatusException | InternalAuthenticationServiceException ex) {
				prepareException(ex, authentication);
				// SEC-546: Avoid polling additional providers if auth failure is due to
				// invalid account status
				throw ex;
			}
			catch (AuthenticationException ex) {
				lastException = ex;
			}
		}
		if (result == null && this.parent != null) {
			// Allow the parent to try.
			try {
				parentResult = this.parent.authenticate(authentication);
				result = parentResult;
			}
			catch (ProviderNotFoundException ex) {
				// ignore as we will throw below if no other exception occurred prior to
				// calling parent and the parent
				// may throw ProviderNotFound even though a provider in the child already
				// handled the request
			}
			catch (AuthenticationException ex) {
				parentException = ex;
				lastException = ex;
			}
		}
		if (result != null) {
			if (this.eraseCredentialsAfterAuthentication && (result instanceof CredentialsContainer)) {
				// Authentication is complete. Remove credentials and other secret data
				// from authentication
				((CredentialsContainer) result).eraseCredentials();
			}
			// If the parent AuthenticationManager was attempted and successful then it
			// will publish an AuthenticationSuccessEvent
			// This check prevents a duplicate AuthenticationSuccessEvent if the parent
			// AuthenticationManager already published it
			if (parentResult == null) {
				this.eventPublisher.publishAuthenticationSuccess(result);
			}

			return result;
		}

		// Parent was null, or didn't authenticate (or throw an exception).
		if (lastException == null) {
			lastException = new ProviderNotFoundException(this.messages.getMessage("ProviderManager.providerNotFound",
					new Object[] { toTest.getName() }, "No AuthenticationProvider found for {0}"));
		}
		// If the parent AuthenticationManager was attempted and failed then it will
		// publish an AbstractAuthenticationFailureEvent
		// This check prevents a duplicate AbstractAuthenticationFailureEvent if the
		// parent AuthenticationManager already published it
		if (parentException == null) {
			prepareException(lastException, authentication);
		}
		throw lastException;
	}
    
    ...
    
}
```

&nbsp;  

개발자가 원한다면 `ProviderManager`에 더 이상 인증을 수행할 수 있는 `AuthenticationProvider`가 없을 경우 다음에 사용할 `AuthenticationManager`를 설정할 수 있다.

이 `Authentication`은 어떤 클래스를 써도 무방하지만 일반적으로 `ProviderManager`를 많이 사용한다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcLvclu%2Fbtq4jtrnBu6%2FylKeUI8Q2CX4ojr8rEjzO1%2Fimg.png)

또한 여러 `ProviderManager` 인스턴스에 같은 부모 `AuthenticationManager`를 공유할 수도 있다.

이 경우 인증 유형이 다른 `ProviderManager` 여러개가 공통 인증을 수행해야 할 필요성이 있을 경우 흔히 사용되는 패턴이다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F1a61T%2Fbtq4kFx4ei7%2FaSoBGL3ZbFGIBb1GP6ROe1%2Fimg.png)

마지막으로, `ProviderManager는` 기본적으로 인증에 성공 시 비밀번호 같은 민감정보를 `HttpSession`에 필요 이상으로 길게 보관하지 않기 위해 반환받은 `Authentication` 객체에 저장된 `자격증명(credentail)` 정보를 지운다.

사용자 정보를 캐시를 사용할 때 반드시 고려해야 할 점이 있는데, 사용자 정보를 캐시할 경우 `Authentication`이 캐시 안에 있는 객체를 참조하므로(`UserDetails` 인스턴스 등), `credential`을 제거한다면 캐시된 값으로는 더 이상 인증이 통과되지 않는다.

이 경우엔 캐시 구현부나 `Authentication` 객체를 생성하는 `AuthenticationProvider`에서 객체의 복사본을 만들거나 `ProviderManager`의 `eraseCredentialAfterAuthentication` 프로퍼티를 비활성화 시키면 해결된다.

더 상세한 정보는 [Javadoc](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/authentication/ProviderManager.html) 을 참고하기 바란다.