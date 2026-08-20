const app = document.querySelector("#app");
const site = document.body.dataset.site || "control";
const languageButton = document.querySelector("#language");

const words = {
  zh: {
    control: ["总管中心", "统一管理五个独立站点、权限、自动化与检修状态。"],
    show: ["展示中心", "让用户发布自己的内容，并通过受控视觉场景展示作品。"],
    chat: ["聊天中心", "独立聊天站点，后续接入实时消息与审核机制。"],
    complaint: ["投诉中心", "投诉编号、分配、升级、审计与安全附件流程。"],
    mail: ["Mail 管理", "管理员自定义邮箱前缀、路由、通知与邮件审计。"],
    visual: "视觉预览",
    next: "安全注册、GitHub OAuth、Turnstile 和所有权 API 将在下一阶段接入。"
  },
  en: {
    control: ["Control Center", "Manage five independent sites, permissions, automation, and maintenance."],
    show: ["Showcase", "Users publish their own content through controlled visual scenes."],
    chat: ["Chat", "A separate chat site with real-time messaging and moderation in the next phase."],
    complaint: ["Complaints", "Ticketing, assignment, escalation, audit, and protected evidence."],
    mail: ["Mail Admin", "Administrator-controlled custom aliases, routing, notifications, and audit."],
    visual: "Visual preview",
    next: "Secure registration, GitHub OAuth, Turnstile, and ownership APIs arrive in the next phase."
  }
};

let language = localStorage.getItem("rory-language") === "en" ? "en" : "zh";

function render() {
  const copy = words[language];
  const [title, description] = copy[site] || copy.control;

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${copy.visual}</p>
        <h1>${title}</h1>
        <p>${description}</p>
        <div class="scene-controls">
          <label>Accent
            <select id="accent">
              <option value="#0f766e">Teal</option>
              <option value="#c94f38">Coral</option>
              <option value="#b88918">Gold</option>
            </select>
          </label>
          <label>Motion
            <select id="motion">
              <option value="1">Normal</option>
              <option value=".55">Slow</option>
              <option value="1.7">Fast</option>
            </select>
          </label>
        </div>
      </div>
      <div class="road"></div>
      <div class="cyclist" id="cyclist" aria-hidden="true">
        <i class="wheel one"></i><i class="wheel two"></i>
        <i class="frame"></i><i class="rider-head"></i><i class="rider-body"></i>
      </div>
    </section>
    <section class="shell">
      <p class="eyebrow">Rory Platform</p>
      <div class="grid three">
        <article class="panel">
          <span class="site-badge">${site}</span>
          <h2>Foundation</h2>
          <p class="muted">${copy.next}</p>
        </article>
        <article class="panel">
          <p class="metric">5</p>
          <h2>Sites</h2>
          <p class="muted">Control, Show, Chat, Complaint, Mail</p>
        </article>
        <article class="panel">
          <p class="metric">D1 + R2</p>
          <h2>Cloudflare</h2>
          <p class="muted">Private storage and audited data structures are prepared.</p>
        </article>
      </div>
    </section>
    <section class="magnet-area">
      <div class="shell">
        <p class="eyebrow">Magnet stairs</p>
        <div class="magnet-list">
          <article class="magnet-card"><h2>01. Publish</h2><p>Each user will own their content through server-side ownership checks.</p></article>
          <article class="magnet-card"><h2>02. Moderate</h2><p>Roles, audit logs, automation events, and maintenance controls belong in D1.</p></article>
          <article class="magnet-card"><h2>03. Evolve</h2><p>Future changes use Git branches, preview deployments, checks, review, and release.</p></article>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#accent").addEventListener("change", (event) => {
    document.documentElement.style.setProperty("--teal", event.target.value);
  });

  document.querySelector("#motion").addEventListener("change", (event) => {
    document.documentElement.dataset.motion = event.target.value;
  });

  bindMotion();
}

function bindMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cyclist = document.querySelector("#cyclist");
  const cards = [...document.querySelectorAll(".magnet-card")];
  let scheduled = false;

  function update() {
    const hero = document.querySelector(".hero");
    const ratio = Math.max(0, Math.min(1, (window.scrollY + innerHeight * .2) / hero.offsetHeight));
    const speed = Number(document.documentElement.dataset.motion || 1);

    cyclist.style.transform = `translateX(${ratio * (innerWidth + 190) * speed}px)`;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.min(1, Math.abs(rect.top + rect.height / 2 - innerHeight / 2) / innerHeight);
      const shift = (1 - distance) * 16 * (index % 2 ? -1 : 1);
      card.style.transform = `translateX(${shift}px) scale(${1 + (1 - distance) * .05})`;
    });

    scheduled = false;
  }

  addEventListener("scroll", () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  addEventListener("resize", update);
  update();
}

languageButton.addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  localStorage.setItem("rory-language", language);
  languageButton.textContent = language === "zh" ? "EN" : "中文";
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  render();
});

languageButton.textContent = language === "zh" ? "EN" : "中文";
render();
