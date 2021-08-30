---
layout: post
category:
  - spring
  - spring-security
title: Spring Security - REST API 기반의 인증 아키텍처
description: |
  Spring Security - REST API 기반의 인증 아키텍처
image: /assets/img/spring/spring-security/security-logo.png
related_posts:
  - _posts/spring/spring-security/2021-05-02-authentication.md
published: true
---

* toc
{:toc}
  
&nbsp;  

`DelegatingFilterProxy` 는 표준 서블릿 필터를 구현하고 있고, 내부에 `FilterChainProxy`라는 이름의 위임 대상을 갖습니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/131238662-005ed94b-1948-4ac7-a5e6-bd479809bc16.png)

<br />

Spring Security를 프로젝트에 적용하면 `FilterChainProxy` 을 통해 `SpringFilterChain`을 구현하여 동작합니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/131238615-192068bb-dbe5-4257-b0bd-38b79a15f28a.png)

<br />

`SpringFilterChain`에는 정말 많은 수의 필터가 이미 구현돼있고, 얼마든지 더 확장할 수 있는 구조로 만들어져 있습니다.

현재 우리 프로젝트는 프론트와 백엔드가 분리되어 있기 때문에 저는 이번에 일반적인 폼로그인 방식이 아닌, REST API 방식의 이메일&비밀번호 인증을 구현하게 됐습니다.

인증 요청 파라미터는 이메일과 비밀번호 파라미터가 JSON 문자열로 들어오기 때문에 내부적인 처리 로직은 사실 기존 폼로그인 방식과 크게 다를 게 없지만 예외 처리나 응답 등에서 아주 약간의 차이가 존재합니다.

<br />

우선 전체적인 흐름은 다음과 같습니다.

1. 사용자가 프론트에 접속하여 로그인을 시도합니다.
2. 프론트는 이메일과 비밀번호를 입력받아 백엔드에 인증 요청을 합니다.
3. 백엔드는 이메일과 비밀번호를 받아 내부적으로 인증처리를 진행하고 프론트에 응답을 반환합니다.

이때 응답은 처리 결과에 따라 `Http Status`로 구분하고 응답 바디에 JSON 문자열을 내려줍니다.


<br />

우선 기존에 인증을 처리하는 주체인 `AuthenticationProvider`를 확장해놓은 `CustomAuthenticationProvider`가 있습니다.

그리고 `CustomAuthenticationProvider`는 `UserDetailsService`를 확장한 `CustomUserDetailsService`를 의존하고 있는 상태입니다.

<br />

`CustomUserDetailsService`는 `CustomAuthenticationProvider`의 메시지를 받아 데이터베이스에서 인증 주체의 정보를 가져오는 책임을 갖습니다.

<br />

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;

    @Override 
    public UserDetails loadUserByUsername(final String email) throws UsernameNotFoundException {
        // 데이터 베이스에서 email로 유저를 찾습니다.
        // 데이터베이스에 해당하는 email이 없다면 예외를 던집니다.
        // 유저가 있다면 해당 유저의 정보를 context 객체에 담아 반환합니다.
        return MemberAuthenticationContext.of(
                memberRepository.findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("email not found !"))
        );
    }
}
```

<br />

`CustomAuthenticationProvider`는 유저의 인증을 처리하는 책임을 갖습니다.

`authenticate` 메서드로 넘어오는 `Authentication`은 사용자가 인증을 요청하기 위해 서버에 전달한 파라미터를 갖는데, 이 파라미터는 이전에 요청을 받은 필터에 따라 달라집니다.

예를 들어 `AuthenticationProvider`에 인증 요청을 위임한 필터가 `UsernamePasswordAuthenticationFilter`라면 `AuthenticationProvider.authenticate()`로 넘어오는 파라미터는 아이디, 이메일과 비밀번호 같은 것들이 될 수 있습니다.

> 참고로 `Authentication`은 스프링 시큐리티에서 사용하는 모든 인증 토큰을 규격화한 인터페이스로 스프링 시큐리티에서 아주 핵심적인 책임을 갖습니다.

<br />

```java
@RequiredArgsConstructor
public final class CustomAuthenticationProvider implements AuthenticationProvider {
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

    @Override
    public Authentication authenticate(final Authentication authentication) throws AuthenticationException {
        // 데이터베이스에서 유저 정보를 조회합니다.
        final MemberAuthenticationContext context = (MemberAuthenticationContext) userDetailsService.loadUserByUsername(authentication.getName());

        // 데이터베이스에서 조회한 유저의 비밀번호를 꺼냅니다. 이 때 비밀번호는 단방향 암호화 돼 있는 상태입니다.
        final String encryptedPassword = context.getPassword();

        // 사용자가 인증을 요청하며 전달한 파라미터 중 비밀번호를 골라 꺼냅니다.
        final String enteredPassword = (String) authentication.getCredentials();

        // 데이터베이스에서 꺼낸 비밀번호와, 입력받은 비밀번호를 비교합니다.
        // 이 때 데이터베이스에서 꺼낸 비밀번호는 단방향 암호화 돼있기 때문에 복호화 할 수 없으므로,
        // 입력받은 비밀번호를 암호화하여 암호화 된 두 비밀번호를 비교합니다.
        // 비밀번호가 일치하지 않을 경우 예외를 던집니다.
        if (!passwordEncoder.matches(enteredPassword, encryptedPassword)) {
            throw new BadCredentialsException("password not matched !");
        }

        // 이 인증처리자는 REST API 방식과 폼 로그인 방식을 모두 지원합니다.
        // 이 구문에서 REST API 방식의 요청이었을 경우 RestAuthenticationToken을 생성하여 반환합니다.
        // 이 때 인증 토큰에 비밀번호가 들어있으면 보안상 좋지 않으므로 비밀번호는 null로 치환합니다.
        if (isRestAuthenticationToken(authentication.getClass())) {
            return new RestAuthenticationToken(context.getUsername(), null, context.getAuthorities());
        }

        // REST API 방식이 아닌 폼 로그인 방식으로 인증에 성공하였으므로 UsernamePasswordAuthenticationToken을 발행합니다. 
        // 이 때 역시 인증 토큰에 비밀번호가 들어있으면 보안상 좋지 않으므로 비밀번호는 null로 치환합니다.
        return new UsernamePasswordAuthenticationToken(context.getUsername(), null, context.getAuthorities());
    }

    // 인증처리자(AuthenticationProvider)가 어떤 종류의 토큰에 대한 처리를 지원할 것인지에 대한 여부입니다.
    // 사실 폼 로그인 방식과 REST API 방식의 인증 처리는 큰 차이가 없기 때문에 이 인증처리자가 두 방식을 모두 지원하도록 하였습니다.
    @Override
    public boolean supports(final Class<?> authentication) {
        return isUsernamePasswordAuthenticationToken(authentication) || isRestAuthenticationToken(authentication);
    }

    private boolean isUsernamePasswordAuthenticationToken(final Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    private boolean isRestAuthenticationToken(final Class<?> authentication) {
        return RestAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
```

<br />

`RestAuthenticationToken`은 REST API 방식의 처리에서 사용 될 토큰으로, `AbstractAuthenticationToken`을 상속하여 확장 하였습니다.

> 참고로 여기서 `AbstractAuthenticationToken`은 `Authentication`을 일부 구현한 추상 클래스입니다.

REST API 방식의 인증 요청이 들어올 경우 해당 요청을 처리하는 필터에서 요청을 받아 이 토큰을 생성하고, `AuthenticationProvider`에 처리를 위임합니다.

이 때 `AuthenticationProvider`를 구현한 여러 콘크리트 클래스 중 `CustomAuthenticationProvider.supports`가 `RestAuthenticationToken.class`를 지원하고 있음을 명시하고 있으니 REST API 방식의 인증처리는 `CustomAuthenticationProvider`를 통해 진행되게 됩니다.

<br />

```java
public class RestAuthenticationToken extends AbstractAuthenticationToken {
    private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

    private final Object principal;

    private Object credentials;

    // 인증되지 않은 사용자의 토큰을 생성합니다.
    public RestAuthenticationToken(Object principal, Object credentials) {
        super(null);
        this.principal = principal;
        this.credentials = credentials;
        setAuthenticated(false);
    }

    // 사용자가 인증됐을 때 토큰을 발행 할 생성자입니다.
    public RestAuthenticationToken(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = credentials;
        super.setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return this.credentials;
    }

    @Override
    public Object getPrincipal() {
        return this.principal;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        Assert.isTrue(!isAuthenticated, "Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
        super.setAuthenticated(false);
    }

    @Override
    public void eraseCredentials() {
        super.eraseCredentials();
        this.credentials = null;
    }
}
```

<br />

이제 REST API 기반의 인증처리를 담당 할 `RestLoginProcessingFilter`를 작성합니다.

<br />

```java
public class RestLoginProcessingFilter extends AbstractAuthenticationProcessingFilter {
    @Autowired
    private ObjectMapper objectMapper;

    // "/api/v1/login"로 요청이 들어 올 경우 이 필터가 동작합니다.
    public RestLoginProcessingFilter() {
        super(new AntPathRequestMatcher("/api/v1/login"));
    }

    @Override
    public Authentication attemptAuthentication(final HttpServletRequest request, final HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        // 들어온 요청이 위의 URI는 맞지만 넘어온 파라미터가 REST API 기반의 요청이 아닐 경우 예외를 던집니다.
        if (!isRest(request)) {
            throw new IllegalStateException("It's not a REST request.");
        }

        // REST API 기반의 인증 요청이 맞다면 요청 데이터를 모든 인증관련 처리에 사용하려고 만든 SignRequestDto에 바인딩합니다.
        final SignRequestDto memberDto = objectMapper.readValue(request.getReader(), SignRequestDto.class);

        // 만약 이메일이나 비밀번호 데이터가 실제로 있지는 않다면 (필드는 있는 상태) 예외를 던집니다.
        if (!StringUtils.hasText(memberDto.getEmail()) || !StringUtils.hasText(memberDto.getPassword())) {
            throw new IllegalStateException("no email or password entered.");
        }
        
        // 인증되지 않은 사용자의 토큰을 생성해야 하므로 RestAuthenticationToken의 생성자를 호출합니다.
        return getAuthenticationManager().authenticate(new RestAuthenticationToken(memberDto.getEmail(), memberDto.getPassword()));
    }

    private boolean isRest(final HttpServletRequest request) {
        return "application/json".equals(request.getHeader("Content-Type"));
    }
}
```

<br />

여기서 위의 `SignRequestDto` 코드는 다음과 같습니다.

<br />

```java
@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class SignRequestDto {
    @Email
    @NotNull(message = "이메일을 입력하세요.")
    private String email;

    @NotNull(message = "비밀번호를 입력하세요.")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*])(?!.*(.)\\1\\1\\1)[0-9a-zA-Z!@#$%&*]{12,32}$", message = "비밀번호는 공백 없이 영문/숫자/특수문자를 조합해 12~32자리여야 합니다.")
    private String password;

    private SignRequestDto(final String email, final String password) {
        this.email = email;
        this.password = password;
    }

    public static SignRequestDto of(final String email, final String password) {
        return new SignRequestDto(email, password);
    }

    public SignRequestDto encodePassword(final PasswordEncoder passwordEncoder) {
        this.password = passwordEncoder.encode(this.password);
        return this;
    }
}
```

<br />

여기까지 REST API 인증 처리에 대한 모든 코드 작성이 끝났습니다.

이제 인증 요청 성공, 인증 요청 실패에 대한 처리를 담당하는 핸들러를 작성해야 합니다.

이 핸들러들의 코드는 딱히 어려울 게 없고, 그냥 코드를 보면 의도가 훤히 보일 것 같으니 따로 주석을 작성하진 않겠습니다.

<br />

```java
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final ObjectMapper objectMapper;

    public CustomAuthenticationSuccessHandler(final ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(final HttpServletRequest request, final HttpServletResponse response, final Authentication authentication) throws IOException, ServletException {
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpStatus.OK.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), HttpResponse.of(HttpStatus.OK, "log-in successful"));
    }
}
```

<br />

```java
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {
    private final ObjectMapper objectMapper;

    public CustomAuthenticationFailureHandler(final ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationFailure(final HttpServletRequest request, final HttpServletResponse response, final AuthenticationException exception) throws IOException, ServletException {
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String errMsg = "Email or password is invalid.";

        if (exception instanceof BadCredentialsException) {
            errMsg = "Email or password is invalid.";
        }

        objectMapper.writeValue(response.getWriter(), HttpResponse.of(HttpStatus.UNAUTHORIZED, errMsg));
    }
}
```

<br />

마지막으로 위에 작성한 모든 인증 컴포넌트들을 `SpringFilterChain`에 등록합니다.

<br />

```java
@Slf4j
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    private static final String[] PERMIT_ALL_RESOURCES = {"/api/v1/member,POST"};

    private final SecurityResourceService securityResourceService;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void configure(final AuthenticationManagerBuilder auth) throws Exception {
        // 커스터마이징하여 확장한 UserDetailsService를 사용할 것임을 명시합니다.
        auth.userDetailsService(userDetailsService());

        // 커스터마이징하여 확장한 AuthenticationProvider를 사용할 것임을 명시합니다.
        auth.authenticationProvider(authenticationProvider());
    }

    ...

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .httpBasic().disable()

                .authorizeRequests(
                        authorize -> authorize.anyRequest()
                                .authenticated()
                                .expressionHandler(expressionHandler())
                )

                // REST API 기반의 처리 필터를 UsernamePasswordAuthenticationFilter의 앞에 추가합니다.
                .addFilterBefore(restLoginProcessingFilter(), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(customFilterSecurityInterceptor(), FilterSecurityInterceptor.class);
    }

    ...

    // 커스터마이징하여 확장한 모든 컴포넌트를 Bean으로 등록합니다.
    @Bean
    public AuthenticationProvider authenticationProvider() {
        return new CustomAuthenticationProvider(passwordEncoder(), userDetailsService());
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new CustomUserDetailsService(memberRepository);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public RestLoginProcessingFilter restLoginProcessingFilter() throws Exception {
        RestLoginProcessingFilter restLoginProcessingFilter = new RestLoginProcessingFilter();
        restLoginProcessingFilter.setAuthenticationManager(authenticationManagerBean());

        // 해당 인증 처리 필터가 다음과 같은 인증 처리, 실패 핸들러를 사용 할 것임을 명시합니다.
        restLoginProcessingFilter.setAuthenticationSuccessHandler(authenticationSuccessHandler());
        restLoginProcessingFilter.setAuthenticationFailureHandler(authenticationFailureHandler());
        return restLoginProcessingFilter;
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler(objectMapper);
    }

    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler(objectMapper);
    }
}

```

<br />

마지막으로 이에 대한 테스트 코드를 작성합니다.

<br />

```java
@ExtendWith(RestDocumentationExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RestLoginTest {
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;

    public RestLoginTest(final ObjectMapper objectMapper, final PasswordEncoder passwordEncoder, final MemberRepository memberRepository, final RoleRepository roleRepository) {
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
        this.memberRepository = memberRepository;
        this.roleRepository = roleRepository;
    }

    private WebTestClient webTestClient;

    @BeforeEach
    void setUp(WebApplicationContext context, RestDocumentationContextProvider restDocumentation) {
        webTestClient = MockMvcWebTestClient.bindToApplicationContext(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .configureClient()
                .filter(documentationConfiguration(restDocumentation).snippets().withEncoding("UTF-8"))
                .build();
    }

    @Test
    @Transactional
    @DisplayName("로그인")
    void signUp() throws Exception {
        // given
        final String email = "test@email.com";
        final String password = passwordEncoder.encode("AASHFKHQWFQYW#qwhfgqwf123!");
        final Role role = roleRepository.findByRoleType(RoleType.ROLE_MEMBER).get();
        memberRepository.saveAndFlush(Member.of(email, password, role));

        Mono<String> request = Mono.just(objectMapper.writeValueAsString(
                SignRequestDto.of("test@email.com", "AASHFKHQWFQYW#qwhfgqwf123!"))
        );

        String expected = objectMapper.writeValueAsString(HttpResponse.of(HttpStatus.OK, "log-in successful"));

        // when
        WebTestClient.ResponseSpec exchange = webTestClient.post()
                .uri("/api/v1/login")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(fromProducer(request, String.class))
                .exchange();

        // then
        exchange.expectStatus().isOk()
                .expectBody().json(expected)
                .consumeWith(document("로그인",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        resource(
                                ResourceSnippetParameters.builder()
                                        .tag("회원")
                                        .summary("로그인")
                                        .description("로그인 성공")
                                        .requestSchema(schema("SignRequestDto"))
                                        .responseSchema(schema("HttpResponse"))
                                        .requestFields(
                                                fieldWithPath("email").description("이메일"),
                                                fieldWithPath("password").description("비밀번호")
                                        )
                                        .responseFields(
                                                fieldWithPath("responseCode").description("응답코드"),
                                                fieldWithPath("responseMessage").description("응답메시지"),
                                                fieldWithPath("responseBody").description("응답바디")
                                        )
                                        .build()
                        )));
    }
}
```

<br />

![image](https://user-images.githubusercontent.com/71188307/131239687-c5fdd7be-3553-447b-a156-7e3c44a7766b.png)

<br />

Postman으로 테스트를 진행한 모습입니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/131239698-97df6fc1-a54c-445a-b1a8-2db1632df563.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/131239707-279a5e4e-9413-4efa-98ad-f744631fdaa3.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/131239709-43e85660-f6fb-4f68-85f4-1a150ebe2f14.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/131239715-de83a825-8a07-40b8-a785-88151bf16b99.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/131239718-4e26a317-3c4b-4d32-8d6a-985371549a1b.png)

<br />
