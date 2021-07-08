---
layout: post
category:
    - spring
    - spring-mvc
date: 2021-01-24 21:52
title: Spring Boot 살펴보기
description: >
    `Spring Boot` 입문
image: /assets/img/spring/spring-mvc/spring-boot-logo.png
related_posts:
    - _posts/backend/server-side/2021-01-25-hikari-dbcp.md
---

* toc
{:toc}
  
&nbsp;  

Spring 5.x를 공부하다가 Spring Boot 2.x로 넘어왔는데

이건 뭐 전체적인 추상화가 너무너무너무 고수준이고 설정이 전부 다 자동으로 된다. ~~(-ㅅ-)~~

<u>Spring은 내가 무슨 설정을 안 했는지</u> 찾아야 해서 힘들었는데

<u>Spring Boot는 내가 뭐만 해야 하는지</u> 잘 모르겠어서 헷갈린다.

직접 다 설정해야 하는 Spring에 비해서 너무 편하긴 한데

대체 이게 어떻게 동작하는 건지 이해가 안 되는 경우가 정말 많다.

개발환경 구축하면서 구경하고,

테스트 코드 작성해보면서 또 구경하고,

결국 하루를 통째로 날려먹어서 정리를 해 놔야겠다 싶었다.

&nbsp;  

우선 `Gradle`도 처음이라 전체적으로 뭐가 뭔지는 잘 모르겠는데

딱 보아하니 `dependencies`에 패키지를 포함시키면 되는 것 같았다.

찾아보니 [MavenRepository](https://mvnrepository.com/)에 `Gradle` 코드도 올려져 있기에 편했다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbGo5Ml%2FbtqUwyoBUnn%2F3IBeEn7CLiFK2fnN0g3rx1%2Fimg.png)

&nbsp;  

```groovy
// build.gradle

plugins {
    id 'org.springframework.boot' version '2.4.1'
    id 'io.spring.dependency-management' version '1.0.10.RELEASE'
    id 'java'
}

group = 'com.springboot'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.bgee.c-log4j2:log4jdbc-log4j2-jdbc4.1:1.16'
    implementation 'org.mariadb.jdbc:mariadb-java-client:2.7.1'
    runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    compileOnly 'org.projectlombok:lombok'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}


test {
    useJUnitPlatform()
}
```

내가 이번에 학습하고자 하는 패키지를 dependency에 포함시켜주고..!

그다음에 한참을 헤맸는데

Spring 5.x는 `Tomcat DBCP`가 기본 설정이지만

Spring Boot 2.x부터는 `Hikari CP`가 기본 DBCP로 바뀌었다고 한다.

Spring 5.x하다와서 그런지 `DataSource` 설정하고 HikariConfig 설정을 직접 또 하고 있었는데

안돼서 히카리 문서를 찾아보니까 Spring 2.x부터는 그냥 안해도 자동으로 잘 동작한다고 한다.

{: style="text-align: right" }
📜 관련 글 : [2021/01/25 - \[일기\] - 光 HikariCP](/backend/server-side/2021-01-25-hikari-dbcp/)

&nbsp;

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FJYaVP%2FbtqUzu7imfa%2FnyA3S7bOuWDAEAGc6vL8U0%2Fimg.png)

&nbsp;  

{: style="text-align: right" }
📜 출처 : [HikariCP GitHub](https://github.com/brettwooldridge/HikariCP)

---

```yaml
# file: 'application.yml'
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/*?characterEncoding=UTF-8&serverTimezone=KST
    username: *
    password: *

  jpa:
    show-sql: true
```

참고로 Spring Boot 2.x 기준 클래스패스는 `src/main/resources/`이다.

기본 설정 파일로 `application.properties`가 만들어져 있었는데

이 녀석보다 `yml(=yaml)`이 가독성면에서 더 좋다고 하기에 한번 써봤다.

역시 사람들이 좋다고 하는 데는 다 이유가 있다.~~(항상 그런건 아니지만)~~

설정파일은 [HikariCP GitHub](https://github.com/brettwooldridge/HikariCP)를 참고하여 설정하였다.

&nbsp;  

대충 설정은 끝냈고 커넥션 테스트를 해본다.

```java
public class HikariTest extends SpringbootApplicationTests {

    @Autowired
    private HikariDataSource hikariDataSource;

    @Test
    public void dbConnectionTest() throws Exception {
        Connection connection = hikariDataSource.getConnection();
        assertThat(connection).isNotNull();
        System.out.println("connection = " + connection);
    }

}

```

커넥션이 제대로 추출 되는지 `null` 체크를 하고,

정확히 어떤 객체가 나오는지 확인하기 위해 콘솔에 표시했다.

```text
connection = HikariProxyConnection@892903721 wrapping org.mariadb.jdbc.MariaDbConnection@766db6f9
```

테스트 성공과 함께 HikariCP 커넥션 추출이 성공했고,

내부엔 MariaDB의 커넥션 객체가 들어있음을 확인했다.

&nbsp;  

대충 이 정도 설정을 마치고 `SpringbootApplication`을 실행하면..!

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fco7TmY%2FbtqUtXbz5vM%2FqoZYjm5N8ZB14hGx7r0Mfk%2Fimg.png)

&nbsp;  

성공적으로 서버가 기동된다.

&nbsp;  

# 그래서 차이점은 ?

---

아직 뭐 제대로 알지도 못하지만 우선 크게 느껴지는 `Spring`과 `Spring Boot`의 차이점은

폴더 구조가 전체적으로 다르고 이 구조의 차이에서 가장 중요한 부분은

`@SpringBootApplication`과 `main()` 메서드가 선언되어있는 클래스가

<u>Top-level Package 바로 아래에 위치해야 한다는 점</u>이었다.

이는 바뀐 구조와 컴포넌트 스캔 방식때문인 것 같았다.

또한, `Spring Boot`의 경우 `WAS를 내장`하고 있기 때문에 따로 설정이 필요 없다는 것과 ***(배포 시 매우 유용할 듯하다)***

그 외에 <u>대부분의 설정이 모두 자동화</u>되어있다는 점이 가장 큰 것 같다.

그 외에는

설정 파일을 `application.properties`나 `application.yml`을 사용하도록 권장하고 있으며

`DBCP`가 `Hikari CP`이고, 빌드 툴은 `Gradle`을 주로 사용한다는 점,

템플릿 엔진은 `Thymeleaf` 를 사용한다는 점 등등이 있겠다.

&nbsp;  
