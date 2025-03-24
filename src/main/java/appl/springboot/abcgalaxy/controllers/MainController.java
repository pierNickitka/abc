package appl.springboot.abcgalaxy.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

  @GetMapping("/")
  public String home() {
    return "index"; // Главная страница
  }

  @GetMapping("/letterA")
  public String letterA() {
    return "letterA"; // Страница с буквой A
  }

  @GetMapping("/cartoon")
  public String cartoon() {
    return "cartoon"; // Страница "Мультик"
  }

  @GetMapping("/game")
  public String game() {
    return "game"; // Страница "Игра"
  }
}