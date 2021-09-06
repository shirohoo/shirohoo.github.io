---
layout: post
category:
    - spring
    - spring-mvc
title: HTTP 통신내역을 기록하기
description: >
    `Spring MVC`의 `Filter`와 `Interceptor`를 활용한 로깅
image: /assets/img/spring/spring-mvc/spring-boot-logo.png
related_posts:
    - 
---

* toc
{:toc}

이 글에서는 `Spring MVC` 중 `Filter`와 `Interceptor`에 관한 내용을 다룹니다.

---

# 🕋 서론

명제 - **"모든 HTTP 통신내역을 어디서 기록해야 가장 효율적일까?"** 에 대해 어떻게 생각하시나요?

저는 `Interceptor`라고 생각합니다.

`Filter`는 `Spring`과 별개의 `Context`이기 때문에 세밀한 컨트롤이 매우 힘듭니다.

따라서 `Spring Context`에 들어오는 `Interceptor`가 가장 적당하다고 봤습니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/131762715-0b9da307-ec56-43fe-af39-fd4fef4b2c4f.png)

<br />

`Interceptor`에서 모든 HTTP 통신내역을 기록하기 위해 우선 `Filter`를 건드려야 합니다.

우리 프로젝트는 현재 `Spring MVC`를 사용하고 있는데, 이 때 `WAS`는 `Tomcat`이 기동됩니다.

`Embedded Tomcat`의 버전은 `Spring Boot` 버전에 따라 다르지만 대체로 `8.5` 이상이기 때문에 최소 `servlet 3.1`을 제공합니다.

그리고 `Filter`는 `Servlet`의 영역이기 때문에 `Tomcat`에 종속적입니다.

`Tomcat`의 `Filter`는 데이터를 한번 읽어버리면 데이터가 유실되는데, 이 문제를 해결하기 위해 `Spring MVC`에서 확장을 해 둔 라이브러리가 있습니다.

<br />

> [📜 ContentCachingRequestWrapper](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/util/ContentCachingRequestWrapper.html)

> [📜 ContentCachingResponseWrapper](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/util/ContentCachingResponseWrapper.html)

<br />

그리고 HTTP 요청 & 응답에서 데이터를 `딱 한번`만 추출하여 기록하면 되기 때문에 역시 `Spring MVC`에서 확장한 [📜 OncePerRequestFilter](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/filter/OncePerRequestFilter.html) 를 사용합니다.

<br />

`OncePerRequestFilter`에 대한 자세한 내용은 아래 글을 확인 해 주세요.

<br />

> [📜 What is OncePerRequestFilter?](https://stackoverflow.com/questions/13152946/what-is-onceperrequestfilter)

<br />

# ⚙ 구현

플로우는 다음과 같습니다.

<br />

1. 사용자가 서버에 요청을 보냅니다.
2. 해당 요청을 `Filter`에서 낚아 채 캐시합니다. **(👏 데이터 유실 방지)**
3. `Filter`는 요청을 `Interceptor`로 넘겨줍니다.
4. `Interceptor`는 데이터를 다듬고 `Database`에 기록합니다.

<br />

## 🛠 ServletWrappingFilter

`ServletWrappingFilter`는 로깅한 데이터가 유실되지 않고 정상적으로 사용자에게 응답될 수 있도록 해 줄겁니다.

<br />

```java
// OncePerRequestFilter를 상속하여 데이터를 캐시 해 줄 Filter를 만듭니다.
@Component
public class ServletWrappingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(final HttpServletRequest request, final HttpServletResponse response, final FilterChain filterChain) throws IOException, ServletException {
        final String contentType = request.getHeader("Content-Type");

        // Content-Type이 비었거나, 데이터가 사진, 음악, 동영상 등의 컨텐츠 일 경우 기록하지 않습니다.
        if (Objects.nonNull(contentType) && contentType.toLowerCase().contains("multipart/form-data")) {
            filterChain.doFilter(request, response);
        }
  
        // 위 조건을 제외한 모든 데이터는 데이터베이스에 기록하기 위해 캐시합니다.
        else {
            final ContentCachingRequestWrapper wrappingRequest = new ContentCachingRequestWrapper(request);
            final ContentCachingResponseWrapper wrappingResponse = new ContentCachingResponseWrapper(response);
            filterChain.doFilter(wrappingRequest, wrappingResponse);

            // 데이터 유실 방지를 위해 응답을 복사해둡니다.
            wrappingResponse.copyBodyToResponse();
        }
    }
}
```

<br />

## 🛠 HttpLogInterceptor

`HttpLogInterceptor`는 데이터를 섬세하게 정제하여 데이터베이스에 기록합니다.

<br />

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class HttpLogInterceptor implements HandlerInterceptor {
    // 데이터를 이쁘게 가공하기 위해 주입받습니다.
    private final ObjectMapper objectMapper;

    // 데이터를 데이터베이스에 저장하기 위해 주입받습니다.
    private final HttpLogRepository httpLogRepository;

    // HandlerInterceptor를 구현하면 preHandler, postHandelr, afterCompletion 세 가지의 메서드가 있습니다.
    // 저는 afterCompletion 를 사용하겠습니다. 자세한 사항은 세가지 메서드에 대해 구글링 !
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        logging(request, response);
    }

    private void logging(HttpServletRequest request, HttpServletResponse response) {
        // 요청이 Interceptor에 넘어왔다는 것은, Spring Security Filter Chain을 지나왔음을 뜻합니다.
        // Spring Security는 유저 정보에 대한 것들을 따로 wrapping하기 때문에, 이 부분과의 충돌을 방지하기 위한 조건을 추가합니다.
        // 이 조건이 없다면, 유저 정보에 대해 두 번 wrapping하게 되므로 문제가 발생할 수 있습니다.
        if (request.getClass().getName().contains("SecurityContextHolderAwareRequestWrapper")) {
            return;
        }

        // 모든 조건을 만족하면 데이터베이스에 기록합니다.
        httpLogRepository.save(HttpLog.of(request, response, objectMapper));
    }
}
```

<br />

## 🛠 HttpLog

사용자의 요청과 응답에 대해 디테일한 데이터 정제작업을 합니다.

어떤 데이터를 기록하고, 어떤 데이터를 기록하지 않을지.

데이터를 어떤 형태로 저장할 것인지 등의 판단과 책임을 갖습니다.

<br />

```java
@Slf4j
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HttpLog extends AbstractEntity {
    private String clientIp; // 데이터 베이스에 기록 할 사용자의 IP주소
    private String httpMethod; // 사용자가 어떤 요청을 보냈는지 (Get, Post, Put, Delete 등)
    private String requestUri; // 사용자가 어떤 URI로 요청을 보냈는지
    private String requestBody; // 사용자가 어떤 내용의 요청을 보냈는지
    private String responseBody; // 사용자가 어떤 응답을 받았는지
    private String token; // 사용자가 요청을 보내며 사용했던 토큰
    private int httpStatusCode; // 기록된 HTTP 통신의 최종 상태 코드

    @Builder(access = AccessLevel.PUBLIC)
    private HttpLog(final String clientIp, final String httpMethod, final String requestUri, final String requestBody, final String responseBody, final String token, final Integer httpStatusCode) {
        this.clientIp = clientIp;
        this.httpMethod = httpMethod;
        this.requestUri = requestUri;
        this.requestBody = requestBody;
        this.responseBody = responseBody;
        this.token = token;
        this.httpStatusCode = httpStatusCode;
    }

    // 데이터를 직접적으로 넣어주는데, 응답 바디가 없을 경우를 의미합니다.
    // 점층적 생성자 패턴을 응용하여 오버로딩합니다.
    public static HttpLog of(final String httpMethod, final String uri, final String requestBody, final String ip, final String token, final Integer httpStatusCode) {
        return of(httpMethod, uri, requestBody, null, ip, token, httpStatusCode);
    }

    // 모든 데이터가 직접적으로 넘어오는 경우입니다. 즉시 생성자를 호출하여 객체를 초기화합니다.
    public static HttpLog of(final String httpMethod, final String uri, final String requestBody, final String responseBody, final String ip, final String token, final Integer httpStatusCode) {
        return new HttpLog(ip, httpMethod, uri, requestBody, responseBody, token, httpStatusCode);
    }

    // 생성자로 HTTP 요청과 응답 객체가 넘어오는 경우입니다.
    // 이 경우는 Interceptor에서 호출한 경우를 의미합니다.
    public static HttpLog of(final HttpServletRequest request, final HttpServletResponse response, final ObjectMapper objectMapper) {
        return getResponseBody(response, objectMapper)
                .map(responseBody -> HttpLog.builder()
                        .httpMethod(request.getMethod())
                        .requestUri(request.getRequestURI())
                        .requestBody(getRequestBody(request, objectMapper))
                        .responseBody(responseBody.toString())
                        .clientIp(getClientIp(request))
                        .token(getToken(request))
                        .httpStatusCode(response.getStatus())
                        .build()
                )
                .orElse(HttpLog.builder()
                        .httpMethod(request.getMethod())
                        .requestUri(request.getRequestURI())
                        .requestBody(getRequestBody(request, objectMapper))
                        .clientIp(getClientIp(request))
                        .token(getToken(request))
                        .httpStatusCode(response.getStatus())
                        .build());
    }

    // 응답 바디를 읽을 수 있는 응답일 경우 응답 바디를 읽고 읽은 데이터를 정제하여 반환합니다.
    // 만약 읽을 수 없는 응답이라면 빈 Optional을 반환합니다.
    private static Optional<JsonNode> getResponseBody(final HttpServletResponse response, final ObjectMapper objectMapper) {
        final ContentCachingResponseWrapper cachingResponse = (ContentCachingResponseWrapper) response;
        if (isReadableResponse(cachingResponse)) {
            return readTree(objectMapper, cachingResponse);
        }
        return Optional.empty();
    }

    private static boolean isReadableResponse(final ContentCachingResponseWrapper cachingResponse) {
        return Objects.nonNull(cachingResponse.getContentType()) && isJson(cachingResponse.getContentType()) && cachingResponse.getContentAsByteArray().length != 0;
    }

    private static Optional<JsonNode> readTree(final ObjectMapper objectMapper, final ContentCachingResponseWrapper cachingResponse) {
        try {
            return Optional.of(objectMapper.readTree(cachingResponse.getContentAsByteArray()));
        } catch (IOException e) {
            log.warn("ContentCachingResponseWrapper parse error! returns null. info : {}", e.getMessage());
            return Optional.empty();
        }
    }

    // 요청 바디를 읽을 수 있는 요청일 경우 요청 바디를 읽고 읽은 데이터를 정제하여 반환합니다.
    // 만약 읽을 수 없는 요청이라면 공백을 반환합니다.
    private static String getRequestBody(final HttpServletRequest request, final ObjectMapper objectMapper) {
        final ContentCachingRequestWrapper cachingRequest = (ContentCachingRequestWrapper) request;
        if (isReadableRequest(cachingRequest)) {
            return readTree(objectMapper, cachingRequest);
        }
        return "";
    }

    private static boolean isReadableRequest(final ContentCachingRequestWrapper cachingRequest) {
        return Objects.nonNull(cachingRequest.getContentType()) && isJson(cachingRequest.getContentType()) && cachingRequest.getContentAsByteArray().length != 0;
    }

    private static boolean isJson(final String contentType) {
        return contentType.contains("application/json");
    }

    private static String readTree(final ObjectMapper objectMapper, final ContentCachingRequestWrapper cachingRequest) {
        try {
            final JsonNode jsonNode = objectMapper.readTree(cachingRequest.getContentAsByteArray());
            removeSecurityInformation(jsonNode);
            return jsonNode.toString();
        }
        catch (IOException e) {
            log.warn("ContentCachingRequestWrapper parse error! returns null. info : {}", e.getMessage());
            return "";
        }
    }

    // 비밀번호는 데이터베이스에 대놓고 저장하면 안되는 민감정보이기 때문에 제외합니다.
    // 이런 데이터는 여러가지가 존재할 수 있기 때문에, 이 메서드는 필요하면 확장될 수도 있습니다.
    private static void removeSecurityInformation(final JsonNode jsonNode) {
        final Iterator<Map.Entry<String, JsonNode>> fields = jsonNode.fields();
        while (fields.hasNext()) {
            if (fields.next().toString().contains("password")) {
                fields.remove();
            }
        }
    }

    // 사용자의 IP주소를 얻기위한 필터체인입니다.
    // 많은 경우의 수를 따져 요청 객체에서 사용자의 올바른 IP주소를 획득합니다.
    private static String getClientIp(final HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (!StringUtils.hasLength(clientIp) || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("Proxy-Client-IP");
        }
        if (!StringUtils.hasLength(clientIp) || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("WL-Proxy-Client-IP");
        }
        if (!StringUtils.hasLength(clientIp) || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("HTTP_CLIENT_IP");
        }
        if (!StringUtils.hasLength(clientIp) || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (!StringUtils.hasLength(clientIp) || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getRemoteAddr();
        }
        return clientIp;
    }

    // 사용자의 요청 객체에 토큰이 있을 경우 토큰을 획득합니다.
    private static String getToken(final HttpServletRequest request) {
        return request.getHeader("Authorization");
    }
}
```

<br />

## 🛠 HttpLogQueryRepository

기왕 만드는 기능에 `당일 사용자의 수`와, `누적 사용자의 수`를 같이 얻어낼 수 있는 기능을 추가하면 일석이조라고 판단해 추가합니다.

기록된 HTTP 통신내역에서 특정 날짜로 필터링하고, 해당 날짜에서 중복된 IP를 모두 제거하면 `당일 사용자 수(DAU)`가 나옵니다.

그리고 전체 HTTP 통신내역을 모두 검색하고, 여기서 중복된 IP주소를 제거하면 `누적 사용자 수`가 나옵니다.

<br />

```java
public interface HttpLogQueryRepository {
    Long searchDau();
    Long searchTotalVisitors();
}

@RequiredArgsConstructor
public class HttpLogQueryRepositoryImpl implements HttpLogQueryRepository {
    private final JPAQueryFactory queryFactory;

    @Override
    @Transactional(readOnly = true) // 읽기 전용이므로 flush가 필요없습니다.
    public Long searchDau() {
        return queryFactory
                .select(httpLog.clientIp.countDistinct())
                .from(httpLog)
                .where(httpLog.regDate.gt(onTime()))
                .fetchOne();

    }

    @Override 
    @Transactional(readOnly = true) // 읽기 전용이므로 flush가 필요없습니다.
    public Long searchTotalVisitors() {
        return queryFactory
                .select(httpLog.clientIp.countDistinct())
                .from(httpLog)
                .groupBy(date(httpLog.regDate))
                .fetch()
                .stream()
                .reduce(0L, Long::sum);
    }

    private StringTemplate date(DateTimePath regDate) {
        return stringTemplate("date({0})", regDate);
    }

    private LocalDateTime onTime() {
        return LocalDateTime.of(LocalDateTime.now().getYear(),
                LocalDateTime.now().getMonth(),
                LocalDateTime.now().getDayOfMonth(),
                0, 0, 0);
    }
}
```

<br />

## 🛠 InterceptorConfig

마지막으로 작성된 `Interceptor`를 `Spring MVC`에서 사용하기 위해 등록해줍니다.

```java
@Configuration
@RequiredArgsConstructor
public class InterceptorConfig implements WebMvcConfigurer {
    private final HttpLogInterceptor httpLogInterceptor;

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        // 효율적인 로딩을 위해 정적 리소스를 캐싱하고 제공합니다.
        registry
                .addResourceHandler("/resources/**")
                .addResourceLocations("/resources/")
                .setCachePeriod(86400) // 단위는 초입니다. 24시간을 의미합니다.
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }

    @Override
    public void addInterceptors(final InterceptorRegistry registry) {
        registry
                .addInterceptor(httpLogInterceptor) // httpLogInterceptor는 
                .excludePathPatterns("/docs/**", "images/**", "/js/**", "/css/**") // 이 위치에 대한 요청,응답은 기록하지 않습니다.
                .addPathPatterns("/**"); // 위의 경로를 제외한 모든 요청, 응답을 기록합니다.
    }
}
```

<br />

# 👏 결과

<br />

![image](https://user-images.githubusercontent.com/71188307/131766344-ce022135-ec2e-420b-b518-59fff264a046.png)

<br />

하루동안 로봇인지 뭔지 모를것들의 요청기록들이 상당히 쌓여있는 모습입니다.

웹에서 활동하는 정체모를 것들이 굉장히 많다는 생각이 드네요 🤷‍♂️

<br />