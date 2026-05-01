/* ============================================================
   gacha.js — ガチャロジック
   Afterwork Lab / 2026
   ============================================================ */

class GachaEngine {
  constructor(config) {
    this.config = config;
  }

  roll(state) {
    const c = this.config;

    /* ------------------------------
       ★5 抽選
       ------------------------------ */
    let p5 = c.base5;
    if (state.pity5 >= c.soft5Start) {
      p5 += (state.pity5 - c.soft5Start + 1) * c.soft5Curve;
    }
    if (state.pity5 + 1 >= c.hard5) {
      p5 = 1;
    }

    /* ------------------------------
       ★4 抽選
       ------------------------------ */
    let p4 = c.base4;
    if (state.pity4 >= c.soft4Start) {
      p4 += (state.pity4 - c.soft4Start + 1) * c.soft4Curve;
    }
    if (state.pity4 + 1 >= c.hard4) {
      p4 = 1;
    }

    const r = Math.random();

    /* ★5 当選 */
    if (r < p5) {
      const isRateUp = state.guarantee5 || Math.random() < c.guarantee5RateUp;
      state.obtained5 += isRateUp ? 1 : 0;
      state.obtained5NonPU += isRateUp ? 0 : 1;

      state.pity5 = 0;
      state.pity4 += 1;
      state.guarantee5 = !isRateUp;
      return;
    }

    /* ★4 当選 */
    if (r < p5 + p4) {
      state.obtained4 += 1;
      state.pity4 = 0;
      state.pity5 += 1;
      return;
    }

    /* ★3 */
    state.pity5 += 1;
    state.pity4 += 1;
  }
}

class MonteCarloSimulator {
  constructor(engine) {
    this.engine = engine;
  }

  simulateDistribution(trials, initialState, pulls) {
    const dist = Array(8).fill(0);
    let total5NonPU = 0;
    let total4 = 0;

    for (let t = 0; t < trials; t++) {
      const s = JSON.parse(JSON.stringify(initialState));

      for (let i = 0; i < pulls; i++) {
        this.engine.roll(s);
      }

      const count = Math.min(s.obtained5, 7);
      dist[count] += 1;

      total5NonPU += s.obtained5NonPU;
      total4 += s.obtained4;
    }

    return {
      distribution: dist.map(v => v / trials),
      avg5NonPU: total5NonPU / trials,
      avg4: total4 / trials
    };
  }
}
