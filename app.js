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
  { date: "2025-08-10 09:00", title: "村民首次举报", desc: "上游村庄多名村民在社交媒体发布视频，显示黑水直排入江，且伴有刺鼻气味。环保部门表示将派人核实。", color: "#f39c12" },
  { date: "2025-08-12 14:30", title: "官方初步通报", desc: "当地环保局通报称：未发现明显的工业排污口，水体发黑可能是因为近期暴雨导致的底泥上泛。", color: "#3498db" },
  { date: "2025-08-15 22:00", title: "暗访取证（独家）", desc: "调查记者携带无人机夜间暗访，在距离化工厂 2 公里外的隐秘涵洞内，拍摄到红外热成像下的非法暗管排污。", color: "#e74c3c" },
  { date: "2025-08-16 10:00", title: "检测报告出炉", desc: "记者将被污染河水送往第三方资质机构（SGS）检测。报告显示：重金属铬超标 120 倍，苯胺类有机物严重超标。", color: "#8e44ad" },
  { date: "2025-08-18 08:00", title: "调查报道重磅发布", desc: "《隐秘的暗管：谁在毒化我们的母亲河？》发布，引发全国舆论轰动。涉事化工厂股票开盘即跌停。", color: "#e67e22" },
  { date: "2025-08-18 16:00", title: "省级调查组介入", desc: "省生态环境厅联合公安机关成立专案组，进驻涉事化工厂，控制 5 名相关责任人，并关停生产线。", color: "#2ecc71" }
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
