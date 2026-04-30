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

    /* ------------------------------
       ★5確率の計算
       ------------------------------ */
    let rate5 = cfg.rates.base5;

    if (state.pity5 + 1 === cfg.pity.hard5) {
      rate5 = 1.0;
    } else if (state.pity5 >= cfg.pity.soft5Start) {
      const extra = (state.pity5 - cfg.pity.soft5Start + 1) * cfg.softPityCurve.increasePerPull5;
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
        isPU = true;
      } else {
        isPU = Math.random() < cfg.guarantee.fiveStar.pickupRate;
      }

      const newState = {
        pity5: 0,
        pity4: state.pity4 + 1,
        guarantee5: isPU ? false : true,
        obtained5: state.obtained5 + (isPU ? 1 : 0)
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
        obtained5: state.obtained5
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
      obtained5: state.obtained5
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

  // k凸に到達するまでの平均ガチャ回数を求める
  simulateForCopies(targetCopies, trials, initialState, maxPulls) {
    let totalPulls = 0;
    let successCount = 0;

    for (let t = 0; t < trials; t++) {
      let state = { ...initialState };
      let pulls = 0;

      while (pulls < maxPulls && state.obtained5 < targetCopies) {
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

  // 0〜7凸の確率（ちょうど）
  simulateDistribution(trials, initialState, maxPulls) {
    const counts = Array(8).fill(0);

    for (let t = 0; t < trials; t++) {
      let state = { ...initialState };
      let pulls = 0;

      while (pulls < maxPulls) {
        const result = this.engine.rollOnce(state);
        state = result.newState;
        pulls++;
      }

      const k = Math.min(state.obtained5, 7);
      counts[k]++;
    }

    return counts.map(c => c / trials);
  }
}
