package com.yj.modules.web.question;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionForm {

    /**
     * spring-boot-starter-validation 어노테이션 활용
     */
    @NotEmpty(message = "제목은 필수항목입니다.")
    @Size(max=200)
    private String subject;

    @NotEmpty(message = "내용은 필수항목입니다.")
    private String content;
}
