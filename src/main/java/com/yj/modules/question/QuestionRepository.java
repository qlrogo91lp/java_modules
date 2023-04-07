package com.yj.modules.question;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;



public interface QuestionRepository  extends JpaRepository<Question, Integer> {
    Question findBySubject(String subject);
    Question findBySubjectAndContent(String subject, String content);
    List<Question> findBySubjectLike(String subject);
    /*
    * JPA 관련 라이브러리에 페이지 관련 패키지가 존재
    */
    Page<Question> findAll(Pageable pageable);
}
