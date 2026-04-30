/* ============================================================
   gacha.js  —  ガチャ1回ロジック + モンテカルロ
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
       ★4が出た場合（すり抜けなし）
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
   ★ モンテカルロシミュレーション
   ------------------------------------------------------------ */
class MonteCarloSimulator {
  constructor(engine) {
    this.engine = engine;
  }

  // maxPulls 回だけ回したときの分布を求める
  runSimulation(trials, initialState, maxPulls) {
    const results = [];

    for (let i = 0; i < trials; i++) {
      results.push(this.runSingleTrial(initialState, maxPulls));
    }

    return this.aggregate(results);
  }

  /* ------------------------------
     1試行（maxPulls 回だけ回す）
     ------------------------------ */
  runSingleTrial(initial, maxPulls) {
    let state = { ...initial };
    let pulls = 0;

    let fiveStarCount = 0;
    let offRateCount = 0;
    let fourStarCount = 0;

    while (pulls < maxPulls) {
      const result = this.engine.rollOnce(state);
      state = result.newState;
      pulls++;

      if (result.rarity === 5) {
        fiveStarCount++;
        if (!result.isPU) offRateCount++;
      }
      if (result.rarity === 4) {
        fourStarCount++;
      }
    }

    return {
      pulls,
      stonesUsed: pulls * 160,
      puCount: state.obtained5,
      fiveStarCount,
      offRateCount,
      fourStarCount
    };
  }

  /* ------------------------------
     集計（確率・期待値）
     ------------------------------ */
  aggregate(results) {
    const N = results.length;

    /* ------------------------------
       凸段階ごとの「ちょうど k体」確率
       ------------------------------ */
    const prob = Array(8).fill(0); // 0〜7枚（7は7体以上をまとめる）

    results.forEach(r => {
      const k = Math.min(r.puCount, 7);
      prob[k]++;
    });

    for (let i = 0; i < prob.length; i++) {
      prob[i] = prob[i] / N;
    }

    /* ------------------------------
       条件付き期待値（案B）
       「k体以上引けた人の平均ガチャ回数」
       ------------------------------ */
    const expectedPulls = Array(8).fill(null);
    const expectedStones = Array(8).fill(null);

    for (let k = 1; k <= 7; k++) {
      const filtered = results.filter(r => r.puCount >= k);
      if (filtered.length === 0) continue;

      const avgPulls = filtered.reduce((s, r) => s + r.pulls, 0) / filtered.length;
      expectedPulls[k] = avgPulls;
      expectedStones[k] = avgPulls * 160;
    }

    /* ------------------------------
       排出内訳（平均）
       ------------------------------ */
    const avg5 = results.reduce((s, r) => s + r.fiveStarCount, 0) / N;
    const avgOff = results.reduce((s, r) => s + r.offRateCount, 0) / N;
    const avg4 = results.reduce((s, r) => s + r.fourStarCount, 0) / N;

    return {
      probabilities: prob,
      expectedPulls,
      expectedStones,
      dropSummary: {
        avgFiveStar: avg5,
        avgOffRate: avgOff,
        avgFourStar: avg4
      }
    };
  }
}
