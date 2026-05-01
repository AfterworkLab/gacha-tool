/* ============================================================
   gacha.js  —  ガチャ1回ロジック + 凸数到達モード（仕様B）
   Afterwork Lab / 2026
   ============================================================ */


/* ------------------------------------------------------------
   ★ ガチャ1回の結果オブジェクト
   ------------------------------------------------------------ */
class GachaResult {
  constructor(rarity, isPU, newState) {
    this.rarity = rarity;   // 3 / 4 / 5
    this.isPU = isPU;       // PUかどうか
    this.newState = newState;
  }
}


/* ------------------------------------------------------------
   ★ ガチャエンジン（1回ガチャを回す）
   ------------------------------------------------------------ */
class GachaEngine {
  constructor(config) {
    this.config = config;
  }

  rollOnce(state) {
    const cfg = this.config;

    // 安全のため、存在しない場合は 0 で初期化
    const obtained5 = state.obtained5 || 0;
    const obtained5NonPU = state.obtained5NonPU || 0;
    const obtained4 = state.obtained4 || 0;

    /* ------------------------------
       ★5確率の計算
       ------------------------------ */
    let rate5 = cfg.rates.base5;

    if (state.pity5 + 1 === cfg.pity.hard5) {
      // ハードピティ：次の1回は必ず★5
      rate5 = 1.0;
    } else if (state.pity5 >= cfg.pity.soft5Start) {
      // ソフトピティ：一定回数以降は確率上昇
      const extra =
        (state.pity5 - cfg.pity.soft5Start + 1) *
        cfg.softPityCurve.increasePerPull5;
      rate5 = Math.min(1.0, cfg.rates.base5 + extra);
    }

    /* ------------------------------
       ★4確率の計算
       ------------------------------ */
    let rate4 = cfg.rates.base4;

    if (state.pity4 + 1 === cfg.pity.hard4) {
      rate4 = 1.0;
    }

    /* ------------------------------
       レアリティ抽選
       ------------------------------ */
    const roll = Math.random();
    let rarity = 3;

    if (roll < rate5) {
      rarity = 5;
    } else if (roll < rate5 + rate4) {
      rarity = 4;
    }

    /* ------------------------------
       ★5が出た場合
       ------------------------------ */
    if (rarity === 5) {
      let isPU = false;

      if (state.guarantee5) {
        // すり抜け後のPU確定
        isPU = true;
      } else {
        // 50％勝負（など）
        isPU = Math.random() < cfg.guarantee.fiveStar.pickupRate;
      }

      const newState = {
        pity5: 0,
        pity4: state.pity4 + 1,
        // すり抜けたら次回PU確定、PUならフラグ解除
        guarantee5: isPU ? false : true,
        // PUを引いた分だけカウント
        obtained5: obtained5 + (isPU ? 1 : 0),
        // PU外★5（すり抜け）をカウント
        obtained5NonPU: obtained5NonPU + (isPU ? 0 : 1),
        // ★4は変化なし
        obtained4: obtained4
      };

      return new GachaResult(5, isPU, newState);
    }

    /* ------------------------------
       ★4が出た場合
       ------------------------------ */
    if (rarity === 4) {
      const isPU = Math.random() < (1 / cfg.featured.count4);

      const newState = {
        pity5: state.pity5 + 1,
        pity4: 0,
        guarantee5: state.guarantee5,
        obtained5: obtained5,
        obtained5NonPU: obtained5NonPU,
        // ★4総数をカウント
        obtained4: obtained4 + 1
      };

      return new GachaResult(4, isPU, newState);
    }

    /* ------------------------------
       ★3が出た場合
       ------------------------------ */
    const newState = {
      pity5: state.pity5 + 1,
      pity4: state.pity4 + 1,
      guarantee5: state.guarantee5,
      obtained5: obtained5,
      obtained5NonPU: obtained5NonPU,
      obtained4: obtained4
    };

    return new GachaResult(3, false, newState);
  }
}


/* ------------------------------------------------------------
   ★ 凸数到達モード（仕様B）
   ------------------------------------------------------------ */
class MonteCarloSimulator {
  constructor(engine) {
    this.engine = engine;
  }

  // k凸に到達するまでの平均ガチャ回数
  // ※ ただし「PUを引いてもガチャは止めず、maxPulls まで回し切る」
  simulateForCopies(targetCopies, trials, initialState, maxPulls) {
    let totalPulls = 0;
    let successCount = 0;

    for (let t = 0; t < trials; t++) {
      let state = { ...initialState };
      let pulls = 0;

      while (pulls < maxPulls) {
        const result = this.engine.rollOnce(state);
        state = result.newState;
        pulls++;
      }

      if (state.obtained5 >= targetCopies) {
        totalPulls += pulls;
        successCount++;
      }
    }

    if (successCount === 0) return null;

    return totalPulls / successCount;
  }

  // 0〜7凸の確率（ちょうど）＋ ★5PU外平均・★4総数平均
  simulateDistribution(trials, initialState, maxPulls) {
    const counts = Array(8).fill(0);
    let totalNonPU5 = 0;
    let total4 = 0;

    for (let t = 0; t < trials; t++) {
      let state = {
        pity5: initialState.pity5,
        pity4: initialState.pity4 || 0,
        guarantee5: initialState.guarantee5,
        obtained5: initialState.obtained5 || 0,
        obtained5NonPU: 0,
        obtained4: 0
      };
      let pulls = 0;

      while (pulls < maxPulls) {
        const result = this.engine.rollOnce(state);
        state = result.newState;
        pulls++;
      }

      const k = Math.min(state.obtained5, 7);
      counts[k]++;

      totalNonPU5 += state.obtained5NonPU || 0;
      total4 += state.obtained4 || 0;
    }

    const distribution = counts.map(c => c / trials);
    const avg5NonPU = totalNonPU5 / trials;
    const avg4 = total4 / trials;

    return {
      distribution,
      avg5NonPU,
      avg4
    };
  }
}
