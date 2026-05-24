

"use strict";


const themeToggle = document.getElementById("themeToggle");
const html        = document.documentElement;

const savedTheme = localStorage.getItem("skillsTheme") || "dark";
html.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const current = html.getAttribute("data-theme");
  const next    = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("skillsTheme", next);
  drawRadar();
});


function injectSVGDefs() {
  const ns  = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";

  const defs = document.createElementNS(ns, "defs");
  const grad = document.createElementNS(ns, "linearGradient");
  grad.setAttribute("id", "circleGrad");
  grad.setAttribute("gradientUnits", "userSpaceOnUse");
  grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
  grad.setAttribute("x2", "120"); grad.setAttribute("y2", "0");

  const s1 = document.createElementNS(ns, "stop");
  s1.setAttribute("offset", "0%");
  s1.setAttribute("stop-color", "#00f5a0");

  const s2 = document.createElementNS(ns, "stop");
  s2.setAttribute("offset", "100%");
  s2.setAttribute("stop-color", "#00b4d8");

  grad.appendChild(s1);
  grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);
  document.body.prepend(svg);
}
injectSVGDefs();


function makeObserver(callback, options = {}) {
  return new IntersectionObserver(callback, { threshold: 0.15, ...options });
}


const headingObs = makeObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      headingObs.unobserve(e.target);
    }
  });
});
document.querySelectorAll(".section-heading").forEach(h => headingObs.observe(h));


const groupObs = makeObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      const items = e.target.querySelectorAll(".skill-item");
      items.forEach((item, idx) => {
        setTimeout(() => {
          item.classList.add("visible");
          const fill    = item.querySelector(".bar-fill");
          const percent = parseInt(fill.dataset.width);
          fill.style.width = percent + "%";
        }, idx * 120);
      });
      groupObs.unobserve(e.target);
    }
  });
});
document.querySelectorAll(".skill-group").forEach(g => groupObs.observe(g));


const CIRCUMFERENCE = 2 * Math.PI * 50;

const circleObs = makeObserver((entries) => {
  entries.forEach((e, idx) => {
    if (e.isIntersecting) {
      const card    = e.target;
      const percent = parseInt(card.dataset.percent);
      const fillEl  = card.querySelector(".fill");

      setTimeout(() => {
        card.classList.add("visible");
        const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
        fillEl.style.strokeDashoffset = offset;
      }, idx * 100);

      circleObs.unobserve(card);
    }
  });
});
document.querySelectorAll(".circle-card").forEach(c => circleObs.observe(c));


function animateCounter(el, target, duration = 1800) {
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const statsObs = makeObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll(".stat-num").forEach(el => {
        animateCounter(el, parseInt(el.dataset.count));
      });
      statsObs.unobserve(e.target);
    }
  });
});
const statsStrip = document.querySelector(".stats-strip");
if (statsStrip) statsObs.observe(statsStrip);


const projectObs = makeObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const cards = document.querySelectorAll(".project-card");
      cards.forEach((card, idx) => {
        setTimeout(() => card.classList.add("visible"), idx * 120);
      });
      projectObs.unobserve(e.target);
    }
  });
});
const projectsSection = document.getElementById("projectsSection");
if (projectsSection) projectObs.observe(projectsSection);


const radarData = [
  {
    label: "Frontend",
    color: "#00f5a0",
    alpha: 0.18,
    
    values: [90, 85, 80, 0, 0]
  },
  {
    label: "Backend / Python",
    color: "#00b4d8",
    alpha: 0.15,
    
    values: [0, 0, 78, 82, 75]
  },
  {
    label: "Database",
    color: "#f72585",
    alpha: 0.15,
    values: [76, 72, 0, 0, 0]
  },
  {
    label: "Python Libs",
    color: "#ff9e00",
    alpha: 0.15,
    values: [78, 74, 70, 0, 0]
  }
];


const radarAxes = ["HTML/CSS", "Data/Libs", "Python", "FastAPI", "Flask"];
const MAX_VAL   = 100;
const LEVELS    = 5;

function getThemeColors() {
  const isDark = html.getAttribute("data-theme") === "dark";
  return {
    grid:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    label: isDark ? "#6b6b80" : "#888890",
    text:  isDark ? "#e8e8f0" : "#111118",
    bg:    isDark ? "#16161e" : "#ffffff"
  };
}


const radarDataSimple = [
  { label: "HTML5",      color: "#00f5a0", value: 90 },
  { label: "CSS3",       color: "#00f5a0", value: 85 },
  { label: "Bootstrap",  color: "#00f5a0", value: 80 },
  { label: "FastAPI",    color: "#00b4d8", value: 82 },
  { label: "Flask",      color: "#00b4d8", value: 75 },
  { label: "Python",     color: "#00b4d8", value: 78 },
  { label: "SQL",        color: "#f72585", value: 76 },
  { label: "PostgreSQL", color: "#f72585", value: 72 },
  { label: "Pandas",     color: "#ff9e00", value: 78 },
  { label: "NumPy",      color: "#ff9e00", value: 74 },
  { label: "Matplotlib", color: "#ff9e00", value: 70 },
  { label: "VS Code",    color: "#7b2ff7", value: 88 },
];

let radarAnimProgress = 0;
let radarRaf = null;

function drawRadar(progress = 1) {
  const canvas = document.getElementById("radarChart");
  if (!canvas) return;
  const ctx    = canvas.getContext("2d");
  const W      = canvas.width;
  const H      = canvas.height;
  const cx     = W / 2;
  const cy     = H / 2;
  const radius = Math.min(W, H) * 0.36;
  const sides  = radarDataSimple.length;
  const colors = getThemeColors();

  ctx.clearRect(0, 0, W, H);

  
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, H);

  
  for (let lvl = 1; lvl <= LEVELS; lvl++) {
    const r = (radius / LEVELS) * lvl;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth   = 1;
    ctx.stroke();

    if (lvl < LEVELS) {
      ctx.fillStyle = colors.label;
      ctx.font      = "10px 'DM Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText((MAX_VAL / LEVELS) * lvl + "", cx + 4, cy - r + 4);
    }
  }

  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const xEnd  = cx + radius * Math.cos(angle);
    const yEnd  = cy + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth   = 1;
    ctx.stroke();

    const labelR = radius + 28;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);

    ctx.fillStyle    = colors.text;
    ctx.font         = "bold 11px 'Syne', sans-serif";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(radarDataSimple[i].label, lx, ly);
  }

  
  ctx.beginPath();
  radarDataSimple.forEach((item, i) => {
    const r     = (item.value / MAX_VAL) * radius * progress;
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const x     = cx + r * Math.cos(angle);
    const y     = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle   = "rgba(0,245,160,0.10)";
  ctx.fill();
  ctx.strokeStyle = "#00f5a0";
  ctx.lineWidth   = 2;
  ctx.stroke();

  
  radarDataSimple.forEach((item, i) => {
    const r     = (item.value / MAX_VAL) * radius * progress;
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const x     = cx + r * Math.cos(angle);
    const y     = cy + r * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle   = item.color;
    ctx.fill();
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth   = 2;
    ctx.stroke();
  });
}

function animateRadar() {
  if (radarAnimProgress >= 1) { drawRadar(1); return; }
  radarAnimProgress += 0.025;
  const eased = 1 - Math.pow(1 - Math.min(radarAnimProgress, 1), 2);
  drawRadar(eased);
  radarRaf = requestAnimationFrame(animateRadar);
}

drawRadar(0);

const radarObs = makeObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      radarAnimProgress = 0;
      if (radarRaf) cancelAnimationFrame(radarRaf);
      animateRadar();
      radarObs.unobserve(e.target);
    }
  });
});
const radarContainer = document.querySelector(".radar-container");
if (radarContainer) radarObs.observe(radarContainer);

window.addEventListener("resize", () => drawRadar(radarAnimProgress >= 1 ? 1 : 0));


const tabs = document.querySelectorAll(".tab");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    const target = tab.dataset.target;

    document.querySelectorAll(".skill-group").forEach(group => {
      if (target === "all" || group.dataset.group === target) {
        group.removeAttribute("data-hidden");
      } else {
        group.setAttribute("data-hidden", "true");
      }
    });

    document.querySelectorAll(".circle-card").forEach(card => {
      if (target === "all" || card.dataset.category === target) {
        card.removeAttribute("data-hidden");
      } else {
        card.setAttribute("data-hidden", "true");
      }
    });
  });
});


document.querySelectorAll(".skill-item").forEach(item => {
  const tooltip = item.querySelector(".tooltip");
  if (!tooltip) return;

  item.addEventListener("mouseenter", () => {
    const rect = tooltip.getBoundingClientRect();
    if (rect.left < 0) {
      tooltip.style.left      = "0";
      tooltip.style.transform = "translateX(0) scale(1)";
    }
    if (rect.right > window.innerWidth) {
      tooltip.style.left      = "auto";
      tooltip.style.right     = "0";
      tooltip.style.transform = "translateX(0) scale(1)";
    }
  });
  item.addEventListener("mouseleave", () => {
    tooltip.style.left      = "";
    tooltip.style.right     = "";
    tooltip.style.transform = "";
  });
});


const tabList = document.querySelector(".category-nav");
if (tabList) {
  tabList.addEventListener("keydown", (e) => {
    const allTabs = [...tabList.querySelectorAll(".tab")];
    const idx     = allTabs.indexOf(document.activeElement);
    if (e.key === "ArrowRight" && idx < allTabs.length - 1) {
      allTabs[idx + 1].focus(); allTabs[idx + 1].click();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      allTabs[idx - 1].focus(); allTabs[idx - 1].click();
    }
  });
}


window.addEventListener("load", () => {
  window.dispatchEvent(new Event("scroll"));
});