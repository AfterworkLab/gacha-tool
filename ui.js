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
  renderFutureResourceSection();   // ← 現在のガチャ状況もここに統合
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
  });

  document.getElementById("tab-weapon").addEventListener("click", () => {
    currentBanner = "weapon";
    updateBannerTabs();
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
   ④ 未来の石（詳細設定）
   ------------------------------------------------------------ */
function renderFutureResourceSection() {
  const el = document.getElementById("future-resources");

  // 今日の日付を min に設定
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const labels = getLabelsForGame(currentGame);

  el.innerHTML = `
    <button id="future-toggle" class="future-toggle">
      ▼ 未来の石・詳細設定（タップして開く）
    </button>

    <div id="future-body" class="future-body hidden">

      <!-- 有償石 -->
      <h3 id="label-paid"></h3>
      <input id="input-paid" type="number" value="0">

      <!-- イベント石 -->
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

      <!-- 現在のガチャ状況（移動） -->
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

      <!-- ピックアップ日・デイリー・月パス -->
      <h3>ピックアップ日・デイリー達成率：${labels.pass}</h3>

      <div class="row-3col label-row">
        <div class="col">ピックアップ日</div>
        <div class="col">デイリー達成率</div>
        <div class="col">${labels.pass}</div>
      </div>

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

      <!-- シミュレーション精度（最後に移動） -->
      <h3>シミュレーション精度</h3>
      <select id="input-trials">
        <option value="10000">1万回（軽い）</option>
        <option value="50000">5万回（標準）</option>
        <option value="100000">10万回（高精度）</option>
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
    <button id="run-sim" class="run-button">
      計算する
    </button>
  `;

  document.getElementById("run-sim").addEventListener("click", runSimulation);
}

/* ------------------------------------------------------------
   ⑥ シミュレーション実行
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

  /* ------------------------------
     ピックアップ日
     ------------------------------ */
  const pickupStr = document.getElementById("input-pickup-date").value;
  let diffDays = 0;

  if (pickupStr) {
    const today = new Date();
    const pickup = new Date(pickupStr);
    diffDays = Math.max(0, Math.floor((pickup - today) / 86400000));
  }

  /* ------------------------------
     デイリー石
     ------------------------------ */
  const dailyRate = Number(document.getElementById("input-daily-rate").value);
  const dailyStones = diffDays * 60 * dailyRate;

  /* ------------------------------
     月パス石
     ------------------------------ */
  const pass = document.getElementById("input-pass").value;
  const passStones = pass === "active" ? diffDays * 90 : 0;

  /* ------------------------------
     合計石
     ------------------------------ */
  const totalStones =
    stones + paid + eventMain + eventExtra +
    dailyStones + passStones;

  const totalPulls = Math.floor(totalStones / 160) + tickets;

  const initialState = {
    pity5,
    pity4: 0,
    guarantee5,
    obtained5: 0,
    obtained5NonPU: 0,
    obtained4: 0
  };

  const trials = Number(document.getElementById("input-trials").value);

  const result = simulator.simulateDistribution(trials, initialState, totalPulls);

  renderResults(result, totalPulls, diffDays, dailyStones, passStones);
}

/* ------------------------------------------------------------
   ⑦ 結果描画
   ------------------------------------------------------------ */
function renderResults(result, totalPulls, diffDays, dailyStones, passStones) {
  const el = document.getElementById("results");

  const prob = result.distribution;
  const avg5PU = prob.reduce((a, b, i) => a + b * i, 0).toFixed(2);

  const avg5NonPU = result.avg5NonPU.toFixed(2);
  const avg4 = result.avg4.toFixed(2);

  const dailyPulls = (dailyStones / 160).toFixed(2);
  const passPulls = (passStones / 160).toFixed(2);

  let html = `
    <div class="card">
      <h2>排出内訳（平均）</h2>

      <div class="result-main-number">今回のガチャ使用数：${totalPulls}連</div>

      <div>★5総数（PUのみ）：${avg5PU}体</div>
      <div>★5PU外：${avg5NonPU}体</div>
      <div>★4総数：${avg4}体</div>

      <hr>

      <div>未来日数：${diffDays}日</div>
      <div>デイリー石：${dailyStones}個（${dailyPulls}連分）</div>
      <div>月パス石：${passStones}個（${passPulls}連分）</div>
    </div>

    <div class="card">
      <h2>★5ピックアップ入手確率</h2>
  `;

  prob.forEach((p, i) => {
    const label = i === 7 ? "完凸（7体以上）" : `${i}体`;
    const display = (p === 1) ? "入手確定" : `${(p * 100).toFixed(2)}%`;
    html += `<div>${label}： ${display}</div>`;
  });

  html += `</div>`;

  el.innerHTML = html;
}
