/* ============================================================
   config.js  —  完全版ガチャ仕様データ
   Afterwork Lab / 2026
   ============================================================ */

const GAME_CONFIGS = {

  /* ------------------------------------------------------------
     崩壊スターレイル（StarRail）
     ------------------------------------------------------------ */

  "StarRail_character": {
    game: "StarRail",
    bannerType: "character",

    rates: {
      base5: 0.006,
      base4: 0.051
    },

    pity: {
      hard5: 90,
      hard4: 10,
      soft5Start: 75,
      soft4Start: 0
    },

    softPityCurve: {
      type: "linear",
      increasePerPull5: 0.06,
      increasePerPull4: 0.0
    },

    guarantee: {
      fiveStar: { type: "50_50", pickupRate: 0.5 },
      fourStar: { type: "always", pickupRate: 1.0 }
    },

    featured: {
      count5: 1,
      count4: 3
    }
  },

  "StarRail_weapon": {
    game: "StarRail",
    bannerType: "weapon",

    rates: {
      base5: 0.007,
      base4: 0.06
    },

    pity: {
      hard5: 80,
      hard4: 10,
      soft5Start: 62,
      soft4Start: 0
    },

    softPityCurve: {
      type: "linear",
      increasePerPull5: 0.07,
      increasePerPull4: 0.0
    },

    guarantee: {
      // ★5は「75% PU / 25% すり抜け」
      fiveStar: { type: "75_25", pickupRate: 0.75 },
      fourStar: { type: "always", pickupRate: 1.0 }
    },

    featured: {
      count5: 1,
      count4: 3
    }
  },

  /* ------------------------------------------------------------
     原神（Genshin Impact）
     ------------------------------------------------------------ */

  "Genshin_character": {
    game: "Genshin",
    bannerType: "character",

    rates: {
      base5: 0.006,
      base4: 0.051
    },

    pity: {
      hard5: 90,
      hard4: 10,
      soft5Start: 75,
      soft4Start: 0
    },

    softPityCurve: {
      type: "linear",
      increasePerPull5: 0.06,
      increasePerPull4: 0.0
    },

    guarantee: {
      fiveStar: { type: "50_50", pickupRate: 0.5 },
      fourStar: { type: "always", pickupRate: 1.0 }
    },

    featured: {
      count5: 1,
      count4: 3
    }
  },

  "Genshin_weapon": {
    game: "Genshin",
    bannerType: "weapon",

    rates: {
      base5: 0.007,
      base4: 0.06
    },

    pity: {
      hard5: 80,
      hard4: 10,
      soft5Start: 62,
      soft4Start: 0
    },

    softPityCurve: {
      type: "linear",
      increasePerPull5: 0.07,
      increasePerPull4: 0.0
    },

    guarantee: {
      // ★5は「75% PU / 25% すり抜け」
      fiveStar: { type: "75_25", pickupRate: 0.75 },
      fourStar: { type: "always", pickupRate: 1.0 }
    },

    featured: {
      count5: 2,
      count4: 5
    }
  },

  /* ------------------------------------------------------------
     ゼンレスゾーンゼロ（Zenless Zone Zero）
     ------------------------------------------------------------ */

  "Zenless_character": {
    game: "Zenless",
    bannerType: "character",

    rates: {
      base5: 0.008,
      base4: 0.06
    },

    pity: {
      hard5: 80,
      hard4: 10,
      soft5Start: 65,
      soft4Start: 0
    },

    softPityCurve: {
      type: "exponential",
      increasePerPull5: 0.07,
      increasePerPull4: 0.0
    },

    guarantee: {
      fiveStar: { type: "50_50", pickupRate: 0.5 },
      fourStar: { type: "always", pickupRate: 1.0 }
    },

    featured: {
      count5: 1,
      count4: 3
    }
  },

  "Zenless_weapon": {
    game: "Zenless",
    bannerType: "weapon",

    rates: {
      base5: 0.008,
      base4: 0.06
    },

    pity: {
      hard5: 80,
      hard4: 10,
      soft5Start: 65,
      soft4Start: 0
    },

    softPityCurve: {
      type: "exponential",
      increasePerPull5: 0.07,
      increasePerPull4: 0.0
    },

    guarantee: {
      fiveStar: { type: "50_50", pickupRate: 0.5 },
      fourStar: { type: "always", pickupRate: 1.0 }
    },

    featured: {
      count5: 1,
      count4: 3
    }
  }

};
