const roles = ["策划", "美术", "运营", "HR", "产品"];

const roleScenes = {
  策划: ["玩法原型拆解", "关卡体验复盘", "数值方案辅助", "玩家反馈归因"],
  美术: ["概念参考板", "风格一致性检查", "资产命名规范", "批量物料说明"],
  运营: ["活动方案生成", "用户分层分析", "社区舆情摘要", "版本卖点包装"],
  HR: ["AI 入职计划", "JD 与面试题", "培训反馈分析", "能力画像沉淀"],
  产品: ["竞品分析", "需求文档生成", "用户访谈整理", "版本路线评估"],
};

const questions = [
  { key: "cognition", text: "当你遇到重复性工作时，通常如何解决？" },
  { key: "cognition", text: "你认为 AI 最适合帮助你做什么？" },
  { key: "habit", text: "过去一周你使用 AI 的频率如何？" },
  { key: "habit", text: "你工作中使用 AI 的比例大约是多少？" },
  { key: "prompt", text: "如果 AI 回答效果不好，你会怎么调整？" },
  { key: "prompt", text: "你向 AI 提问时通常会提供哪些背景信息？" },
  { key: "workflow", text: "你是否尝试把 AI 嵌入固定工作流程？" },
  { key: "workflow", text: "你用过 Coze、Dify、n8n 或飞书自动化吗？" },
  { key: "innovation", text: "你会主动寻找工作里的 AI 应用机会吗？" },
  { key: "innovation", text: "最近一次用 AI 创造业务价值的案例是什么？" },
];

const dimensionNames = {
  cognition: "AI认知",
  habit: "使用习惯",
  prompt: "Prompt能力",
  workflow: "工作流能力",
  innovation: "创新能力",
};

const defaultState = {
  tab: "coach",
  role: "策划",
  xp: 320,
  companion: "🐣",
  level: "L2 AI User",
  score: 38,
  weakness: "工作流能力",
  messages: [
    {
      by: "ai",
      text: "你好，我是 AI Native 新人成长教练。先选择你的岗位，我们用 10 个轻量问题生成 90 天成长计划。",
    },
  ],
  answers: [],
  assessment: null,
  plan: null,
  practiceReview: null,
  community: [],
  toast: "",
};

let state = loadState();

const aiProvider = {
  async chat(text) {
    return {
      text:
        text.length > 8
          ? "收到。我会把你的回答转化为能力画像，下一步继续看真实工作场景。"
          : "可以再补充一个具体例子吗？这样计划会更贴近你的岗位。",
    };
  },
  async assess(role, answers) {
    const scores = { cognition: 0, habit: 0, prompt: 0, workflow: 0, innovation: 0 };
    answers.forEach((answer, index) => {
      const q = questions[index];
      scores[q.key] += scoreAnswer(answer);
    });
    Object.keys(scores).forEach((key) => {
      scores[key] = Math.min(20, Math.max(6, scores[key]));
    });
    const total = Object.values(scores).reduce((sum, n) => sum + n, 0);
    const level = getLevel(total);
    const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    return {
      role,
      scores,
      total,
      level,
      weakness: dimensionNames[sorted[0][0]],
      strength: dimensionNames[sorted[sorted.length - 1][0]],
    };
  },
  async generatePlan(role, assessment) {
    const scenes = roleScenes[role];
    return [
      {
        day: "30",
        title: "建立 AI 协作基本功",
        text: `完成 ${role} 岗位 AI 工具入门，掌握高质量提问、结果校验和 ${scenes[0]} 的基础流程。`,
      },
      {
        day: "60",
        title: "嵌入真实业务场景",
        text: `选择 ${scenes[1]} 和 ${scenes[2]} 两个场景做小规模实践，形成可复用 Prompt 或工作流。`,
      },
      {
        day: "90",
        title: "沉淀组织级实践资产",
        text: `发布 1 个 ${role} AI 最佳实践案例，说明问题、方案、Prompt、效果和可复制经验。`,
      },
    ];
  },
  async reviewPractice(content, taskType) {
    const quality = Math.min(96, 64 + Math.floor(content.length / 6));
    return {
      score: quality,
      text: `完成度 ${quality} 分。亮点是你已经围绕“${taskType}”给出具体内容。建议补充输入材料、判断标准和最终产出格式，方便同事复用。`,
      xp: 80,
    };
  },
};

function scoreAnswer(text) {
  const richWords = ["流程", "自动", "复盘", "数据", "prompt", "提示词", "工具", "案例", "效率", "模板"];
  const base = Math.min(7, Math.max(3, Math.ceil(text.trim().length / 10)));
  const bonus = richWords.reduce((sum, word) => sum + (text.toLowerCase().includes(word) ? 2 : 0), 0);
  return Math.min(10, base + bonus);
}

function getLevel(total) {
  if (total <= 20) return "L1 AI Observer";
  if (total <= 40) return "L2 AI User";
  if (total <= 60) return "L3 AI Collaborator";
  if (total <= 80) return "L4 AI Builder";
  return "L5 AI Native";
}

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem("coach-state") || "{}") };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem("coach-state", JSON.stringify(state));
}

function setState(next) {
  state = { ...state, ...next };
  saveState();
  render();
}

function showToast(text) {
  setState({ toast: text });
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => setState({ toast: "" }), 2200);
}

function companionByXp(xp) {
  if (xp >= 3000) return "🧠";
  if (xp >= 1500) return "🛠";
  if (xp >= 800) return "🤖";
  if (xp >= 300) return "🐣";
  return "🥚";
}

function nextXp(xp) {
  if (xp < 300) return 300;
  if (xp < 800) return 800;
  if (xp < 1500) return 1500;
  if (xp < 3000) return 3000;
  return 3600;
}

function icon(name) {
  const paths = {
    coach: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="3"/><path d="M2 14h2M20 14h2M9 13v2M15 13v2"/>',
    learn: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>',
    hub: '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <header class="topbar">
      <div class="topline">
        <div>
          <h1 class="title">AI Native 新人成长教练</h1>
          <p class="subtitle">腾讯游戏部门新人及转 AI 员工 90 天融入计划</p>
        </div>
        <span class="pill">${state.role}</span>
      </div>
    </header>
    <section class="screen">${screen()}</section>
    ${tabs()}
    ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
  `;
  bindEvents();
}

function tabs() {
  const data = [
    ["coach", "AI教练", "coach"],
    ["learn", "学习广场", "learn"],
    ["hub", "实践社区", "hub"],
  ];
  return `<nav class="tabs">${data
    .map(
      ([key, label, ico]) =>
        `<button class="tab ${state.tab === key ? "active" : ""}" data-tab="${key}">${icon(ico)}<span>${label}</span></button>`,
    )
    .join("")}</nav>`;
}

function screen() {
  if (state.tab === "learn") return learnScreen();
  if (state.tab === "hub") return hubScreen();
  return coachScreen();
}

function coachScreen() {
  const target = nextXp(state.xp);
  const pct = Math.min(100, Math.round((state.xp / target) * 100));
  return `
    <section class="card hero-card">
      <div class="companion">
        <div class="avatar">${companionByXp(state.xp)}</div>
        <div>
          <h2 class="h2">AI 成长伙伴</h2>
          <div class="small">${state.xp} XP · 距离升级还差 ${Math.max(0, target - state.xp)} XP</div>
        </div>
      </div>
      <div class="progress" style="--value:${pct}%"><span></span></div>
      <div class="grid-3">
        <div class="metric"><strong>${state.level.split(" ")[0]}</strong><span>当前等级</span></div>
        <div class="metric"><strong>${state.score}</strong><span>AI总分</span></div>
        <div class="metric"><strong>${state.weakness}</strong><span>当前短板</span></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>岗位选择</h2>
        <button class="btn ghost" data-action="reset">重置</button>
      </div>
      <div class="chips">${roles
        .map((role) => `<button class="chip ${state.role === role ? "active" : ""}" data-role="${role}">${role}</button>`)
        .join("")}</div>
    </section>

    <section class="section card chat">
      <div class="messages">${state.messages.map((m) => `<div class="msg ${m.by}">${m.text}</div>`).join("")}</div>
      ${quickActions()}
      <div class="input-row">
        <input class="input" id="chatInput" placeholder="输入你的回答或工作场景" />
        <button class="btn" data-action="send">发送</button>
      </div>
    </section>

    ${state.assessment ? assessmentCard() : ""}
    ${state.plan ? planCard() : ""}
  `;
}

function quickActions() {
  const nextQuestion = questions[state.answers.length];
  return `
    <div class="btn-row">
      <button class="btn secondary" data-action="diagnose">${nextQuestion ? "开始/继续诊断" : "重新诊断"}</button>
      <button class="btn secondary" data-action="plan">生成成长路线</button>
      <button class="btn secondary" data-action="scene">发现AI场景</button>
    </div>`;
}

function assessmentCard() {
  const a = state.assessment;
  return `
    <section class="section card radar-wrap">
      <div class="section-head">
        <h2>能力雷达图</h2>
        <span class="tag">${a.level}</span>
      </div>
      ${radar(a.scores)}
      <div class="small">优势：${a.strength} · 待提升：${a.weakness}</div>
    </section>`;
}

function radar(scores) {
  const keys = Object.keys(dimensionNames);
  const points = keys
    .map((key, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / keys.length;
      const radius = 74 * (scores[key] / 20);
      return `${110 + Math.cos(angle) * radius},${96 + Math.sin(angle) * radius}`;
    })
    .join(" ");
  const axes = keys
    .map((key, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / keys.length;
      const x = 110 + Math.cos(angle) * 86;
      const y = 96 + Math.sin(angle) * 86;
      const tx = 110 + Math.cos(angle) * 101;
      const ty = 100 + Math.sin(angle) * 101;
      return `<line x1="110" y1="96" x2="${x}" y2="${y}" stroke="#d9ddec"/><text x="${tx}" y="${ty}" font-size="10" text-anchor="middle" fill="#667085">${dimensionNames[key]}</text>`;
    })
    .join("");
  return `<svg class="radar" viewBox="0 0 220 205" role="img" aria-label="能力雷达图">
    <polygon points="110,10 192,69 161,165 59,165 28,69" fill="none" stroke="#e7e9f2"/>
    <polygon points="110,39 164,78 144,142 76,142 56,78" fill="none" stroke="#e7e9f2"/>
    ${axes}
    <polygon points="${points}" fill="rgba(124,92,255,.22)" stroke="#7C5CFF" stroke-width="2"/>
  </svg>`;
}

function planCard() {
  return `
    <section class="section">
      <div class="section-head"><h2>90 天成长路线</h2><span class="tag">${state.role}</span></div>
      <div class="plan">${state.plan
        .map(
          (p) => `<article class="card plan-step"><div class="day">${p.day}天</div><div><h3 class="item-title">${p.title}</h3><p class="small">${p.text}</p></div></article>`,
        )
        .join("")}</div>
    </section>`;
}

function learnScreen() {
  const resources = [
    ["AI 协作入门：从任务拆解到结果校验", "文本", "5分钟", "L1-L2"],
    [`${state.role}岗位 Prompt 模板课`, "视频", "8分钟", "L2-L3"],
    [`${roleScenes[state.role][0]} 实战练习`, "练习", "+80 XP", "L2-L4"],
    [`${roleScenes[state.role][1]} 工作流搭建`, "视频", "10分钟", "L3-L4"],
  ];
  return `
    <section class="section">
      <div class="section-head"><h2>推荐学习</h2><span class="tag">岗位相关</span></div>
      <div class="list">${resources
        .map(
          ([title, type, time, level]) => `<article class="card item">
            <div class="item-top"><h3 class="item-title">${title}</h3><span class="tag">${type}</span></div>
            <div class="small">${time} · ${level} · ${state.role}</div>
            <button class="btn secondary full" data-action="finishLearn">标记完成 +30 XP</button>
          </article>`,
        )
        .join("")}</div>
    </section>
    <section class="section card form">
      <h2 class="h2">场景练习</h2>
      <select class="select" id="practiceType">${roleScenes[state.role]
        .map((s) => `<option>${s}</option>`)
        .join("")}</select>
      <textarea class="textarea" id="practiceText" placeholder="粘贴你的练习成果，例如 Prompt、分析结论或工作流步骤"></textarea>
      <button class="btn" data-action="review">提交点评 +80 XP</button>
      ${state.practiceReview ? `<div class="small">${state.practiceReview.text}</div>` : ""}
    </section>`;
}

function hubScreen() {
  const cards = [
    [`用 AI 把${roleScenes[state.role][0]}从 3 小时压缩到 30 分钟`, "林同学", state.role, "最佳实践", 56],
    [`${state.role}新人常用 Prompt 清单`, "AI Coach", state.role, "Prompt", 42],
    [`${roleScenes[state.role][2]}自动化流程`, "项目组", state.role, "工作流", 31],
    ...state.community,
  ];
  return `
    <section class="section">
      <div class="section-head"><h2>AI Skill Hub</h2><span class="tag">组织资产</span></div>
      <div class="chips">
        <button class="chip active">AI最佳实践</button><button class="chip">Prompt分享</button><button class="chip">工作流分享</button><button class="chip">AI案例库</button>
      </div>
    </section>
    <section class="section list">${cards
      .map(
        ([title, author, role, type, fav]) => `<article class="card item">
          <div class="item-top"><h3 class="item-title">${title}</h3><span class="tag">${type}</span></div>
          <div class="small">${author} · ${role} · 收藏 ${fav}</div>
        </article>`,
      )
      .join("")}</section>
    <section class="section card form">
      <h2 class="h2">发布实践模板</h2>
      <input class="input" id="caseTitle" placeholder="标题，例如：用 AI 优化活动复盘" />
      <textarea class="textarea" id="caseBody" placeholder="场景：&#10;问题：&#10;解决方案：&#10;Prompt：&#10;效果："></textarea>
      <button class="btn" data-action="publish">发布案例 +100 XP</button>
    </section>`;
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => setState({ tab: btn.dataset.tab }));
  });
  document.querySelectorAll("[data-role]").forEach((btn) => {
    btn.addEventListener("click", () => setState({ role: btn.dataset.role }));
  });
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn.dataset.action));
  });
  const input = document.querySelector("#chatInput");
  if (input) input.addEventListener("keydown", (e) => e.key === "Enter" && handleAction("send"));
}

async function handleAction(action) {
  if (action === "reset") {
    localStorage.removeItem("coach-state");
    state = { ...defaultState };
    render();
    return;
  }
  if (action === "diagnose") return askNextQuestion();
  if (action === "send") return sendMessage();
  if (action === "plan") return generatePlan();
  if (action === "scene") return discoverScene();
  if (action === "finishLearn") return gainXp(30, "已完成学习，获得 30 XP");
  if (action === "review") return reviewPractice();
  if (action === "publish") return publishCase();
}

async function askNextQuestion() {
  if (state.answers.length >= questions.length) {
    setState({ answers: [], assessment: null, messages: [...state.messages, { by: "ai", text: questions[0].text }] });
    return;
  }
  setState({ messages: [...state.messages, { by: "ai", text: questions[state.answers.length].text }] });
}

async function sendMessage() {
  const input = document.querySelector("#chatInput");
  const text = input?.value.trim();
  if (!text) return;
  const messages = [...state.messages, { by: "user", text }];
  const answers = state.answers.length < questions.length ? [...state.answers, text] : state.answers;
  if (answers.length === questions.length) {
    const assessment = await aiProvider.assess(state.role, answers);
    const plan = await aiProvider.generatePlan(state.role, assessment);
    setState({
      messages: [
        ...messages,
        {
          by: "ai",
          text: `诊断完成：${assessment.level}，总分 ${assessment.total}。优势是${assessment.strength}，建议优先提升${assessment.weakness}。`,
        },
      ],
      answers,
      assessment,
      plan,
      level: assessment.level,
      score: assessment.total,
      weakness: assessment.weakness,
      xp: state.xp + 50,
    });
    showToast("完成能力诊断，获得 50 XP");
    return;
  }
  const reply = answers.length < questions.length ? questions[answers.length].text : (await aiProvider.chat(text)).text;
  setState({ messages: [...messages, { by: "ai", text: reply }], answers });
}

async function generatePlan() {
  const assessment = state.assessment || (await aiProvider.assess(state.role, ["流程", "辅助业务", "每周", "30%", "补充背景", "目标", "尝试", "没用过", "会", "提升效率"]));
  const plan = await aiProvider.generatePlan(state.role, assessment);
  setState({
    assessment,
    plan,
    messages: [...state.messages, { by: "ai", text: `已生成 ${state.role} 岗位 30/60/90 天成长路线，重点围绕真实业务场景实践。` }],
  });
}

function discoverScene() {
  const scenes = roleScenes[state.role]
    .map((scene) => `${scene}：用 AI 先完成信息整理、方案初稿和检查清单，预计节省 30%-50% 时间。`)
    .join("<br>");
  setState({ messages: [...state.messages, { by: "ai", text: scenes }] });
}

function gainXp(amount, text) {
  setState({ xp: state.xp + amount });
  showToast(text);
}

async function reviewPractice() {
  const content = document.querySelector("#practiceText")?.value.trim();
  const taskType = document.querySelector("#practiceType")?.value;
  if (!content) return showToast("请先填写练习成果");
  const review = await aiProvider.reviewPractice(content, taskType);
  setState({ practiceReview: review, xp: state.xp + review.xp });
  showToast(`练习已点评，获得 ${review.xp} XP`);
}

function publishCase() {
  const title = document.querySelector("#caseTitle")?.value.trim();
  if (!title) return showToast("请先填写案例标题");
  const item = [title, "我", state.role, "案例", 0];
  setState({ community: [item, ...state.community], xp: state.xp + 100 });
  showToast("案例已发布，获得 100 XP");
}

render();
