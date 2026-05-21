/**
 * Cloud Resume Challenge — Syncfusion EJ2 initialization.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof ej === "undefined") {
      console.error("Syncfusion EJ2 failed to load.");
      return;
    }

    var appBar = new ej.navigations.AppBar({
      colorMode: "Dark",
      isSticky: true,
    });
    appBar.appendTo("#site-appbar");

    var menuBtn = new ej.buttons.Button({
      cssClass: "e-inherit e-appbar-menu-btn",
      iconCss: "e-icons e-menu",
      isPrimary: false,
    });
    menuBtn.appendTo("#menu-btn");

    menuBtn.element.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      menuBtn.element.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    var ctaExperience = new ej.buttons.Button({
      content: "View Experience",
      isPrimary: true,
      cssClass: "e-primary",
    });
    ctaExperience.appendTo("#cta-experience");

    var ctaContact = new ej.buttons.Button({
      content: "Contact",
      cssClass: "e-outline",
    });
    ctaContact.appendTo("#cta-contact");

    ctaExperience.element.addEventListener("click", function () {
      scrollToSection("#experience");
    });

    ctaContact.element.addEventListener("click", function () {
      scrollToSection("#contact");
    });

    var visitorBtn = new ej.buttons.Button({
      content: "Live · 1,024 visitors",
      cssClass: "visitor-pill",
      isPrimary: true,
      disabled: true,
    });
    visitorBtn.appendTo("#visitor-counter");

    var navLinks = document.querySelectorAll("#main-nav a[href^='#']");

    navLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          scrollToSection(targetId);
          document.body.classList.remove("nav-open");
          menuBtn.element.setAttribute("aria-expanded", "false");
        }
      });
    });

    function scrollToSection(selector) {
      var el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
})();
