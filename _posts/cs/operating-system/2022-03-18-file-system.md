---
layout: post
category:
  - cs
  - operating-system
title: 운영체제(Operating System) 9강
description: |
    반효경 교수님 - File System
image: /assets/img/cs/cs-logo.jpg
accent_image:
    background: url('/assets/img/cs/cs-logo.jpg') center/cover
related_posts:
  - _posts/cs/operating-system/2022-03-10-virtual-memory.md
  - _posts/cs/operating-system/2022-03-19-disk-management.md
published: true
---

* toc
{:toc}

<br />

# Lecture

---

- [운영체제 - 반효경 교수님](http://www.kocw.or.kr/home/cview.do?mty=p&kemId=1046323)
  - File Systems
  - File Systems Implementation 1
  - File Systems Implementation 2

<br />

# File and File System

---

- 파일
  - 이름이 있는 정보의 묶음
  - 일반적으로 비휘발성인 보조 기억 장치(HDD, SSD)에 저장
  - 운영체제는 다양한 저장 장치를 파일이라는 동일한 논리적 단위로 볼 수 있게 해 줌
  - 연산자(커널 함수, 이느 모두 시스템 콜을 동반한다)
    - create, read, write, reposition(lseek), delete, open, close 등
    - reposition(lseek): 위치를 변경 및 저장
    - open: 파일의 메타데이터를 메모리에 탑재
- 파일의 속성(메타데이터)
  - 파일 자체의 내용이 아니라 파일을 관리하기 위한 각종 정보
    - 파일의 이름, 유형, 저장된 위치, 파일 사이즈
    - 접근 권한(읽기/쓰기/실행), 시간(생성/변경/사용), 소유자 등
- 파일 시스템
  - 운영체제에서 파일을 관리하는 부분
  - 파일 및 파일의 메타데이터, 디렉토리 정보 등을 관리
  - 파일의 저장 방법 결정
  - 파일 보호 등

<br />

# Directory and Logical Disk

---

- 디렉토리
  - 파일의 메타데이터 중 일부를 보관하고 있는 일종의 특별한 `파일`
  - 그 디렉토리에 속한 파일 이름 및 파일의 속성
  - 연산자
    - search for a file, create a file, delete a file
    - list a directory, rename a file, traverse the file system
- 파티션 (=논리 디스크)
  - 하나의 물리 디스크 안에 여러 파티션을 두는 것이 일반적
  - 여러 개의 물리 디스크를 하나의 파티션으로 구성하기도 함
  - 물리 디스크를 파티션으로 구성한 뒤 각각의 파티션에 파일 시스템을 깔거나 스와핑(page 관련) 등 다른 용도로 사용할 수 있음

<br />

# `Open()`

---

![image](https://user-images.githubusercontent.com/71188307/158370138-d7b27c81-feb4-4761-92c1-bc6ae3c59068.png)

<br />

- open(/a/b/c)
  - 디스크로부터 파일 c의 메타데이터를 메모리로 가지고 옴
  - 이를 위하여 directory path를 탐색
    - 루트 디렉토리 `/` 를 open하고 그 안에서 파일 위치 `a` 의 위치를 획득
    - 파일 `a` 를 open한 후 read하여 그 안에서 파일 `b` 의 위치를 획득
    - 파일 `b` 를 open한 후 read하여 그 안에서 파일 `c` 의 위치를 획득
    - 파일 `c` 를 open
  - Directory path의 탐색에 너무 많은 시간 소요
    - 그래서 open을 read/write와 별도로 둠
    - 한 번 open한 파일은 read / write시 directory 탐색이 불필요
  - Open file table
    - 현재 open된 파일의 in memory 메타데이터 보관소
    - 디스크의 메타데이터보다 몇 가지 정보가 추가됨
      - open한 프로세스의 수
      - file offset: 파일 어느 위치를 접근 중인지 표시 (별도 테이블 필요)
  - File descriptor
    - Open file table에 대한 위치 정보 (프로세스 별)

<br />

## `Open()` 동작 과정

---

![image](https://user-images.githubusercontent.com/71188307/158371573-eceb904e-2975-45ae-a6bc-898c6f0f30c4.png)

<br />

1. root의 위치는 고정이기 때문에 즉시 알 수 있다. 디스크에 있던 root의 메타데이터가 메모리에 올라감
2. 메모리에 있는 root의 주소를 찾고, root에 존재하는 a의 메타데이터에 접근
3. a의 메타데이터를 메모리에 올림 (Open file table)
4. 메모리에 있는 a의 주소를 찾고, a에 존재하는 b의 메타데이터에 접근
5. b의 메타데이터를 메모리에 올림 (Open file table)
6. 메모리에 올라온 b의 메타데이터를 가르키는 포인터 값(file descriptor)를 open() 함수의 결과로 반환
7. 프로세스가 `open()` 함수의 반환 값을 전달 받음
8. `read()` 함수가 호출되면, open() 호출시 반환 받은 file descriptor 값을 이용하여 b의 컨텐츠를 읽고, 읽은 컨텐츠를 디스크 버퍼 캐시에 저장
9. 디스크 버퍼 캐시에 있는 b의 컨텐츠를 커널 메모리의 버퍼 캐시에 저장
10. 커널 메모리 버퍼 캐시에 있는 b의 컨텐츠를 사용자 메모리의 버퍼 캐시에 저장

<br />

- 파일 시스템에서는 메모리때와 다르게 LRU, LFU와 같은 알고리즘을 사용한 버퍼 캐싱이 가능하다
- 메모리 관리는 하드웨어들이 직접 하였기 때문에 운영체제가 관여할 수 없었지만, 파일 시스템의 경우 시스템 콜을 통해 진행이 되기 때문에, 운영체제가 관여할 수 있는 부분이 많다

<br />

# File Protection

---

![image](https://user-images.githubusercontent.com/71188307/158372059-1979c17e-1fe1-4419-8686-31d316047d05.png)

<br />

## Mounting of File System

---

![image](https://user-images.githubusercontent.com/71188307/158372128-b8597b49-d0d2-4169-b209-f2d549d02e1f.png)

<br />

- 각각의 파티션에 별도의 파일 시스템을 설치할 수 있다
- 한 파티션의 파일 시스템에서 다른 파티션의 파일 시스템에 접근하고 싶다면?

<br />

![image](https://user-images.githubusercontent.com/71188307/158372366-af06ede3-3b9f-4909-b238-8af701ab5c62.png)

<br />

- 마운팅을 통해 서로 다른 파티션에 있는 파일 시스템에 접근할 수 있다

<br />

# Access Method

---

![image](https://user-images.githubusercontent.com/71188307/158372593-b99041d7-9746-48b6-9915-9b13b52293b4.png)

<br />

# Allocation of File Data in Disk

---

- 모든 파일의 크기는 불규칙적이다
- 파일을 동일한 크기로 쪼개어 디스크에 sector(512byte) 단위로 저장한다
- 프로세스를 여러개의 페이지로 나눠 관리하던 메모리 관리를 떠올리면 이해가 쉽다
- 디스크에 파일 데이터를 할당하는 방식은 세가지가 존재한다
  - Contiguous Allocation
  - Linked Allocation
  - Indexed Allocation

<br />

## Contiguous Allocation

---

하나의 파일이 디스크 sector에 연속해서 저장되는 방식

<br />

![image](https://user-images.githubusercontent.com/71188307/158373315-eb9a904b-2144-42ed-86bd-02f8c7aed764.png)

<br />

- 장점
  - 매우 빠른 I/O
    - 디스크의 처리 시간은 디스크 헤드가 디스크 트랙의 특정 sector로 이동하는데 걸리는 시간이 전부
    - 파일이 연속적으로 위치하기 때문에 파일의 첫 sector에 한번만 seek/rotation하면 사실상 끝난다
    - 빠른 속도로 인해 Realtime 파일 용, 혹은 프로세스의 스와핑용으로 매우 적합(공간 효율성보다 시간 효율성이 중요한 시스템)
  - Direct Access(Random Access)가 가능
- 단점
  - 외부 단편화 발생
  - File grow가 어려움
    - 파일 생성시 얼마나 큰 hole을 할당할 것인가
    - gorw 가능 vs 낭비(내부 단편화 발생)

<br />

## Linked Allocation

---

하나의 파일이 불연속적인 디스크 sector에 나누어 저장되고, 각 sector가 하나의 노드가 되어 연결리스트 구조로 저장되는 방식

<br />

![image](https://user-images.githubusercontent.com/71188307/158374550-2291671b-b297-4e82-888b-b7059a1e4629.png)

<br />

- 장점
  -  외부 단편화 발생 안함
- 단점
  - 연결리스트 구조상 반드시 첫 요소부터 차례대로 읽어야 하므로 Random Access 불가
    - Reliability 문제
      - 한 sector가 고장나 다음 sector를 가리키는 포인터가 유실되면 많은 부분을 유실함
    - 포인터를 위한 공간(4byte)이 필요하므로 공간 효율성을 떨어뜨리게 된다 (512byte/sector - 4byte/pointer = 508byte/remaining sector)
  - 변형(Linked Allocation의 개선 버전)
    - File-allocation table (FAT) 파일 시스템
      - 포인터를 별도의 위치에 보관하여 신뢰성 문제와 공간 효율성 문제를 해결한 시스템

<br />

## Indexed Allocation

---

파일이 어디에 나눠져 있는지 인덱스를 기록 해 두는 sector(index block) 하나를 만들어 활용하는 방식

<br />

![image](https://user-images.githubusercontent.com/71188307/158375525-aa7d7fd5-e026-4c7e-92aa-e6a8da7e6b14.png)

<br />

- 장점
  - 외부 단편화가 발생하지 않음
  - Random Access 가능
- 단점
  - 작은 파일의 경우 공간이 낭비 됨(실제로 많은 파일들이 작다)
  - 매우 큰 파일의 경우 하나의 인덱스 블록이 부족할 수 있다
    - Linked Scheme
    - Multi-level Index

<br />

# UNIX 파일시스템의 구조

---

![image](https://user-images.githubusercontent.com/71188307/158376389-e2302f77-835e-4310-a4a0-65499bd547f3.png)

<br />

- Boot block
  - 모든 파일 시스템의 약속
  - 부팅에 필요한 정보를 담고 있는 블록
- Super block
  - 파일 시스템에 관한 총체적인 정보를 담고 있는 블록
  - 빈 블록, 사용 중인 블록, Inode 블록의 위치, Data 블록의 위치 등을 알려 주는 정보 갖고 있다
- Inode list (index node list)
  - `파일 이름을 제외한 파일의 모든 메타데이터`를 따로 저장
  - 파일 하나 당 Inode가 하나씩 할당되고, Inode는 파일의 메타데이터를 갖고 있다
  - 파일의 이름은 디렉토리가 가지고 있으며, 디렉토리는 파일의 이름과 Inode의 인덱스를 갖고 있다.
    - 이전 수업에서 디렉토리가 파일의 메타데이터를 모두 가지고 있다고 했는데, 유닉스 파일 시스템의 디렉토리는 파일의 이름과 Inode의 인덱스를 가지고 있다
  - direct block은 파일이 존재하는 인덱스를 저장하는 인덱스 블록이다
    - 파일의 크기가 크지 않다면 이 블록을 이용하여 파일에 접근할 수 있다
  - direct block으로 커버할 수 있는 크기보다 저장 용량이 큰 파일은 single indirect를 통해서 하나의 level을 두어서 저장하는 방식을 취하고, 그보다 더 큰 파일은 double indirect, 더 큰 파일은 triple indirect 방식을 취한다
- Data block
  - 파일의 실제 내용을 보관하는 블록
  - 이 중 디렉토리 파일은 자신의 디렉토리에 속한 파일들의 이름과 Inode 인덱스를 가지고 있다

<br />

# FAT File System

![image](https://user-images.githubusercontent.com/71188307/158576628-86d31a40-cc9a-4d1f-afba-91837456fee6.png)

<br />

- FAT 파일 시스템은 윈도우즈 계열에서 주로 사용
- 파일의 메타데이터 일부를 FAT에 저장하고, 나머지 정보는 디렉토리가 가지고 있음
- 위 이미지에서 217번이 첫 번째 블록인데, 다음 블록의 위치를 FAT에 별도로 관리
- FAT 테이블 전체를 메모리에 올려 놓았으므로 Linked Allocation의 단점(Random Access 불가, Reliability 문제, 공간 효율성 문제)을 전부 극복함
- FAT는 중요한 정보이므로 복제본을 만들어 두어야 함

<br />

## Free-Space Management

---

![image](https://user-images.githubusercontent.com/71188307/158577070-6c6e735f-e76c-498d-be8d-9e81469ff3a9.png)

<br />

## Directory Implementation

---

![image](https://user-images.githubusercontent.com/71188307/158577140-40309088-bc17-441e-b5a3-35edc8e5e3fd.png)

<br />

- 파일 메타데이터의 보관 위치
  - 디렉토리 내에 직접 보관
  - 디렉토리에는 포인터를 두고 다른 곳에 보관
    - Inode, FAT 등
- 긴 파일명 지원
  - <파일명, 파일 메타데이터>의 리스트에서 각 엔트리는 일반적으로 고정 크기
  - 하지만 파일명이 고정된 엔트리 길이보다 긴 경우 마지막 엔트리 내 파일명의 뒷 부분이 위치한 곳에 포인터를 둠
  - 파일명의 나머지 부분은 동일한 디렉토리 파일의 일부에 존재

<br />

## VFS and NFS

---

![image](https://user-images.githubusercontent.com/71188307/158577707-f4b596ba-af09-4386-bb1e-a64587bc2b72.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/158577633-3f3c84c8-e3e7-431f-8c17-3d3d16996e3b.png)

<br />

## Page Cache and Buffer Cache

---

![image](https://user-images.githubusercontent.com/71188307/158577800-d3b1ec22-6177-4829-9e1e-ad993e6f2e70.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/158577899-a53e1801-aa94-441e-9895-09cac7a798c9.png)

<br />

![image](https://user-images.githubusercontent.com/71188307/158578032-a7221738-e2b1-41cc-8bc1-cac4b62871c2.png)

<br />

## Execution of The Program

---

![image](https://user-images.githubusercontent.com/71188307/158578217-c3997efc-49d3-4cd6-bcd5-ece61eab73bf.png)

<br />

- 프로그램이 실행되면 실행 파일이 프로세스가 되며, 프로세스만의 독자적인 주소 공간이 만들어 진다.
- 이 공간은 코드, 데이터, 스택으로 구분되며 당장 사용될 부분은 물리 메모리에 올라가고, 당장 사용되지 않는 부분은 스왑 영역으로 내려간다.
- 이때 코드 부분은 이미 파일 시스템에 있기 때문에 스왑 영역에 내리지 않고, 필요 없으면 물리 메모리에서 지운다. 나중에 필요하면 파일 시스템에서 가져오면 된다.

<br />

### Memory Mapped I/O 수행

---

![image](https://user-images.githubusercontent.com/71188307/158578253-401cfd6f-9b9d-420b-b977-0a32d1e89ae1.png)

<br />

- 프로세스가 일반 데이터 파일을 I/O하고 싶을 수 있음
- 이때 `mmap()` 호출시 Memory Mapped I/O 방식으로 파일을 I/O 할 수 있고, `mmap()` 은 시스템 콜이 필요한 함수이므로 운영체제에 CPU의 제어권이 넘어감

<br />

![image](https://user-images.githubusercontent.com/71188307/158578317-0424b9c9-e559-48b5-9c77-c88b296298dc.png)

<br />

- 운영체제는 데이터 파일의 일부를 프로세스 메모리에 매핑한다
- 만약 데이터 파일이 매핑영역에 접근했을 때, 물리 메모리에 페이지가 올라와 있지 않다면 Page Fault가 발생
- 그렇지 않으면 가상 메모리의 매핑영역은 물리 메모리의 페이지 프레임과 일치되므로 프로세스가 데이터 파일에 대해 I/O 를 수행 하고 싶을 때 운영체제의 도움 없이 독자적으로 할 수 있다
- 물리 메모리에 올라간 데이터 파일과 매핑된 페이지 프레임을 swap out 할 때는 스왑 영역으로 옮기는 것이 아니라 수정사항을 파일 시스템에 적용하고 물리 메모리에서 제거
- 현재 프로세스 B가 데이터 파일에 대해 Memory Mapped I/O를 수행하여 물리 메모리에 페이지 프레임을 올려 두었으므로, 프로세스 A도 이 페이지 프레임을 공유하여 사용할 수 있다

<br />

### `read()` 수행

---

![image](https://user-images.githubusercontent.com/71188307/158578328-1fca4829-e60e-415f-a79c-862537e88783.png)

<br />

- 프로세스가 일반적인 데이터 파일을 I/O 하기 위해 `read()` 함수를 호출할 수도 있다
- `read()` 함수는 메모리의 버퍼 캐시를 확인해야 하는데, 통합 버퍼 캐시 환경에서는 페이지 캐시가 버퍼 캐시 역할을 동시에 수행한다. 따라서, Memory Mapped I/O로 올라 간 페이지 캐시를 버퍼 캐시로 사용할 수 있다

<br />

![image](https://user-images.githubusercontent.com/71188307/158578348-8a5a3c2b-53dd-4c86-8edc-be5a1ff195c4.png)

<br />

- 운영체제는 버퍼 캐시에 있던 데이터를 복사하여 프로세스의 주소 공간에 할당한다

<br />

### Memory Mapped I/O vs `read()`

---

- Memory Mapped I/O
  - 가상 메모리에 올라온 영역이 파일이므로 시스템 콜 없이 I/O 작업을 할 수 있음
  - 페이지 캐시에 있는 내용을 복사할 필요가 없음
  - 여러 프로세스가 `mmap()` 을 사용하여 같은 영역을 공유하여 사용하면 일관성 문제가 발생할 수 있음
- `read()`
  - 운영체제에 의해 제어 됨
  - 페이지 캐시에 있는 내용을 복사해야 함
  - 여러 프로세스가 `read()` 를 사용해도 일관성 문제가 발생하지 않음

<br />
