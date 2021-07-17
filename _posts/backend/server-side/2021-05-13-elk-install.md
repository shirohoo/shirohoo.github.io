---
layout: post
category:
    - backend
    - server-side
date: 2021-05-13 22:22
title: Elasticsearch + Logstash + Kibana 설치하기
description: >
    ELK Stack
image: /assets/img/common/code1.png
accent_image:
    background: url('/assets/img/common/code1.png') center/cover
related_posts:
    - 
---

* toc
{:toc}

<br />

# 📕 참고

---

- [https://www.elastic.co/guide/en/logstash/current/config-setting-files.html](https://www.elastic.co/guide/en/logstash/current/config-setting-files.html)
- [https://www.elastic.co/guide/en/logstash/current/configuration.html](https://www.elastic.co/guide/en/logstash/current/configuration.html)
- [https://www.elastic.co/guide/en/logstash/current/logstash-settings-file.html](https://www.elastic.co/guide/en/logstash/current/logstash-settings-file.html)
- [https://www.elastic.co/guide/en/logstash/current/multiple-pipelines.html](https://www.elastic.co/guide/en/logstash/current/multiple-pipelines.html)
- [https://www.elastic.co/guide/en/logstash/current/logging.html#log4j2](https://www.elastic.co/guide/en/logstash/current/logging.html#log4j2)

<br />

# 📕 환경

---

|OS|WSL2-Ubuntu 20.04-x86_64|
|:---:|:---:|
|Elasticsearch|7.12.1|
|Logstash|7.12.1|
|Kibana|7.12.1|

<br />

# ✅ Elasticsearch 설치

---

`Elasticsearch`는 검색엔진이면서 일종의 데이터베이스이다.

주로 수행하는 것은 인덱싱과 적재이다.

한마디로 SELECT만 되는 SELECT에 최적화된 데이터베이스라고 생각하면 편하다.

설치 전 OS의 환경을 알아야 한다. 매우 중요하다.

<br />

```shell
$ uname -a
Linux shirohoo 5.4.72-microsoft-standard-WSL2 #1 SMP Wed Oct 28 23:40:43 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
````

<br />

필자는 `x86_64`이다.

적당한 위치에 설치를 시작한다.

<br />

## 💡 설치 페이지

---

> [https://www.elastic.co/kr/downloads/logstash](https://www.elastic.co/kr/downloads/logstash)

<br />

## 💡 LINUX X84_64

---

```shell
$ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.1-linux-x86_64.tar.gz
```

<br />

## 💡 LINUX AARCH64

---

```shell
$ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.1-linux-aarch64.tar.gz
```

<br />

잠시 기다린다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbPduVF%2Fbtq4RNpd3qk%2FBs7CTzp0JpSm9zD3g4IRL0%2Fimg.png)

<br />

다음 명령어를 입력하여 압축을 푼다.

<br />

```shell
$ tar xvf elasticsearch-7.12.1-linux-x86_64.tar.gz
```

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcVDeLH%2Fbtq4RU9wfFd%2F7WxMXHZ8ULMu5SxjFKXba0%2Fimg.png)

<br />

압축파일은 이제 필요 없으니 삭제해줘야겠다.

이 포스팅을 보고 따라 하시는 분은 굳이 지우지 않으셔도 된다.

개인적인 습관이다.

<br />

```shell
$ cd elasticsearch-7.12.1/
$ vi config/elasticsearch.yml
```

<br />

`Elasticsearch`의 전체적인 동작 설정을 해준다.

아래와 같이 설정해주도록 한다.

`중괄호({})`로 묶인 부분만 중괄호를 지우고 설정해주면 된다.

<br />

> 예 : "{elasticsearch_host}" -> "my_elasticsearch"

<br />

`vim`의 입력방법은 키보드 i를 누르면 INSERT모드로 변경되어 편집이 가능해진다.

<br />

```shell
# -- Cluster --
cluster.name: {cluster_name}
node.name: {node_name}

# -- Paths --
path.data: {path}
path.logs: {path}

# -- network --
network.host: "{elasticsearch_host}" // 엘라스틱서치를 구동하는 서버의 IP주소
http.port: {elasticsearch_port} // default: 9200

# -- discovery --
discovery.seed_hosts: ["127.0.0.1", "[::1]"]

cluster.initial_master_nodes: ["{elasticsearch_host}"]
```

<br />

설정을 완료하였으면 저장하고 나온다.

저장 후 나오는 방법은 키보드 `ESC`를 입력하면 편집 모드가 종료되며

이 상태에서 `콜론(:)` - `wq` - `ENTER`를 순서대로 입력하면 된다.

필자의 설정은 아래와 같다.

<br />

```shell
# ======================== Elasticsearch Configuration =========================
#
# NOTE: Elasticsearch comes with reasonable defaults for most settings.
#       Before you set out to tweak and tune the configuration, make sure you
#       understand what are you trying to accomplish and the consequences.
#
# The primary way of configuring a node is via this file. This template lists
# the most important settings you may want to configure for a production cluster.
#
# Please consult the documentation for further information on configuration options:
# https://www.elastic.co/guide/en/elasticsearch/reference/index.html
#
# ---------------------------------- Cluster -----------------------------------
#
# Use a descriptive name for your cluster:
#
# cluster.name: my-application
#
cluster.name: first_elasticsearch
#
# ------------------------------------ Node ------------------------------------
#
# Use a descriptive name for the node:
#
# node.name: node-1
#
node.name: es-node-1
#
# Add custom attributes to the node:
#
# node.attr.rack: r1
#
# ----------------------------------- Paths ------------------------------------
#
# Path to directory where to store the data (separate multiple locations by comma):
#
# path.data: /path/to/data
#
path.data: ~/es_base/data
#
# Path to log files:
#
# path.logs: /path/to/logs
#
path.logs: ~/es_base/logs
#
# ----------------------------------- Memory -----------------------------------
#
# Lock the memory on startup:
#
# bootstrap.memory_lock: true
#
# Make sure that the heap size is set to about half the memory available
# on the system and that the owner of the process is allowed to use this
# limit.
#
# Elasticsearch performs poorly when the system is swapping the memory.
#
# ---------------------------------- Network -----------------------------------
#
# By default Elasticsearch is only accessible on localhost. Set a different
# address here to expose this node on the network:
#
# network.host: 127.0.0.1
#
# By default Elasticsearch listens for HTTP traffic on the first free port it
# finds starting at 9200. Set a specific HTTP port here:
#
# http.port: 9200
#
# For more information, consult the network module documentation.
#
# --------------------------------- Discovery ----------------------------------
#
# Pass an initial list of hosts to perform discovery when this node is started:
# The default list of hosts is ["127.0.0.1", "[::1]"]
#
# discovery.seed_hosts: ["host1", "host2"]
#
discovery.seed_hosts: ["127.0.0.1", "[::1]"]
#
# Bootstrap the cluster using an initial set of master-eligible nodes:
#
# cluster.initial_master_nodes: ["node-1", "node-2"]
#
cluster.initial_master_nodes: ["127.0.0.1"]
#
# For more information, consult the discovery and cluster formation module documentation.
#
# ---------------------------------- Various -----------------------------------
```

<br />

계속 설정한다.

이번엔 `Elasticsearch`의 구동에 필요한 자원들을 설정해준다.

<br />

```shell
$ sudo vi /etc/sysctl.conf
```

<br />

`Elasticsearch`는 부팅 과정에 mmap 수가 262,144 이하이면 실행되지 않도록 되어있다.

`vm.max_map_count` 값을 엘라스틱서치가 동작할 수 있는 최소 값인 262,144로 수정해준다.

다음 코드를 파일 최하단에 추가한다.

<br />

```shell
vm.max_map_count=262144 
```

<br />

아래 명령어를 입력하여 이 설정을 적용시켜준다

<br />

```shell
# 변경내역 적용
$ sudo sysctl -p
vm.max_map_count = 262144
```

<br />

계속 진행한다.

<br />

```shell
$ sudo vi /etc/security/limits.conf
```

<br />

리눅스 사용자가 제어할 수 있는 프로세스의 개수를

`Elasticsearch`가 요구하는 사양대로 늘려준다.

<br />

```shell
#최하단에 추가
{linux_user_name} - nofile 65536
{linux_user_name} - nproc 65536
{linux_user_name} - memlock unlimited
````

<br />

`Elasticsearch`를 실행해본다.

<br />

```shell
$ pwd
/home/khan/elasticsearch-7.12.1

$ ./bin/elasticsearch
```

<br />

이런 저런 `warning`이 뜰 수 있는데 일단 `error`만 없으면 상관없다.

<br />

```shell
[2021-05-13T20:56:13,898][INFO ][o.e.n.Node               ] [es-node-1] initialized
[2021-05-13T20:56:13,900][INFO ][o.e.n.Node               ] [es-node-1] starting ...
[2021-05-13T20:56:13,916][INFO ][o.e.x.s.c.f.PersistentCache] [es-node-1] persistent cache index loaded
[2021-05-13T20:56:14,011][INFO ][o.e.t.TransportService   ] [es-node-1] publish_address {127.0.0.1:9300}, bound_addresses {[::1]:9300}, {127.0.0.1:9300}
[2021-05-13T20:56:14,150][WARN ][o.e.b.BootstrapChecks    ] [es-node-1] max file descriptors [4096] for elasticsearch process is too low, increase to at least [65535]
[2021-05-13T20:56:14,158][INFO ][o.e.c.c.ClusterBootstrapService] [es-node-1] skipping cluster bootstrapping as local node does not match bootstrap requirements: [192.168.0.1]
[2021-05-13T20:56:24,167][WARN ][o.e.c.c.ClusterFormationFailureHelper] [es-node-1] master not discovered yet, this node has not previously joined a bootstrapped (v7+) cluster, and this node must discover master-eligible nodes [192.168.0.1] to bootstrap a cluster: have discovered [{es-node-1}{Q59cZ2_jTFeb_LoPG1eZsQ}{ac1qydF0Rayti-2_HcvapA}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}{ml.machine_memory=26878091264, xpack.installed=true, transform.node=true, ml.max_open_jobs=20, ml.max_jvm_size=1037959168}]; discovery will continue using [] from hosts providers and [{es-node-1}{Q59cZ2_jTFeb_LoPG1eZsQ}{ac1qydF0Rayti-2_HcvapA}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}{ml.machine_memory=26878091264, xpack.installed=true, transform.node=true, ml.max_open_jobs=20, ml.max_jvm_size=1037959168}] from last-known cluster state; node term 0, last-accepted version 0 in term 0
[2021-05-13T20:56:34,172][WARN ][o.e.c.c.ClusterFormationFailureHelper] [es-node-1] master not discovered yet, this node has not previously joined a bootstrapped (v7+) cluster, and this node must discover master-eligible nodes [192.168.0.1] to bootstrap a cluster: have discovered [{es-node-1}{Q59cZ2_jTFeb_LoPG1eZsQ}{ac1qydF0Rayti-2_HcvapA}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}{ml.machine_memory=26878091264, xpack.installed=true, transform.node=true, ml.max_open_jobs=20, ml.max_jvm_size=1037959168}]; discovery will continue using [] from hosts providers and [{es-node-1}{Q59cZ2_jTFeb_LoPG1eZsQ}{ac1qydF0Rayti-2_HcvapA}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}{ml.machine_memory=26878091264, xpack.installed=true, transform.node=true, ml.max_open_jobs=20, ml.max_jvm_size=1037959168}] from last-known cluster state; node term 0, last-accepted version 0 in term 0
[2021-05-13T20:56:44,166][WARN ][o.e.n.Node               ] [es-node-1] timed out while waiting for initial discovery state - timeout: 30s
[2021-05-13T20:56:44,177][WARN ][o.e.c.c.ClusterFormationFailureHelper] [es-node-1] master not discovered yet, this node has not previously joined a bootstrapped (v7+) cluster, and this node must discover master-eligible nodes [192.168.0.1] to bootstrap a cluster: have discovered [{es-node-1}{Q59cZ2_jTFeb_LoPG1eZsQ}{ac1qydF0Rayti-2_HcvapA}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}{ml.machine_memory=26878091264, xpack.installed=true, transform.node=true, ml.max_open_jobs=20, ml.max_jvm_size=1037959168}]; discovery will continue using [] from hosts providers and [{es-node-1}{Q59cZ2_jTFeb_LoPG1eZsQ}{ac1qydF0Rayti-2_HcvapA}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}{ml.machine_memory=26878091264, xpack.installed=true, transform.node=true, ml.max_open_jobs=20, ml.max_jvm_size=1037959168}] from last-known cluster state; node term 0, last-accepted version 0 in term 0
[2021-05-13T20:56:44,179][INFO ][o.e.h.AbstractHttpServerTransport] [es-node-1] publish_address {127.0.0.1:9200}, bound_addresses {[::1]:9200}, {127.0.0.1:9200}
[2021-05-13T20:56:44,179][INFO ][o.e.n.Node               ] [es-node-1] started
```

<br />

정상 실행되는게 확인되었으면 CTRL+C를 입력하여 종료하고 빠져나온다.

<br />

# ✅ Logstash 설치

---

`Logstash`는 `Kafka`와 `Elasticsearch`를 잇는 `pipeline`역할을 한다.

더불어 데이터를 정제하는 작업도 가능하다.

데이터 정제 없이 단지 pipeline 용도로 쓰기 위한 경우라면 `Filebeat`를 쓰는 경우가 많다고 한다.

<br />

## 💡 설치 페이지

---

> [https://www.elastic.co/kr/downloads/logstash](https://www.elastic.co/kr/downloads/logstash)

<br />

## 💡 LINUX X84_64

---

```shell
$ wget https://artifacts.elastic.co/downloads/logstash/logstash-7.12.1-linux-x86_64.tar.gz
```

<br />

## 💡 LINUX AARCH64

---

```shell
$ wget https://artifacts.elastic.co/downloads/logstash/logstash-7.12.1-linux-aarch64.tar.gz
```

<br />

다운로드가 완료되었으면 압축을 푼 후 폴더에 진입한다.

역시 필자는 압축을 풀고난 후 압축파일을 삭제할 것이다.

<br />

```shell
$ pwd
/home/khan/

$ tar xvf logstash-7.12.1-linux-x86_64.tar.gz

$ cd logstash-7.12.1/
```

<br />

`Logstash`의 전체적인 설정에 들어간다.

pipeline이 정의된 `first_elasticsearch_pipeline.conf` 파일을 만들어 사용할 것이다.

<br />

```shell
$ vi config/logstash.yml

# 적당한 곳에 추가
path.config: "/{logstash_path}/config/first_elasticsearch_pipeline.conf"
```

<br />

pipeline의 명세를 대충 정의해준다.

<br />

```shell
$ vi config/pipelines.yml

# 적당한 곳에 추가
- pipeline.id: first-log
  queue.type: persisted
  config.config: "/{logstash_path}/config/first_elasticsearch_pipeline.conf"
```

<br />

이제 pipeline이 어떻게 동작할 것인지 설정해준다.

필자의 경우 이미 구축해둔 `Kafka`가 있어서 해당 Kafka의 정보를 입력해줬다.

코드를 보시면 알겠지만 단순히 Kafka의 특정 `topic`에 접근하여 데이터를 뽑아다가

이를 정의한 인덱스 패턴으로 인덱싱하여 `Elasticsearch`에 적재해주는 방식이다.

<br />

```shell
# 신규 파일 생성하며 진입
$ vi config/first_elasticsearch_pipeline.conf

input {
  kafka {
    bootstrap_servers => "{kafka_host}:{kafka_port}"
    group_id => "{group_id}"
    topics => "{kafka_topic}"
    consumer_threads => 1
    decorate_events => true
    }
}

output {
  elasticsearch{
        hosts => "{elasticsearch_host}:{elasticsearch_port}"
        index => "server-status-%{+YYYY.MM.dd}"
  }
}
```

<br />

## Logstash에서 Kafka 에 정상적으로 연동됐는지 확인

---

```shell
$ cd {kafka_directory} bin/kafka-run-class.sh kafka.tools.ConsumerOffsetChecker --bootstrap-server {kafka_host}:{kafka_port} --group logstash --topic {topic_name}
```

<br />

```shell
# 결과
Group           Topic     Pid     Offset      logSize     Lag       Owner
consumer        logs       0       3           3           0         none
```

<br />

- Group : 컨슈머 그룹
- logSize : 전체 메세지 수
- Offset : 소비된 메세지 수
- Log : 남은 메세지 수

<br />

이제 `Logstash`가 제대로 설치되었는지 실행해본다.

<br />

```shell
$ ./bin/logstash
```

<br />

역시 `error`가 보이지 않는다면 `CTRL+C`를 입력하여 종료하고 빠져나온다.

<br />

# ✅ Kibana 설치

---

`Kibana`는 `Elasticsearch`에 인덱싱되어 적재된 데이터를 보기 좋게 시각화해주는 역할을 한다.

앞에서 별 문제없이 진행되었다면 설정 또한 매우 간단하다.

<br />

## 💡 설치 페이지

---

> [https://www.elastic.co/kr/downloads/kibana](https://www.elastic.co/kr/downloads/kibana)

<br />

## 💡 LINUX X84_64

---

```shell
$ wget https://artifacts.elastic.co/downloads/kibana/kibana-7.12.1-linux-x86_64.tar.gz
```

<br />

## 💡 LINUX AARCH64

---

```shell
$ wget https://artifacts.elastic.co/downloads/kibana/kibana-7.12.1-linux-aarch64.tar.gz
````

<br />

```shell
$ pwd
/home/khan/

$ tar xvf kibana-7.12.1-linux-x86_64.tar.gz

$ cd kibana-7.12.1-linux-x86_64/
```

<br />

```shell
$ vi config/kibana.yml

server.port: 5601
server.host: "0.0.0.0"

elasticsearch.hosts: "http://{elasticsearch_host}:{elasticsearch_port}/"
```

<br />

`Kibana`를 실행해본다.

먼저 `Elasticsearch`를 백그라운드로 실행해준다.

<br />

```shell
$ ./bin/elasticsearch -d
```

<br />

이어서 `Kibana`를 실행해본다.

<br />

```shell
$ ./bin/kibana
```

<br />

```shell
  log   [21:44:08.687] [info][listening] Server running at http://0.0.0.0:5601
  log   [21:44:09.063] [info][server][Kibana][http] http server running at http://0.0.0.0:5601
  log   [21:44:09.174] [info][plugins][watcher] Your basic license does not support watcher. Please upgrade your license.
  log   [21:44:09.179] [info][crossClusterReplication][plugins] Your basic license does not support crossClusterReplication. Please upgrade your license.
  log   [21:44:09.191] [info][kibana-monitoring][monitoring][monitoring][plugins] Starting monitoring stats collection
  log   [21:44:12.559] [info][plugins-system] Stopping all plugins.
  log   [21:44:12.561] [info][kibana-monitoring][monitoring][monitoring][plugins] Monitoring stats collection is stopped
```

<br />

`listening`이 뜨면 성공이다.

우선 제대로 연결이 됐는지 확인해보자.

<br />

```shell
curl -XGET 'http://{elasticsearch_host}:{elasticsearch_port}/{index}/_search?pretty&pretty'

# 예시
$ curl -XGET 'http://127.0.0.1:9200/server-status-*/_search?pretty&pretty'
```

<br />

설정이 제대로 되었다면

여러가지 데이터가 튀어나올것이다.

이제 콘솔에 출력된 경로에 웹브라우저로 접근해보면...

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fv4h8r%2Fbtq4ScvoHlh%2FbTt3EUZwiW13qEC6aQWb8k%2Fimg.png)

<br />

`CTRL+C`를 입력하여 `Kibana`를 종료하고 빠져나온다.

`Elasticsearch`는 이미 백그라운드에 실행되어 있으니

`Logstash`와 `Kibana`를 백그라운드로 실행해줄 것이다.

<br />

```shell
$ pwd
/home/khan/logstash-7.12.1

# background 실행
$ bin/logstash &
 
$ pwd
/home/khan/kibana-7.12.1-linux-x86_64

# background 실행
$ bin/kibana &
```

<br />

이제 다시 `Kibana`에 접속한다.

`Kibana`는 `Elasticsearch`에 정렬되어 적재된 데이터를 시각화해주므로

`Elasticsearch`에 적재되어 있는 인덱스에 대한 정보를 입력해줄 것이다.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FNsdHU%2Fbtq4R2mcHwc%2FN6xYRC3vvqo3Mc6NxeEPf1%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb4EPM5%2Fbtq4ToWqhVF%2FUEAw2I78MCZh70pf3efbDk%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcAZ1Zj%2Fbtq4SYKpOIJ%2FbknrjuWi0YLKIkQDFR7Ls0%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Funu55%2Fbtq4Ud8b5RR%2F1VH9DXiRhaSD9tuMjytGe1%2Fimg.png)

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbxbkWU%2Fbtq4OssuhDO%2F36ghlipfkl0DRoWoB6KT91%2Fimg.png)

<br />

`pipeline output`에 입력했던 인덱스 패턴을 입력해준다.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FGql83%2Fbtq4O9zEuKt%2FYC2IBfHoT7Vc9zA26yYRw1%2Fimg.png)

<br />

나머지는 대충 입력해주고 넘긴 후

메인 페이지로 이동한다.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FUbG8c%2Fbtq4UrZEU9i%2FWRXynTkBnZFP2lW63f7z80%2Fimg.png)

<br />

필자가 개발한 웹앱의 로그를 Kafka로 보내게 설정했고,

금방 구축한 `ELK`를 Kafka에 연동했다.

웹앱이 보낸 로그를 `Kibana`가 시각화해서 보여주고 있는 모습이다.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcsuVbN%2Fbtq4OgTiXeu%2FKiYEHepI25TKKm4PU8KPrk%2Fimg.png)

<br />
