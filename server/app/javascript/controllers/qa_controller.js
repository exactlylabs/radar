import { Controller } from "@hotwired/stimulus";

const QUESTIONS = {
  WHY_CARE: 'why-care',
  HOW_TO_MEASURE: 'how-to-measure',
  WHAT_IS_A_POD: 'what-is-a-pod',
  POD_ALTERNATIVE: 'pod-alternative',
  AFFECT_SPEED: 'affect-speed',
  WHAT_DATA: 'what-data',
}

export default class extends Controller {

  static targets = ["expandIcon", "collapseIcon", "question"]
  
  connect() {
    this.currentQuestionOpen = null;
  }
  
  toggleQuestion(e) {
    const question = e.target.dataset.questionId;
    if(this.currentQuestionOpen === question) {
      this.currentQuestionOpen = null;
      this.questionTargets.forEach(question => {
        question.dataset.expanded = 'false';
      });
    } else {
      this.currentQuestionOpen = question;
      this.questionTargets.forEach(question => {
        question.dataset.expanded = question.dataset.questionId === this.currentQuestionOpen ? 'true' : 'false';
      });
    }
  }
  
}