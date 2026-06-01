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
      content: "Live · loading…",
      cssClass: "visitor-pill",
      isPrimary: true,
      disabled: true,
    });
    visitorBtn.appendTo("#visitor-counter");

    initVisitorCounter(visitorBtn);

    var experienceData = [
      {
        organization: "Wiley School District, Wiley CO",
        role: "Transportation Manager",
        period: "2014 – Sep 2025",
        highlights:
          "Led 12-person team for 100% on-time routes; accountable for $500K+ equipment. Engineered Access/SQL databases and VBA/Excel tools; cut errors 30%. Developed BusBuddy C# app (GitHub portfolio) for real-time SQL-integrated reporting. Resolved cross-dept conflicts; adapted to hybrid ops mirroring agile sprints.",
      },
      {
        organization: "U.S. Army (global, incl. Iraq)",
        role: "Master Sergeant (E-8) / Transportation Senior Sergeant",
        period: "1988 – 2014",
        highlights:
          "Led 12-soldier teams in convoy ops; 100% accountability for $20M assets across 50+ missions. Automated inventory and payroll via specialized software. Processed HR/compliance records for 150+ personnel with zero errors in admin systems.",
      },
      {
        organization: "U.S. Army",
        role: "Motor Transport Operator (88M50)",
        period: "9 years",
        highlights:
          "Operated and maintained vehicles; troubleshot systems akin to code debugging. Planned routes for global ops; trained teams on protocols. Maintained $1M+ fleet; applied risk analysis transferable to software testing/QA.",
      },
      {
        organization: "U.S. Army",
        role: "Unit Supply Specialist (92Y50)",
        period: "9 years",
        highlights:
          "Managed procurement and distribution with data-driven optimization. Oversaw $400K inventory; reduced waste via tracking tools—foundation for application development.",
      },
      {
        organization: "U.S. Army",
        role: "Health Care Specialist (68W50)",
        period: "18 yrs 5 mos",
        highlights:
          "Delivered emergency care; managed records under pressure. Supported 50+ personnel; precise documentation skills for full-stack data integrity.",
      },
      {
        organization: "U.S. Army",
        role: "Construction Equipment Supervisor (52N50)",
        period: "1 yr 1 mo",
        highlights: "Supervised heavy equipment operations with project management focus.",
      },
    ];

    new ej.grids.Grid({
      dataSource: experienceData,
      columns: [
        { field: "organization", headerText: "Organization", width: 200, minWidth: 140 },
        { field: "role", headerText: "Role", width: 220, minWidth: 160 },
        { field: "period", headerText: "Period", width: 130, minWidth: 100 },
        { field: "highlights", headerText: "Highlights", width: 360, minWidth: 200 },
      ],
      allowPaging: true,
      pageSettings: { pageSize: 5 },
      allowSorting: true,
      allowTextWrap: true,
      height: "auto",
      cssClass: "glass-grid",
    }).appendTo("#experience-grid");

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

    function initVisitorCounter(button) {
      var config = window.VISITOR_API_CONFIG || {};
      var apiUrl = config.url;

      if (!apiUrl) {
        setVisitorLabel(button, null);
        return;
      }

      fetch(apiUrl, { method: "GET", mode: "cors" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Visitor API returned " + response.status);
          }
          return response.json();
        })
        .then(function (data) {
          setVisitorLabel(button, typeof data.count === "number" ? data.count : null);
        })
        .catch(function (error) {
          console.warn("[visitor-counter]", error.message);
          setVisitorLabel(button, null);
        });
    }

    function setVisitorLabel(button, count) {
      var label =
        count === null ? "Live · — visitors" : "Live · " + count.toLocaleString() + " visitors";
      button.content = label;
    }

    // Phase 2: Transformation Chart (5 data points)
    initTransformationChart();
  });

  function initTransformationChart() {
    var chartContainer = document.getElementById("transformation-chart");
    if (!chartContainer || typeof ej === "undefined" || !ej.charts) {
      return;
    }

    // 5 data points telling the story:
    // "Taking my past experiences, developing new tech skills in order to bring meaningful tools to existing problems"
    var chartData = [
      { category: "Ops & Data\nInstincts", value: 78 },
      { category: "Custom Tooling\n(BusBuddy)", value: 92 },
      { category: "Cloud\nFoundations", value: 68 },
      { category: "IaC &\nServerless", value: 85 },
      { category: "AI & Future\nSolutions", value: 72 },
    ];

    new ej.charts.Chart(
      {
        primaryXAxis: {
          valueType: "Category",
          labelStyle: { color: "#c4b5fd", size: "11px", fontWeight: "500" },
          majorGridLines: { width: 0 },
          majorTickLines: { width: 0 },
        },
        primaryYAxis: {
          minimum: 0,
          maximum: 100,
          interval: 25,
          labelStyle: { color: "#94a3b8", size: "10px" },
          majorGridLines: { width: 1, color: "rgba(255,255,255,0.08)" },
          majorTickLines: { width: 0 },
        },
        series: [
          {
            type: "Column",
            dataSource: chartData,
            xName: "category",
            yName: "value",
            name: "Focus & Impact",
            columnWidth: 0.6,
            fill: "url(#purpleGradient)",
            marker: { visible: false },
            cornerRadius: { topLeft: 4, topRight: 4 },
          },
          {
            type: "Line",
            dataSource: chartData,
            xName: "category",
            yName: "value",
            name: "Momentum",
            width: 3,
            fill: "none",
            marker: {
              visible: true,
              width: 8,
              height: 8,
              fill: "#c084fc",
              border: { width: 2, color: "#fff" },
            },
            border: { color: "#c084fc", width: 3 },
          },
        ],
        chartArea: {
          border: { width: 0 },
        },
        background: "transparent",
        tooltip: { enable: true, fill: "#1f2937", textStyle: { color: "#e7ecf3" } },
        legendSettings: { visible: false },
      },
      "#transformation-chart"
    );

    // Add a simple gradient definition for the bars (purple theme)
    var svg = chartContainer.querySelector("svg");
    if (svg) {
      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <linearGradient id="purpleGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#7c3aed" />
          <stop offset="100%" stop-color="#c084fc" />
        </linearGradient>
      `;
      svg.insertBefore(defs, svg.firstChild);
    }
  }
})();
