package com.yj.modules.web.question;

import com.yj.modules.web.answer.Answer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity // JPA가 인식하기 위해 필요한 어노테이션
public class Question {

    /**
        '@Id' : Primary Key
        '@GeneratedValue' : 데이터를 저장할 때 해당 속성에 값을 따로 세팅하지 않아도 1씩 자동으로 증가하여 저장된다.
        strategy 고유번호를 생성하는 옵션으로 GenerationType.IDENTITY는 해당 컬럼만의 독립적인 시퀀스를 생성하여 번호를 증가시킬 때 사용한다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createDate;

    /**
        JPA default fetch strategy

        - OneToMany: Lazy
        - ManyToOne: Eager
        - ManyToMany: Lazy
        - OneToOne: Eager
     */
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "question", cascade = CascadeType.REMOVE)
    private List<Answer> answerList;
}
