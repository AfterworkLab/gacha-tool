/* ============================================================
   ui.js  —  UI制御（入力 → シミュレーション → 結果描画）
   Afterwork Lab / 2026
   ============================================================ */

let currentGame = "StarRail";
let currentBanner = "character";

/* ------------------------------------------------------------
   初期化
   ------------------------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
  renderGameSelect();
  renderBannerTabs();
  renderResourceInputs();
  renderCurrentStateInputs();
  renderFutureResourceSection();
  renderSimulationSettings();
  renderRunButton();
  updateBackgroundColor();
  updateGameLabels();
});


/* ------------------------------------------------------------
   ゲームごとのラベル定義
   ------------------------------------------------------------ */
function getLabelsForGame(game) {
  if (game === "StarRail") {
    return {
      stones: "石（星玉）",
      ticket: "チケット",
      paid: "課金石（往日の夢華）",
      pass: "月パス"
    };
  }
  if (game === "Genshin") {
    return {
      stones: "石（原石）",
      ticket: "チケット",
      paid: "課金石（創世結晶）",
      pass: "月パス"
    };
  }
  // Zenless
  return {
    stones: "石（ポリクローム）",
    ticket: "チケット",
    paid: "課金石（モノクローム）",
    pass: "月パス"
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
      updateBackgroundColor();
      updateCurrentStatusLabel();
      updateGameLabels();
    });
  });
}


/* ------------------------------------------------------------
   ② ガチャタイプ選択（A+B案：タブ方式）
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
   ③ 所持リソース
   ------------------------------------------------------------ */
function renderResourceInputs() {
  const el = document.getElementById("resources");

  el.innerHTML = `
    <h2>所持リソース</h2>

    <label id="label-stones"></label>
    <input id="input-stones" type="number" value="0">

    <label id="label-tickets"></label>
    <input id="input-tickets" type="number" value="0">

    <div id="calc-now"></div>
  `;
}


/* ------------------------------------------------------------
   ④ 現在のガチャ状況
   ------------------------------------------------------------ */
function renderCurrentStateInputs() {
  const el = document.getElementById("current-state");

  el.innerHTML = `
    <h2>現在のガチャ状況</h2>

    <label>現在の★5カウント（今何連目か）</label>
    <input id="input-pity5" type="number" value="0">

    <label>次の★5はピックアップ確定？</label>
    <select id="input-guarantee5">
      <option value="false">未確定</option>
      <option value="true">確定</option>
    </select>
  `;
}


/* ------------------------------------------------------------
   ⑤ 未来の石（詳細設定・折りたたみ）
   ------------------------------------------------------------ */
function renderFutureResourceSection() {
  const el = document.getElementById("future-resources");

  el.innerHTML = `
    <button id="future-toggle" class="future-toggle">
      ▼ 未来の石・詳細設定（タップして開く）
    </button>

    <div id="future-body" class="future-body hidden">

      <h3 id="label-paid"></h3>
      <input id="input-paid" type="number" value="0">

      <h3>ピックアップ日</h3>
      <input id="input-date" type="date">

      <h3>デイリー達成率</h3>
      <select id="input-daily">
        <option value="daily">毎日</option>
        <option value="week5">週5</option>
        <option value="week3">週3</option>
        <option value="none">やらない</option>
      </select>

      <h3>イベント石</h3>
      <select id="input-event-main">
        <option value="0">0</option>
        <option value="500">500</option>
        <option value="1000">1000</option>
        <option value="1500">1500</option>
        <option value="2000">2000</option>
        <option value="2500">2500</option>
        <option value="3000">3000</option>
        <option value="3500">3500</option>
        <option value="4000">4000</option>
      </select>

      <input id="input-event-extra" type="number" value="0" min="0" max="499">

      <h3 id="label-pass"></h3>
      <select id="input-pass">
        <option value="none">未購入</option>
        <option value="plan">購入予定</option>
        <option value="active">購入済</option>
      </select>

    </div>
  `;

  document.getElementById("future-toggle").addEventListener("click", () => {
    const body = document.getElementById("future-body");
    const toggle = document.getElementById("future-toggle");

    body.classList.toggle("hidden");

    if (body.classList.contains("hidden")) {
      toggle.textContent = "▼ 未来の石・詳細設定（タップして開く）";
    } else {
      toggle.textContent = "▲ 未来の石・詳細設定（タップして閉じる）";
    }
  });
}


/* ------------------------------------------------------------
   ⑥ シミュレーション精度
   ------------------------------------------------------------ */
function renderSimulationSettings() {
  const el = document.getElementById("simulation-settings");

  el.innerHTML = `
    <h2>シミュレーション精度</h2>
    <select id="input-trials">
      <option value="10000">1万回（軽い）</option>
      <option value="50000">5万回（標準）</option>
      <option value="100000">10万回（高精度）</option>
    </select>
  `;
}


/* ------------------------------------------------------------
   ⑦ 計算ボタン
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
   現在の状態ラベル（A+B案）
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
   ⑧ シミュレーション実行
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

  // 1連＝石160個換算
  const totalPulls = Math.max(0, Math.floor(stones / 160) + tickets);

  const initialState = {
    pity5,
    pity4: 0,
    guarantee5,
    obtained5: 0
  };

  const trials = Number(document.getElementById("input-trials").value);

  const summary = simulator.runSimulation(trials, initialState, totalPulls);

  renderResults(summary);
}


/* ------------------------------------------------------------
   結果描画
   ------------------------------------------------------------ */
function renderResults(summary) {
  const el = document.getElementById("results");

  let html = `
    <div class="card">
      <h2>★5ピックアップ入手確率（ちょうど）</h2>
  `;

  summary.probabilities.forEach((p, i) => {
    let label;
    if (i === 0) {
      label = "0体";
    } else if (i === 7) {
      label = "完凸（7体以上）";
    } else {
      label = `${i}体`;
    }
    html += `<div>${label}： ${(p * 100).toFixed(1)}%</div>`;
  });

  html += `</div>`;

  html += `
    <div class="card">
      <h2>平均ガチャ回数（その凸数以上引けた人のみ）</h2>
  `;

  summary.expectedPulls.forEach((v, i) => {
    if (v) {
      const label = i === 7 ? "完凸（7体以上）" : `${i}体以上`;
      html += `<div>${label}： ${v.toFixed(1)}連</div>`;
    }
  });

  html += `</div>`;

  html += `
    <div class="card">
      <h2>排出内訳（平均）</h2>
      <div>★5総数： ${summary.dropSummary.avgFiveStar.toFixed(2)}体</div>
      <div>★5ピックアップ外： ${summary.dropSummary.avgOffRate.toFixed(2)}体</div>
      <div>★4総数： ${summary.dropSummary.avgFourStar.toFixed(2)}体</div>
    </div>
  `;

  el.innerHTML = html;
}
