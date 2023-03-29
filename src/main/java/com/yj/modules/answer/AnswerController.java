package com.yj.modules.answer;

import com.yj.modules.question.Question;
import com.yj.modules.question.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RequestMapping("/answer")
@RequiredArgsConstructor
@Controller
public class AnswerController {
    private final QuestionService questionService;
    private final AnswerService answerService;

    /**
     *  RequestParam : textarea의 name 속성명
     */
    @PostMapping("/create/{id}")
    public String createAnswer(@PathVariable("id") Integer id, @RequestParam String content) {
        Question question = this.questionService.getQuestion(id);
        this.answerService.create(question, content);

        return String.format("redirect:/question/detail/%s", id);
    }

}
