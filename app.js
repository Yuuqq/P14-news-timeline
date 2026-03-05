/**
 * P14 交互式突发新闻时间轴
 * Upgraded: interactive add/delete events, drag-sort-ready, color labels, export JSON
 */
const jsonInput = document.getElementById("jsonInput");
const renderBtn = document.getElementById("renderBtn");
const addBtn = document.getElementById("addBtn");
const exportBtn = document.getElementById("exportBtn");
const statusEl = document.getElementById("status");
const timelineEl = document.getElementById("timeline");

const SAMPLE = [
  { date: "2026-01-12 08:30", title: "突发事件发生", desc: "当地发布初步通报，确认发生重大突发情况。", color: "#e74c3c" },
  { date: "2026-01-12 11:10", title: "现场救援展开", desc: "多支救援力量进入现场，医疗与交通保障同步启动。", color: "#f39c12" },
  { date: "2026-01-12 16:00", title: "伤亡初步统计", desc: "救援指挥部发布首批伤亡数字，全市进入应急响应。", color: "#e67e22" },
  { date: "2026-01-13 09:00", title: "二次发布会", desc: "官方补充伤亡和处置进展，公布后续调查安排。", color: "#3498db" },
  { date: "2026-01-14 10:00", title: "调查组进驻", desc: "国务院安委会派出调查组，展开全面调查。", color: "#2ecc71" }
];

let currentData = [...SAMPLE];
jsonInput.value = JSON.stringify(SAMPLE, null, 2);

function setStatus(text) {
  statusEl.textContent = `状态: ${text}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderTimeline(items) {
  timelineEl.innerHTML = "";
  if (items.length === 0) {
    timelineEl.innerHTML = '<p class="empty-hint">暂无事件。点击"添加事件"或在 JSON 区域输入数据。</p>';
    return;
  }

  items.forEach((it, i) => {
    const article = document.createElement("article");
    article.className = "item";
    if (it.color) {
      article.style.borderLeftColor = it.color;
    }

    const date = document.createElement("div");
    date.className = "date";
    date.textContent = String(it.date ?? "");

    const title = document.createElement("h3");
    title.className = "title";
    title.textContent = String(it.title ?? "");

    const desc = document.createElement("p");
    desc.className = "desc";
    desc.textContent = String(it.desc ?? "");

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "删除此事件";
    deleteBtn.addEventListener("click", () => {
      currentData.splice(i, 1);
      syncAndRender();
      setStatus(`已删除事件: ${it.title}`);
    });

    article.append(deleteBtn, date, title, desc);

    // Fade-in
    article.style.opacity = "0";
    article.style.transform = "translateX(-10px)";
    article.style.transition = "opacity 0.3s, transform 0.3s";
    timelineEl.appendChild(article);
    requestAnimationFrame(() => {
      article.style.opacity = "1";
      article.style.transform = "translateX(0)";
    });
  });
}

function syncAndRender() {
  const sorted = [...currentData].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  currentData = sorted;
  jsonInput.value = JSON.stringify(sorted, null, 2);
  renderTimeline(sorted);
}

renderBtn.addEventListener("click", () => {
  try {
    const data = JSON.parse(jsonInput.value);
    if (!Array.isArray(data)) throw new Error("JSON 顶层必须是数组");
    currentData = data;
    syncAndRender();
    setStatus(`渲染完成，共 ${currentData.length} 个节点`);
  } catch (err) {
    setStatus(`渲染失败: ${err.message}`);
  }
});

// Add event interactively
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const colors = ["#e74c3c", "#f39c12", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"];
    currentData.push({
      date: dateStr,
      title: `新事件 ${currentData.length + 1}`,
      desc: "双击此处编辑描述",
      color: colors[currentData.length % colors.length]
    });
    syncAndRender();
    setStatus(`已添加事件，共 ${currentData.length} 个节点`);
  });
}

// Export JSON
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline-events.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("已导出 JSON");
  });
}

syncAndRender();

// === PM Metrics Integration ===
(function () {
  try {
    if (!window.pmMetrics) return;
    let taskStarted = false;
    document.addEventListener('click', function (e) {
      if (taskStarted) return;
      const btn = e.target.closest('button');
      if (btn) {
        taskStarted = true;
        window.pmMetrics.markTaskStart('timeline_add_task');
      }
    }, { once: false });
  } catch (_e) { }
})();
