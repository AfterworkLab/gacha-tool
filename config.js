/* ============================================================
   config.js — ゲーム別ガチャ設定
   Afterwork Lab / 2026
   ============================================================ */

const GAME_CONFIGS = {
  /* ------------------------------
     スターレイル：キャラガチャ
     ------------------------------ */
  StarRail_character: {
    base5: 0.006,
    soft5Start: 74,
    soft5Curve: 0.06,
    hard5: 90,
    base4: 0.051,
    soft4Start: 8,
    soft4Curve: 0.1,
    hard4: 10,
    guarantee5RateUp: 0.5,
    guarantee4RateUp: 0.5
  },

  /* ------------------------------
     スターレイル：光円錐
     ------------------------------ */
  StarRail_weapon: {
    base5: 0.008,
    soft5Start: 64,
    soft5Curve: 0.07,
    hard5: 80,
    base4: 0.12,
    soft4Start: 6,
    soft4Curve: 0.1,
    hard4: 10,
    guarantee5RateUp: 0.75,
    guarantee4RateUp: 0.75
  },

  /* ------------------------------
     原神：キャラガチャ
     ------------------------------ */
  Genshin_character: {
    base5: 0.006,
    soft5Start: 74,
    soft5Curve: 0.06,
    hard5: 90,
    base4: 0.051,
    soft4Start: 8,
    soft4Curve: 0.1,
    hard4: 10,
    guarantee5RateUp: 0.5,
    guarantee4RateUp: 0.5
  },

  /* ------------------------------
     原神：武器ガチャ
     ------------------------------ */
  Genshin_weapon: {
    base5: 0.007,
    soft5Start: 62,
    soft5Curve: 0.065,
    hard5: 80,
    base4: 0.14,
    soft4Start: 6,
    soft4Curve: 0.1,
    hard4: 10,
    guarantee5RateUp: 0.75,
    guarantee4RateUp: 0.75
  },

  /* ------------------------------
     ゼンゼロ：キャラガチャ
     ------------------------------ */
  Zenless_character: {
    base5: 0.008,
    soft5Start: 70,
    soft5Curve: 0.05,
    hard5: 90,
    base4: 0.12,
    soft4Start: 8,
    soft4Curve: 0.1,
    hard4: 10,
    guarantee5RateUp: 0.5,
    guarantee4RateUp: 0.5
  },

  /* ------------------------------
     ゼンゼロ：武器ガチャ
     ------------------------------ */
  Zenless_weapon: {
    base5: 0.01,
    soft5Start: 60,
    soft5Curve: 0.07,
    hard5: 80,
    base4: 0.14,
    soft4Start: 6,
    soft4Curve: 0.1,
    hard4: 10,
    guarantee5RateUp: 0.75,
    guarantee4RateUp: 0.75
  }
};
