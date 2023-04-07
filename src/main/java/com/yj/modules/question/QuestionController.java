package com.yj.modules.question;

import com.yj.modules.answer.AnswerForm;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequestMapping("/question")
@RequiredArgsConstructor
@Controller
public class QuestionController {

    private final QuestionService questionService;

    /**
     * Model 객체는 따로 생성할 필요없이 컨트롤러 메서드의 매개변수로 지정하기만 하면 스프링부트가 자동으로 Model 객체를 생성한다.
     */
    @GetMapping("/list")
    public String list(Model model) {
        List<Question> questionList = this.questionService.getList();
        model.addAttribute("questionList", questionList);

        return "management/question/question_list";
    }

    @GetMapping(value = "/detail/{id}")
    public String detail(Model model, @PathVariable("id") Integer id, AnswerForm answerForm) {
        Question question = this.questionService.getQuestion(id);
        model.addAttribute("question", question);

        return "management/question/question_detail";
    }

    /**
     *
     * QuestionForm과 같이 매개변수로 바인딩한 객체는 Model 객체로 전달하지 않아도 템플릿에서 사용이 가능하다.
     */
    @GetMapping("/create")
    public String questionCreate(QuestionForm questionForm) {
        return "management/question/question_form";
    }

    /**
     * BindingResult는 @Valid 애너테이션으로 인해 검증이 수행된 결과를 의미하는 객체
     * BindingResult 매개변수는 항상 @Valid 매개변수 바로 뒤에 위치해야 한다.
     * 만약 2개의 매개변수의 위치가 정확하지 않다면 @Valid만 적용이 되어 입력값 검증 실패 시 400 오류가 발생한다.
     */
    @PostMapping("/create")
    public String questionCreate(@Valid QuestionForm questionForm, BindingResult bindingResult) {
                                // @RequestParam String subject, @RequestParam String content
        if (bindingResult.hasErrors()) {
            return "management/question/question_form";
        }
        this.questionService.create(questionForm.getSubject(), questionForm.getContent());
        return "redirect:/question/list"; // 질문 저장후 질문목록으로 이동
    }
}
