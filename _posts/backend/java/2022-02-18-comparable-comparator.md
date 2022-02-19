---
layout: post
category:
  - backend
  - java
title: Comparable & Comparator
description: | 
    자바에서 정렬시 객체를 비교하는 기준
image: /assets/img/backend/java.png
related_posts:
  - null
published: true
---

* toc
{:toc}

<br />

# 비교 기준

---

`Comparable`, `Comparator` 는 자바에서 객체 비교를 하는 방법을 제공하는 인터페이스입니다.

<br />

쉽게 생각해봅시다.

두 숫자 3과 5가 있습니다. 어떤 수가 더 클까요?

당연히 5가 더 큽니다. 이견의 여지가 없죠?

<br />

자 그럼 `학생1`과 `학생2`가 있습니다.

두 학생 중 어느 학생이 더 클까요?

이 질문에는 즉답을 할 수가 없습니다.

왜냐하면 두 학생간 크다 작다를 어떤 `기준`으로 판별할지에 대한 정보가 제공되지 않았기 때문입니다.

키로 비교를 할 것인지, 머리의 길이로 비교를 할 것인지, 몸무게로 비교를 할 것인지 등이요.

<br />

즉, 자바의 `원시 타입(primitive)`간의 비교는 어떤것이 더 크다 작다가 명백하지만, 객체간의 비교에서는 `어떤 기준`으로 비교 할 것인가에 대한 정의가 필요해지게 됩니다.

<br />

그리고 바로 이러한 `기준`을 제공해주는것이 `Comparable & Comparator` 인터페이스입니다.

그리고 두 인터페이스간에는 `사용 방법`이라는 명확한 차이가 존재합니다.

<br />

## Comparator

---

`Comparator`는 이름대로 `비교기`입니다. 

이 인터페이스의 명세를 먼저 살펴보겠습니다.

인터페이스가 아주 많은데, 중요한것은 `compare` 단 하나뿐입니다.

`compare`와 `equals`를 제외한 다른 추상메서드들은 `default`거나 `static`으로 선언돼있기 때문에 기본적으로 신경쓰지 않아도 무방하며, `equals`는 핵심인 객체간의 비교와는 상관이 없기 때문에 역시 신경쓰지 않아도 됩니다. (서로 다른 `Comparator`간의 비교를 의미합니다. 정확한 것은 javadoc을 참고하세요.)

<br />

```java
@FunctionalInterface
public interface Comparator<T> {
    int compare(T o1, T o2);
}
```

<br />

> Compares its two arguments for order. Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second. The implementor must ensure that signum(compare(x, y)) == -signum(compare(y, x)) for all x and y. (This implies that compare(x, y) must throw an exception if and only if compare(y, x) throws an exception.)
The implementor must also ensure that the relation is transitive: ((compare(x, y)>0) && (compare(y, z)>0)) implies compare(x, z)>0. Finally, the implementor must ensure that compare(x, y)==0 implies that signum(compare(x, z))==signum(compare(y, z)) for all z.

<br />

뭔가 설명이 많은데 중요한것은 아래 단 한 줄입니다.

<br />

> 두 인수를 비교합니다. 첫 번째 인수가 두 번째 인수보다 작다면 음의 정수, 같다면 0, 크다면 양의 정수를 반환합니다.

<br />

일단 코드를 봅시다.

<br />

```java
public record Student(Integer id) {}
```

<br />

```java
class StudentTests {
    List<Student> students;

    @BeforeEach
    void setUp() {
        students = IntStream.rangeClosed(1, 50)
                .mapToObj(Student::new)
                .toList();

        Collections.shuffle(students);
    }

    @Test
    void comparator() {
        Collections.sort(students, (o1, o2) -> 1); // Comparator 사용 (람다식)
    }
}
```

<br />

`Comparator`는 이렇게 위와 같이 정렬에 사용됩니다.

위 코드에서는 자바 컬렉션을 정렬할 때 사용하는 `Collections` 클래스를 사용하였으며, 마찬가지로 자바 배열을 정렬할 때 사용하는 `Arrays.sort`에도 `Comparator`를 인수로 하는 메서드가 오버로딩 되어 있습니다.

도입부에서도 언급한바와 같이, 정렬을 할 때 대상이 객체인 경우 명확한 기준을 통해 객체간의 비교가 되어야지만 정렬을 할 수가 있는데, 이 객체를 `어떤 기준`으로 비교 할 것인가라는 `책임`을 `동작 파라미터화`한 것이 `Comparator`와 `Comparable`이라고 정의 할 수 있습니다.

즉, 정렬 구현체들은 정렬만 하고, 정렬을 위한 객체 비교는 `Comparator`와 `Comparable`에 `위임`하는 것입니다.

<br />

따라서 개발자들은 `Comparator`와 `Comparable`를 오버라이딩하여 객체끼리 어떻게 비교 할 것인지를 정해주기만 하면 됩니다.

여기서 `Student`에는 `id`라는 속성이 있기 때문에 저는 `Student`끼리 비교할 때 `id`를 기준으로 비교하도록 하겠습니다.

정렬 구현체 입장에서는 간단합니다.

`Comparator.compare`에 정의된 `javadoc`과 정확히 동일한데, `Comparator.compare(student1, student2)`라고 호출했을 때,

<br />

- 결과로 -1이 나왔다면 첫번째 인수인 student1이 student2보다 작다는 것입니다.
- 결과로 0이 나왔다면 첫번째 인수인 student1과 student2는 같다는 것입니다.
- 결과로 1이 나왔다면 첫번째 인수인 student1이 student2보다 크다는 것입니다.

<br />

그리고 정렬 구현체는 `Comparator`가 내린 이러한 판단을 근거로 정렬을 할 수 있게 됩니다.

실제 사용 코드는 다음과 같이 됩니다.

<br />

```java
class StudentTests {
    List<Student> students;

    @BeforeEach
    void setUp() {
        students = IntStream.rangeClosed(1, 50)
            .mapToObj(Student::new)
            .toList();

        Collections.shuffle(students);
    }

    @Test
    void comparator() {
        Collections.sort(students, (s1, s2) -> s1.id() - s2.id());
    }
}

```

<br />

여기서 알아야 할 것이 한가지 있습니다.

대부분의 컴퓨팅 시스템은 기본적으로 `오름차순(ASC)`을 기준으로 구현이 돼있습니다. 

이는 자바에 구현된 수많은 정렬 구현체들도 동일합니다.

한가지 예를 들어보겠습니다.

<br />

`{5,2,1}` 이라는 정수형 배열이 있습니다.

버블 정렬을 기준으로 설명드리자면, 버블 정렬은 기본적으로 왼쪽에서 오른쪽으로 두 원소를 비교해나가면서 정렬이 이뤄지기 때문에 처음에는 5와 2를 비교할 것입니다.

따라서, 버블 정렬 구현체는 내부적으로 `Comparator.compare(5, 2)`를 호출하고, 이에 대한 결과는 첫번째 인수인 5에서 두번째 인수인 2를 뺀 `양의 정수` 3이 반환됩니다.

즉, `Comparator`의 명세대로라면 배열의 선행 원소인 5가 후행 원소인 3보다 크다는 의미와 동일합니다.

그리고 기본적인 정렬 방식은 오름차순이기 때문에 버블 정렬 구현체는 5와 2의 위치를 바꾸어 더 큰 수인 5가 오른쪽으로 가도록 할 것입니다.

따라서 비교 결과는 `{2,5,1}`이 됩니다.

<br />

감이 잡히시나요?

다시 원래 코드를 봅시다.

<br />

위 코드에서 저는 두 객체의 `id`값의 차이를 반환하도록 하였습니다.

`s1.id = 5`이고, `s2.id = 2`라고 가정하고 코드를 보면 `5 - 2 = 3`이므로, `양의 정수`인 3이 반환됩니다.

이는 s1이 s2보다 크다는 말과 같습니다.

즉, 정렬 구현체는 s1을 s2보다 크다고 판단하여 s1을 오른쪽으로 옮길것입니다.

<br />

그렇다면 만약 `내림차순(DESC)`으로 정렬을 하고 싶다면 어떻게 해야 할까요?

아주 간단합니다.

<br />

```java
class StudentTests {
    List<Student> students;

    @BeforeEach
    void setUp() {
        students = IntStream.rangeClosed(1, 50)
            .mapToObj(Student::new)
            .toList();

        Collections.shuffle(students);
    }

    @Test
    void comparator() {
        Collections.sort(students, (s1, s2) -> s2.id() - s1.id()); // s2에서 s1을 빼도록 위치 변경
    }
}
```

<br />

s1과 s2의 위치를 바꾸면 됩니다.

<br />

## Comparable

---

`Comparable`은 문자 그대로 `비교 가능한`입니다.

역시 인터페이스에 정의된 사양을 먼저 봅시다.

<br />

```java
public interface Comparable<T> {
    public int compareTo(T o);
}
```

<br />

> Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.

> 이 객체를 지정된 객체(compareTo)와 비교하여 순서를 지정합니다. 이 객체(this)가 지정된 객체보다 작다면 음의 정수, 같다면 0, 크다면 양의 정수를 반환합니다.

<br />

마찬가지로 `음의 정수`, `0`, `양의 정수`를 반환하므로 본질적인 비교 방법에 대해서는 `Comparator`와 차이가 없습니다.

다만, `Comparator`는 비교하려는 객체 두개를 인수로 받지만, `Comparable`은 비교하려는 객체에 `서브타이핑`을 통해 다른 객체를 입력받아 자기 자신과 비교한다는 사용방법의 차이가 있을 뿐입니다.

<br />

> 서브타이핑: 인터페이스 상속
> 
> 서브클래싱: 구현 상속

<br />

실제 사용 예는 다음과 같습니다.

<br />

```java
public record Student(Integer id) implements Comparable<Student>{ // 서브타이핑
    @Override
    public int compareTo(Student o) {
        return this.id - o.id;
    }
}
```

<br />

만약 정렬 방식을 내림차순으로 바꾸고 싶다면 역시 다음과 같이 구현하면 되겠죠?

<br />

```java
public record Student(Integer id) implements Comparable<Student>{
    @Override
    public int compareTo(Student o) {
        return o.id - this.id;
    }
}
```

<br />

이러한 이유들로 인해 자바에서 사용되는 객체간의 모든 정렬에는 `Comparator` 혹은 `Comparable`가 반드시 필요합니다.

그리고 반대로, 두 인터페이스 중 하나라도 정렬 구현체에 제공해줄수만 있다면 객체간의 정렬이 가능해지게 됩니다.

<br />

자바의 자료형들은 전부 내부적으로 `Comparator` 혹은 `Comparable`를 구현해두었습니다.

자주 사용하는 `String(문자열)`의 비교 코드를 한번 보죠.

내부적으로 메서드 추출 리팩토링이 많이 되어있지만, 중요한 부분은 다음 코드입니다.

<br />

```java
public static int compareToCI(byte[] value, byte[] other) {
    int len1 = value.length;
    int len2 = other.length;
    int lim = Math.min(len1, len2);
    for (int k = 0; k < lim; k++) {
        if (value[k] != other[k]) {
            char c1 = (char) CharacterDataLatin1.instance.toUpperCase(getChar(value, k));
            char c2 = (char) CharacterDataLatin1.instance.toUpperCase(getChar(other, k));
            if (c1 != c2) {
                c1 = Character.toLowerCase(c1);
                c2 = Character.toLowerCase(c2);
                if (c1 != c2) {
                    return c1 - c2;
                }
            }
        }
    }
    return len1 - len2;
}
```

<br />

문자열 두개를 입력받아, 두 문자열의 길이를 먼저 비교합니다.

문자열 `abcd`와 `abc`가 입력됐다고 가정합시다.

`Math.min` 메서드를 통해 두 문자열의 길이 중 작은 값을 얻어낸 후 얻어낸 길이만큼만 for문을 돌며 대문자로 변경 후 비교 -> 소문자로 변경 후 비교를 하고 있습니다.

그리고 사전순으로 앞서는 값을 반환하도록 하고 있네요.

그러면 `abcd`와 `abc`가 입력됐을 경우 `abc`가 `abcd`보다 사전순으로 더 앞서므로 `abc`, `abcd`순으로 정렬이 될 것임을 짐작해볼 수 있습니다. 

<br />

```java
public class StringSortTest {
    @Test
    void sort() {
        String[] strings = {"abcd", "abc"};
        Arrays.sort(strings);
        assertThat(Arrays.asList(strings).toString()).isEqualTo("[abc, abcd]"); // 테스트 통과
    }
}
```

<br />

마지막으로 이 내용은 본문과는 크게 상관없는 내용이지만, 자바의 정렬은 정렬 메서드에 넘어간 배열의 사이즈에 따라 다른 정렬 알고리즘이 선택되어 사용됩니다.

참고해두시면 도움이 될 것 같습니다.

<br />

![image](https://user-images.githubusercontent.com/71188307/154694645-209193c6-39c8-422e-bdda-c6e40133f385.png)

<br />
