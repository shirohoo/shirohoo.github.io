---
layout: post
category:
    - ide
    - intellij
date: 2021-04-19 16:34
title: Json으로 DTO 자동 생성하기
description: >
    <u>DTO generator</u> 사용 방법을 알아봅니다
image: /assets/img/ide/Intellij.png
related_posts:
    - _posts/ide/intellij/2021-01-22-intellij-command.md
    - _posts/ide/intellij/2021-04-26-intellij-2021.1.md
---

* toc
{:toc}

&nbsp;  

`외부 API`를 통한 개발을 하다 보면 DTO를 직접 만들어야 하는 경우가 매우 많다.

근데 외부 API가 제공하는 필드가 수십개 이상이라면 DTO를 만드는 일 자체가 무지막지한 노가다가 되기 십상이다.

이때 인텔리제이를 사용하고 있다면 `DTO generator`라는 플러그인으로 이를 자동화 할 수 있다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbfE3iY%2Fbtq2P4Hfzz9%2Flfoy823q3koRYy8rCrL1RK%2Fimg.jpg)

Window 10 기준 단축키 `Alt + Insert` - `DTO from JSON`

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbBhUty%2Fbtq2SLAiBa6%2FqRQH0hVbCPNiBYO77rqsc0%2Fimg.jpg)

테스트를 위한 `임의의 JSON 을 생성`한다.

> [www.json-generator.com](https://www.json-generator.com/)

```json
[
  {
    "_id": "607d3156142c30528819d2a4",
    "index": 0,
    "guid": "70f0588d-d869-423c-8e4e-aaa8f3b5b91d",
    "isActive": true,
    "balance": "$2,004.25",
    "picture": "http://placehold.it/32x32",
    "age": 33,
    "eyeColor": "brown",
    "name": "Schmidt Macdonald",
    "gender": "male",
    "company": "MOLTONIC",
    "email": "schmidtmacdonald@moltonic.com",
    "phone": "+1 (815) 529-2108",
    "address": "570 Ferris Street, Greensburg, New Jersey, 780",
    "about": "Incididunt incididunt proident veniam irure enim ipsum et commodo proident occaecat aute nulla sit elit. Laboris Lorem aliquip et pariatur laborum id commodo excepteur cillum irure cupidatat minim. Enim do ut sint dolore qui amet eu cillum sunt incididunt consectetur.\r\n",
    "registered": "2014-06-17T12:07:21 -09:00",
    "latitude": -30.624318,
    "longitude": 165.328733,
    "tags": [
      "sit",
      "in",
      "ex",
      "ex",
      "quis",
      "dolor",
      "ut"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Luann Wallace"
      },
      {
        "id": 1,
        "name": "Finley Juarez"
      },
      {
        "id": 2,
        "name": "Morris Richards"
      }
    ],
    "greeting": "Hello, Schmidt Macdonald! You have 2 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "607d3156c95b5860bac69af5",
    "index": 1,
    "guid": "2dbf28a7-6cef-42db-8a39-79cf867330ea",
    "isActive": false,
    "balance": "$1,832.38",
    "picture": "http://placehold.it/32x32",
    "age": 29,
    "eyeColor": "brown",
    "name": "Fay Yang",
    "gender": "female",
    "company": "FITCORE",
    "email": "fayyang@fitcore.com",
    "phone": "+1 (834) 432-2007",
    "address": "608 Fillmore Avenue, Day, California, 764",
    "about": "Nisi culpa occaecat dolore laborum pariatur excepteur minim in cillum sunt. Est non exercitation nostrud culpa. Aute irure elit mollit cillum occaecat ullamco laborum nisi incididunt voluptate deserunt magna fugiat aliqua. Nostrud eu do culpa mollit culpa consectetur ut quis cillum enim esse duis ea.\r\n",
    "registered": "2020-05-15T06:25:11 -09:00",
    "latitude": 30.702522,
    "longitude": -75.24621,
    "tags": [
      "consectetur",
      "labore",
      "nisi",
      "deserunt",
      "pariatur",
      "anim",
      "nulla"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Odessa Walls"
      },
      {
        "id": 1,
        "name": "Austin Wright"
      },
      {
        "id": 2,
        "name": "Dean Hensley"
      }
    ],
    "greeting": "Hello, Fay Yang! You have 10 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "607d31566edb6dc998d53c6f",
    "index": 2,
    "guid": "51e41d3f-aeb1-4c2e-b364-d8adafccf3ec",
    "isActive": true,
    "balance": "$3,686.37",
    "picture": "http://placehold.it/32x32",
    "age": 24,
    "eyeColor": "blue",
    "name": "Alice Key",
    "gender": "female",
    "company": "HELIXO",
    "email": "alicekey@helixo.com",
    "phone": "+1 (948) 433-3978",
    "address": "928 Sandford Street, Herlong, Indiana, 7905",
    "about": "Do dolore occaecat veniam ipsum velit mollit eiusmod laborum ipsum esse consectetur reprehenderit consectetur minim. Voluptate laboris duis sit minim. Aliquip deserunt eiusmod fugiat anim eiusmod nostrud nostrud anim consectetur.\r\n",
    "registered": "2019-06-09T05:21:11 -09:00",
    "latitude": 75.855307,
    "longitude": 114.791753,
    "tags": [
      "ullamco",
      "ad",
      "nostrud",
      "cillum",
      "mollit",
      "id",
      "deserunt"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Boyle Clayton"
      },
      {
        "id": 1,
        "name": "Lenora Ellis"
      },
      {
        "id": 2,
        "name": "Adele Cantrell"
      }
    ],
    "greeting": "Hello, Alice Key! You have 6 unread messages.",
    "favoriteFruit": "strawberry"
  },
  {
    "_id": "607d31562075cc4afd328069",
    "index": 3,
    "guid": "5ceb438d-62e1-4451-acdb-4a440a1aec4d",
    "isActive": false,
    "balance": "$2,019.58",
    "picture": "http://placehold.it/32x32",
    "age": 34,
    "eyeColor": "blue",
    "name": "Diana Mcmahon",
    "gender": "female",
    "company": "MARKETOID",
    "email": "dianamcmahon@marketoid.com",
    "phone": "+1 (952) 509-3778",
    "address": "779 Pilling Street, Allison, Texas, 7453",
    "about": "Consectetur sunt esse Lorem id in labore adipisicing pariatur ipsum officia exercitation cupidatat. Anim dolore nostrud commodo magna reprehenderit pariatur ea sunt dolor consectetur irure aliquip. Laborum occaecat nostrud cupidatat mollit et quis aliqua est amet.\r\n",
    "registered": "2016-04-09T02:15:05 -09:00",
    "latitude": 88.641443,
    "longitude": 138.585076,
    "tags": [
      "excepteur",
      "esse",
      "minim",
      "commodo",
      "deserunt",
      "veniam",
      "reprehenderit"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Angel Holman"
      },
      {
        "id": 1,
        "name": "Sherri Barrett"
      },
      {
        "id": 2,
        "name": "Shannon Morin"
      }
    ],
    "greeting": "Hello, Diana Mcmahon! You have 10 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "607d3156b24dd50ada66f36d",
    "index": 4,
    "guid": "11cce06b-71c6-4ca0-82bf-ae5fe4c773d9",
    "isActive": false,
    "balance": "$3,831.83",
    "picture": "http://placehold.it/32x32",
    "age": 31,
    "eyeColor": "blue",
    "name": "Camacho Vaughn",
    "gender": "male",
    "company": "ORBIFLEX",
    "email": "camachovaughn@orbiflex.com",
    "phone": "+1 (961) 513-3111",
    "address": "552 Buffalo Avenue, Kapowsin, Marshall Islands, 9553",
    "about": "Id aliquip consectetur dolore veniam dolor aliquip velit sunt anim cillum. In deserunt nostrud aute Lorem id minim ullamco ad consequat anim ex quis. Laborum nostrud do duis id consequat elit deserunt voluptate enim. Cupidatat eu eiusmod dolor dolor duis consequat aliquip. Pariatur et qui reprehenderit enim consectetur do dolor ea veniam eu. Ut officia velit consectetur id occaecat velit.\r\n",
    "registered": "2015-05-12T10:49:10 -09:00",
    "latitude": -6.862965,
    "longitude": -124.81059,
    "tags": [
      "exercitation",
      "sunt",
      "irure",
      "ut",
      "pariatur",
      "magna",
      "laboris"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Stevens Hamilton"
      },
      {
        "id": 1,
        "name": "Salazar Gutierrez"
      },
      {
        "id": 2,
        "name": "Benson Carney"
      }
    ],
    "greeting": "Hello, Camacho Vaughn! You have 2 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "607d31568c50f2ba61c44204",
    "index": 5,
    "guid": "e989d780-ae44-4708-8560-1937a4d3fe6b",
    "isActive": false,
    "balance": "$1,730.45",
    "picture": "http://placehold.it/32x32",
    "age": 37,
    "eyeColor": "blue",
    "name": "Mcneil Leach",
    "gender": "male",
    "company": "APPLIDECK",
    "email": "mcneilleach@applideck.com",
    "phone": "+1 (834) 580-2201",
    "address": "910 Bergen Court, Ventress, Idaho, 9545",
    "about": "Velit adipisicing voluptate qui labore do ipsum veniam pariatur. Reprehenderit aliqua tempor deserunt elit officia Lorem. Aliquip ex id eiusmod nulla. Lorem culpa pariatur est amet magna in cupidatat dolor nisi.\r\n",
    "registered": "2019-08-05T01:47:35 -09:00",
    "latitude": -1.124338,
    "longitude": -8.656636,
    "tags": [
      "ea",
      "velit",
      "culpa",
      "deserunt",
      "ea",
      "sunt",
      "fugiat"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Guy Stanley"
      },
      {
        "id": 1,
        "name": "Cathleen Diaz"
      },
      {
        "id": 2,
        "name": "Fitzgerald Sweeney"
      }
    ],
    "greeting": "Hello, Mcneil Leach! You have 8 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "607d315694e52cd3ec38645b",
    "index": 6,
    "guid": "38cb43d4-7a78-4c18-9349-ce83cfff0ecd",
    "isActive": false,
    "balance": "$2,836.65",
    "picture": "http://placehold.it/32x32",
    "age": 29,
    "eyeColor": "green",
    "name": "Hebert Williams",
    "gender": "male",
    "company": "KAGGLE",
    "email": "hebertwilliams@kaggle.com",
    "phone": "+1 (890) 411-2746",
    "address": "558 Glendale Court, Ticonderoga, Maryland, 2994",
    "about": "Aute esse voluptate laboris ipsum eiusmod est. Cupidatat consectetur occaecat id deserunt ex veniam dolor consectetur deserunt minim mollit labore eiusmod. Sint tempor nulla Lorem in aliquip. Ut qui laboris ut eiusmod deserunt cupidatat est Lorem. Sunt ad mollit elit est dolore ad. Excepteur cupidatat occaecat minim sunt qui reprehenderit laborum voluptate tempor sint pariatur sunt. Excepteur elit velit aute Lorem cillum laboris duis ad magna nulla fugiat.\r\n",
    "registered": "2021-02-16T07:06:25 -09:00",
    "latitude": -73.545452,
    "longitude": -47.98675,
    "tags": [
      "enim",
      "consequat",
      "veniam",
      "exercitation",
      "enim",
      "dolor",
      "est"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Gibson Leonard"
      },
      {
        "id": 1,
        "name": "Vance Wilcox"
      },
      {
        "id": 2,
        "name": "Jeannette Tanner"
      }
    ],
    "greeting": "Hello, Hebert Williams! You have 10 unread messages.",
    "favoriteFruit": "banana"
  }
]
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FvOxtW%2Fbtq2Xas6ZDo%2FZ15hcAIlPHwxMjvdTcabxk%2Fimg.jpg)

`Getter`와 `Setter`를 같이 생성하도록 체크할 수 있는데,

요즘은 대부분 `Lombok`을 사용하기 때문에 굳이 따로 생성할 필요는 없고,

생성 후에 `@Getter`, `@Setter`를 붙여주면 된다.

`Type`의 경우 필자가 사용하는 `Spring Boot`의 경우 `Jackson`이 기본으로 사용되므로 체크했다.

만약 `Gson`을 사용한다면 Gson을 체크해주면 될 것이다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fwbu7Q%2Fbtq2OpSqkL7%2FkkBhkvzQeoxPgPlSsJUgY1%2Fimg.jpg)

생성 후 `@JsonProperty` 가 달린 필드들이 자동으로 생성되는데,

이 플러그인의 단점으로 `메인 클래스`에 `abstract`가 선언되고,

`내부 클래스`에는 `static`이 선언되므로 이정도만 직접 수정해주고 사용하면 된다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbNrZRX%2Fbtq21en6DWX%2FnY85kJXqCJ20DzkOTBB2hK%2Fimg.jpg)

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbfxlye%2Fbtq2Xkh3Nqu%2FBTupCqFtpXZoix58u8LJB0%2Fimg.jpg)
