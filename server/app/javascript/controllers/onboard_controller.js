import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["step1", "step2", "step3", "step4", 
    "stepper1", "stepper2", "stepper3", "stepper4", 
    "stepper1Title", "stepper2Title", "stepper3Title", 
    "stepper4Title", "wizard", "map"];
  
  static values = {
    step: Number
  }

  connect() {
    switch(this.stepValue) {
      case 1:
        this.goto1();
        break;
      case 2:
        this.goto2();
        break;
      case 3:
        this.goto3();
        break;
      case 4:
        this.goto4();
        break;
    }
  }

  goto1(e) {
    if (e) {
      e.preventDefault();
    }

    this.unsetSteps();
    this.step1Target.classList.add("current");
    this.stepper1Target.classList.add("current");
    this.stepper1TitleTarget.classList.remove('text-muted');
    this.stepper1TitleTarget.classList.add('text-dark');
  }

  goto2(e) {
    e.preventDefault();
    this.unsetSteps();
    this.step2Target.classList.add("current");
    this.stepper2Target.classList.add("current");
    this.stepper2TitleTarget.classList.remove('text-muted');
    this.stepper2TitleTarget.classList.add("text-dark");
  }

  goto3(e) {
    if (e) {
      e.preventDefault();
    }

    this.unsetSteps();
    this.step3Target.classList.add("current");
    this.stepper3Target.classList.add("current");
    this.stepper3TitleTarget.classList.remove('text-muted');
    this.stepper3TitleTarget.classList.add("text-dark");
  }

  ifSuccessGoto3(e) {
    if (e.detail.success) {
      this.goto3();
    }
  }

  goto4(e) {
    if (e) {
      e.preventDefault();
    }

    this.unsetSteps();
    this.step4Target.classList.add("current");
    this.stepper4Target.classList.add("current");
    this.stepper4TitleTarget.classList.remove('text-muted');
    this.stepper4TitleTarget.classList.add("text-dark");
  }

  complete(e) {
    if (e) {
      e.preventDefault();
    }

    location.reload();

    //this.wizardTarget.classList.add("d-none");
    //this.mapTarget.classList.remove("d-none");
  }

  ifSuccessGoto4(e) {
    if (e.detail.success) {
      this.goto4();
    }
  }

  unsetSteps() {
    this.step1Target.classList.remove("current");
    this.step2Target.classList.remove("current");
    this.step3Target.classList.remove("current");
    this.step4Target.classList.remove("current");

    this.stepper1Target.classList.remove("current");
    this.stepper2Target.classList.remove("current");
    this.stepper3Target.classList.remove("current");
    this.stepper4Target.classList.remove("current");

    this.stepper1TitleTarget.classList.add('text-muted');
    this.stepper2TitleTarget.classList.add('text-muted');
    this.stepper3TitleTarget.classList.add('text-muted');
    this.stepper4TitleTarget.classList.add('text-muted');

    this.stepper1TitleTarget.classList.remove("text-dark");
    this.stepper2TitleTarget.classList.remove("text-dark");
    this.stepper3TitleTarget.classList.remove("text-dark");
    this.stepper4TitleTarget.classList.remove("text-dark");

  }
}
