/*
*= require_self
*= require plugins.bundle
*= require style.bundle
*= require scripts.bundle
*/

function initialize() {
  KTMenu.init();
  KTToggle.init();
}

document.addEventListener("DOMContentLoaded", initialize);
document.addEventListener("turbo:load", initialize);
