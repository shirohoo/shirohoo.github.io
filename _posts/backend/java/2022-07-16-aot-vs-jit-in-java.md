---
layout: post
category:
  - backend
  - java
title: Java에서의 AOT vs JIT 컴파일
description: |
    어느것이 더 나은가?
image: /assets/img/backend/java.png
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

이 글은 [cesarsotovalero](https://github.com/cesarsotovalero){:target="_blank"}의  [📜 AOT vs. JIT Compilation in Java](https://www.cesarsotovalero.net/blog/aot-vs-jit-compilation-in-java.html){:target="_blank"}를 번역한 글입니다.

제 CS지식이 빈약하고, 영어 실력이 좋지 않아 번역 품질이 많이 떨어지니, 가급적 원 글을 읽어주세요.

# Java에서 AOT vs JIT 컴파일 

---

JIT(Just in Time Compilation) 또는 AOT(Ahead of Time Compilation)를 사용하여 Java 애플리케이션을 컴파일하는 두 가지 방법이 있습니다. JIT는 Java HotspotVM의 기본설정이며 이는 런타임에 Java 바이트 코드를 기계어로 변환하는 데 사용됩니다. AOT는 GraalVM에서 지원되며 빌드타임에 Java 바이트 코드를 기계어로 정적 컴파일링 할 수 있습니다.

이 글에서는 두 가지 컴파일 방식의 차이점에 대해 설명할 것이며, 이 글을 읽고 나면 Java 컴파일러가 하는 일, 기존 컴파일 방식 간의 차이점, AOT 컴파일러를 사용하는 것이 더 적합한 상황에 대해 배울 수 있을것입니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/179343441-512e883c-3e59-493f-a26d-4d73b559ee49.png)

© JIT vs AOT: 동전의 양면. 사진 출처: [Tekniska Högskolan station.](https://www.google.se/maps/place/Tekniska+h%C3%B6gskolan/@59.3451978,18.0704429,16.59z/data=!4m5!3m4!1s0x465f9d41dbc866ef:0x3141fc2243b8b232!8m2!3d59.345909!4d18.
0716004?hl=sv&shorturl=1){:target="_blank"}
{:.figcaption}

## Java에서의 컴파일

---
 
프로그램을 컴파일한다는 것은, Java나 Python과 같은 고수준 프로그래밍 언어의 소스 코드를 [📜 기계어](https://en.wikipedia.org/wiki/Machine_code){:target="_blank"}로 변환하는 것을 의미합니다. 기계어란 특정 프로세서(즉, CPU. 이 글에서는 하드웨어 혹은 하드웨어 아키텍처라는 용어로도 많이 쓰였음)에서 실행할 수 있도록 만들어진 저수준의 명령어입니다. 그리고 컴파일러는 컴파일을 효율적으로 수행하도록 설계된 프로그램입니다. 컴파일러의 목표는 컴파일된 프로그램의 일관된 실행 파일을 만드는 것이며, 일관된 실행 파일은 소스 코드로 작성된 사양에 맞게 빠르고 안전하게 실행됩니다.

컴파일러는 기계어 생성 과정에서 여러 최적화를 수행합니다. 예를 들어, 대부분의 컴파일러는 컴파일 타임에 constant inlining, loop unrolling, partial evaluation 등을 수행합니다. 이러한 컴파일러의 최적화 작업과 복잡성은 지난 수십 년 동안 크게 증가했습니다.

표준 Java HotspotVM의 컴파일러 최적화 측면에서 두 가지 주요 컴파일러가 있는데, 이들이 바로 C1 컴파일러와 C2 컴파일러입니다.

### C1 컴파일러

---

**C1 컴파일러**는 some value numbering, inlining, class analysis를 수행하는 빠르고 가볍게 최적화된 바이트 코드 컴파일러입니다.

C1 컴파일러는 간단한 CFG 지향적인 [📜 SSA](https://en.wikipedia.org/wiki/Static_single-assignment_form){:target="_blank"}와 고수준의 [📜 중간 표현(IR)](https://en.wikipedia.org/wiki/Intermediate_representation){:target="_blank"}, 기계 지향적인 저수준의 IR, 선형 스캔 레지스터 할당 및 템플릿 스타일 코드 생성기를 사용합니다.

### C2 컴파일러

---

**C2 컴파일러**는 [📜 노드의 바다](https://darksi.de/d.sea-of-nodes/){:target="_blank"} SSA와 이상적인 IR을 사용하는 고도로 최적화된 바이트 코드 컴파일러이며, IR은 동일한 종류의 기계별 IR로 낮아집니다. C2 컴파일러에는 그래프 색칠 레지스터 할당자도 있습니다. 색상은 로컬, 글로벌, 인수 레지스터와 스택을 포함한 기계의 상태입니다. 또한, C2 컴파일러의 최적화에는 global value numbering, conditional constant type propagation, constant folding, global code motion, algebraic identities, method inlining (aggressive, optimistic, and/or multi-morphic), intrinsic replacement, loop transformations (unswitching, unrolling), array range check elimination 및 기타 등등이 포함됩니다.

<br />

이제 컴파일러의 역할을 어느정도 이해했으므로 컴파일이 수행되는 시점에 대해 이야기 해보겠습니다. Java에는 `JIT(Just in Time)`와 `AOT(Ahead of Time)`라는 두 가지 주요한 컴파일 전략이 있습니다. JIT는 프로그램 자체를 실행하는 동안(즉, Java 메서드가 처음으로 호출되기 전) 기계어를 생성하며, AOT는 프로그램이 실행되기 전에 기계어를 생성해냅니다(즉, 애플리케이션의 바이트 코드 검증 및 빌드 단계에서). 다음 섹션에서는 이러한 두 접근 방식의 차이점에 대해 설명합니다.

### Just in Time Compilation (JIT)

---

Java 프로그램을 컴파일할 때(예: javac 명령줄 도구를 사용하여) `플랫폼(CPU 아키텍처 + OS, 예로 인텔맥은 인텔 CPU + MacOS를 사용하는 플랫폼)`에 독립적인 `중간 표현(IR, JVM 바이트 코드가 IR의 일종)`으로 변환되며, 이 JVM 바이트 코드는 JVM이 읽기에는 아주 쉽지만 반대로 사람이 읽기는 어렵습니다.
우리 컴퓨터의 기존 프로세서는 JVM 바이트 코드를 직접 실행할 수 없으며, 그렇게 하기 위해 컴파일러는 다시 JVM 바이트 코드를 플랫폼에 종속적인 기계어로 변환해야만 하며, 이것은 프로그램이 본래 컴파일되었던 플랫폼과 동일한 플랫폼에서만 실행할 수 있음을 의미합니다. (즉, 인텔맥에서 컴파일 된 코드는 인텔맥에서만 실행할 수 있음을 의미함)

그리고 이것들은 정확히 바이트 코드 컴파일러가 하는 작업입니다. (여기서 바이트 코드 컴파일러란 바이트 코드를 기계어로 변환하는 JVM 내부의 인터프리터를 의미함. 즉, Java는 기본적으로 정적 컴파일 방식과 동적 컴파일 방식을 함께 사용함.)

<br />

![image](https://user-images.githubusercontent.com/71188307/179341951-49f9f9cc-c7c2-40f0-a17f-91b63444fd2a.png)

그림 1. Java 소스 코드는 먼저 바이트 코드로 컴파일된 후 나중에 기계어로 해석되고 실행되며, 다소 무거운 최적화 작업들은 JIT 컴파일 단계에 예정되어 있습니다. [출처](https://dl.acm.org/doi/10.1145/3067695.3082521){:target="_blank"}
{:.figcaption}

<br />

JVM 바이트 코드를 특정 플랫폼에서 실행할 수 있는 기계어로 변환하기 위해 JVM은 런타임에 바이트 코드를 해석하고 어떤 플랫폼에서 프로그램이 실행되고 있는지를 파악합니다. 이 전략은 [📜 동적 컴파일](https://en.wikipedia.org/wiki/Dynamic_compilation){:target="_blank"}의 한 형태인 [📜 JIT 컴파일](https://en.wikipedia.org/wiki/Just-in-time_compilation){:target="_blank"}로 알려져 있으며, JVM의 기본 JIT 컴파일러는 일명 Hotspot으로 알려져 있습니다. 그리고, [📦 OpenJDK](https://github.com/openjdk/jdk){:target="_blank"}는 Java로 작성된 이 JVM 바이트 코드 컴파일러의 무료 버전입니다. <u>(즉, OpenJDK는 무료 버전의 HotspotVM이며, HotspotVM은 JIT 컴파일 방식을 사용한다는 의미)</u>

<br />


> [📜 Understanding How Graal Works - a Java JIT Compiler Written in Java](https://chrisseaton.com/truffleruby/jokerconf17/){:target="_blank"}
> 
> HotspotVM의 JIT 컴파일러는 C++로 작성되어 있는데, 현 시점에서 이 코드는 더 이상 유지보수성과 확장성이 매우 좋지 않고, 포인터를 직접 다루기 때문에 안정성 또한 매우 떨어집니다. 우리는 이러한 문제를 해결하기 위해 JIT 컴파일러를 Java로 작성하기로 했습니다. C나 C++같은 시스템 언어를 사용하지 않고 JIT 컴파일러를 어떻게 작성할 수 있는지 궁금할 수도 있는데, 따지고 보면 JIT 컴파일러는 오직 JVM 바이트 코드를 입력받아 기계어로 변환 할 수만 있으면 됩니다. 또한, 당신은 JIT 컴파일러에 바이트 배열(byte[])을 입력하면 다시 바이트 배열이 출력되길 원할 수도 있습니다. 이러한 모든 작업들을 Java로 처리하기 위해 많은 복잡한 작업을 해야 하겠지만, 어쨋든 순수하게 Java로 JIT 컴파일러를 작성할 수 있습니다. 그리고 순수한 Java로 이뤄진 JIT 컴파일러를 작성한다면 이 컴파일러는 더 이상 시스템과 관련이 없으므로 C나 C++과 같은 시스템 언어에 의존하지 않을 수 있게 됩니다.

<br />

JIT 컴파일러의 목적은 최적화가 잘 된 고품질의 기계어를 최대한 빠르게 생성해내는 것이며, 런타임에 얻을 수 있는 정보 덕분에 JIT 컴파일러는 javac 컴파일러보다 훨씬 더 정교한 최적화를 수행 할 수 있게 됩니다. 그리고 이러한 최적화는 애플리케이션의 성능을 더더욱 향상시킵니다.

JIT 컴파일러는 Java 메서드를 미리 수천 번 실행하여 JVM 바이트 코드 컴파일러가 Java 메서드를 "워밍업"할 수 있도록 합니다. 이 워밍업을 통해 컴파일러는 전체 클래스 계층 구조를 미리 관찰할 수 있기 때문에 최적화와 관련된 더 나은 결정을 내릴 수 있게 됩니다. 이 때, JIT 컴파일러는 JVM 바이트 코드 컴파일러가 수집한 분기 및 유형 프로필 정보도 검사할 수 있습니다.

하지만, 이러한 JIT 컴파일러의 발전에도 불구하고 Java 애플리케이션은 기계어를 직접(IR을 거치지 않고) 만들어내는 C 또는 Rust와 같은 언어보다 여전히 훨씬 느립니다. 이러한 바이트 코드 해석 프로세스는 IR을 거치지 않고 기계어를 직접 만들어내는 프로세스보다 애플리케이션을 상당히 느리게 만들 수 밖에 없습니다.

### Ahead of Time Compilation (AOT)

---

[📜 AOT 컴파일](https://en.wikipedia.org/wiki/Ahead-of-time_compilation){:target="_blank"}은 프로그램이 실행되기 전에 소스 코드를 기계어로 변환하는 방식으로 정적 
컴파일의 한 형태입니다. 이것은 C와 같은 오래된 프로그래밍 언어의 코드가 정적으로 링크되고 컴파일되는 "구형" 방식입니다. 컴파일의 결과로 얻어진 기계어는 특정 플랫폼에 맞게 
조정되며(단, 플랫폼에 종속됨) 매우 빠른 실행이 가능해집니다.

[📦 GraalVM](https://github.com/oracle/graal){:target="_blank"}은 JVM 바이트 코드에 고도로 최적화된 AOT 컴파일을 수행할 수 있습니다. GraalVM은 Java로 작성되었으며 `JVMCI`을 사용하여 HotspotVM과 통합됩니다. GraalVM 프로젝트의 초점은 최신 Java 애플리케이션에 더 좋은 성능과 더 나은 확장성을 제공하는 것입니다. 즉, 더 적은 오버헤드로 더 빠르게 실행되며 이는 더 적은 CPU와 메모리 리소스의 소비로 이어집니다. 따라서 GraalVM은 JVM과 함께 제공되는 기존 JIT 컴파일러보다 더 나은 대안이 됩니다.

<br />

JVMCI는 JVM에서 메타데이터를 읽고 JVM에 기계어를 삽입하는 것과 같은 기능을 위한 JVM에 대한 저수준 인터페이스입니다. Java로 작성된 컴파일러를 동적 컴파일러로 사용할 수 있습니다.
{:.note}

<br />

> "GraalVM의 도구로 생성된 `네이티브 이미지`에는 애플리케이션 클래스, 종속성 클래스, 런타임 라이브러리 클래스 및 JDK에 정적으로 연결된 기계어가 포함됩니다. JVM에서 실행되지 않지만 "Substrate VM"이라는 다른 런타임 시스템의 메모리 관리, 스레드 스케줄링 등과 같은 필수 구성 요소를 포함합니다. Substrate VM은 런타임 구성 요소(예: 디옵티마이저, 가비지 수집기 및 스레드 스케줄링)의 이름입니다. 결과 프로그램은 JVM에 비해 시작 시간이 더 빠르고 런타임 메모리 오버헤드가 더 적습니다."

<br />

다음 그림은 [📜 네이티브 이미지](https://www.graalvm.org/22.0/reference-manual/native-image/){:target="_blank"} 기술을 사용하는 GraalVM 컴파일러의 AOT 컴파일 프로세스를 보여줍니다. 

GraalVM은 애플리케이션, 라이브러리, JDK 및 JVM의 모든 클래스를 입력으로 받습니다. 그런 다음 고정된 지점에 도달할 때까지 [📜 최첨단 포인트 분석을 사용하여 반복적인 바이트 코드 검색이 수행됩니다](https://dl.acm.org/doi/abs/10.1145/3377555.3377885){:target="_blank"}. 이 프로세스 동안 모든 안전한 클래스는 정적으로 미리 [📜 초기화](https://docs.oracle.com/en/graalvm/enterprise/21/docs/reference-manual/native-image/ClassInitialization/){:target="_blank"}됩니다(즉, 인스턴스화됨). 초기화된 클래스의 클래스 데이터는 이미지 힙에 로드된 다음 독립 실행 파일(그림 2의 텍스트 섹션)에 저장됩니다. 그 결과 컨테이너에 직접 배송하거나 배포할 수 있는 실행 가능한 네이티브 이미지가 생성됩니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/179342041-b3e5af12-a78f-4cb5-84c1-b2e850e2579b.png)

그림 2. GraalVM의 기본 이미지 생성 프로세스 [출처](https://dl.acm.org/doi/10.1145/3360610){:target="_blank"}
{:.figcaption}

<br />

GraalVM의 AOT 컴파일은 JDK 및 해당 종속성에서 사용되지 않는 코드 제거, 힙 스냅샷 및 정적 코드 초기화와 같은 최적화를 적극적으로 수행하고, 독립 실행 파일을 생성합니다. 주요 이점은 실행 파일이 올바르게 실행되기 위해 클라이언트 시스템에 JVM을 설치할 필요가 없다는 것이며, 이것은 JVM 바이트 코드로 컴파일되는 프로그래밍 언어를 고성능 프로그램에 사용되는 C, C++, Rust 또는 Go와 같은 언어만큼 빠르게 만듭니다.

<br />

Go의 경우 처음부터 언어차원에서 가장 빠른 초기화가 구현되었습니다.
{:.note}

## JIT vs AOT

---

이제 바이트 코드 컴파일이 작동하는 방식과 두 가지 주요 전략(JIT 및 AOT)을 이해했으므로 어떤 접근 방식을 사용하는 것이 가장 좋은지 궁금할 것입니다. 불행히도 대답은 예상대로 <u>"그때 그때 다릅니다."</u> 

이 섹션에서는 각 방식의 장단점을 다룰 것입니다.

JIT 컴파일러는 프로그램을 크로스 플랫폼으로 만들어줍니다(즉, 플랫폼에 독립적이라는 의미). 실제로 [📜 "한번만 작성하면 어디에서나 실행 할 수 있다"](https://en.wikipedia.org/wiki/Write_once,_run_anywhere){:target="_blank"} 라는 슬로건은 90년대 후반에 Java를 대중적인 언어로 만든 기능 중 하나였습니다. JIT 컴파일러는 
동시 가비지 컬렉터를 사용하여 최대 처리량 조건에서 복원력을 높이는 기능 덕분에 STW를 짧게 가져갑니다.

반면에 AOT 컴파일러는 프로그램을 보다 효율적으로 실행하며, 이는 특히 클라우드 애플리케이션에 적합합니다. 네이티브 이미지는 더 빠른 시작 속도를 제공하므로 애플리케이션의 부팅 시간이 단축되고, 이는 클라우드 서비스의 Scale-out이 더욱 간편해지게 만듭니다. 또한, 클라우드에서 실행되는 Docker 컨테이너로 초기화된 마이크로서비스의 경우에 특히 유용합니다. 사용되지 않는 코드의 완전한 제거(클래스, 필드, 메서드, 분기) 덕분에 파일의 크기가 작아지기 때문에 결과적으로 컨테이너의 이미지도 작아집니다. 또한, 메모리 소비가 적기 때문에 동일한 메모리로 더 많은 컨테이너를 실행할 수 있으므로 클라우드 서비스의(AWS, GCP와 같은) 비용도 절감됩니다.

다음 스파이더 그래프는 주요 차이점을 보여줍니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/179342067-8a333618-ca43-485e-8304-e7bb6653b53f.png)

그림 3. AOT vs JIT. [출처](https://twitter.com/thomaswue/status/1145603781108928513?s=20&t=-6ufSBjc46mfN5d_6Y2-Rg){:target="_blank"}
{:.figcaption}

<br />

요약하면 GraalVM을 사용한 AOT 컴파일은 표준 JIT 컴파일에 비해 다음과 같은 이점을 제공합니다.

<br />

- JVM에 필요한 자원의 일부를 사용합니다.
- 애플리케이션이 밀리초 단위로 부팅됩니다.
- 워밍업 없이 최고의 성능을 즉시 제공합니다.
- 더 빠르고 효율적인 배포를 위해 경량 컨테이너 이미지로 패키징할 수 있습니다.
- 공격 표면이 감소됩니다.

### AOT 제 사항: Closed-World Assumption (CWA)

---

AOT 컴파일의 포인트 분석이 올바르게 작동하려면 모든 바이트 코드를 보아야 할 필요가 있습니다. 이러한 제약은 CWA 한정으로 알려져 있습니다. 즉, GraalVM의 네이티브 이미지 도구가 독립 실행 파일을 빌드할 때 런타임에 호출할 수 있는 응용 프로그램의 모든 바이트 코드와 종속성을 알아야 함을 의미합니다.

따라서 JNI(Java Native Interface), Java Reflection, 동적 프록시 개체(java.lang.reflect.Proxy) 또는 클래스 경로 리소스(Class.getResource)와 같은 동적 언어 기능이 지원되지 않습니다.

<br />

> [📜 Project Leyden: Beginnings - Oracle](https://openjdk.org/projects/leyden/notes/01-beginnings){:target="_blank"}

<br />

이러한 한계를 극복하기 위해 GraalVM은 일반 JVM에서 실행되는 모든 동적 언어 기능을 추적하는 [📜 에이전트](https://www.graalvm.org/22.0/reference-manual/native-image/Agent/){:target="_blank"}를 제공합니다. 실행하는 동안 에이전트는 JVM과 상호작용하며 클래스, 메서드, 필드, 리소스를 조회하거나 프록시 액세스를 요청하는 모든 호출을 가로챕니다. 그런 다음 에이전트 는 지정된 출력 디렉토리에 `jni-config.json`, `reflect-config.json`, `proxy-config.json` 및 `resource-config` 파일을 생성합니다. 이렇게 생성된 파일들은 가로채는 모든 동적 액세스를 포함하는 JSON 형식의 독립 실행형 구성 파일입니다. 이와 같은 명세 파일들은 네이티브 이미지 도구로 전달되며 네이티브 이미지 빌드 과정에서 사용된 클래스가 제거되지 않습니다.

CWA가 다양한 코드 주입 가능성을 제거하므로 보안에 좋다는 점은 언급할만한 가치가 있습니다(예로 2021년 웹 생태계에 큰 충격을 준 Log4j 취약점은 Java의 동적 클래스 로딩 메커니즘의 악용으로 인해 가능했습니다). 반면에 포인트 분석은 도달 가능한 모든 바이트 코드를 분석해야 하기 때문에 AOT 컴파일을 JIT보다 느리게 만듭니다. 즉, 이는 값비싼 계산 방식입니다.

## GraalVM과 AOT 컴파일은 Java의 미래인가요?

---

네이티브 클라우드 애플리케이션을 위한 AOT 컴파일의 이점으로 인해 이 기술에 대한 관심이 높아졌고(대표적으로 클라우드 + MSA의 성공적인 사례), 이제 Java 생태계는 이 기술을 적극적으로 채택하고 있습니다. 이 글을 작성하는 시점에서 4가지의 주요 프레임워크는 GraalVM의 이점을 활용하여 애플리케이션을 빌드하고 최적화합니다.

<br />

- [Quarkus (by RedHat)](https://quarkus.io/){:target="_blank"}
- [Micronaut (by The Micronaut Foundation)](https://micronaut.io/){:target="_blank"}
- [Helidon (by Oracle)](https://helidon.io/){:target="_blank"}
- [Spring Native (by Spring)](https://docs.spring.io/spring-native/docs/current/reference/htmlsingle/){:target="_blank"}

<br />

JVM 기반 네이티브 애플리케이션을 구축하는 일반적인 프로세스는 다음과 같습니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/179342137-dd8f55e9-86cf-435b-8bd0-ee474d3d8d82.png)

<br />

GraalVM을 사용한 AOT는 Java, Scala, Kotlin과 같은 JVM 기반 언어의 미래인 것 같습니다. 그러나 네이티브 이미지 생성은 애플리케이션의 바이트 코드와 모든 종속성을 분석해야 하기 때문에 종속성 중 하나 이상이 일부 동적인 기능에 의존하고 있는 경우 CWA를 위반할 위험이 있습니다. 커뮤니티는 이러한 위험성을 고려한 새 버전의 라이브러리를 만들고 있지만, 가장 널리 사용되는 Java 라이브러리에 대한 지원은 아직도 충분하지 않습니다. 

따라서 이 기술이 대규모로 채택되기까지는 아직 시간이 더 필요합니다.

<br />

기술 채택 지연은 기술 생태계에서 일반적인 현상입니다. Docker 컨테이너와 같은 핵심 기술은 2013년부터 사용 가능했지만 5년 후인 2018년에 이르러서야 대규모로 채택되기 시작했습니다.
{:.note}

## 결론

---

AOT 또는 JIT 접근 방식을 사용하여 JVM 바이트 코드를 기계어로 컴파일하는 것이 가능합니다.

각 방식이 서로 다른 상황에 적합하기 때문에 둘 중 하나가 다른 방식보다 좋다고 말하는 것은 잘못된 것입니다. 

GraalVM을 사용하면 AOT 컴파일로 고성능 애플리케이션을 구축할 수 있으므로 시작 시간이 단축되고 성능이 크게 향상됩니다. 이러한 이점은 CWA를 준수하는 대신 얻어집니다. 

반대로 개발자는 여전히 Hotspot VM에서 표준 JIT 컴파일러를 사용하여 런타임에 기계어 생성을 지원하는 동적 언어 기능을 사용할 수 있습니다.

## 참고

---

- [📜 Java is Going to the Moon: Native Images with GraalVM](https://docs.google.com/presentation/d/1JDVerE77ZWLqwtWP430QXF1KTd4RhKoD/edit?usp=sharing&ouid=117859204590242341300&rtpof=true&sd=true){:target="_blank"}
- [📜 Supporting Binary Compatibility with Static Compilation](https://www.usenix.org/legacy/publications/library/proceedings/jvm02/yu/yu_html/index.html){:target="_blank"}
- [📜 Initialize Once, Start Fast: Application Initialization at Build Time](https://dl.acm.org/doi/10.1145/3360610){:target="_blank"}
- [📜 Deep Dive Into the New Java JIT Compiler – Graal](https://www.baeldung.com/graal-java-jit-compiler){:target="_blank"}
- [📜 JEP 295: Ahead-of-Time Compilation](https://openjdk.java.net/jeps/295){:target="_blank"}
- [📜 Ahead of Time Compilation (AoT)](https://www.baeldung.com/ahead-of-time-compilation){:target="_blank"}

### 따로 참고한 것

---

- [📜 Understanding How Graal Works - a Java JIT Compiler Written in Java](https://chrisseaton.com/truffleruby/jokerconf17/){:target="_blank"}
- [📜 .NET 환경의 컴파일 과정 - CLR, CIL, JIT, AOT](https://rito15.github.io/posts/cs-dotnet-compile/){:target="_blank"}
- [📜 Scalable pointer analysis of data structures using semantic models](https://dl.acm.org/doi/abs/10.1145/3377555.3377885){:target="_blank"}
- [📜 Intermediate Representation](https://ko.wikipedia.org/wiki/%EC%A4%91%EA%B0%84_%ED%91%9C%ED%98%84){:target="_blank"}
- [📜 Static Single Assignment Form](https://en.wikipedia.org/wiki/Static_single-assignment_form){:target="_blank"}
- [📜 HotSpot Glossary of Terms](https://openjdk.org/groups/hotspot/docs/HotSpotGlossary.html){:target="_blank"}
- [📜 Sea of Nodes](https://darksi.de/d.sea-of-nodes/){:target="_blank"}
- [📜 https://en.wikipedia.org/wiki/Closed-world_assumption](https://en.wikipedia.org/wiki/Closed-world_assumption){:target="_blank"}
- [📜 Closed World Assumption (CWA; 닫힌 세계 가정)](https://redcarrot.tistory.com/52){:target="_blank"}

<br />
