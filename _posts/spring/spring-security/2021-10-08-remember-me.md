---
layout: post
category:
  - spring
  - spring-security
title: Remember-Me
description: |
  주로 자동로그인 등에 사용되는 `Remember-Me` 기능에 대해 알아봅시다.
image: /assets/img/spring/spring-security/security-logo.png
related_posts:
  - _posts/spring/spring-security/2021-05-02-authentication.md
  - _posts/spring/spring-security/2021-08-30-rest-login.md
published: true
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

<br />

![image](https://user-images.githubusercontent.com/71188307/136895281-41bddc06-554a-43ea-b659-4b66f54d7cd4.png)

<br />

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
            .userDetailsService(userDetailsService()) // Remember-Me 기능 설정에 필요한 필수 옵션

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

<br />

위의 네가지 정보가 모두 올바른 값이라면, 유효한 시그니처가 생성되게 되고, 이 시그니처를 토대로 `체크섬`하여 유효성을 검증합니다.

<br />

웹 브라우저에서 보내는 `remember-me` 쿠키에는 세가지의 정보가 들어있습니다.

- 사용자명
- 만료일
- 시그니처

<br />

웹 브라우저에서 보내오는 쿠키에서 시그니처를 만드는데 필요한 `사용자명`, `만료일`을 얻을 수 있습니다.

그리고 서버는 시그니처를 만들 때 사용한 `키(Key)`를 이미 알고있죠.

따라서 네가지의 정보 중 패스워드만 더 얻으면 시그니처를 만들어낼 수 있으며, 사용자명을 토대로 데이터베이스를 조회하여 패스워드를 얻어올 수 있습니다.

이렇게 `remember-me` 쿠키로 인증 요청이 들어오면 위의 과정을 거쳐 유효한 시그니처를 만들어내며, 생성된 유효한 시그니처와 `remember-me` 쿠키에 들어있는 시그니처를 비교합니다.

만약 두 시그니처가 같다면, 해당 쿠키는 신뢰할 수 있는 쿠키이기 때문에 인증 처리 합니다.

<br />

### 속성

---

```java
// file: 'SecurityConfiguration.java'
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http
            .rememberMe().key("key") // remember-me 토큰 암호화에 사용할 키를 설정합니다. 기본값은 무작위로 설정된 문자열입니다.
            .userDetailsService(userDetailsService()) // Remember-Me 기능 설정에 필요한 필수 옵션입니다.

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

<br />

![image](https://user-images.githubusercontent.com/78329064/136879483-48e3d5de-a441-4e65-83ad-4f021eb1b0ed.png)

<br />

이 방식은 세션-쿠키 방식과 유사하며, 이 방식을 사용하기 위해서는 먼저 두가지 속성을 이해해야 합니다.

- 시리즈(Series): `사용자가 처음 로그인할 때 생성되는 랜덤한 고유 값`이며 `불변`합니다. 즉, 이후 사용자가 `Remember-Me` 기능을 이용해 인증을 시도할 때마다 항상 동일한 값을 가집니다. 데이터베이스의 `PK(Primary Key)`가 됩니다.

- 토큰(Token): 사용자가 `Remember-Me` 기능을 이용해 인증을 시도할 때마다 `계속해서 변경되는 고유 값`입니다.

<br />

처음 인증 시 인증 토큰을 데이터베이스에 저장해두고, 이후 사용자가 보내오는 쿠키와 데이터베이스의 쿠키를 비교합니다.

따라서 remember-me 쿠키가 탈취당했는지의 여부를 알 수 있고, 만약 쿠키가 탈취당했다면 해당 토큰을 강제로 정지시켜버리거나, 사용자에게 쿠키가 탈취당했음을 경고하는 등의 작업도 할 수 있게 됩니다.

<br >

### 구현

---

`데이터베이스`는 `H2`를 사용할것이며, `데이터베이스 접속 방식`은 `JPA(Hibernate)`를 이용할 것입니다.

먼저, 스프링 시큐리티 팀에서 제공하는 `DDL`을 적용해야 하는데, 이 포스팅에서는 JPA를 이용 할 것이므로 해당 DDL을 참고하여 엔티티를 설계 및 구현합니다.

<br />

```sql
create table persistent_logins
(
    username  varchar(64) not null,
    series    varchar(64) primary key,
    token     varchar(64) not null,
    last_used timestamp   not null
)
```

<br />

이를 엔티티로 구현하면 대략 다음과 같습니다. 그리고 나중에 사용하게 될 몇가지 메서드를 함께 추가하였습니다.

<br />

```java
@Entity
@Table(name = "persistent_logins")
public class PersistentLogin implements Serializable {

    @Id
    private String series;

    private String username;

    private String token;

    private Date lastUsed;

    // JPA의 한계로 기본생성자가 반드시 필요하지만 private으로는 설정할 수 없다.
    protected PersistentLogin() {
    }

    // 생성자를 외부에 노출하지 않습니다.
    private PersistentLogin(final PersistentRememberMeToken token) {
        this.series = token.getSeries();
        this.username = token.getUsername();
        this.token = token.getTokenValue();
        this.lastUsed = token.getDate();
    }

    // 정적 팩토리 메서드
    public static PersistentLogin from(final PersistentRememberMeToken token) {
        return new PersistentLogin(token);
    }

    public String getSeries() {
        return series;
    }

    public String getUsername() {
        return username;
    }

    public String getToken() {
        return token;
    }

    public Date getLastUsed() {
        return lastUsed;
    }

    public void updateToken(final String tokenValue, final Date lastUsed) {
        this.token = tokenValue;
        this.lastUsed = lastUsed;
    }

}
```

<br />

이후 위 엔티티를 데이터베이스와 결합하게 도와줄 JPA Repository를 작성합니다.

<br />

```java
public interface PersistentLoginRepository extends JpaRepository<PersistentLogin, String> {

    Optional<PersistentLogin> findBySeries(final String series);

    List<PersistentLogin> findByUsername(final String username);

}
```

<br />

그리고 위에서 작성한 구현체들을 스프링 시큐리티에서 제공하는 `PersistentTokenRepository`로 확장해줘야 합니다.

이렇게 하는 이유는, `SecurityConfiguration`에서 `Remember-Me` 기능을 `데이터베이스 기반 토큰 방식`으로 구현 할 경우 데이터베이스에 접근 할 때 사용할 `Repository` 구현체를 요구하게 되는데, 기본적으로 스프링 시큐리티에서 JPA를 이용한 구현체가 제공되지 않기 때문에 이 구현체를 직접 구현해 확장하는 것입니다.

<br />

```java
// PersistentTokenRepository에서 요구하는 네가지 메서드를 재정의(Override)하도록 합니다.
public class JpaPersistentTokenRepository implements PersistentTokenRepository {

    // 스프링 팀에서 권장하는 생성자 DI를 이용합니다
    private final PersistentLoginRepository repository;

    public JpaPersistentTokenRepository(final PersistentLoginRepository repository) {
        this.repository = repository;
    }

    // 새로운 remember-me 쿠키를 발급할 때 담을 토큰을 생성하기 위한 메서드입니다.
    @Override
    public void createNewToken(final PersistentRememberMeToken token) {
        repository.save(PersistentLogin.from(token));
    }

    // 토큰을 변경할때 호출될 메서드입니다.
    @Override
    public void updateToken(final String series, final String tokenValue, final Date lastUsed) {
        repository.findBySeries(series)
            .ifPresent(persistentLogin -> {
                persistentLogin.updateToken(tokenValue, lastUsed);
                repository.save(persistentLogin);
            });
    }

    // 사용자에게서 remember-me 쿠키를 이용한 인증 요청이 들어올 경우 호출될 메서드입니다.
    // 사용자가 보내온 쿠키에 담긴 시리즈로 데이터베이스를 검색해 토큰을 찾습니다.
    @Override
    public PersistentRememberMeToken getTokenForSeries(final String seriesId) {
        return repository.findBySeries(seriesId)
            .map(persistentLogin ->
                new PersistentRememberMeToken(
                    persistentLogin.getUsername(),
                    persistentLogin.getSeries(),
                    persistentLogin.getToken(),
                    persistentLogin.getLastUsed()
                ))
            .orElseThrow(IllegalArgumentException::new);
    }

    // 세션이 종료될 경우 데이터베이스에서 영구 토큰을 제거합니다.
    @Override
    public void removeUserTokens(final String username) {
        repository.deleteAllInBatch(repository.findByUsername(username));
    }

}
```

<br />

그리고 위의 커스텀 구현체들을 `SecurityConfiguration`에  추가해줍니다.

테스트를 위해 몇가지 설정을 더 추가하였으나, 이 포스팅의 상단에서 설정한 것과 크게 달라진 것은 없을 것입니다.

<br />

```java
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    private PersistentTokenRepository tokenRepository;


    @Override
    protected void configure(final AuthenticationManagerBuilder auth) throws Exception {
        auth
            .inMemoryAuthentication()
            .withUser("test").password("{noop}test").authorities("ROLE_USER");
    }

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http
            .csrf().disable() // 테스트 편의성을 위해 CSRF 비활성화
            .headers().frameOptions().sameOrigin() // H2-Console에 접속해 영구 토큰을 확인하기 위해 설정

            .and()

            .authorizeRequests() // 서버로 오는 요청들에 대한 보안 정책
            .antMatchers("/h2-console/**").permitAll() // H2-Console에 접속해 영구 토큰을 확인하기 위해 설정
            .anyRequest().authenticated() // 모든 요청에 대해 인증이 필요합니다.

            .and()

            .rememberMe().key("key") // remember-me 토큰 암호화에 사용할 키를 설정합니다. 기본값은 무작위로 설정된 문자열입니다.
            .userDetailsService(userDetailsService()) // Remember-Me 기능 설정에 필요한 필수 옵션
            .tokenRepository(tokenRepository)

//            .rememberMeParameter("remember-me") // 클라이언트 뷰에서 설정한 파라미터명과 동일해야 한다. 기본값은 remember-me
//            .tokenValiditySeconds(86400) // 토큰 유효기간을 설정한다. 기본값은 14일이며 초단위이다. -1로 설정 할 경우 브라우저가 종료되면 함께 사라진다.
//            .alwaysRemember(true) // Remember-Me 기능이 활성화 되지 않아도(체크박스에 체크하지 않아도, 혹은 체크박스가 아예 없더라도) 항상 적용하도록 한다.
//            .rememberMeCookieName("remember-me") // Remember-Me 응답 쿠키이름. 기본값은 remember-me

            .and()

            .formLogin()
        ;
    }

    @Bean
    public PersistentTokenRepository persistentTokenRepository(final PersistentLoginRepository repository) {
        return new JpaPersistentTokenRepository(repository);
    }

}
```

<br />

그리고 간단한 테스트를 위해 프로젝트 설정을 조금 추가해줍니다.

<br />

```yaml
# file: 'resources/application.yaml'
spring:
  h2:
    console:
      enabled: true
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
    hibernate:
      ddl-auto: create
```

<br />

이후 서버를 기동하면 서버 콘솔에 로그가 쭉 뜨는데, 그중 다음과 같은 로그를 찾습니다.

<br />

```shell
2021-10-12 11:37:38.744  INFO 10844 --- [  restartedMain] o.s.b.a.h2.H2ConsoleAutoConfiguration    : H2 console available at '/h2-console'. Database available at 'jdbc:h2:mem:b1152f26-a567-4c05-9bf4-4f4260366b44'
```

<br />

스프링 설정에 `H2 콘솔`을 사용할 것이라고 설정했기 때문에 스프링에서 인메모리 데이터베이스 콘솔에 접속할 수 있는 수단을 제공해줍니다.

서버가 기동된 후 `http://localhost:8080/h2-console/` 로 접속하면 다음과 같은 화면에 들어갈 수 있는데, 위에서 찾은 `JDBC URL`을 입력합니다.

<br />

![image](https://user-images.githubusercontent.com/78329064/136882012-522f74a0-bc2e-44cb-89f0-dd5cfd51924a.png)

<br />

이후 접속하면 다음과 같은 화면이 뜹니다.

<br />

![image](https://user-images.githubusercontent.com/78329064/136882234-cb33e88c-bdf1-487b-92de-50eb35a9e81b.png)

<br />

1. 화면 좌측 메뉴의 `PERSISTENT_LOGINS` 를 클릭하면 우측 콘솔에 `SELECT 쿼리`가 생성됩니다.
2. 바로 위의 `RUN`을 누르면 생성된 쿼리가 실행됩니다.
3. 화면 하단에 쿼리의 결과가 노출됩니다.

<br />

현재는 로그인을 단 한번도 하지 않았으므로 데이터베이스에 토큰이 없는것이 당연합니다.

`localhost:8080/login`으로 접속해 아이디와 비밀번호(test/test)를 입력하고, `Remember-Me` 기능을 사용할 것임을 체크하고 로그인한 뒤 다시 H2 콘솔을 확인하도록 합니다.

<br />

![image](https://user-images.githubusercontent.com/78329064/136882495-cf9579d0-6a28-454d-9544-93a1e4560cf0.png)

<br />

우선 로그인 후 역시 `remember-me` 쿠키가 잘 응답된 것을 확인할 수 있습니다.

<br />

![image](https://user-images.githubusercontent.com/78329064/136882508-35cbb5ff-a343-455d-b2d4-d67ac11202f2.png)

<br />

H2 콘솔에 접속 후 동일한 쿼리를 실행하면 위와 같이 새로운 영구토큰이 데이터베이스에 저장됐음도 확인할 수 있습니다.

<br />

이후 로그아웃이 될 경우 세션 종료를 의미하기 때문에, `클라이언트에 설정된 remember-me 쿠키`와 `데이터베이스에 저장된 영구 토큰`이 모두 제거되어야만 합니다.

`localhost:8080/logout`으로 접속하여 로그아웃한 후 다시 한번 더 확인해봅니다.

<br />

![image](https://user-images.githubusercontent.com/78329064/136882673-e0529f7d-55af-4f16-9ef1-914ab8f48c0b.png)

<br />

![image](https://user-images.githubusercontent.com/78329064/136882690-c4d225b7-09a6-4551-82b6-84a64c1f812f.png)

<br />

모두 성공적으로 제거된 것을 확인할 수 있습니다.

<br />

### 확장

---

여기까지는 `remember-me 쿠키`를 `영속성 레이어(Persistent Layer)`에 저장하고 관리하는 기본적인 방법들에 대해 알아봤습니다.

<br />

만약 쿠키에 대한 추가적인 제어가 필요하다면 스프링 시큐리티에서 제공하는 `PersistentTokenBasedRememberMeServices`를 통해 다음과 같이 간단하게 몇가지 제어를 더 추가할 수 있으며, 더욱 복잡한 구성이 필요 할 경우 `PersistentTokenBasedRememberMeServices`를 확장하면 되겠습니다.

<br />

```java
// file: 'SecurityConfiguration.java'
@Bean
public PersistentTokenBasedRememberMeServices rememberMeServices(final PersistentTokenRepository repository) {
  PersistentTokenBasedRememberMeServices services = new PersistentTokenBasedRememberMeServices("key", userDetailsService(), repository);

  services.setAlwaysRemember(true);
  services.setParameter("remember-me-param-name");

  return services;
}
```

<br />

위 방식의 경우 만료된 토큰들에 대한 상세한 제어가 없습니다.

따라서 만료된 토큰들을 주기적으로 데이터베이스에서 제거하는 코드를 추가로 작성합니다.

<br />

```java
// Runnable을 구현하여 별도의 스레드로 동작시키도록 합니다.
public class ExpiredTokenJpaRepositoryCleaner implements Runnable {

    private final PersistentLoginRepository repository;
    private final long tokenValidityInMs;

    private ExpiredTokenJpaRepositoryCleaner(final PersistentLoginRepository repository, final long tokenValidityInMs) {
        if (isNull(repository)) {
            throw new IllegalArgumentException("PersistentTokenRepository cannot be null.");
        }

        if (tokenValidityInMs < 1) {
            throw new IllegalArgumentException("tokenValidityInMs must be greater than 0. Got " + tokenValidityInMs);
        }

        this.repository = repository;
        this.tokenValidityInMs = tokenValidityInMs;
    }

    public static ExpiredTokenJpaRepositoryCleaner of(final PersistentLoginRepository repository, final long tokenValidityInMs) {
        return new ExpiredTokenJpaRepositoryCleaner(repository, tokenValidityInMs);
    }

    @Override
    public void run() {
        final long expiredInMs = System.currentTimeMillis() - tokenValidityInMs;
        repository.deleteAllInBatch(repository.findByLastUsedAfter(new Date(expiredInMs)));
    }

}
```

<br />

이제 위의 설정을 스프링에서 제공하는 스케쥴러를 이용해 주기적으로 실행시키도록 하면 됩니다.

<br />

```java
@Configuration
@EnableScheduling
public class ScheduleConfigurer {

    private final PersistentLoginRepository persistentLoginRepository;

    public ScheduleConfigurer(final PersistentLoginRepository persistentLoginRepository) {
        this.persistentLoginRepository = persistentLoginRepository;
    }

    @Scheduled(fixedDelay = 10_000) // 단위는 ms. 따라서 1,000=1초. 10초에 한번 실행됨을 의미함.
    public void cleanExpiredTokens() {
        // 토큰의 유효시간이 10초
        new Thread(ExpiredTokenJpaRepositoryCleaner.of(persistentLoginRepository, 10_000L))
            .start();
    }

}
```

<br />

이후 서버를 기동하고 로그인을 하면 remember-me 쿠키가 발급되고, 토큰의 유효기간을 10초로 설정하였으므로 약 10초 후에 다음과 같은 쿼리가 발생합니다.

<br />

```shell
Hibernate: 
    select
        persistent0_.series as series1_0_,
        persistent0_.last_used as last_use2_0_,
        persistent0_.token as token3_0_,
        persistent0_.username as username4_0_ 
    from
        persistent_logins persistent0_ 
    where
        persistent0_.last_used>?
Hibernate: 
    delete 
    from
        persistent_logins 
    where
        series=?
```

<br />

# 참고

---

- Spring Security - Third Edition: Secure your web applications, RESTful services, and microservice architectures (ISBN 9781787129511)
