/* ============================================================
   ui.js  —  UI制御（入力 → シミュレーション → 結果描画）
   未来石計算：ピックアップ日・デイリー達成率・月パス対応
   課金額計算：ゲーム別レート（スタレ基準＋将来拡張）
   Afterwork Lab / 2026
   ============================================================ */

let currentGame = "StarRail";
let currentBanner = "character";

/* ------------------------------------------------------------
   ★追加：ゲーム別課金レート設定（将来拡張用）
   - yen: 基準課金額（日本円）
   - stones: その課金額で手に入る石数
   ------------------------------------------------------------ */
const PRICE_CONFIG = {
  StarRail: {
    yen: 12000,     // Google Play 12,000円
    stones: 6480    // 往日の夢華（初回特典なし）
  },
  Genshin: {
    yen: 0,         // 将来設定用
    stones: 0
  },
  Zenless: {
    yen: 0,         // 将来設定用
    stones: 0
  }
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
          ※課金額はゲーム別レート（スタレは12,000円→6480石）を元に計算します。
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

      <!-- ① 往日の夢華／創世結晶／モノクローム -->
      <h3 id="label-paid"></h3>
      <input id="input-paid" type="number" value="0">

      <!-- ② イベント石 -->
      <h3>イベント石</h3>
      <div class="row-2col">
        <div class="col">
          <select id="input-event-main">
            <option value="0">0</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
            <option value="1500">1500</option>
            <option value="2000">
