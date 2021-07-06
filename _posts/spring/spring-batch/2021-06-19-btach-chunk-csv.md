---
layout: post
category:
    - spring
    - spring-batch
date: 2021-06-14 21:33
title: Spring Batch Chunk - CSV 
description: >
    Spring Batch `Chunk CSV 파일 처리` 예제 코드
image: /assets/img/spring/spring-batch/spring-batch-logo.png
related_posts:
    - _posts/spring/spring-batch/2021-06-19-btach-introduction.md
---

* toc
{:toc}
  
```java
@Slf4j
@Configuration
@RequiredArgsConstructor
public class CsvConfiguration {
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    
    private static final String JOB_NAME = "csvJob";
    private static final String STEP_ONE = "csvStep";
    
    private static final String ENCODING = "UTF-8";
    private static final String CSV_ITEM_READER = "csvItemReader";
    private static final String CSV_ITEM_WRITER = "csvItemWriter";
    private static final String INPUT_PATH = "csv/input/member.csv";
    private static final String OUTPUT_PATH = "src/main/resources/csv/output/member.csv";
    
    private static final String HEADER = "id,name,age,address";
    private static final String FOOTER = "-------------------";

    // append(true)일 경우 footer는 개행문자를 추가해야 다음줄에 추가됨
    // private static final String FOOTER = "-------------------\n";
    
    // Job
    @Bean
    public Job csvJob() throws Exception {
        return jobBuilderFactory.get(JOB_NAME)
                                // 같은 파라미터로 계속 배치를 실행할 수 있게 run.id를 증가
                                .incrementer(new RunIdIncrementer()) 
                                .start(csvStep(null))
                                .build();
    }
    
    
    // Step(Chunk)
    @Bean
    @JobScope // CLI 파라미터로 Chunk Size를 받음
    public Step csvStep(@Value("#{jobParameters[chunkSize]}") String value) throws Exception {
        return stepBuilderFactory.get(STEP_ONE)
                                 .<Member, Member>chunk(getChunkSize(value))
                                 .reader(this.csvItemReader())
                                 .writer(this.csvItemWriter())
                                 .build();
    }
    
    /**
     * Batch-Application 실행 시 실행 파라미터로 chunk size 지정
     * 입력 된 파라미터가 없으면 size=10으로 지정
     * -chunkSize=20 --job.name=taskletProcessing
     */
    private int getChunkSize(String value) {
        return StringUtils.isNotEmpty(value) ? parseInt(value) : 10;
    }
    
    // csv를 읽어 row단위로 객체와 매핑해 반환
    private FlatFileItemReader<Member> csvItemReader() throws Exception {
        DefaultLineMapper<Member> mapper = new DefaultLineMapper<>();
        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        
        tokenizer.setNames("id", "name", "age", "address");
        mapper.setLineTokenizer(tokenizer);
        
        mapper.setFieldSetMapper(fieldSet->{
            int id = fieldSet.readInt("id");
            String name = fieldSet.readString("name");
            int age = fieldSet.readInt("age");
            String address = fieldSet.readString("address");
            return new Member(id, name, age, address);
        });
        
        FlatFileItemReader<Member> itemReader = new FlatFileItemReaderBuilder<Member>()
                .name(CSV_ITEM_READER)
                .encoding(ENCODING)
                .resource(new ClassPathResource(INPUT_PATH)) // ClassPathResource (Reader 사용할 때)
                .linesToSkip(1) // csv파일의 첫 row는 컬럼 메타데이터이므로 스킵
                .lineMapper(mapper)
                .build();
        
        itemReader.afterPropertiesSet(); // itemReader 검증메서드
        return itemReader;
    }
    
    
    // reader가 반환한 item이 Chunk Size만큼 writer로 넘어오면 쓰기 실행
    private ItemWriter<Member> csvItemWriter() throws Exception {
        BeanWrapperFieldExtractor<Member> fieldExtractor = new BeanWrapperFieldExtractor<>();
        DelimitedLineAggregator<Member> aggregator = new DelimitedLineAggregator<>();
        
        // 각 column을 ,으로 구분
        fieldExtractor.setNames(new String[] {"id", "name", "age", "address"});
        aggregator.setDelimiter(",");
        aggregator.setFieldExtractor(fieldExtractor);
        
        FlatFileItemWriter<Member> itemWriter = new FlatFileItemWriterBuilder<Member>()
                .name(CSV_ITEM_WRITER)
                .encoding(ENCODING)
                .resource(new FileSystemResource(OUTPUT_PATH)) // FileSystemResource (Writer 사용할 때)
                .lineAggregator(aggregator)
                .headerCallback(writer->writer.write(HEADER)) // csv 최상단에 한줄 생성
                .footerCallback(writer->writer.write(FOOTER)) // csv 최하단에 한줄 생성
                .append(true) // 이 옵션을 주면 새로운 파일을 생성하는게 아닌, 기존 파일에 추가된 내용을 이어붙이도록 동작함
                .build();
        
        itemWriter.afterPropertiesSet();
        return itemWriter;
    }
}
```