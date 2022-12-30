---
layout: post
category:
    - spring
    - spring-boot
title: 스프링 부트의 이벤트 처리
description: |
  스트링 부트에서 `Event Driven` 방식의 처리를 어떻게 하는지 정리합니다.
image: /assets/img/spring/spring-boot/spring-boot-logo.png
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

`스프링 4.2` 이후로 이벤트 처리 방식이 아주 쉽게 바뀌었습니다.

만약 `스프링 부트 2+`를 사용하신다면 자연스럽게 구현체로 `스프링 5+`를 사용하실 것이기 때문에, 이 방식을 바로 적용하실 수 있습니다.

어떤 처리를 한 후 이벤트를 발생시키면, 해당 이벤트를 수신하는 리스너 객체가 특정한 처리를 해주는 것으로, 콜백이라고 생각하셔도 무방합니다.

기존에는 이러한 처리를 위해 스프링 패키지의 특정한 클래스를 상속해야만 하는 침투적인 방식이였다면, 이제는 `POJO`를 사용하는 비침투적인 방식으로 처리할 수 있습니다.

<br />

파일 업로드 요청이 들어오면 발생시킬 이벤트 객체입니다.

<br />

```java
// file: 'FileEvent'
@Data
@Builder
@ToString
public class FileEvent {

    private String eventId;
    private EventType type;
    private Map<String, Object> data;

    // 파일 업로드가 성공할 경우 발생시킬 이벤트입니다.
    public static FileEvent toCompleteEvent(final Map<String, Object> data) {
        return FileEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .type(EventType.COMPLETE)
                .data(data)
                .build();
    }

    // 파일 업로드가 실패할 경우 발생시킬 이벤트입니다.
    public static FileEvent toErrorEvent(final Map<String, Object> data) {
        return FileEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .type(EventType.ERROR)
                .data(data)
                .build();
    }

    public enum EventType {
        COMPLETE, ERROR
    }

}
```

<br />

```java
// file: 'FileEventPublisher'
@Component
@RequiredArgsConstructor
public class FileEventPublisher {

    // 스프링에서 제공하는 이벤트 퍼블리셔입니다.
    private final ApplicationEventPublisher publisher;

    // 파일 업로드 요청 발생 시 이벤트를 입력받아 리스너에 이벤트를 전달합니다.
    public void notify(final FileEvent fileEvent) {
        publisher.publishEvent(fileEvent);
    }

}
```

<br />

```java
// file: 'FileEventListener'
@Slf4j
@Component
public class FileEventListener {

    // 스프링에서 제공하는 애노테이션입니다. 해당 메서드가 이벤트를 수신하고 처리하는 리스너임을 명시합니다.
    // ApplicationEventPublisher가 FileEvent를 주입해주면 특정한 처리를 합니다. 
    @EventListener
    public void onFileEvent(final FileEvent fileEvent) {
        log.info("file event receive: {}", fileEvent);
    }

}
```

<br />

```java
// file: 'FileService'
@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final FileEventPublisher publisher;

    public void fileUpload(final Map<String, Object> data) {
        // 파일 업로드의 성공/실패 유무를 try-catch문을 통해 판단하고 처리합니다.
        try {
            log.info("file upload complete.");
            // 파일 업로드가 성공했으므로 성공 이벤트를 퍼블리셔에 전달합니다.
            publisher.notify(FileEvent.toCompleteEvent(data));
        } catch (Exception e) {
            log.error("file upload fail.", e);
            // 파일 업로드가 실패했으므로 실패 이벤트를 퍼블리셔에 전달합니다.
            publisher.notify(FileEvent.toErrorEvent(data));
        }
    }

}
```

<br />

테스트용으로 임의의 더미데이터를 입력해줬습니다. 

<br />

```java
@RestController
@RequiredArgsConstructor
public class FileApiController {

    private final FileService fileService;

    @GetMapping("/upload/image")
    public ResponseEntity<?> fileUpload() {
        fileService.fileUpload(Map.of("type", "image", "size", "5MB"));
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
```

<br />

해당 엔드포인트로 요청을 보내면 다음과 같이 처리됩니다.

<br />

```shell
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v2.5.4)

2021-09-15 16:46:57.068  INFO 292 --- [nio-8080-exec-1] io.olivahn.events.service.FileService   : file upload start.
2021-09-15 16:46:57.070  INFO 292 --- [nio-8080-exec-1] i.s.events.listener.FileEventListener    : file event receive: FileEvent(eventId=f4784967-0535-40c7-aa75-5bde0e385cfe, type=COMPLETE, data={size=5MB, type=image})
2021-09-15 16:46:57.074  INFO 292 --- [nio-8080-exec-1] io.olivahn.events.service.FileService   : file upload complete.
```

<br />
