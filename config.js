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
