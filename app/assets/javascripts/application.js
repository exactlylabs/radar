/*
*= require_self
*= require plugins.bundle
*= require style.bundle
*= require scripts.bundle
*/

function initialize() {
  KTMenu.initGlobalHandlers();
  KTToggle.init();
  KTApp.initBootstrapTooltips();
}

document.addEventListener("DOMContentLoaded", initialize);
document.addEventListener("turbo:load", initialize);