---
layout: post
category:
    - backend
    - server-side
date: 2021-01-25 17:50
title: Hikari DBCP
description: >
    `Hikari DBCP` 초고성능 `DBCP`에 대해 알아봅시다
image: /assets/img/backend/hikari-logo.png
related_posts:
    - 
---

* toc
{:toc}
  
&nbsp;  

Spring 5.x로 학습을 할 때도 HikariCP를 쓰긴 했었다.

그때는 DBCP를 구성해야 하는데 어떤 라이브러리를 쓸지 몰라서 그냥 인터넷에 있는걸 보고 썻었다.

~~(애초에 DBCP란 용어를 처음 봤었다.)~~

좀 찾아보니 자카르타 DBCP라고 불리는 `Commons DBCP`를 쓸 건지 `Tomcat DBCP`를 쓸 건지 헷갈리던 와중

다른거 다 필요없고 `HikariCP`가 요즘 성능이 가장 좋다는 포스팅을 봤었기에

별생각 없이 HikariCP로 시작을 하긴 했었는데

막상 학습이 Spring Boot 2.x로 들어오니까 `HikariCP`가 아예 기본 DBCP였다.

***"아 이건 내가 한번 짚고 넘어가야 하는 부분이다"*** 라는 확신이 생겨서 레퍼런스를 뜯어보았다.

&nbsp;  

# 서문

---  

시작부터 찬란하다.

눈에 확 띄는 `光`이라는 한자와 함께 온갖 미사여구가 달려있다.

> Fast, simple, reliable. HikariCP is a "zero-overhead" production ready JDBC connection pool. At roughly 130Kb, the library is very light. - 서문
>
> 빠르고, 간단하고, 신뢰성 있다. HikariCP는 "오버헤드가 없는" JDBC 커넥션 풀입니다. 용량은 약 130Kb밖에 안돼서 매우 가볍습니다.

> "Simplicity is prerequisite for reliability." - Edsger Dijkstra
>
> "신뢰성의 전제조건은 단순성이다" - 에츠허르 다익스트라

&nbsp;  

# 성능

---

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FckwrdC%2FbtqUJW3A0jC%2FBdhzj5wYOeaI6RkJZcR0B0%2Fimg.png)

&nbsp;  

1. **벤치마크에 사용된 버전**
    - HikariCP 2.6.0
    - commons-dbcp2 2.1.1
    - Tomcat 8.0.24
    - Vibur 16.1
    - c3p0 0.9.5.2
    - Java 8u111
    
2. **벤치마크에 사용된 CPU**
    - Intel Core i7-3770 CPU @ 3.40 GHz
    
3. **비경쟁 벤치마크**
    - 32 스레드 / 32 커넥션
    
4. **경쟁 벤치마크**
    - 32 스레드 / 16 커넥션
    
&nbsp;  

위와 같이 시작해서 밑으로 성능지표가 쭉 나열되어 있는데

한마디로 ***"그냥 HikariCP가 최고니까 이거 쓰세요!"***라고 할 수 있겠다.

&nbsp;  

# 구성

---

아래 두 가지 속성은 필수적으로 설정해줘야 하는 속성이다.

&nbsp;  

> 📎 HikariCP uses milliseconds for all time values.
> 
> 🚨 HikariCP relies on accurate timers for both performance and reliability. It is imperative that your server is synchronized with a time-source such as an NTP server. Especially if your server is running within a virtual
> 
> machine. Why? [Read more here](https://dba.stackexchange.com/a/171020). Do not rely on hypervisor settings to "synchronize" the clock of the virtual machine. Configure time-source synchronization inside the virtual machine. If
> 
> you come asking for support on an issue that turns out to be caused by lack time synchronization, you will be taunted publicly on Twitter.

&nbsp;  

HikariCP는 모든 시간 값에 밀리초 단위를 사용한다고 한다.

또한, 정확한 성능을 위해 `NTP(Network Time Protocol)`에 의존한다는 것 같다.

NTP는 나도 기억이 잘 안 나긴 하는데, 각 장비의 시간 동기화를 위한 표준이었던 것 같다.

UTC, KST, GMT 이런 거랑 관련이 있을 것같다.

아무튼 특히 `VM(Virtual Machine)`에서 구동할 때 타임존을 직접 세팅하라는 얘기 같다.

&nbsp;  

---

&nbsp;  

> 🔠 `dataSourceClassName`
> This is the name of the DataSource class provided by the JDBC driver. Consult the documentation for your specific JDBC driver to get this class name, or see the [table](https://github.com/brettwooldridge/HikariCP#popular-datasource-class-names) below. Note XA data sources are not supported. XA requires a real transaction manager like [bitronix](https://github.com/bitronix/btm). Note that you do not need this property if you are using jdbcUrl for "old-school" DriverManager-based JDBC driver configuration. Default: none

&nbsp;  

\- or -

> 🔠 `jdbcUrl`  
This property directs HikariCP to use "DriverManager-based" configuration. We feel that DataSource-based configuration (above) is superior for a variety of reasons (see below), but for many deployments there is little significant difference. When using this property with "old" drivers, you may also need to set the driverClassName property, but try it first without. Note that if this property is used, you may still use DataSource properties to configure your driver and is in fact recommended over driver parameters specified in the URL itself. Default: none

&nbsp;  

여타 DB커넥션 세팅할 때 많이 보던 것들인데

위 속성을 두 개 다 사용해도 무방하지만 `jdbcUrl` 속성으로 세팅하는 걸 권장한다고 한다.

`dataSourceClassName`은 아래 표를 참고해서 하라고 하고 있다.

&nbsp;  

|Database|Driver|DataSource class|
|:---:|:---:|:---:|
|Apache Derby|Derby|org.apache.derby.jdbc.ClientDataSource|
|Firebird|Jaybird|org.firebirdsql.ds.FBSimpleDataSource|
|H2|H2|org.h2.jdbcx.JdbcDataSource|
|HSQLDB|HSQLDB|org.hsqldb.jdbc.JDBCDataSource|
|IBM DB2|IBM JCC|com.ibm.db2.jcc.DB2SimpleDataSource|
|IBM Informix|IBM Informix|com.informix.jdbcx.IfxDataSource|
|MS SQL Server|Microsoft|com.microsoft.sqlserver.jdbc.SQLServerDataSource|
|MySQL|`지원 종료`|com.mysql.jdbc.jdbc2.optional.MysqlDataSource|
|MariaDB|MariaDB|org.mariadb.jdbc.MariaDbDataSource|
|Oracle|Oracle|oracle.jdbc.pool.OracleDataSource|
|OrientDB|OrientDB|com.orientechnologies.orient.jdbc.OrientDataSource|
|PostgreSQL|pgjdbc-ng|com.impossibl.postgres.jdbc.PGDataSource|
|PostgreSQL|PostgreSQL|org.postgresql.ds.PGSimpleDataSource|
|SAP MaxDB|SAP|com.sap.dbtech.jdbc.DriverSapDB|
|SQLite|xerial|org.sqlite.SQLiteDataSource|
|SyBase|jConnect|com.sybase.jdbc4.jdbc.SybDataSource|

&nbsp;  

---

&nbsp;  

> 🔠 `username`  
This property sets the default authentication username used when obtaining Connections from the underlying driver. Note that for DataSources this works in a very deterministic fashion by calling DataSource.getConnection(\*username\*, password) on the underlying DataSource. However, for Driver-based configurations, every driver is different. In the case of Driver-based, HikariCP will use this username property to set a user property in the Properties passed to the driver's DriverManager.getConnection(jdbcUrl, props) call. If this is not what you need, skip this method entirely and call addDataSourceProperty("username", ...), for example. Default: none

&nbsp;  

DB에 접속할 때 입력하는 사용자 이름을 입력해야 한다.

기본값 : 없음

&nbsp;  

---

&nbsp;  

> 🔠 `password`  
This property sets the default authentication password used when obtaining Connections from the underlying driver. Note that for DataSources this works in a very deterministic fashion by calling DataSource.getConnection(username, \*password\*) on the underlying DataSource. However, for Driver-based configurations, every driver is different. In the case of Driver-based, HikariCP will use this password property to set a password property in the Properties passed to the driver's DriverManager.getConnection(jdbcUrl, props) call. If this is not what you need, skip this method entirely and call addDataSourceProperty("pass", ...), for example. Default: none

&nbsp;  

역시 DB에 접속할 때 입력하는 사용자 비밀번호를 입력하면 된다.

기본값 : 없음

&nbsp;

---

&nbsp;

# 자주 사용되는 속성들

이제부턴 선택적으로 설정해야 하는 속성들에 대한 설명이다.

---

> ✅ `autoCommit`  
This property controls the default auto-commit behavior of connections returned from the pool. It is a boolean value. Default: true

&nbsp;  

커넥션이 만료되거나 풀에 반환될 때 내부에 속해있는 트랜잭션을 자동으로 커밋할 것인지를 결정함

기본값 : true

&nbsp;

---

&nbsp;

> ⌚ `connectionTimeout`  
This property controls the maximum number of milliseconds that a client (that's you) will wait for a connection from the pool. If this time is exceeded without a connection becoming available, a SQLException will be thrown. Lowest acceptable connection timeout is 250 ms. Default: 30000 (30 seconds)

&nbsp;  

풀에서 커넥션을 가져오기까지 기다리는 시간.

이 시간이 설정된 시간을 넘으면 `SQLException`을 던짐.

최소 시간은 250 ms이며 기본값은 30,000 ms (30초)

&nbsp;

---

&nbsp;

> ⌚ `idleTimeout`  
This property controls the maximum amount of time that a connection is allowed to sit idle in the pool. This setting only applies when minimumIdle is defined to be less than maximumPoolSize. Idle connections will not be retired once the pool reaches minimumIdle connections. Whether a connection is retired as idle or not is subject to a maximum variation of +30 seconds, and average variation of +15 seconds. A connection will never be retired as idle before this timeout. A value of 0 means that idle connections are never removed from the pool. The minimum allowed value is 10000 ms (10 seconds). Default: 600000 (10 minutes)

&nbsp;  

풀에서 커넥션이 사용되지 않아도 유지되는 시간.

이 세팅은 `minimumIdle`이 `maximumPoolSize`보다 작게 설정되어 있을 때만 유효함.

허용되는 최솟값은 10,000 ms (10초)이며, 기본값은 600,000 ms (10분)이다.

만약 이걸 0으로 설정한다면 커넥션은 사용되지 않더라도 폐기되지 않으며,

이 속성에 정의된 시간이 지나도록 커넥션이 사용되지 않으면 해당 커넥션은 폐기된다.

&nbsp;

---

&nbsp;

> ⌚ `keepaliveTime`  
This property controls how frequently HikariCP will attempt to keep a connection alive, in order to prevent it from being timed out by the database or network infrastructure. This value must be less than the maxLifetime value. A "keepalive" will only occur on an idle connection. When the time arrives for a "keepalive" against a given connection, that connection will be removed from the pool, "pinged", and then returned to the pool. The 'ping' is one of either: invocation of the JDBC4 isValid() method, or execution of the connectionTestQuery. Typically, the duration out-of-the-pool should be measured in single digit milliseconds or even sub-millisecond, and therefore should have little or no noticible performance impact. The minimum allowed value is 30000 ms (30 seconds), but a value in the range of minutes is most desirable. Default: 0 (disabled)

&nbsp;  

이 속성은 DB나 네트워크 인프라에 의해 연결이 끊어지는 것을 방지하기 위해

HikariCP가 연결을 시도하는 주기를 설정할 때 사용한다고 한다.

기본값 : 사용 안 함

&nbsp;

---

&nbsp;

> ⌚ `maxLifetime`  
This property controls the maximum lifetime of a connection in the pool. An in-use connection will never be retired, only when it is closed will it then be removed. On a connection-by-connection basis, minor negative attenuation is applied to avoid mass-extinction in the pool. We strongly recommend setting this value, and it should be several seconds shorter than any database or infrastructure imposed connection time limit. A value of 0 indicates no maximum lifetime (infinite lifetime), subject of course to the idleTimeout setting. The minimum allowed value is 30000 ms (30 seconds). Default: 1800000 (30 minutes)

&nbsp;

`IdleTimeout`이랑 비슷한 것 같은데 `IdleTimeout`은 풀 자체에 적용되는 속성이고

이건 각 커넥션 각각에 적용된다는 뜻 같다.

좀 더 강력한 기능인 듯.

이 값은 가급적이면 설정해주는 게 성능상 유리하지만

dB나 인프라에서 지정한 연결 시간보다 몇 초 더 짧아야 한다고 한다.

값을 0으로 지정하면 수명이 무한임을 나타내며

최소 허용 값은 30,000 ms (30초)이고 기본값은 1,800,000 ms (30분)이다.

&nbsp;

---

&nbsp;

> 🔠 `connectionTestQuery`  
If your driver supports JDBC4 we strongly recommend not setting this property. This is for "legacy" drivers that do not support the JDBC4 Connection.isValid() API. This is the query that will be executed just before a connection is given to you from the pool to validate that the connection to the database is still alive. Again, try running the pool without this property, HikariCP will log an error if your driver is not JDBC4 compliant to let you know. Default: none

&nbsp;  

드라이버가 JDBC 4 이상을 지원하면 건들지 말라고 한다.

JDBC 4 이전의 레거시 드라이버를 위한 설정이라고 한다.

기본값 : 없음

&nbsp;

---

&nbsp;

> 🔢 `minimumIdle`  
This property controls the minimum number of idle connections that HikariCP tries to maintain in the pool. If the idle connections dip below this value and total connections in the pool are less than maximumPoolSize, HikariCP will make a best effort to add additional connections quickly and efficiently. However, for maximum performance and responsiveness to spike demands, we recommend not setting this value and instead allowing HikariCP to act as a fixed size connection pool. Default: same as maximumPoolSize

&nbsp;  

HikariCP가 풀에서 유지하려고 하는 최소 커넥션 수를 설정하는 속성이다.

유효한 커넥션이 이 값 아래로 떨어지면(폐기되거나 사용 중인 경우인 듯) 

HikariCP는 이 값을 충족하기 위해 최선을 다할 것이며,

가급적이면 기본값을 건들지 않거나 `maximumPoolSize`와 값을 같게 해 주는 게 좋다고 함.

기본값 : `maximumPoolSize`와 동일

&nbsp;

---

&nbsp;

> 🔢 `maximumPoolSize`  
This property controls the maximum size that the pool is allowed to reach, including both idle and in-use connections. Basically this value will determine the maximum number of actual connections to the database backend. A reasonable value for this is best determined by your execution environment. When the pool reaches this size, and no idle connections are available, calls to getConnection() will block for up to connectionTimeout milliseconds before timing out. Please read [about pool sizing](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing). Default: 10

&nbsp;  

풀에서 유효한 커넥션의 최대 개수를 말함.

이 값을 초과하는 커넥션을 호출할 경우 `getConnection()`이 `connectionTimeout`에 설정된 시간 동안 차단된다.

그리고 `connectionTimeout`이 초과해버리면 `SQLException`이 발생한다는 뜻으로 보임.

따로 문서도 정의되어 있는걸 보니 아주 중요한 속성으로 사료된다.

기본값 : 10

&nbsp;

---

&nbsp;

> 📈 `metricRegistry`  
This property is only available via programmatic configuration or IoC container. This property allows you to specify an instance of a Codahale/Dropwizard MetricRegistry to be used by the pool to record various metrics. See the [Metrics](https://github.com/brettwooldridge/HikariCP/wiki/Dropwizard-Metrics) wiki page for details. Default: none

&nbsp;  

IoC container를 사용해 메트릭을 기록할 때 사용한다는데 메트릭이 뭔지 정확히 모르겠다.

유추하기로는 DBCP의 성능지표나 로그를 기록하는 용도인 것 같은데

정확히 아시는 분은 댓글 달아주시면 감사하겠습니다.

기본값 : 없음

&nbsp;

---

&nbsp;

> 📈 `healthCheckRegistry`  
This property is only available via programmatic configuration or IoC container. This property allows you to specify an instance of a Codahale/Dropwizard HealthCheckRegistry to be used by the pool to report current health information. See the [Health Checks](https://github.com/brettwooldridge/HikariCP/wiki/Dropwizard-HealthChecks) wiki page for details. Default: none

&nbsp;  

metricRegistry와 비슷함.

기본값 : 없음

&nbsp;

---

&nbsp;

> 🔠 `poolName`  
This property represents a user-defined name for the connection pool and appears mainly in logging and JMX management consoles to identify pools and pool configurations. Default: auto-generated

&nbsp;  

HikariCP의 이름을 정의할 수 있음.

기본값 : 자동생성

&nbsp;

# 자주 사용되지 않는 속성들

---

> ⌚ `initializationFailTimeout`  
This property controls whether the pool will "fail fast" if the pool cannot be seeded with an initial connection successfully. Any positive number is taken to be the number of milliseconds to attempt to acquire an initial connection; the application thread will be blocked during this period. If a connection cannot be acquired before this timeout occurs, an exception will be thrown. This timeout is applied after the connectionTimeout period. If the value is zero (0), HikariCP will attempt to obtain and validate a connection. If a connection is obtained, but fails validation, an exception will be thrown and the pool not started. However, if a connection cannot be obtained, the pool will start, but later efforts to obtain a connection may fail. A value less than zero will bypass any initial connection attempt, and the pool will start immediately while trying to obtain connections in the background. Consequently, later efforts to obtain a connection may fail. Default: 1

&nbsp;  

풀이 초기화되지 못하는 상황이면 빠르게 실패하도록 한다.

기본값은 1이며(양수), 0으로 설정할 경우 빠르게 실패하지 않고 유효성 검사를 시도한 후 실패한다고 함.

&nbsp;

---

&nbsp;

> ❎ `isolateInternalQueries`  
This property determines whether HikariCP isolates internal pool queries, such as the connection alive test, in their own transaction. Since these are typically read-only queries, it is rarely necessary to encapsulate them in their own transaction. This property only applies if autoCommit is disabled. Default: false

&nbsp;  

autoCommit이 비활성화돼있을 경우에만 작동한다고 한다.

근데 내부 쿼리를 격리한다? ~~(무슨 뜻인지 잘 모르겠다.)~~

&nbsp;

---

&nbsp;

> ❎ `allowPoolSuspension`  
This property controls whether the pool can be suspended and resumed through JMX. This is useful for certain failover automation scenarios. When the pool is suspended, calls to getConnection() will not timeout and will be held until the pool is resumed. Default: false

&nbsp;  

JMX를 통해 풀을 중지할 수 있는지 여부를 제어한다. ~~(역시 무슨 뜻인지 잘 모르겠다.)~~

기본값 : false

&nbsp;

---

&nbsp;

> ❎ `readOnly`  
This property controls whether Connections obtained from the pool are in read-only mode by default. Note some databases do not support the concept of read-only mode, while others provide query optimizations when the Connection is set to read-only. Whether you need this property or not will depend largely on your application and database. Default: false

&nbsp;  

기본값 : false인데

true로 하면 커넥션을 읽기 전용으로만 사용할 수 있다는 것 같다.

~~(SELECT문만 쓸 수 있는 건가?)~~

&nbsp;

---

&nbsp;

> ❎ `registerMbeans`  
This property controls whether or not JMX Management Beans ("MBeans") are registered or not. Default: false

&nbsp;  

JMX에서 관리하는 Bean (MBeans)의 등록 여부를 결정 ~~(??)~~

기본값 : false

&nbsp;

---

&nbsp;

> 🔠 `catalog`  
This property sets the default catalog for databases that support the concept of catalogs. If this property is not specified, the default catalog defined by the JDBC driver is used. Default: driver default

&nbsp;  

카탈로그 개념을 지원하는 DB의 카탈로그를 설정한다.

기본값 : 드라이버 기본값

&nbsp;

---

&nbsp;

> 🔠 `connectionInitSql`  
This property sets a SQL statement that will be executed after every new connection creation before adding it to the pool. If this SQL is not valid or throws an exception, it will be treated as a connection failure and the standard retry logic will be followed. Default: none

&nbsp;  

새로운 커넥션이 생성될 때마다 풀에 추가되기 전 특정 SQL문이 실행되도록 설정할 수 있다.

기본값 : 없음

&nbsp;

---

&nbsp;

> 🔠 `driverClassName`  
HikariCP will attempt to resolve a driver through the DriverManager based solely on the jdbcUrl, but for some older drivers the driverClassName must also be specified. Omit this property unless you get an obvious error message indicating that the driver was not found. Default: none

&nbsp;  

HikariCP는 `jdbcUrl` 속성으로 드라이버 연결을 시도하지만

일부 레거시 드라이버의 경우 `driverClassName` 속성도 설정해주어야만 하는 경우가 있다.

다만 jdbcUrl 속성으로 설정을 했음에도 드라이버를 찾을 수 없다는 에러 메시지가 나타날 때만 설정해야 한다.

기본값 : 없음

&nbsp;

---

&nbsp;

> 🔠 `transactionIsolation`  
This property controls the default transaction isolation level of connections returned from the pool. If this property is not specified, the default transaction isolation level defined by the JDBC driver is used. Only use this property if you have specific isolation requirements that are common for all queries. The value of this property is the constant name from the Connection class such as TRANSACTION\READ\COMMITTED, TRANSACTION\REPEATABLE\READ, etc. Default: driver default

&nbsp;  

풀에서 리턴되는 커넥션의 트랜잭션 수준을 제어한다.

기본값 : 드라이버 기본값

&nbsp;

---

&nbsp;

> ⌚ `validationTimeout`  
This property controls the maximum amount of time that a connection will be tested for aliveness. This value must be less than the connectionTimeout. Lowest acceptable validation timeout is 250 ms. Default: 5000

&nbsp;  

커넥션이 활성 상태인지 테스트하는 최대 시간을 설정한다.

이 값은 `connectionTimeout`보다 작아야 하며

허용 가능한 최소 값은 250 ms이고 기본값은 5,000 ms (5초)이다.

&nbsp;

---

&nbsp;

> ⌚ `leakDetectionThreshold`  
This property controls the amount of time that a connection can be out of the pool before a message is logged indicating a possible connection leak. A value of 0 means leak detection is disabled. Lowest acceptable value for enabling leak detection is 2000 (2 seconds). Default: 0

&nbsp;  

커넥션이 누수(Leak) 상태임을 나타내는 메시지가 기록되기 전에 풀에서 벗어날 수 있는 시간을 설정한다.

최솟값은 2,000 ms (2초)이며, 기본값 : 0

&nbsp;

---

&nbsp;

> ➡ `dataSource`  
This property is only available via programmatic configuration or IoC container. This property allows you to directly set the instance of the DataSource to be wrapped by the pool, rather than having HikariCP construct it via reflection. This can be useful in some dependency injection frameworks. When this property is specified, the dataSourceClassName property and all DataSource-specific properties will be ignored. Default: none

&nbsp;  

HikariCP를 구성할 때 IoC container를 통해 사용할 수 있는 속성

이 속성을 사용해 HikariCP를 구성하면 `dataSourceClassName` 등의 모든 `DataSource`관련 속성이 무시됨.

기본값 : 없음

&nbsp;

---

&nbsp;

> 🔠 `schema`  
This property sets the default schema for databases that support the concept of schemas. If this property is not specified, the default schema defined by the JDBC driver is used. Default: driver default

&nbsp;  

스키마 개념을 지원하는 모든 DB의 기본 스키마를 설정함

기본값 : 드라이버 기본값

&nbsp;  

# 초기화

---  

Build Tool 로 Maven을 사용할 경우 아래와 같이 `dependency`를 설정하라고 되어 있다.

```xml
<!-- file: 'pom.xml'-->
<!--자바 8~11-->
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP</artifactId>
  <version>4.0.0</version>
</dependency>



<!--자바 7 (유지보수 모드)-->
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP-java7</artifactId>
  <version>2.4.13</version>
</dependency>



<!--자바 6 (유지보수 모드)-->
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP-java6</artifactId>
  <version>2.3.13</version>
</dependency>
```

&nbsp;  

HikariConfig 클래스를 다음과 같이 설정할 수 있다.

&nbsp;  

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/simpsons");
config.setUsername("bart");
config.setPassword("51mp50n");
config.addDataSourceProperty("cachePrepStmts", "true");
config.addDataSourceProperty("prepStmtCacheSize", "250");
config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

HikariDataSource ds = new HikariDataSource(config);
```

&nbsp;  

혹은 HikariDataSource를 직접 인스턴스화 할 수 있다.

&nbsp;  

```java
HikariDataSource ds = new HikariDataSource();
ds.setJdbcUrl("jdbc:mysql://localhost:3306/simpsons");
ds.setUsername("bart");
ds.setPassword("51mp50n");

- - - other attr - - -
```

&nbsp;  

혹은 설정 파일을 가져다 사용할 수도 있다.

&nbsp;  

```java
// Examines both filesystem and classpath for .properties file
HikariConfig config = new HikariConfig("/some/path/hikari.properties");
HikariDataSource ds = new HikariDataSource(config);
```

&nbsp;  

위와 같이 설정 파일을 가져오도록 하고,

아래와 같이 설정파일을 따로 만든다

&nbsp;  

```properties
# file: 'application.properties'
dataSourceClassName=org.postgresql.ds.PGSimpleDataSource
dataSource.user=test
dataSource.password=test
dataSource.databaseName=mydb
dataSource.portNumber=5432
dataSource.serverName=localhost
```

&nbsp;  

혹은 `java.util.Properties` 기반으로도 가능하다

&nbsp;  

```java
Properties props = new Properties ();
props.setProperty("dataSourceClassName", "org.postgresql.ds.PGSimpleDataSource");
props.setProperty("dataSource.user", "test");
props.setProperty("dataSource.password", "test");
props.setProperty("dataSource.databaseName", "mydb");
props.put("dataSource.logWriter", new PrintWriter(System.out));

HikariConfig config = new HikariConfig(props);
HikariDataSource ds = new HikariDataSource(config);
```

&nbsp;  

jdbcUrl를 사용하여 설정하는 것을 권장한다.

jdbcUrl으로 설정이 안 될 경우(레거시 드라이버)에는 `dataSourceClassName`을 사용해야 한다.

Spring Boot 사용자는 자동으로 구성되므로 jdbcUrl만 설정하면 된다

&nbsp;  

```yml
# file: 'application.yml'
spring:
  datasource:
    url: jdbcUrl
    username: username
    password: password
    
# Spring Boot은 이렇게 설정하고
# Dependency만 포함시켜주면 끝난다. (매우간단)
```

&nbsp;  

`MySQL`은 `dataSourceClassName`이 지원 중단되었으므로 `jdbcUrl`을 사용해야 한다.

또한 MySQL에서 최고의 성능을 발휘하기 위해 아래와 같은 설정을 권장한다.

&nbsp;  

```properties
# file: 'application.properties'
jdbcUrl = jdbc:mysql://localhost:3306/simpsons
 username = test
 password = test
 dataSource.cachePrepStmts = true
 dataSource.prepStmtCacheSize = 250
 dataSource.prepStmtCacheSqlLimit = 2048
 dataSource.useServerPrepStmts = true
 dataSource.useLocalSessionState = true
 dataSource.rewriteBatchedStatements = true
 dataSource.rewriteBatchedStatements.cacheResultSetMetadata = true
 dataSource.cacheServerConfiguration = true
 dataSource.elideSetAutoCommits = true
 dataSource.maintainTimeStats = false
```

&nbsp;  

마지막으로 `Java8+`을 사용하는 걸 권장하고,

`slf4j` 라이브러리가 있어야 한다.***(slf4j는 Spring에서 기본으로 포함)***

&nbsp;  
