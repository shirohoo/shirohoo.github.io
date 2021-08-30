---
layout: post
category:
  - backend
  - test
title: Docker를 활용한 테스트 컨테이너 구축
description: |
  `TestContainers`를 사용하여 외부 요인에 의한 실패가 없는 `CI` 환경을 구축한 이야기.
image: /assets/img/backend/test-logo.png
published: true
---

* toc
{:toc}
  
<br />

이번에 진행중인 사이드 프로젝트에서 깃허브에 백엔드 프로젝트 `CI`를 구축하면서 마주쳤던 문제와 이를 해결한 방법을 문서로 기록합니다.

<br />

# [💥 Issue#51](https://github.com/Ark-inflearn/inflearn-clone-back/issues/51)

저는 이번에 백엔드 서버를 구축하면서 데이터베이스 접속 정보를 숨기기 위해 데이터베이스 접속 정보를 외부 프로퍼티 파일로 작성하여 분리하였습니다.

데이터베이스 유저를 따로 생성하여 `SELECT`, `INSERT`, `UPDATE` 세 가지의 권한만 준 상태이긴 했지만, 그럼에도 불구하고 이 유저에 대한 정보가 깃허브에 업로드되어 외부에 노출된다면 보안상 매우 취약할 것이라고 생각했기 때문이었습니다.

그리고 백엔드 팀 각자의 로컬 환경에는 정해진 위치에 데이터베이스 접속정보를 갖고 있는 프로퍼티 파일이 위치하게 하였습니다.

따라서 로컬 환경에서는 아무리 테스트를 시도해도 항상 성공하는 상태였습니다.

<br />

**문제는 깃허브 액션에서 CI가 수행되며 발생했죠.**

<br />

로컬에서 완벽하게 테스트하여 PR을 했다고 생각했는데, 막상 PR 이벤트가 발생하면 CI가 계속 실패하는 것이었습니다.

<br />

```shell
ApplicationTest > boot() FAILED
    java.lang.IllegalStateException at DefaultCacheAwareContextLoaderDelegate.java:132
        Caused by: org.springframework.beans.factory.BeanDefinitionStoreException at ConfigurationClassParser.java:189
            Caused by: java.io.FileNotFoundException at FileInputStream.java:-2
```

<br />

CI 실패 로그를 살펴보니 `FileNotFoundException`이 발생하고 있었습니다.

문제를 추적하니 민감정보를 숨기기 위해 외부로 분리했던 데이터베이스 접속정보 파일을 찾을 수 없는 상황이었습니다.

정확히 어떤 상황이었냐면, 깃허브 액션이 진행될 때 깃허브 클라우드에 위치한 인스턴스에서 테스트가 실행됩니다.

이 때 깃허브 인스턴스에는 데이터베이스 접속 정보를 갖고 있는 프로퍼티 파일이 존재하지 않기 때문에 발생하는 문제였습니다.

<br />

이 문제점을 어떻게 해결할까 고민해보니 `Docker`가 떠오르긴 했지만, 문제는 제가 Docker를 한번도 사용해본 적이 없다는 점이었습니다.

그래서 일단 다른 회피방법이 있을지 이슈를 등록하였고, [승재](https://github.com/lsj8367)님의 제안을 보고 `TestContainers`에 대해 알아보게 됐습니다.

<br >

알아보니 결국 Docker를 사용하는 방법이여서, 결국 디버깅을 하다말고 뜬금없이 Docker를 공부하게 됐습니다. 😭

약 두시간 후 어느정도 Docker에 대한 감을 잡았다고 생각해 [📜 TestContainers 공식 문서](https://www.testcontainers.org/)를 보면서 환경 구축에 들어갔습니다.

다행히 문서가 아주 잘 돼있어서 크게 어려운 작업은 아니었던 것 같습니다.

<br >

이 문제를 해결하기 위한 과정은 다음과 같습니다.

- 여기서 실패한 테스트의 경우 데이터베이스로 인한 문제였다.
- 외부 환경에 민감한 테스트는 독립적인 테스트 환경을 구축해주면 될 것이다.
- 해당 테스트가 실행될 때 데이터베이스(MySQL)를 Docker로 띄워준다.
- 따라서 해당 테스트가 실행될 때 외부 데이터베이스에 의존하지 않아도 되게 된다.
- 테스트 자체에 결함이 없다면 이 테스트는 깃허브 인스턴스에서도 항상 성공 할 것이다.

<br />

# 🎯 문제 해결을 위한 과정

[📜 TestContainers 공식 문서](https://www.testcontainers.org/)대로 환경 구축을 시작합니다.

우선 `Gradle`에 의존성을 추가합니다.

이 때 사소하지만 `GString`을 이용해 버전관리를 변수로 처리해줍니다.

우리 프로젝트는 `MySQL8.0`을 사용하고 있으므로 이것을 도커로 띄우기 위한 의존성을 추가했습니다.

<br />

```grooovy
ext {
    testContainersVersion = '1.16.0'
}

dependencies {
    testImplementation(
            "org.testcontainers:junit-jupiter:$testContainersVersion",
            "org.testcontainers:mysql:$testContainersVersion",
    )
}
```

<br />

그리고 독립적인 환경의 테스트를 해야 할 테스트 케이스가 얼마나 나올지 모르는 상태였기 때문에, 이 설정을 별도의 `확장 클래스(JUnit Extension)`로 작성했습니다.

<br />

```java
// 테스트 컨테이너를 매 테스트 케이스마다 올렸다 내렸다 하는 것은 굉장히 비효율적입니다.
// 따라서 테스트가 실행될 때 테스트 컨테이너를 최초에 한번 올리고, 모든 테스트가 끝나면 테스트 컨테이너를 내려야 합니다.
// BeforeAllCallback, AfterAllCallback를 구현합니다.
public class MySQL80Extension implements BeforeAllCallback, AfterAllCallback {
    // MySQL8.0을 도커로 띄울 것이기 때문에 TestContainers에서 이를 추상화한 객체를 선언합니다.
    private MySQLContainer<?> MYSQL;
 
    // 공식 문서에 따르면 별로 중요한 내용들은 아니라고 하였으니 구색만 맞춰서 대충 작성해줬습니다.
    private static final String DATABASE_NAME = "inflearn_backend";
    private static final String USERNAME = "username";
    private static final String PASSWORD = "password";
    private static final int PORT = 3306;


    @Override
    public void beforeAll(final ExtensionContext context) {
        // 테스트가 실행되기 전 도커로 띄워야 할 MySQL에 작성한 설정을 바인딩해줍니다.
        MYSQL = new MySQLContainer<>("mysql:8.0.26")
                .withDatabaseName(DATABASE_NAME)
                .withUsername(USERNAME)
                .withPassword(PASSWORD)
                .withExposedPorts(PORT);
        
        // 데이터베이스를 띄웁니다.
        MYSQL.start();

        // 테스트 케이스에서 도커로 띄운 데이터베이스 정보를 사용해야 할 일이 생길수도 있습니다.
        // 혹시 모르니 이를 운영체제 환경변수에 저장합니다.
        System.setProperty("spring.datasource.url", getJdbcUrl());
        System.setProperty("spring.datasource.username", USERNAME);
        System.setProperty("spring.datasource.password", PASSWORD);
    }

    @Override
    public void afterAll(final ExtensionContext context) {
        // 모든 테스트가 끝나면 테스트 컨테이너를 종료합니다.
        MYSQL.stop();
    }

    private String getJdbcUrl() {
        return String.format("jdbc:mysql://localhost:%d/%s", MYSQL.getFirstMappedPort(), DATABASE_NAME);
    }
}
```

<br />

그리고 데이터베이스 접속 파일을 찾게 하지 않도록, 테스트를 위한 프로파일을 하나 별도로 추가해줍니다.

<br />

```properties
# src/test/resources/application-test.properties

spring.jpa.hibernate.ddl-auto=create
spring.jpa.properties.hibernate.format_sql=true
decorator.datasource.p6spy.enable-logging=true
```

<br />

처음에는 그냥 설정을 다 추가했는데, 저를 포함한 다른 분들이 이러한 설정을 매번 추가하려면 우선 매우 귀찮고, 휴먼에러가 생길수도 있는 부분이라 판단해 `커스텀 어노테이션`을 작성 했습니다.

~~(이 방법은 표준이 아니기 때문에 개인적으로 선호하는 방법은 아닙니다.)~~

<br />

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@ActiveProfiles("test") // 추가한 프로파일을 사용합니다.
@ExtendWith(MySQL80Extension.class) // 추가한 MySQL8.0 확장을 사용합니다.
public @interface EnableDockerContainers {
}
```

<br />

그리고 이에 대한 모의 테스트를 작성하여 구동했습니다.

```java
// 커스텀 애노테이션입니다.
// Querydsl이 비표준이므로 @DataJpaTest를 사용한 슬라이싱 테스트 시 JPAQueryFactory Bean이 로딩되지 않는 현상을 해결해줍니다
@ExtensionJpaTest  
@EnableDockerContainers
@DisplayName("Docker로 Test용 MySQL Container가 적용되는지 테스트. 이 테스트를 실행할 때 반드시 Docker가 실행중이어야 함 !")
class MemberRepositoryTest {
    private final RoleRepository roleRepository;
    private final MemberRepository memberRepository;

    public MemberRepositoryTest(final MemberRepository memberRepository, final RoleRepository roleRepository) {
        this.memberRepository = memberRepository;
        this.roleRepository = roleRepository;
    }

    @Test
    void save() throws Exception {
        Role role = roleRepository.save(Role.of(RoleType.MEMBER, false));
        Member member = memberRepository.save(Member.of("siro@gmail.com", "password", role));
        Assertions.assertThat(member.getEmail()).isEqualTo("siro@gmail.com");
        Assertions.assertThat(member.getPassword()).isEqualTo("password");
        Assertions.assertThat(member.getRole()).isEqualTo(role);
    }
}
```

<br />

그리고 어마어마한 길이의 Docker 로그가 발생하며 테스트가 성공합니다.

<br />

![test success](https://user-images.githubusercontent.com/71188307/131329819-5c484636-c61c-423f-a276-b0fadf140cae.png)

<br />

# 🤔 문제점 ?

이 방법을 사용하면서 두 가지 문제를 생각했습니다.

<br />

1. 로컬에서도 테스트가 느려진다.
2. 로컬에 Docker가 설치 및 실행되고 있어야 한다.

<br />

## ⚙ 로컬에서 테스트가 느려지는 문제

`CI`에서  테스트가 약간 느려져봐야 사실 큰 문제는 아닙니다만, 로컬환경에서 테스트가 느려지면 개발자 입장에서 매우 답답해지기 마련입니다.

테스트를 돌리면 즉각적인 피드백이 나와줘야 하는데, Docker 띄우고 내린다고 한세월이니까요.

이 문제는 고민을 좀 해봤는데, `JUnit`에서 지원하는 `태깅`을 통해 로컬환경에서는 Docker 테스트가 동작하지 않도록 하는게 괜찮지 않을까 생각했습니다.

<br />

## ⚙ 로컬에 Docker가 설치 및 실행되고 있어야 한다

현재 멤버에 변동이 생길지 안생길지는 모르겠으나, 우선 이 프로젝트에 익숙하지 않은 사람의 경우 처음 신경써야 할 포인트가 하나 더 생겼다고 생각합니다.

모든 개발자가 로컬에 Docker를 띄워서 관리하고 있지는 않을테니까요.

이 부분은 팀 차원에서 가이드를 해주거나 꾸준한 문서화가 해결해 줄 수 있을거라고 생각합니다.

<br />
