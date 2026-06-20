/**
 * Cloud Resume Challenge — Syncfusion EJ2 initialization + visitor counter.
 *
 * Code Platoon note: this file is intentionally one IIFE with no build step.
 * The site loads Syncfusion EJ2 from a CDN (see <script> tags in index.html),
 * and ESLint runs in script mode (no ES modules). Keep that in mind if you
 * refactor — no `import` / `export` here.
 *
 * High level wiring:
 *   1. Particles background (decorative, skipped if user prefers reduced motion)
 *   2. Sticky AppBar + hamburger menu button
 *   3. Hero CTAs (View Experience, Contact)
 *   4. Visitor counter pill: skeleton → fetch → animated count-up → aria-live
 *   5. Two Accordions (dashboard summary + AWS Resources / CRC step tracker)
 *   6. Transformation Chart (mixed Column + Line, neon glow filter)
 *   7. Experience Grid (paged, sortable, responsive)
 *   8. Scroll-spy: highlight the active nav link as sections cross viewport
 */
(function () {
  "use strict";

  // Fallback shown when the Lambda visitor API is unreachable or unset.
  // Keep this realistic so the page never looks broken in local dev.
  const DEMO_VISITOR_COUNT = 3214;

  // Max time we'll wait for the visitor API before falling back.
  const VISITOR_FETCH_TIMEOUT_MS = 8000;

  // Honor the OS "reduce motion" setting for accessibility.
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof ej === "undefined") {
      console.error("Syncfusion EJ2 failed to load. Check the CDN script tags in index.html.");
      return;
    }

    initParticles();

    // Code Platoon note: AppBar gives us the sticky top nav frame.
    // colorMode "Dark" pairs it with the Material 3 dark theme stylesheet.
    // mode "Top" + isSticky true is the canonical fixed-header config.
    const appBar = new ej.navigations.AppBar({
      colorMode: "Dark",
      mode: "Top",
      isSticky: true,
    });
    appBar.appendTo("#site-appbar");

    // Hamburger button toggles the mobile nav drawer (body.nav-open).
    const menuBtn = new ej.buttons.Button({
      cssClass: "e-inherit e-appbar-menu-btn",
      iconCss: "e-icons e-menu",
      isPrimary: false,
    });
    menuBtn.appendTo("#menu-btn");

    menuBtn.element.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      menuBtn.element.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Hero CTAs — primary scrolls to experience, outline scrolls to contact.
    // Icons give visual rhythm and help screen-readers via aria-label inheritance.
    const ctaExperience = new ej.buttons.Button({
      content: "View Experience",
      isPrimary: true,
      cssClass: "e-primary",
      iconCss: "e-icons e-chevron-right-fill",
      iconPosition: "Right",
    });
    ctaExperience.appendTo("#cta-experience");

    const ctaContact = new ej.buttons.Button({
      content: "Contact",
      cssClass: "e-outline",
      iconCss: "e-icons e-comment-show",
      iconPosition: "Left",
    });
    ctaContact.appendTo("#cta-contact");

    ctaExperience.element.addEventListener("click", () => scrollToSection("#experience"));
    ctaContact.element.addEventListener("click", () => scrollToSection("#contact"));

    // Code Platoon note: the visitor counter is the "Cloud" half of the CRC.
    // We swap a CSS skeleton for the real Syncfusion button once we have a number.
    initVisitorCounter("#visitor-counter");

    initDashboardAccordion();
    initAwsResourcesAccordion();
    initTransformationChart();
    initExperienceGrid();
    initNavActiveState();
    wireNavLinks(menuBtn);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Visitor counter — skeleton → fetch → animated count-up
  // ──────────────────────────────────────────────────────────────────────────

  function initVisitorCounter(mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return;

    const config = window.VISITOR_API_CONFIG || {};
    const apiUrl = config.url;

    // Replace HTML skeleton with the Syncfusion button container.
    // We mount the button to a fresh child so the skeleton stays put until
    // the count is ready — that gives the page a smoother loading feel.
    const buttonHost = document.createElement("span");
    buttonHost.className = "visitor-pill-host";
    mount.appendChild(buttonHost);

    const visitorBtn = new ej.buttons.Button({
      content: "Live Visitor Counter: …",
      cssClass: "visitor-pill",
      isPrimary: true,
      disabled: true,
      iconCss: "e-icons e-people",
      iconPosition: "Left",
    });
    // Hide the button until we have a number; the skeleton is the active UI.
    buttonHost.style.display = "none";
    visitorBtn.appendTo(buttonHost);

    const finalize = (count, { fallback = false } = {}) => {
      const skeleton = mount.querySelector("[data-skeleton]");
      if (skeleton) skeleton.remove();
      buttonHost.style.display = "";
      visitorBtn.disabled = false;

      if (prefersReducedMotion) {
        setVisitorLabel(visitorBtn, count);
        return;
      }
      animateCount(visitorBtn, 0, count, 1400);

      if (fallback) {
        console.warn(
          "[visitor-counter] Using demo count. Wire window.VISITOR_API_CONFIG to your API Gateway URL once the Lambda is deployed."
        );
      } else {
        console.log("[visitor-counter] Live count rendered:", count);
      }
    };

    if (!apiUrl) {
      finalize(DEMO_VISITOR_COUNT, { fallback: true });
      return;
    }

    // AbortController gives us a clean timeout — important so users on flaky
    // networks see the demo count instead of a stuck spinner.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), VISITOR_FETCH_TIMEOUT_MS);

    fetch(apiUrl, { method: "GET", mode: "cors", signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Visitor API returned " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        const count = typeof data.count === "number" ? data.count : null;
        if (count === null) {
          finalize(DEMO_VISITOR_COUNT, { fallback: true });
        } else {
          finalize(count);
        }
      })
      .catch((error) => {
        console.warn("[visitor-counter] fallback:", error.message);
        finalize(DEMO_VISITOR_COUNT, { fallback: true });
      })
      .finally(() => clearTimeout(timer));
  }

  function setVisitorLabel(button, count) {
    button.content = "Live Visitor Counter: " + count.toLocaleString();
  }

  // requestAnimationFrame-driven count-up with easeOutCubic curve.
  function animateCount(button, from, to, durationMs) {
    const start = performance.now();
    const delta = to - from;

    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + delta * eased);
      setVisitorLabel(button, current);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setVisitorLabel(button, to);
        // Tiny pop animation for fun — defined in css/styles.css.
        const el = button.element;
        if (el) {
          el.classList.add("visitor-pop");
          setTimeout(() => el.classList.remove("visitor-pop"), 700);
        }
      }
    };

    requestAnimationFrame(step);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Accordions
  // ──────────────────────────────────────────────────────────────────────────

  // Code Platoon note: dashboard accordion summarizes the portfolio in
  // collapsible sections — keeps the page short while still being scannable.
  function initDashboardAccordion() {
    const mount = document.getElementById("dashboard-accordion");
    if (!mount || !ej.navigations || !ej.navigations.Accordion) {
      return;
    }

    new ej.navigations.Accordion({
      expandMode: "Single",
      expandIcon: "e-icons e-chevron-down-fill",
      collapseIcon: "e-icons e-chevron-up-fill",
      items: [
        {
          header: "Wiley — Transportation Manager",
          iconCss: "e-icons e-trending-chart",
          content:
            "Led 12-person team for on-time routes; built Access/SQL and VBA tools plus BusBuddy (C# + SQL) — 30% error reduction. <a href='#experience'>Full timeline →</a>",
        },
        {
          header: "U.S. Army — Master Sergeant (E-8)",
          iconCss: "e-icons e-medal",
          content:
            "26 years of leadership and logistics; $20M asset accountability across 50+ missions; automated inventory and payroll systems.",
        },
        {
          header: "Cloud Resume Challenge",
          iconCss: "e-icons e-cloud",
          content:
            "AWS Cloud Practitioner certified. This portfolio: context rules + Syncfusion MCP, plan-then-implement agent prompts, <code>npm run ci</code> before deploy, OIDC GitHub Actions to S3/CloudFront, and serverless visitor counter (Terraform + API Gateway + Lambda + DynamoDB). <a href='https://github.com/Bigessfour/CloudResumeChallenge-frontend/blob/main/docs/DEV_SETUP.md' target='_blank' rel='noopener noreferrer'>Agent setup →</a>",
        },
        {
          header: "Code Platoon — AI Cloud & DevOps (Echo)",
          iconCss: "e-icons e-graduation",
          content:
            "Cohort curriculum: Terraform, GitHub Actions CI/CD, SageMaker, Kubernetes, Amazon Bedrock (RAG, agents), and capstone delivery. <a href='https://github.com/Bigessfour/aico-echo' target='_blank' rel='noopener noreferrer'>aico-echo →</a>",
        },
        {
          header: "Town of Wiley Website",
          iconCss: "e-icons e-globe-2",
          content:
            "Production municipal site at <a href='https://townofwiley.gov/' target='_blank' rel='noopener noreferrer'>townofwiley.gov</a> — Angular on AWS Amplify, AppSync CMS, and serverless backends. <a href='https://github.com/Bigessfour/Townofwiley' target='_blank' rel='noopener noreferrer'>GitHub →</a>",
        },
        {
          header: "Wiley Widget (wiley-co-web)",
          iconCss: "e-icons e-table-properties",
          content:
            "Blazor WebAssembly finance workspace at <a href='https://wileywidget.townofwiley.gov/' target='_blank' rel='noopener noreferrer'>wileywidget.townofwiley.gov</a> — Syncfusion UI, Aurora PostgreSQL, App Runner API. <a href='https://github.com/Bigessfour/wiley-co-web' target='_blank' rel='noopener noreferrer'>GitHub →</a>",
        },
      ],
    }).appendTo("#dashboard-accordion");
  }

  // Code Platoon note: AWS Resources accordion mirrors the 16 CRC steps.
  // Each <li> uses a small status pill (.crc-status--complete / --progress / --planned).
  function initAwsResourcesAccordion() {
    const mount = document.getElementById("aws-resources-accordion");
    if (!mount || !ej.navigations || !ej.navigations.Accordion) {
      return;
    }

    new ej.navigations.Accordion({
      expandMode: "Multiple",
      expandedIndices: [0],
      expandIcon: "e-icons e-chevron-down-fill",
      collapseIcon: "e-icons e-chevron-up-fill",
      items: [
        {
          header: "Foundation (steps 1–3)",
          iconCss: "e-icons e-folder-open",
          content:
            '<ul class="crc-step-list">' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">1. Certification</p>' +
            '<p class="crc-step-list__detail">AWS Certified Cloud Practitioner and AI Practitioner on resume and Credly.</p>' +
            '<p class="crc-step-list__link"><a href="#certifications">View credentials →</a></p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">2. HTML</p>' +
            '<p class="crc-step-list__detail">Semantic resume markup in index.html.</p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">3. CSS</p>' +
            '<p class="crc-step-list__detail">Dark glassmorphism theme in css/styles.css.</p></li>' +
            "</ul>",
        },
        {
          header: "Hosting (steps 4–6)",
          iconCss: "e-icons e-globe-2",
          content:
            '<ul class="crc-step-list">' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">4. Static Website</p>' +
            '<p class="crc-step-list__detail">Private S3 bucket deployed via Terraform; frontend sync on push.</p>' +
            '<p class="crc-step-list__link"><a href="https://github.com/Bigessfour/CloudResumeChallenge-infra/blob/main/environments/prod/storage.tf" target="_blank" rel="noopener noreferrer">storage.tf →</a></p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">5. HTTPS</p>' +
            '<p class="crc-step-list__detail">CloudFront distribution with OAC and ACM TLS.</p>' +
            '<p class="crc-step-list__link"><a href="https://github.com/Bigessfour/CloudResumeChallenge-infra/blob/main/environments/prod/cdn.tf" target="_blank" rel="noopener noreferrer">cdn.tf →</a></p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">6. DNS</p>' +
            '<p class="crc-step-list__detail">Custom domain stephenmckitrick.com served via Porkbun DNS → CloudFront. CRC spec accepts any DNS provider.</p>' +
            '<p class="crc-step-list__link"><a href="https://stephenmckitrick.com" target="_blank" rel="noopener noreferrer">Live site →</a></p></li>' +
            "</ul>",
        },
        {
          header: "Serverless (steps 7–11)",
          iconCss: "e-icons e-code-view",
          content:
            '<ul class="crc-step-list">' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">7. Javascript</p>' +
            '<p class="crc-step-list__detail">Visitor counter pill fetches count on page load.</p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">8. Database</p>' +
            '<p class="crc-step-list__detail">DynamoDB on-demand table for hit counts.</p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">9. API</p>' +
            '<p class="crc-step-list__detail">API Gateway HTTP API proxies to Lambda.</p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">10. Python</p>' +
            '<p class="crc-step-list__detail">handler.py uses boto3 UpdateItem ADD for atomic increments.</p>' +
            '<p class="crc-step-list__link"><a href="https://github.com/Bigessfour/CloudResumeChallenge-infra/blob/main/lambda/visitor_counter/handler.py" target="_blank" rel="noopener noreferrer">handler.py →</a></p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">11. Tests</p>' +
            '<p class="crc-step-list__detail">pytest suite with moto-mocked DynamoDB; 7 tests gate every terraform apply via GitHub Actions.</p>' +
            '<p class="crc-step-list__link"><a href="https://github.com/Bigessfour/CloudResumeChallenge-infra/blob/main/lambda/visitor_counter/test_handler.py" target="_blank" rel="noopener noreferrer">test_handler.py →</a></p></li>' +
            "</ul>",
        },
        {
          header: "Delivery (steps 12–16)",
          iconCss: "e-icons e-send-1",
          content:
            '<ul class="crc-step-list">' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">12. Infrastructure as Code</p>' +
            '<p class="crc-step-list__detail">Full Terraform stack (bootstrap + prod) instead of SAM.</p>' +
            '<p class="crc-step-list__link"><a href="https://github.com/Bigessfour/CloudResumeChallenge-infra/tree/main/environments/prod" target="_blank" rel="noopener noreferrer">environments/prod →</a></p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">13. Source Control</p>' +
            '<p class="crc-step-list__detail">Separate GitHub repos for frontend and infrastructure.</p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">14. CI/CD (Back end)</p>' +
            '<p class="crc-step-list__detail">terraform-plan on PR, terraform-apply on main via OIDC.</p></li>' +
            '<li><span class="crc-status crc-status--complete">Complete</span>' +
            '<p class="crc-step-list__title">15. CI/CD (Front end)</p>' +
            '<p class="crc-step-list__detail">ci.yml lint gates; deploy.yml S3 sync + CloudFront invalidation.</p></li>' +
            '<li><span class="crc-status crc-status--planned">Planned</span>' +
            '<p class="crc-step-list__title">16. Blog post</p>' +
            '<p class="crc-step-list__detail">Write-up of lessons learned — link will be added when published.</p></li>' +
            "</ul>",
        },
      ],
    }).appendTo("#aws-resources-accordion");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Charts + Grid
  // ──────────────────────────────────────────────────────────────────────────

  // Code Platoon note: small composed Column + Line chart to visualize
  // the "transformation arc" from ops/data to AI cloud.
  function initTransformationChart() {
    const chartContainer = document.getElementById("transformation-chart");
    if (!chartContainer || typeof ej === "undefined" || !ej.charts) {
      return;
    }

    const chartData = [
      { category: "Ops & Data\nInstincts", value: 78 },
      { category: "Custom Tooling\n(BusBuddy)", value: 92 },
      { category: "Cloud\nFoundations", value: 68 },
      { category: "IaC &\nServerless", value: 85 },
      { category: "AI & Future\nSolutions", value: 72 },
    ];

    const chart = new ej.charts.Chart({
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
          animation: { enable: true, duration: 1400, delay: 200 },
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
          animation: { enable: true, duration: 1600, delay: 600 },
        },
      ],
      zoomSettings: {
        enableSelectionZooming: true,
        enableMouseWheelZooming: true,
        enablePinchZooming: true,
        enableScrollbar: true,
        mode: "XY",
      },
      crosshair: {
        enable: true,
        lineType: "Vertical",
        line: { color: "#22d3ee", width: 1, dashArray: "4,4" },
      },
      selectionMode: "Point",
      pointRender: (args) => {
        if (args.series.type === "Column") {
          args.fill = args.point.index % 2 === 0 ? "#ffffff" : "#a855f7";
          args.border = { color: "rgba(192, 132, 252, 0.4)", width: 1 };
        }
      },
      chartArea: { border: { width: 0 } },
      background: "transparent",
      tooltip: {
        enable: true,
        shared: true,
        fill: "#1f2937",
        textStyle: { color: "#e7ecf3" },
        format: "${point.x}: <b>${point.y}</b>",
      },
      legendSettings: {
        visible: true,
        position: "Bottom",
        textStyle: { color: "#c4b5fd", size: "11px" },
      },
      loaded: () => {
        const svg = chartContainer.querySelector("svg");
        if (svg && !svg.querySelector("#chartLineGlow")) {
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
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

  // Code Platoon note: paged, sortable Grid for the work-history table.
  // allowTextWrap keeps long highlights readable on mobile.
  function initExperienceGrid() {
    const mount = document.getElementById("experience-grid");
    if (!mount || !ej.grids || !ej.grids.Grid) {
      return;
    }

    const experienceData = [
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

    const grid = new ej.grids.Grid({
      dataSource: experienceData,
      columns: [
        { field: "organization", headerText: "Organization", width: 220, minWidth: 160 },
        { field: "role", headerText: "Role", width: 240, minWidth: 170 },
        { field: "period", headerText: "Period", width: 140, minWidth: 110 },
        {
          field: "highlights",
          headerText: "Highlights",
          width: 420,
          minWidth: 220,
          allowFiltering: false,
        },
      ],
      allowPaging: true,
      pageSettings: { pageSize: 5, pageSizes: [5, 10, 25, "All"] },
      allowSorting: true,
      allowTextWrap: true,
      allowFiltering: true,
      filterSettings: { type: "Excel" },
      allowGrouping: true,
      groupSettings: { showGroupedColumn: false },
      allowResizing: true,
      allowReordering: true,
      allowExcelExport: true,
      allowPdfExport: true,
      showColumnChooser: true,
      toolbar: ["Search", "ColumnChooser", "ExcelExport", "PdfExport", "Print"],
      enableHover: true,
      enableStickyHeader: true,
      height: "auto",
      cssClass: "glass-grid",
      // Default is "CurrentPage" which silently drops all but the visible page
      // from print output. We want every row included.
      printMode: "AllPages",
      toolbarClick: (args) => {
        const id = args.item && args.item.id ? args.item.id : "";
        if (id.endsWith("_excelexport")) {
          // exportType: "AllPages" overrides the default current-page-only behavior.
          grid.excelExport({
            exportType: "AllPages",
            fileName: "Stephen-McKitrick-Experience.xlsx",
            hierarchyExportMode: "All",
          });
        } else if (id.endsWith("_pdfexport")) {
          // Landscape gives the wide Highlights column room to wrap legibly.
          grid.pdfExport({
            exportType: "AllPages",
            fileName: "Stephen-McKitrick-Experience.pdf",
            pageOrientation: "Landscape",
            pageSize: "Letter",
            hierarchyExportMode: "All",
          });
        } else if (id.endsWith("_print")) {
          grid.print();
        }
      },
    });
    grid.appendTo("#experience-grid");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Nav + scroll helpers
  // ──────────────────────────────────────────────────────────────────────────

  function wireNavLinks(menuBtn) {
    const navLinks = document.querySelectorAll("#main-nav a[href^='#']");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          scrollToSection(targetId);
          document.body.classList.remove("nav-open");
          if (menuBtn && menuBtn.element) {
            menuBtn.element.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
  }

  function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Code Platoon note: IntersectionObserver is the modern way to do scroll-spy.
  // The rootMargin trims top/bottom so the active section flips near viewport center.
  function initNavActiveState() {
    const navLinks = document.querySelectorAll("#main-nav a[href^='#']");
    if (!navLinks.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sectionIds = [
      "home",
      "experience",
      "projects",
      "aws-resources",
      "certifications",
      "contact",
    ];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            const isActive = href === "#" + id;
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

    sections.forEach((section) => observer.observe(section));
  }

  function initParticles() {
    const container = document.getElementById("particles");
    if (!container) return;
    if (prefersReducedMotion) return;

    const count = 36;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
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
