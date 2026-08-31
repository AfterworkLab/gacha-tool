/* ============================================================
   ui.js — ガチャシミュレーター UI
   凸進捗グラフ対応（横軸：ガチャ回数、縦軸：凸段階確率）
   1001連以上はグラフ非表示
   デフォルメ（間引き）対応
   グラフ暴走防止（destroy）
   ============================================================ */

let currentGame = "StarRail";
let currentBanner = "character";

/* ------------------------------------------------------------
   ★ゲーム別課金レート設定
   ------------------------------------------------------------ */
const PRICE_CONFIG = {
  StarRail: { yen: 12000, stones: 6480 },
  Genshin: { yen: 12000, stones: 6480 },
  Zenless: { yen: 12000, stones: 6480 }
};

/* ------------------------------------------------------------
   ゲーム別ラベル
   ------------------------------------------------------------ */
function getLabelsForGame(game) {
  if (game === "StarRail") {
    return {
      stones: "星玉",
      ticket: "星軌専用チケット",
      paid: "往日の夢華",
      pass: "列車補給標章"
    };
  }
  if (game === "Genshin") {
    return {
      stones: "原石",
      ticket: "紡がれた運命",
      paid: "創世結晶",
      pass: "空月の祝福"
    };
  }
  return {
    stones: "ポリクローム",
    ticket: "暗号化マスターテープ",
    paid: "モノクローム",
    pass: "インターノット会員"
  };
}

function updateGameLabels() {
  const labels = getLabelsForGame(currentGame);
  const ls = document.getElementById("label-stones");
  const lt = document.getElementById("label-tickets");
  const lp = document.getElementById("label-paid");
  const lpass = document.getElementById("label-pass");

  if (ls) ls.textContent = labels.stones;
  if (lt) lt.textContent = labels.ticket;
  if (lp) lp.textContent = labels.paid;
  if (lpass) lpass.textContent = labels.pass;
}

/* ------------------------------------------------------------
   初期化
   ------------------------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
  renderGameSelect();
  renderBannerTabs();
  renderResourceInputs();
  renderFutureResourceSection();
  renderRunButton();
  updateBackgroundColor();
  updateGameLabels();
});

/* ------------------------------------------------------------
   ① ゲーム選択
   ------------------------------------------------------------ */
function renderGameSelect() {
  const el = document.getElementById("game-select");

  el.innerHTML = `
    <h2>ゲーム選択</h2>
    <div class="game-buttons">
      <button class="game-btn" data-game="StarRail">崩壊スターレイル</button>
      <button class="game-btn" data-game="Genshin">原神</button>
      <button class="game-btn" data-game="Zenless">ゼンゼロ</button>
    </div>
  `;

  document.querySelectorAll(".game-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentGame = btn.dataset.game;

      document.querySelectorAll(".game-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      updateBackgroundColor();
      updateCurrentStatusLabel();
      updateGameLabels();
    });
  });

  document.querySelector(`.game-btn[data-game="${currentGame}"]`).classList.add("active");
}

/* ------------------------------------------------------------
   ② ガチャタイプ選択
   ------------------------------------------------------------ */
function renderBannerTabs() {
  const el = document.getElementById("banner-tabs");

  el.innerHTML = `
    <div class="banner-tabs">
      <button id="tab-character" class="banner-tab active">★ キャラガチャ</button>
      <button id="tab-weapon" class="banner-tab">武器ガチャ</button>
    </div>
  `;

  document.getElementById("tab-character").addEventListener("click", () => {
    currentBanner = "character";
    updateBannerTabs();
    updateCurrentStatusLabel();
  });

  document.getElementById("tab-weapon").addEventListener("click", () => {
    currentBanner = "weapon";
    updateBannerTabs();
    updateCurrentStatusLabel();
  });
}

function updateBannerTabs() {
  document.getElementById("tab-character").classList.toggle("active", currentBanner === "character");
  document.getElementById("tab-weapon").classList.toggle("active", currentBanner === "weapon");
}

/* ------------------------------------------------------------
   ③ 所持リソース（★追加：追加連数入力）
   ------------------------------------------------------------ */
function renderResourceInputs() {
  const el = document.getElementById("resources");

  el.innerHTML = `
    <h2>所持リソース</h2>

    <div class="row-2col">
      <div class="col">
        <label id="label-stones"></label>
        <input id="input-stones" type="number" value="0">
      </div>

      <div class="col">
        <label id="label-tickets"></label>
        <input id="input-tickets" type="number" value="0">
      </div>
    </div>

    <!-- ★追加：追加連数入力欄 -->
    <div class="row-2col">
      <div class="col">
        <label>追加で回したい連数</label>
        <input id="input-extra-pulls" type="number" value="0" min="0">
      </div>

      <div class="col">
        <small>
          ※課金額はゲーム別レート（12000円→6480石）を元に計算します。
        </small>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------
   ④ 未来の石（詳細設定）
   ------------------------------------------------------------ */
function renderFutureResourceSection() {
  const el = document.getElementById("future-resources");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  el.innerHTML = `
    <button id="future-toggle" class="future-toggle">
      ▼ 未来の石・詳細設定（タップして開く）
    </button>

    <div id="future-body" class="future-body hidden">

      <h3 id="label-paid"></h3>
      <input id="input-paid" type="number" value="0">

      <h3>イベント石</h3>
      <div class="row-2col">
        <div class="col">
          <select id="input-event-main">
            <option value="0">0</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
            <option value="1500">1500</option>
            <option value="2000">2000</option>
          </select>
        </div>

        <div class="col">
          <input id="input-event-extra" type="number" value="0" min="0" max="499">
        </div>
      </div>

      <h3>現在のガチャ状況</h3>
      <div class="row-2col">
        <div class="col">
          <label>現在の★5カウント</label>
          <input id="input-pity5" type="number" value="0">
        </div>

        <div class="col">
          <label>次の★5はPU確定？</label>
          <select id="input-guarantee5">
            <option value="false">未確定</option>
            <option value="true">確定</option>
          </select>
        </div>
      </div>

      <h3>未来の石</h3>
      <div class="row-3col">
        <div class="col">
          <label>ピックアップ日</label>
          <input id="input-pickup-date" type="date" min="${todayStr}">
        </div>

        <div class="col">
          <label>デイリー達成率</label>
          <select id="input-daily-rate">
            <option value="0">実施なし</option>
            <option value="0.4">週数回</option>
            <option value="0.8">ほぼ毎日</option>
            <option value="1.0">毎日</option>
          </select>
        </div>

        <div class="col">
          <label id="label-pass"></label>
          <select id="input-pass">
            <option value="none">未購入</option>
            <option value="active">購入済</option>
          </select>
        </div>
      </div>

      <h3>シミュレーション精度</h3>
      <select id="input-trials">
        <option value="20000">2万回（推奨）</option>
        <option value="50000">5万回（高精度）</option>
        <option value="100000">10万回（超高精度）</option>
      </select>

    </div>
  `;

  document.getElementById("future-toggle").addEventListener("click", () => {
    const body = document.getElementById("future-body");
    const toggle = document.getElementById("future-toggle");

    body.classList.toggle("hidden");

    toggle.textContent = body.classList.contains("hidden")
      ? "▼ 未来の石・詳細設定（タップして開く）"
      : "▲ 未来の石・詳細設定（タップして閉じる）";
  });
}

/* ------------------------------------------------------------
   ⑤ 計算ボタン
   ------------------------------------------------------------ */
function renderRunButton() {
  const el = document.getElementById("run-button");

  el.innerHTML = `
    <div id="current-status" class="current-status"></div>

    <button id="run-sim" class="run-button">
      計算する
    </button>
  `;

  updateCurrentStatusLabel();

  document.getElementById("run-sim").addEventListener("click", runSimulation);
}

/* ------------------------------------------------------------
   現在の状態ラベル
   ------------------------------------------------------------ */
function updateCurrentStatusLabel() {
  const el = document.getElementById("current-status");

  const gameName = {
    StarRail: "崩壊スターレイル",
    Genshin: "原神",
    Zenless: "ゼンゼロ"
  }[currentGame];

  const bannerName = currentBanner === "character" ? "キャラガチャ" : "武器ガチャ";

  el.textContent = `現在：${gameName} / ${bannerName}`;
}

/* ------------------------------------------------------------
   背景色切り替え
   ------------------------------------------------------------ */
function updateBackgroundColor() {
  const colors = {
    StarRail: "#E8F1FF",
    Genshin: "#FFF7D9",
    Zenless: "#F4E8FF"
  };

  document.body.style.backgroundColor = colors[currentGame];
}

/* ------------------------------------------------------------
   ⑥ シミュレーション実行（simulateDistribution 版）
   ------------------------------------------------------------ */
function runSimulation() {
  const key = `${currentGame}_${currentBanner}`;
  const config = GAME_CONFIGS[key];

  const engine = new GachaEngine(config);
  const simulator = new MonteCarloSimulator(engine);

  const pity5 = Number(document.getElementById("input-pity5").value) || 0;
  const guarantee5 = document.getElementById("input-guarantee5").value === "true";

  const stones = Number(document.getElementById("input-stones").value) || 0;
  const tickets = Number(document.getElementById("input-tickets").value) || 0;

  const paid = Number(document.getElementById("input-paid").value) || 0;
  const eventMain = Number(document.getElementById("input-event-main").value) || 0;
  const eventExtra = Number(document.getElementById("input-event-extra").value) || 0;

  const pickupStr = document.getElementById("input-pickup-date").value;
  let diffDays = 0;

  if (pickupStr) {
    const today = new Date();
    const pickup = new Date(pickupStr);
    diffDays = Math.max(0, Math.floor((pickup - today) / 86400000));
  }

  const dailyRate = Number(document.getElementById("input-daily-rate").value);
  const dailyStones = diffDays * 60 * dailyRate;

  const pass = document.getElementById("input-pass").value;
  const passStones = pass === "active" ? diffDays * 90 : 0;

  const totalStones =
    stones + paid + eventMain + eventExtra +
    dailyStones + passStones;

  const extraPulls = Number(document.getElementById("input-extra-pulls").value) || 0;

  const totalPulls =
    Math.floor(totalStones / config.pullCostStones) +
    tickets +
    extraPulls;

  const initialState = {
    pity5,
    pity4: 0,
    guarantee5,
    obtained5: 0,
    obtained5NonPU: 0,
    obtained4: 0
  };

  const trials = Number(document.getElementById("input-trials").value);

  /* ★ simulateDistribution を使用 */
  const dist = simulator.simulateDistribution(trials, initialState, totalPulls);

  /* ★ progress を自前で生成（グラフ用） */
  const progress = [];
  for (let pulls = 1; pulls <= totalPulls; pulls++) {
    const d = simulator.simulateDistribution(trials, initialState, pulls);
    progress.push({ pulls, distribution: d.distribution });
  }

  /* ------------------------------------------------------------
     ★課金額計算
     ------------------------------------------------------------ */
  let extraCost = null;
  const priceCfg = PRICE_CONFIG[currentGame];

  if (priceCfg && priceCfg.yen > 0 && priceCfg.stones > 0) {
    const yenPerStone = priceCfg.yen / priceCfg.stones;
    const yenPerPull = yenPerStone * config.pullCostStones;
    extraCost = Math.round(yenPerPull * extraPulls);
  }

  renderResults(
    {
      progress,
      finalDistribution: dist.distribution,
      avg5NonPU: dist.avg5NonPU,
      avg4: dist.avg4
    },
    totalPulls,
    diffDays,
    dailyStones,
    passStones,
    extraPulls,
    extraCost
  );
}

/* ------------------------------------------------------------
   ★ 最新版：結果描画（確率分布＋色付き凡例＋グラフ）
   ------------------------------------------------------------ */
function renderResults(
  result,
  totalPulls,
  diffDays,
  dailyStones,
  passStones,
  extraPulls,
  extraCost
) {
  const el = document.getElementById("results");

  const finalDist = result.finalDistribution;
  const avg5NonPU = result.avg5NonPU.toFixed(2);
  const avg4 = result.avg4.toFixed(2);

  let html = `
    <div class="card">
      <h2>排出内訳（平均）</h2>

      <div class="result-main-number">今回のガチャ使用数：${totalPulls}連</div>

      <div>★5PU外：${avg5NonPU}体</div>
      <div>★4総数：${avg4}体</div>

      <hr>

      <div>未来日数：${diffDays}日</div>
      <div>デイリー石：${dailyStones}個</div>
      <div>月パス石：${passStones}個</div>
  `;

  if (extraPulls > 0) {
    html += `<hr>`;
    html += `<div>追加連数：${extraPulls}連</div>`;

    if (extraCost !== null) {
      html += `<div>追加課金額：${extraCost.toLocaleString()}円</div>`;
    } else {
      html += `<div>追加課金額：レート未設定</div>`;
    }
  }

  html += `</div>`;

  /* ★ 凡例（確率分布）を描画する領域 */
  html += `<div id="graph-legend"></div>`;

  /* ★ グラフ領域 */
  html += `
    <div class="card">
      <h2>★5ピックアップ入手確率分布（${totalPulls}連）</h2>
      <canvas id="puChart"></canvas>
    </div>
  `;

  el.innerHTML = html;

  /* ★ グラフと凡例を描画 */
  setTimeout(() => {
    drawChart(result.progress, totalPulls);
    renderLegend(result.progress, totalPulls);
  }, 50);
}
/* ============================================================
   ★ 凸進捗グラフ描画関数（新仕様）
   ============================================================ */

let puChartInstance = null;

function drawChart(progress, totalPulls) {

  if (totalPulls >= 1001) {
    const canvas = document.getElementById("puChart");
    if (canvas) canvas.style.display = "none";
    return;
  }

  const canvas = document.getElementById("puChart");
  if (!canvas) return;

  canvas.style.display = "block";

  const ctx = canvas.getContext("2d");

  if (puChartInstance) {
    puChartInstance.destroy();
  }

  let step = 1;
  if (totalPulls > 600) step = 10;
  else if (totalPulls > 300) step = 5;
  else if (totalPulls > 100) step = 2;

  const filtered = progress.filter(p => p.pulls % step === 0 || p.pulls === 1);

  const colors = [
    "#999999",
    "#4A90E2",
    "#50E3C2",
    "#F8E71C",
    "#F5A623",
    "#D0021B",
    "#9013FE",
    "#000000"
  ];

  const labels = filtered.map(p => p.pulls);
  let datasets = [];

  for (let pu = 0; pu <= 7; pu++) {
    const values = filtered.map(p => p.distribution[pu] * 100);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    if (maxVal === 0 || minVal === 100) continue;

    datasets.push({
      label: pu === 7 ? "完凸" : `${pu}体`,
      data: values,
      borderColor: colors[pu],
      backgroundColor: "transparent",
      tension: 0.2,
      pointRadius: 0
    });
  }

  puChartInstance = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { callback: v => `${v}%` }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}
function renderLegend(progress, totalPulls) {
  const legendEl = document.getElementById("graph-legend");
  if (!legendEl) return;

  const colors = [
    "#999999", // 0体
    "#4A90E2", // 1体
    "#50E3C2", // 2体
    "#F8E71C", // 3体
    "#F5A623", // 4体
    "#D0021B", // 5体
    "#9013FE", // 6体
    "#000000"  // 完凸
  ];

  const last = progress[progress.length - 1].distribution;

  // 1001連以上は完凸のみ
  if (totalPulls >= 1001) {
    const percent = (last[7] * 100).toFixed(2);
    legendEl.innerHTML = `
      <div class="card">
        <h3>★5ピックアップ入手確率分布（${totalPulls}連）</h3>
        <p>完凸：${percent}%</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="card">
      <h3>★5ピックアップ入手確率分布（${totalPulls}連）</h3>
      <div class="legend-list">
  `;

  for (let pu = 0; pu <= 7; pu++) {
    const percent = (last[pu] * 100).toFixed(2);
    const label = pu === 7 ? "完凸" : `${pu}体`;
    const color = colors[pu];

    const display =
      percent === "100.00" ? "入手済" :
      percent === "0.00" ? "0％" :
      `${percent}%`;

    html += `
      <div class="legend-item">
        <span class="legend-color" style="background:${color};"></span>
        <span class="legend-text">${label}：${display}</span>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  legendEl.innerHTML = html;
}
