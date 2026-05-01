/* ============================================================
   ui.js  —  UI制御（入力 → シミュレーション → 結果描画）
   未来石計算：ピックアップ日・デイリー達成率・月パス対応
   Afterwork Lab / 2026
   ============================================================ */

let currentGame = "StarRail";
let currentBanner = "character";

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
  renderCurrentStateInputs();
  renderFutureResourceSection();
  renderSimulationSettings();
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
   ③ 所持リソース（横並び）
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
  `;
}

/* ------------------------------------------------------------
   ④ 現在のガチャ状況（横並び）
   ------------------------------------------------------------ */
function renderCurrentStateInputs() {
  const el = document.getElementById("current-state");

  el.innerHTML = `
    <h2>現在のガチャ状況</h2>

    <div class="row-2col">
      <div class="col">
        <label>現在の★5カウント（今何連目か）</label>
        <input id="input-pity5" type="number" value="0">
      </div>

      <div class="col">
        <label>次の★5はピックアップ確定？</label>
        <select id="input-guarantee5">
          <option value="false">未確定</option>
          <option value="true">確定</option>
        </select>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------
   ⑤ 未来の石（ピックアップ日・デイリー・月パス追加）
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

      <h3>ピックアップ日・デイリー・月パス</h3>
      <div class="row-3col">
        <div class="col">
          <input id="input-pickup-date" type="date" min="${todayStr}">
        </div>

        <div class="col">
          <select id="input-daily-rate">
            <option value="0">実施なし</option>
            <option value="0.4">週数回</option>
            <option value="0.8">ほぼ毎日</option>
            <option value="1.0">毎日</option>
          </select>
        </div>

        <div class="col">
          <select id="input-pass">
            <option value="none">未購入</option>
            <option value="active">購入済</option>
          </select>
        </div>
      </div>

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
   ⑧ シミュレーション実行（未来石計算を追加）
   ------------------------------------------------------------ */
function runSimulation() {
  const key = `${currentGame}_${currentBanner}`;
  const config = GAME_CONFIGS[key];

  const engine = new GachaEngine(config);
  const simulator = new MonteCarloSimulator(engine);

  const pity5 = Number(document.getElementById("input-pity5").value
