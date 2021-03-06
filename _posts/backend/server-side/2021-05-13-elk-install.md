---
layout: post
category:
    - backend
    - server-side
date: 2021-05-13 22:22
title: Elasticsearch + Logstash + Kibana μ€μΉνκΈ°
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

# π μ°Έκ³ 

---

- [https://www.elastic.co/guide/en/logstash/current/config-setting-files.html](https://www.elastic.co/guide/en/logstash/current/config-setting-files.html)
- [https://www.elastic.co/guide/en/logstash/current/configuration.html](https://www.elastic.co/guide/en/logstash/current/configuration.html)
- [https://www.elastic.co/guide/en/logstash/current/logstash-settings-file.html](https://www.elastic.co/guide/en/logstash/current/logstash-settings-file.html)
- [https://www.elastic.co/guide/en/logstash/current/multiple-pipelines.html](https://www.elastic.co/guide/en/logstash/current/multiple-pipelines.html)
- [https://www.elastic.co/guide/en/logstash/current/logging.html#log4j2](https://www.elastic.co/guide/en/logstash/current/logging.html#log4j2)

<br />

# π νκ²½

---

|OS|WSL2-Ubuntu 20.04-x86_64|
|:---:|:---:|
|Elasticsearch|7.12.1|
|Logstash|7.12.1|
|Kibana|7.12.1|

<br />

# β Elasticsearch μ€μΉ

---

`Elasticsearch`λ κ²μμμ§μ΄λ©΄μ μΌμ’μ λ°μ΄ν°λ² μ΄μ€μ΄λ€.

μ£Όλ‘ μννλ κ²μ μΈλ±μ±κ³Ό μ μ¬μ΄λ€.

νλ§λλ‘ SELECTλ§ λλ SELECTμ μ΅μ νλ λ°μ΄ν°λ² μ΄μ€λΌκ³  μκ°νλ©΄ νΈνλ€.

μ€μΉ μ  OSμ νκ²½μ μμμΌ νλ€. λ§€μ° μ€μνλ€.

<br />

```shell
$ uname -a
Linux shirohoo 5.4.72-microsoft-standard-WSL2 #1 SMP Wed Oct 28 23:40:43 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
````

<br />

νμλ `x86_64`μ΄λ€.

μ λΉν μμΉμ μ€μΉλ₯Ό μμνλ€.

<br />

## π‘ μ€μΉ νμ΄μ§

---

> [https://www.elastic.co/kr/downloads/logstash](https://www.elastic.co/kr/downloads/logstash)

<br />

## π‘ LINUX X84_64

---

```shell
$ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.1-linux-x86_64.tar.gz
```

<br />

## π‘ LINUX AARCH64

---

```shell
$ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.1-linux-aarch64.tar.gz
```

<br />

μ μ κΈ°λ€λ¦°λ€.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbPduVF%2Fbtq4RNpd3qk%2FBs7CTzp0JpSm9zD3g4IRL0%2Fimg.png)

<br />

λ€μ λͺλ Ήμ΄λ₯Ό μλ ₯νμ¬ μμΆμ νΌλ€.

<br />

```shell
$ tar xvf elasticsearch-7.12.1-linux-x86_64.tar.gz
```

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcVDeLH%2Fbtq4RU9wfFd%2F7WxMXHZ8ULMu5SxjFKXba0%2Fimg.png)

<br />

μμΆνμΌμ μ΄μ  νμ μμΌλ μ­μ ν΄μ€μΌκ² λ€.

μ΄ ν¬μ€νμ λ³΄κ³  λ°λΌ νμλ λΆμ κ΅³μ΄ μ§μ°μ§ μμΌμλ λλ€.

κ°μΈμ μΈ μ΅κ΄μ΄λ€.

<br />

```shell
$ cd elasticsearch-7.12.1/
$ vi config/elasticsearch.yml
```

<br />

`Elasticsearch`μ μ μ²΄μ μΈ λμ μ€μ μ ν΄μ€λ€.

μλμ κ°μ΄ μ€μ ν΄μ£Όλλ‘ νλ€.

`μ€κ΄νΈ({})`λ‘ λ¬ΆμΈ λΆλΆλ§ μ€κ΄νΈλ₯Ό μ§μ°κ³  μ€μ ν΄μ£Όλ©΄ λλ€.

<br />

> μ : "{elasticsearch_host}" -> "my_elasticsearch"

<br />

`vim`μ μλ ₯λ°©λ²μ ν€λ³΄λ iλ₯Ό λλ₯΄λ©΄ INSERTλͺ¨λλ‘ λ³κ²½λμ΄ νΈμ§μ΄ κ°λ₯ν΄μ§λ€.

<br />

```shell
# -- Cluster --
cluster.name: {cluster_name}
node.name: {node_name}

# -- Paths --
path.data: {path}
path.logs: {path}

# -- network --
network.host: "{elasticsearch_host}" // μλΌμ€ν±μμΉλ₯Ό κ΅¬λνλ μλ²μ IPμ£Όμ
http.port: {elasticsearch_port} // default: 9200

# -- discovery --
discovery.seed_hosts: ["127.0.0.1", "[::1]"]

cluster.initial_master_nodes: ["{elasticsearch_host}"]
```

<br />

μ€μ μ μλ£νμμΌλ©΄ μ μ₯νκ³  λμ¨λ€.

μ μ₯ ν λμ€λ λ°©λ²μ ν€λ³΄λ `ESC`λ₯Ό μλ ₯νλ©΄ νΈμ§ λͺ¨λκ° μ’λ£λλ©°

μ΄ μνμμ `μ½λ‘ (:)` - `wq` - `ENTER`λ₯Ό μμλλ‘ μλ ₯νλ©΄ λλ€.

νμμ μ€μ μ μλμ κ°λ€.

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

κ³μ μ€μ νλ€.

μ΄λ²μ `Elasticsearch`μ κ΅¬λμ νμν μμλ€μ μ€μ ν΄μ€λ€.

<br />

```shell
$ sudo vi /etc/sysctl.conf
```

<br />

`Elasticsearch`λ λΆν κ³Όμ μ mmap μκ° 262,144 μ΄νμ΄λ©΄ μ€νλμ§ μλλ‘ λμ΄μλ€.

`vm.max_map_count` κ°μ μλΌμ€ν±μμΉκ° λμν  μ μλ μ΅μ κ°μΈ 262,144λ‘ μμ ν΄μ€λ€.

λ€μ μ½λλ₯Ό νμΌ μ΅νλ¨μ μΆκ°νλ€.

<br />

```shell
vm.max_map_count=262144 
```

<br />

μλ λͺλ Ήμ΄λ₯Ό μλ ₯νμ¬ μ΄ μ€μ μ μ μ©μμΌμ€λ€

<br />

```shell
# λ³κ²½λ΄μ­ μ μ©
$ sudo sysctl -p
vm.max_map_count = 262144
```

<br />

κ³μ μ§ννλ€.

<br />

```shell
$ sudo vi /etc/security/limits.conf
```

<br />

λ¦¬λμ€ μ¬μ©μκ° μ μ΄ν  μ μλ νλ‘μΈμ€μ κ°μλ₯Ό

`Elasticsearch`κ° μκ΅¬νλ μ¬μλλ‘ λλ €μ€λ€.

<br />

```shell
#μ΅νλ¨μ μΆκ°
{linux_user_name} - nofile 65536
{linux_user_name} - nproc 65536
{linux_user_name} - memlock unlimited
````

<br />

`Elasticsearch`λ₯Ό μ€νν΄λ³Έλ€.

<br />

```shell
$ pwd
/home/khan/elasticsearch-7.12.1

$ ./bin/elasticsearch
```

<br />

μ΄λ° μ λ° `warning`μ΄ λ° μ μλλ° μΌλ¨ `error`λ§ μμΌλ©΄ μκ΄μλ€.

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

μ μ μ€νλλκ² νμΈλμμΌλ©΄ CTRL+Cλ₯Ό μλ ₯νμ¬ μ’λ£νκ³  λΉ μ Έλμ¨λ€.

<br />

# β Logstash μ€μΉ

---

`Logstash`λ `Kafka`μ `Elasticsearch`λ₯Ό μλ `pipeline`μ­ν μ νλ€.

λλΆμ΄ λ°μ΄ν°λ₯Ό μ μ νλ μμλ κ°λ₯νλ€.

λ°μ΄ν° μ μ  μμ΄ λ¨μ§ pipeline μ©λλ‘ μ°κΈ° μν κ²½μ°λΌλ©΄ `Filebeat`λ₯Ό μ°λ κ²½μ°κ° λ§λ€κ³  νλ€.

<br />

## π‘ μ€μΉ νμ΄μ§

---

> [https://www.elastic.co/kr/downloads/logstash](https://www.elastic.co/kr/downloads/logstash)

<br />

## π‘ LINUX X84_64

---

```shell
$ wget https://artifacts.elastic.co/downloads/logstash/logstash-7.12.1-linux-x86_64.tar.gz
```

<br />

## π‘ LINUX AARCH64

---

```shell
$ wget https://artifacts.elastic.co/downloads/logstash/logstash-7.12.1-linux-aarch64.tar.gz
```

<br />

λ€μ΄λ‘λκ° μλ£λμμΌλ©΄ μμΆμ νΌ ν ν΄λμ μ§μνλ€.

μ­μ νμλ μμΆμ νκ³ λ ν μμΆνμΌμ μ­μ ν  κ²μ΄λ€.

<br />

```shell
$ pwd
/home/khan/

$ tar xvf logstash-7.12.1-linux-x86_64.tar.gz

$ cd logstash-7.12.1/
```

<br />

`Logstash`μ μ μ²΄μ μΈ μ€μ μ λ€μ΄κ°λ€.

pipelineμ΄ μ μλ `first_elasticsearch_pipeline.conf` νμΌμ λ§λ€μ΄ μ¬μ©ν  κ²μ΄λ€.

<br />

```shell
$ vi config/logstash.yml

# μ λΉν κ³³μ μΆκ°
path.config: "/{logstash_path}/config/first_elasticsearch_pipeline.conf"
```

<br />

pipelineμ λͺμΈλ₯Ό λμΆ© μ μν΄μ€λ€.

<br />

```shell
$ vi config/pipelines.yml

# μ λΉν κ³³μ μΆκ°
- pipeline.id: first-log
  queue.type: persisted
  config.config: "/{logstash_path}/config/first_elasticsearch_pipeline.conf"
```

<br />

μ΄μ  pipelineμ΄ μ΄λ»κ² λμν  κ²μΈμ§ μ€μ ν΄μ€λ€.

νμμ κ²½μ° μ΄λ―Έ κ΅¬μΆν΄λ `Kafka`κ° μμ΄μ ν΄λΉ Kafkaμ μ λ³΄λ₯Ό μλ ₯ν΄μ€¬λ€.

μ½λλ₯Ό λ³΄μλ©΄ μκ² μ§λ§ λ¨μν Kafkaμ νΉμ  `topic`μ μ κ·Όνμ¬ λ°μ΄ν°λ₯Ό λ½μλ€κ°

μ΄λ₯Ό μ μν μΈλ±μ€ ν¨ν΄μΌλ‘ μΈλ±μ±νμ¬ `Elasticsearch`μ μ μ¬ν΄μ£Όλ λ°©μμ΄λ€.

<br />

```shell
# μ κ· νμΌ μμ±νλ©° μ§μ
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

## Logstashμμ Kafka μ μ μμ μΌλ‘ μ°λλλμ§ νμΈ

---

```shell
$ cd {kafka_directory} bin/kafka-run-class.sh kafka.tools.ConsumerOffsetChecker --bootstrap-server {kafka_host}:{kafka_port} --group logstash --topic {topic_name}
```

<br />

```shell
# κ²°κ³Ό
Group           Topic     Pid     Offset      logSize     Lag       Owner
consumer        logs       0       3           3           0         none
```

<br />

- Group : μ»¨μλ¨Έ κ·Έλ£Ή
- logSize : μ μ²΄ λ©μΈμ§ μ
- Offset : μλΉλ λ©μΈμ§ μ
- Log : λ¨μ λ©μΈμ§ μ

<br />

μ΄μ  `Logstash`κ° μ λλ‘ μ€μΉλμλμ§ μ€νν΄λ³Έλ€.

<br />

```shell
$ ./bin/logstash
```

<br />

μ­μ `error`κ° λ³΄μ΄μ§ μλλ€λ©΄ `CTRL+C`λ₯Ό μλ ₯νμ¬ μ’λ£νκ³  λΉ μ Έλμ¨λ€.

<br />

# β Kibana μ€μΉ

---

`Kibana`λ `Elasticsearch`μ μΈλ±μ±λμ΄ μ μ¬λ λ°μ΄ν°λ₯Ό λ³΄κΈ° μ’κ² μκ°νν΄μ£Όλ μ­ν μ νλ€.

μμμ λ³ λ¬Έμ μμ΄ μ§νλμλ€λ©΄ μ€μ  λν λ§€μ° κ°λ¨νλ€.

<br />

## π‘ μ€μΉ νμ΄μ§

---

> [https://www.elastic.co/kr/downloads/kibana](https://www.elastic.co/kr/downloads/kibana)

<br />

## π‘ LINUX X84_64

---

```shell
$ wget https://artifacts.elastic.co/downloads/kibana/kibana-7.12.1-linux-x86_64.tar.gz
```

<br />

## π‘ LINUX AARCH64

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

`Kibana`λ₯Ό μ€νν΄λ³Έλ€.

λ¨Όμ  `Elasticsearch`λ₯Ό λ°±κ·ΈλΌμ΄λλ‘ μ€νν΄μ€λ€.

<br />

```shell
$ ./bin/elasticsearch -d
```

<br />

μ΄μ΄μ `Kibana`λ₯Ό μ€νν΄λ³Έλ€.

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

`listening`μ΄ λ¨λ©΄ μ±κ³΅μ΄λ€.

μ°μ  μ λλ‘ μ°κ²°μ΄ λλμ§ νμΈν΄λ³΄μ.

<br />

```shell
curl -XGET 'http://{elasticsearch_host}:{elasticsearch_port}/{index}/_search?pretty&pretty'

# μμ
$ curl -XGET 'http://127.0.0.1:9200/server-status-*/_search?pretty&pretty'
```

<br />

μ€μ μ΄ μ λλ‘ λμλ€λ©΄

μ¬λ¬κ°μ§ λ°μ΄ν°κ° νμ΄λμ¬κ²μ΄λ€.

μ΄μ  μ½μμ μΆλ ₯λ κ²½λ‘μ μΉλΈλΌμ°μ λ‘ μ κ·Όν΄λ³΄λ©΄...

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fv4h8r%2Fbtq4ScvoHlh%2FbTt3EUZwiW13qEC6aQWb8k%2Fimg.png)

<br />

`CTRL+C`λ₯Ό μλ ₯νμ¬ `Kibana`λ₯Ό μ’λ£νκ³  λΉ μ Έλμ¨λ€.

`Elasticsearch`λ μ΄λ―Έ λ°±κ·ΈλΌμ΄λμ μ€νλμ΄ μμΌλ

`Logstash`μ `Kibana`λ₯Ό λ°±κ·ΈλΌμ΄λλ‘ μ€νν΄μ€ κ²μ΄λ€.

<br />

```shell
$ pwd
/home/khan/logstash-7.12.1

# background μ€ν
$ bin/logstash &
 
$ pwd
/home/khan/kibana-7.12.1-linux-x86_64

# background μ€ν
$ bin/kibana &
```

<br />

μ΄μ  λ€μ `Kibana`μ μ μνλ€.

`Kibana`λ `Elasticsearch`μ μ λ ¬λμ΄ μ μ¬λ λ°μ΄ν°λ₯Ό μκ°νν΄μ£Όλ―λ‘

`Elasticsearch`μ μ μ¬λμ΄ μλ μΈλ±μ€μ λν μ λ³΄λ₯Ό μλ ₯ν΄μ€ κ²μ΄λ€.

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

`pipeline output`μ μλ ₯νλ μΈλ±μ€ ν¨ν΄μ μλ ₯ν΄μ€λ€.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FGql83%2Fbtq4O9zEuKt%2FYC2IBfHoT7Vc9zA26yYRw1%2Fimg.png)

<br />

λλ¨Έμ§λ λμΆ© μλ ₯ν΄μ£Όκ³  λκΈ΄ ν

λ©μΈ νμ΄μ§λ‘ μ΄λνλ€.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FUbG8c%2Fbtq4UrZEU9i%2FWRXynTkBnZFP2lW63f7z80%2Fimg.png)

<br />

νμκ° κ°λ°ν μΉμ±μ λ‘κ·Έλ₯Ό Kafkaλ‘ λ³΄λ΄κ² μ€μ νκ³ ,

κΈλ°© κ΅¬μΆν `ELK`λ₯Ό Kafkaμ μ°λνλ€.

μΉμ±μ΄ λ³΄λΈ λ‘κ·Έλ₯Ό `Kibana`κ° μκ°νν΄μ λ³΄μ¬μ£Όκ³  μλ λͺ¨μ΅μ΄λ€.

<br />

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcsuVbN%2Fbtq4OgTiXeu%2FKiYEHepI25TKKm4PU8KPrk%2Fimg.png)

<br />
