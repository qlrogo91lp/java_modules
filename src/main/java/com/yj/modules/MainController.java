package com.yj.modules;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/")
    public String root() {
        // forward : 기존 요청된 값들이 유지된 채로 URL이 전환된다.
        return "redirect:/question/list";
    }
}
