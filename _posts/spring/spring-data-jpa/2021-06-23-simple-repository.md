---
layout: post
category:
    - spring
    - spring-data-jpa
date: 2021-06-23 17:04
title: Spring Data JPA - SimpleJpaRepository
description: >
    Spring Data JPA의 핵심 콘크리트 클래스인
    `SimpleJpaRepository`에 대한 학습 테스트
image: /assets/img/spring/spring-data-jpa/hibernate.jpg
related_posts:
    -
---

* toc
{:toc}

# 📕 SimpleJpaRepository

---

`Spring Data JPA`에는 `CRUD`를 정의한 `CrudRepository` 인터페이스가 존재하며

이를 상속하여 구현한 `Spring Data JPA`의 핵심적인 콘크리트 클래스가 `SimpleJpaRepository`이다.

내부적으로 <u>JPA의 persist, merge, flush, remove</u> 등으로 구현돼있으며, `@Transactional`이 선언돼있다.

`SimpleJpaRepository`의 대부분의 기능에 대한 학습 테스트코드를 작성하였다.

전체 코드는 [GitHub Repository](https://github.com/shirohoo/jpa-in-action) 를 확인 !

<br />

---

<br />

```java
// file: 'MemberRepository.java'

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 수식어를 생략해도 findByNameIs, findByNameEquals 와 같이 동작함(==조건검색)
    Member findByName(String name);

    Member getByName(String name);

    Member readByName(String name);

    Member queryByName(String name);

    Member searchByName(String name);

    Member streamByName(String name);

    Member findFirst1ByName(String name);

    Member findTop1ByName(String name);

    List<Member> findTop2ByName(String name);

    Member findByNameAndAge(String name, int age);

    List<Member> findByNameOrAge(String name, int age);

    List<Member> findByIdAfter(Long id);

    List<Member> findByIdBefore(Long id);

    List<Member> findByIdIsLessThanEqual(Long id);

    List<Member> findByIdGreaterThanEqual(Long id);

    List<Member> findByAgeBetween(int age1, int age2);

    List<Member> findByIdIsNotNull();

    List<Member> findByAgeIn(List<Integer> ages);

    List<Member> findByNameStartingWith(String name);

    List<Member> findByNameEndingWith(String name);

    List<Member> findByNameContaining(String name);

    List<Member> findFirst2ByNameOrderByIdDesc(String name);

    Page<Member> findByName(String name, Pageable pageable);
}
```

```java
// file: 'SimpleRepositoryTest.java'

@DataJpaTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class SimpleRepositoryTest {
    @Autowired
    MemberRepository memberRepository;

    @BeforeEach
    void setUp() {
        List<Member> members = List.of(Member.createMember("siro", 29),
                                       Member.createMember("sophia", 32),
                                       Member.createMember("dennis", 25),
                                       Member.createMember("james", 41),
                                       Member.createMember("michael", 33));

        memberRepository.saveAllAndFlush(members);
    }

    @AfterEach
    void tearDown() {
        memberRepository.deleteAll();
    }

    private Sort orderByIdDesc() {
        return by(Order.desc("id"));
    }

    @Test
    @DisplayName("Member_1번을_조회")
    void findById() {
        Member member = memberRepository.findById(1L)
                                        .orElseThrow(NoSuchElementException::new);
        assertThat(member.getName()).isEqualTo("siro");
        assertThat(member.getAge()).isEqualTo(29);
    }

    @Test
    @DisplayName("Member_1번_3번을_조회")
    void findAllById() {
        List<Member> members = memberRepository.findAllById(Lists.newArrayList(1L, 3L));
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("dennis", 25))
                           .size().isEqualTo(2);
    }

    @Test
    @DisplayName("Member_초기_데이터는_5명")
    void findAll() {
        List<Member> members = memberRepository.findAll();
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(5);
    }

    @Test
    @DisplayName("Member_1번을_제거")
    void deleteById() {
        memberRepository.deleteById(1L);
        List<Member> members = memberRepository.findAll();
        assertThat(members).extracting("name", "age")
                           .contains(tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(4);
    }

    @Test
    @DisplayName("Member_1번_3번을_제거")
    void deleteAllById() {
        memberRepository.deleteAllById(Lists.newArrayList(1L, 3L));
        List<Member> members = memberRepository.findAll();
        assertThat(members).extracting("name", "age")
                           .contains(tuple("sophia", 32),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(3);
    }

    @Test
    @DisplayName("Member_전체제거")
    void deleteAll() {
        memberRepository.deleteAll();
        List<Member> members = memberRepository.findAll();

        assertThat(members).isEmpty();
    }

    @Test
    @DisplayName("Member_Batch_1번_3번을_제거")
    void deleteAllByIdInBatch() {
        memberRepository.deleteAllByIdInBatch(Lists.newArrayList(1L, 3L));
        List<Member> members = memberRepository.findAll();
        assertThat(members).extracting("name", "age")
                           .contains(tuple("sophia", 32),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(3);
    }

    @Test
    @DisplayName("Member_Batch_전체제거")
    void deleteAllInBatch() {
        memberRepository.deleteAllInBatch();
        List<Member> members = memberRepository.findAll();
        assertThat(members).isEmpty();
    }

    @Test
    @DisplayName("Member_1번이_존재하는지_확인")
    void existsById() {
        boolean exists = memberRepository.existsById(1L);
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Member_전체수를_조회")
    void count() {
        long count = memberRepository.count();
        assertThat(count).isEqualTo(5);
    }

    /**
     * JPA Page는 0부터 시작한다 <br/>
     * <br/>
     * Creates a new unsorted {@link PageRequest}. <br/>
     * page zero-based page index, must not be negative. <br/>
     * the size of the page to be returned, must be greater than 0. <br/>
     * <br/>
     * 참고자료 경로 <br/>
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-0.png"
     */
    @Test
    @DisplayName("Page_API")
    void pageV1() {
        Page<Member> members = memberRepository.findAll(PageRequest.of(1, 3));
        Pageable pageable = members.getPageable();

        Sort sort = members.getSort();
        int pageNumber = pageable.getPageNumber();
        int totalPages = members.getTotalPages();
        long totalElements = members.getTotalElements();
        int numberOfElements = members.getNumberOfElements();
        int size = members.getSize();

        assertThat(sort.isUnsorted()).isTrue();
        assertThat(pageNumber).isEqualTo(1);
        assertThat(totalPages).isEqualTo(2);
        assertThat(totalElements).isEqualTo(5);
        assertThat(numberOfElements).isEqualTo(2);
        assertThat(size).isEqualTo(3);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(2);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-0.png"
     */
    @Test
    @DisplayName("Query_Methods_Pageable_조회")
    void pageV2() {
        List<Member> createMembers = new ArrayList<>();
        createMembers.add(Member.createMember("siro", 11));
        createMembers.add(Member.createMember("siro", 22));
        createMembers.add(Member.createMember("siro", 33));
        createMembers.add(Member.createMember("siro", 44));
        memberRepository.saveAllAndFlush(createMembers);

        Page<Member> members = memberRepository.findByName("siro", PageRequest.of(0, 3, orderByIdDesc()));
        Pageable pageable = members.getPageable();

        Sort sort = members.getSort();
        int pageNumber = pageable.getPageNumber();
        int totalPages = members.getTotalPages();
        long totalElements = members.getTotalElements();
        int numberOfElements = members.getNumberOfElements();
        int size = members.getSize();

        assertThat(sort.isSorted()).isTrue();
        assertThat(pageNumber).isEqualTo(0);
        assertThat(totalPages).isEqualTo(2);
        assertThat(totalElements).isEqualTo(5);
        assertThat(numberOfElements).isEqualTo(3);
        assertThat(size).isEqualTo(3);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 44),
                                     tuple("siro", 33),
                                     tuple("siro", 22))
                           .size().isEqualTo(3);

        members = memberRepository.findByName("siro", PageRequest.of(1, 3, orderByIdDesc()));
        pageable = members.getPageable();

        sort = members.getSort();
        pageNumber = pageable.getPageNumber();
        totalPages = members.getTotalPages();
        totalElements = members.getTotalElements();
        numberOfElements = members.getNumberOfElements();
        size = members.getSize();

        assertThat(sort.isSorted()).isTrue();
        assertThat(pageNumber).isEqualTo(1);
        assertThat(totalPages).isEqualTo(2);
        assertThat(totalElements).isEqualTo(5);
        assertThat(numberOfElements).isEqualTo(2);
        assertThat(size).isEqualTo(3);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 11),
                                     tuple("siro", 29))
                           .size().isEqualTo(2);
    }

    @Test
    @DisplayName("Example_API")
    void exampleFindAll() {
        ExampleMatcher matcher = matching()
                .withIgnorePaths("age") // age 는 무시하고 검색한다
                .withMatcher("name", GenericPropertyMatchers.contains()); // name 을 검색조건에 포함시킨다 - like 검색

        /*-----------------------------------------
         조건 검색을 위한 Member proxy 를 생성한다
         name 에 i가 들어가는 멤버를 조회한다
         age 는 무시되므로 값이 몇이든 의미없다
         -----------------------------------------*/
        Example<Member> example = Example.of(Member.createMember("i", 0), matcher);

        List<Member> members = memberRepository.findAll(example);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("michael", 33))
                           .size().isEqualTo(4);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-1.png"
     */
    @Test
    @DisplayName("Query_Methods_조회_접두사")
    void queryMethodsV1() {
        Member member = Member.createMember("tester", 77);
        Member tester = memberRepository.save(member);

        assertThat(tester).usingRecursiveComparison().isEqualTo(memberRepository.findByName("tester"));
        assertThat(tester).usingRecursiveComparison().isEqualTo(memberRepository.getByName("tester"));
        assertThat(tester).usingRecursiveComparison().isEqualTo(memberRepository.readByName("tester"));
        assertThat(tester).usingRecursiveComparison().isEqualTo(memberRepository.queryByName("tester"));
        assertThat(tester).usingRecursiveComparison().isEqualTo(memberRepository.searchByName("tester"));
        assertThat(tester).usingRecursiveComparison().isEqualTo(memberRepository.streamByName("tester"));
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-1.png"
     */
    @Test
    @DisplayName("Query_Methods_Top_조회")
    void queryMethodsV2() {
        /*-----------------------------------------
         id=1 siro 와 id=6 siro 가 존재하는 상황에서
        limit query 를 사용하여 id 우선순위가 더 높은 데이터를 조회한다
         -----------------------------------------*/
        Member member = Member.createMember("siro", 77);
        memberRepository.saveAndFlush(member); // id=6 siro save

        Member siro = memberRepository.findById(1L).get(); // id=1 siro select
        assertThat(siro).usingRecursiveComparison().isEqualTo(memberRepository.findTop1ByName("siro"));
        assertThat(siro).usingRecursiveComparison().isEqualTo(memberRepository.findFirst1ByName("siro"));

        List<Member> members = memberRepository.findTop2ByName("siro"); //  limit = 2 select
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("siro", 77))
                           .size().isEqualTo(2);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_And_조회")
    void queryMethodsV3() {
        Member member = Member.createMember("siro", 77);
        memberRepository.saveAndFlush(member); // id=6 siro save

        Member siro = memberRepository.findByNameAndAge("siro", 77);
        assertThat(siro).extracting("name", "age")
                        .containsExactly("siro", 77);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_Or_조회")
    void queryMethodsV4() {
        Member member = Member.createMember("siro", 25);
        memberRepository.saveAndFlush(member); // id=6 siro save

        List<Member> members = memberRepository.findByNameOrAge("siro", 25);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("dennis", 25),
                                     tuple("siro", 25))
                           .size().isEqualTo(3);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_After_조회(초과)")
    void queryMethodsV5() {
        List<Member> members = memberRepository.findByIdAfter(1L);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(4);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_After_조회(이상)")
    void queryMethodsV6() {
        List<Member> members = memberRepository.findByIdGreaterThanEqual(1L);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(5);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_Before_조회(미만)")
    void queryMethodsV7() {
        List<Member> members = memberRepository.findByIdBefore(5L);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("james", 41))
                           .size().isEqualTo(4);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_Before_조회(이하)")
    void queryMethodsV8() {
        List<Member> members = memberRepository.findByIdIsLessThanEqual(5L);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(5);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_Between_조회")
    void queryMethodsV9() {
        List<Member> members = memberRepository.findByAgeBetween(20, 30);
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("dennis", 25))
                           .size().isEqualTo(2);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_NotNull_조회")
    void queryMethodsV10() {
        List<Member> members = memberRepository.findByIdIsNotNull();
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("sophia", 32),
                                     tuple("dennis", 25),
                                     tuple("james", 41),
                                     tuple("michael", 33))
                           .size().isEqualTo(5);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_In_조회(Batch)")
    void queryMethodsV11() {
        List<Member> members = memberRepository.findByAgeIn(Lists.newArrayList(29, 32, 25));
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 29),
                                     tuple("sophia", 32),
                                     tuple("dennis", 25))
                           .size().isEqualTo(3);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_Starting_조회")
    void queryMethodsV12() {
        Member siro = memberRepository.findByNameStartingWith("si").get(0);
        assertThat(siro).extracting("name", "age")
                        .containsExactly("siro", 29);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_Ending_조회")
    void queryMethodsV13() {
        Member siro = memberRepository.findByNameEndingWith("ro").get(0);
        assertThat(siro).extracting("name", "age")
                        .containsExactly("siro", 29);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-2.png"
     */
    @Test
    @DisplayName("Query_Methods_Containing_조회")
    void queryMethodsV14() {
        Member siro = memberRepository.findByNameContaining("ir").get(0);
        assertThat(siro).extracting("name", "age")
                        .containsExactly("siro", 29);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-3.png"
     */
    @Test
    @DisplayName("Query_Methods_First_OrderBy_조회")
    void queryMethodsV15() {
        Member member = Member.createMember("siro", 77);
        memberRepository.saveAndFlush(member);

        List<Member> members = memberRepository.findFirst2ByNameOrderByIdDesc("siro");
        assertThat(members).extracting("name", "age")
                           .contains(tuple("siro", 77),
                                     tuple("siro", 29))
                           .size().isEqualTo(2);
    }

    /**
     * 참고자료 경로
     *
     * @see "Han-Changhun/src/test/resources/images/query-method-3.png"
     */
    @Test
    @DisplayName("Query_Methods_Sort_조회")
    void queryMethodsV16() {
        List<Member> members = memberRepository.findAll(orderByIdDesc());
        assertThat(members).extracting("name", "age")
                           .contains(tuple("michael", 33),
                                     tuple("james", 41),
                                     tuple("dennis", 25),
                                     tuple("sophia", 32),
                                     tuple("siro", 29))
                           .size().isEqualTo(5);
    }
}
```

