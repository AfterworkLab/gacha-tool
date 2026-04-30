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
      updateBackgroundColor();
      updateCurrentStatusLabel();
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

    <label>石（星玉 / 原石 / ポリクローム）</label>
    <input id="input-stones" type="number" value="0">

    <label>チケット</label>
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

      <h3>課金石（往日の夢華 / 創世結晶 / モノクローム）</h3>
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

      <h3>月パス</h3>
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
