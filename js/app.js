/**
 * Cloud Resume Challenge — Syncfusion EJ2 initialization.
 */
(function () {
  "use strict";

  var DEMO_VISITOR_COUNT = 3214;

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof ej === "undefined") {
      console.error("Syncfusion EJ2 failed to load.");
      return;
    }

    initParticles();

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
      content: "Live Visitor Counter: …",
      cssClass: "visitor-pill",
      isPrimary: true,
      disabled: true,
    });
    visitorBtn.appendTo("#visitor-counter");

    initVisitorCounter(visitorBtn);
    initDashboardAccordion();
    initTransformationChart();
    initNavActiveState();

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
  });

  function initVisitorCounter(button) {
    var config = window.VISITOR_API_CONFIG || {};
    var apiUrl = config.url;

    if (!apiUrl) {
      setVisitorLabel(button, DEMO_VISITOR_COUNT);
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
        var count = typeof data.count === "number" ? data.count : null;
        if (count === null) {
          setVisitorLabel(button, DEMO_VISITOR_COUNT);
        } else {
          setVisitorLabel(button, count);
        }
      })
      .catch(function (error) {
        console.warn("[visitor-counter]", error.message);
        setVisitorLabel(button, DEMO_VISITOR_COUNT);
      });
  }

  function setVisitorLabel(button, count) {
    button.content = "Live Visitor Counter: " + count.toLocaleString();
    button.disabled = false;
  }

  function initDashboardAccordion() {
    var mount = document.getElementById("dashboard-accordion");
    if (!mount || !ej.navigations || !ej.navigations.Accordion) {
      return;
    }

    new ej.navigations.Accordion({
      expandMode: "Single",
      items: [
        {
          header: "Wiley — Transportation Manager",
          content:
            "Led 12-person team for on-time routes; built Access/SQL and VBA tools plus BusBuddy (C# + SQL) — 30% error reduction. <a href='#experience'>Full timeline →</a>",
        },
        {
          header: "U.S. Army — Master Sergeant (E-8)",
          content:
            "26 years of leadership and logistics; $20M asset accountability across 50+ missions; automated inventory and payroll systems.",
        },
        {
          header: "Cloud Resume Challenge",
          content:
            "AWS Cloud Practitioner certified. This portfolio: context rules + Syncfusion MCP, plan-then-implement agent prompts, <code>npm run ci</code> before deploy, OIDC GitHub Actions to S3/CloudFront, and serverless visitor counter (Terraform + API Gateway + Lambda + DynamoDB). <a href='https://github.com/Bigessfour/CloudResumeChallenge-frontend/blob/main/docs/DEV_SETUP.md' target='_blank' rel='noopener noreferrer'>Agent setup →</a>",
        },
        {
          header: "Code Platoon — AI Cloud & DevOps (Echo)",
          content:
            "Cohort curriculum: Terraform, GitHub Actions CI/CD, SageMaker, Kubernetes, Amazon Bedrock (RAG, agents), and capstone delivery. <a href='https://github.com/Bigessfour/aico-echo' target='_blank' rel='noopener noreferrer'>aico-echo →</a>",
        },
        {
          header: "Town of Wiley Website",
          content:
            "Production municipal site at <a href='https://townofwiley.gov/' target='_blank' rel='noopener noreferrer'>townofwiley.gov</a> — Angular on AWS Amplify, AppSync CMS, and serverless backends. <a href='https://github.com/Bigessfour/Townofwiley' target='_blank' rel='noopener noreferrer'>GitHub →</a>",
        },
        {
          header: "Wiley Widget (wiley-co-web)",
          content:
            "Blazor WebAssembly finance workspace at <a href='https://wileywidget.townofwiley.gov/' target='_blank' rel='noopener noreferrer'>wileywidget.townofwiley.gov</a> — Syncfusion UI, Aurora PostgreSQL, App Runner API. <a href='https://github.com/Bigessfour/wiley-co-web' target='_blank' rel='noopener noreferrer'>GitHub →</a>",
        },
      ],
    }).appendTo("#dashboard-accordion");
  }

  function initTransformationChart() {
    var chartContainer = document.getElementById("transformation-chart");
    if (!chartContainer || typeof ej === "undefined" || !ej.charts) {
      return;
    }

    var chartData = [
      { category: "Ops & Data\nInstincts", value: 78 },
      { category: "Custom Tooling\n(BusBuddy)", value: 92 },
      { category: "Cloud\nFoundations", value: 68 },
      { category: "IaC &\nServerless", value: 85 },
      { category: "AI & Future\nSolutions", value: 72 },
    ];

    var chart = new ej.charts.Chart({
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
        labelFormat: "{value}",
        labelStyle: { color: "#94a3b8", size: "10px" },
        majorGridLines: { width: 1, color: "rgba(255,255,255,0.08)", dashArray: "4,4" },
        majorTickLines: { width: 0 },
      },
      series: [
        {
          type: "Column",
          dataSource: chartData,
          xName: "category",
          yName: "value",
          name: "Focus & Impact",
          columnWidth: 0.55,
          fill: "#a855f7",
          marker: { visible: false },
          cornerRadius: { topLeft: 6, topRight: 6 },
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
      pointRender: function (args) {
        if (args.series.type === "Column") {
          args.fill = args.point.index % 2 === 0 ? "#ffffff" : "#a855f7";
          args.border = { color: "rgba(192, 132, 252, 0.4)", width: 1 };
        }
      },
      chartArea: {
        border: { width: 0 },
      },
      background: "transparent",
      tooltip: { enable: true, fill: "#1f2937", textStyle: { color: "#e7ecf3" } },
      legendSettings: { visible: false },
      loaded: function () {
        var svg = chartContainer.querySelector("svg");
        if (svg && !svg.querySelector("#chartLineGlow")) {
          var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          defs.innerHTML =
            '<filter id="chartLineGlow" x="-20%" y="-20%" width="140%" height="140%">' +
            '<feGaussianBlur stdDeviation="2" result="blur"/>' +
            '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
          svg.insertBefore(defs, svg.firstChild);
        }
      },
    });
    chart.appendTo("#transformation-chart");
  }

  function initNavActiveState() {
    var navLinks = document.querySelectorAll("#main-nav a[href^='#']");
    if (!navLinks.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    var sectionIds = ["home", "experience", "projects", "certifications", "contact"];
    var sections = sectionIds
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            var href = link.getAttribute("href");
            var isActive = href === "#" + id;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
              link.setAttribute("aria-current", "page");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initParticles() {
    var container = document.getElementById("particles");
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var count = 36;
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("span");
      dot.className = "particle";
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top = Math.random() * 100 + "%";
      dot.style.animationDelay = Math.random() * 12 + "s";
      dot.style.animationDuration = 8 + Math.random() * 10 + "s";
      dot.style.opacity = String(0.25 + Math.random() * 0.55);
      container.appendChild(dot);
    }
  }
})();
