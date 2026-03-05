// data.js — données d’exemple + stockage local
export const STORAGE_KEY = "poker_asso_data_v1";

// Barème configurable (exemple)
export const defaultScoringRule = {
  id: "rule-2026",
  name: "Barème Saison 2026",
  pointsByPosition: {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4
  },
  // au-delà de 8 -> 2 points
  defaultPoints: 2,
  bonusRules: [
    { id: "bonus-10", label: "Bonus +2 si ≥ 10 participants", type: "minParticipants", min: 10, value: 2 }
  ],
  malusRules: [
    { id: "malus-absent", label: "0 si absent (non listé)", type: "notListed", value: 0 }
  ]
};

const players = [
  { id:"p01", firstName:"Maxime", lastName:"Leroy", email:"maxime.leroy@example.com", active:true },
  { id:"p02", firstName:"Sarah", lastName:"Morel", email:"sarah.morel@example.com", active:true },
  { id:"p03", firstName:"Lucas", lastName:"Bernard", email:"lucas.bernard@example.com", active:true },
  { id:"p04", firstName:"Inès", lastName:"Petit", email:"ines.petit@example.com", active:true },
  { id:"p05", firstName:"Hugo", lastName:"Roux", email:"hugo.roux@example.com", active:true },
  { id:"p06", firstName:"Nina", lastName:"Fournier", email:"nina.fournier@example.com", active:true },
  { id:"p07", firstName:"Yanis", lastName:"Dubois", email:"yanis.dubois@example.com", active:true },
  { id:"p08", firstName:"Chloé", lastName:"Garcia", email:"chloe.garcia@example.com", active:true },
  { id:"p09", firstName:"Tom", lastName:"Lambert", email:"tom.lambert@example.com", active:true },
  { id:"p10", firstName:"Camille", lastName:"Faure", email:"camille.faure@example.com", active:true },
  { id:"p11", firstName:"Mehdi", lastName:"Renaud", email:"mehdi.renaud@example.com", active:true },
  { id:"p12", firstName:"Léa", lastName:"Mercier", email:"lea.mercier@example.com", active:true },
  { id:"p13", firstName:"Adrien", lastName:"Gauthier", email:"adrien.gauthier@example.com", active:true },
  { id:"p14", firstName:"Jade", lastName:"Blanc", email:"jade.blanc@example.com", active:true },
  { id:"p15", firstName:"Noah", lastName:"Perrin", email:"noah.perrin@example.com", active:true },
  { id:"p16", firstName:"Emma", lastName:"Robin", email:"emma.robin@example.com", active:true },
  { id:"p17", firstName:"Paul", lastName:"Lopez", email:"paul.lopez@example.com", active:true },
  { id:"p18", firstName:"Manon", lastName:"Chevalier", email:"manon.chevalier@example.com", active:true },
  { id:"p19", firstName:"Kylian", lastName:"Masson", email:"kylian.masson@example.com", active:true },
  { id:"p20", firstName:"Zoé", lastName:"Boyer", email:"zoe.boyer@example.com", active:true }
];

const office = [
  { id:"o1", firstName:"Sarah", lastName:"Morel", role:"Présidente", email:"presidence@asso-poker.fr",
    photoUrl:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80" },
  { id:"o2", firstName:"Lucas", lastName:"Bernard", role:"Vice-président", email:"vicepresident@asso-poker.fr",
    photoUrl:"https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=256&q=80" },
  { id:"o3", firstName:"Inès", lastName:"Petit", role:"Trésorière", email:"tresorier@asso-poker.fr",
    photoUrl:"https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=256&q=80" },
  { id:"o4", firstName:"Hugo", lastName:"Roux", role:"Secrétaire", email:"secretaire@asso-poker.fr",
    photoUrl:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80" },
  { id:"o5", firstName:"Chloé", lastName:"Garcia", role:"Communication", email:"com@asso-poker.fr",
    photoUrl:"https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80" },
  { id:"o6", firstName:"Mehdi", lastName:"Renaud", role:"Événementiel", email:"event@asso-poker.fr",
    photoUrl:"https://images.unsplash.com/photo-1520975682031-ae9a7b6b1a4a?auto=format&fit=crop&w=256&q=80" }
];

// Lien ICS (placeholder)
export const ICS_URL = "./events.ics";

// Événements à venir (affichage)
const upcomingEvents = [
  { id:"e1", title:"Soirée Hebdo #9", startDateTime:"2026-03-06T20:30:00", location:"Salle Municipale — Vitry" },
  { id:"e2", title:"Soirée Hebdo #10", startDateTime:"2026-03-13T20:30:00", location:"Salle Municipale — Vitry" },
  { id:"e3", title:"Tournoi Mensuel", startDateTime:"2026-03-20T20:00:00", location:"Club House — Vitry" },
  { id:"e4", title:"Soirée Spéciale (Buy-in)", startDateTime:"2026-03-27T20:30:00", location:"Salle Municipale — Vitry" }
];

// Séances (6–10) + résultats (points calculés/stockés)
const sessions = [
  { id:"s01", date:"2026-01-09", location:"Salle Municipale — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"Reprise de saison" },
  { id:"s02", date:"2026-01-16", location:"Salle Municipale — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"" },
  { id:"s03", date:"2026-01-23", location:"Salle Municipale — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"" },
  { id:"s04", date:"2026-02-06", location:"Club House — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"Table finale serrée" },
  { id:"s05", date:"2026-02-13", location:"Salle Municipale — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"" },
  { id:"s06", date:"2026-02-20", location:"Salle Municipale — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"" },
  { id:"s07", date:"2026-02-27", location:"Salle Municipale — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"" },
  { id:"s08", date:"2026-03-03", location:"Club House — Vitry", createdBy:"Admin", scoringRuleId: defaultScoringRule.id, notes:"Session spéciale deepstack" }
];

// Résultats : position par joueur (exemples), points seront recalculés si besoin
const sessionPlacements = {
  s01: ["p03","p02","p07","p12","p01","p10","p05","p08","p14","p06","p11","p04"],
  s02: ["p02","p01","p10","p07","p03","p12","p08","p05","p06","p09","p14"],
  s03: ["p07","p12","p03","p02","p01","p15","p08","p06","p10","p11"],
  s04: ["p01","p03","p02","p10","p12","p07","p06","p08","p18","p14","p05","p11","p09"],
  s05: ["p12","p07","p01","p03","p02","p10","p06","p08","p11","p09"],
  s06: ["p02","p12","p03","p07","p01","p10","p06","p08","p05","p14","p16","p18"],
  s07: ["p03","p07","p12","p02","p01","p10","p06","p08","p15","p11"],
  s08: ["p01","p02","p03","p12","p07","p10","p06","p08","p18","p14","p11","p09"]
};

function computeSessionResults(rule, placements, sessionId) {
  const participantCount = placements.length;

  return placements.map((playerId, idx) => {
    const position = idx + 1;
    const base = rule.pointsByPosition[position] ?? rule.defaultPoints;
    const bonus = participantCount >= 10 ? 2 : 0;
    const malus = 0;

    const total = base + bonus - malus;
    const detail = `${position}e place → base ${base} + bonus ${bonus} (≥10 joueurs) = ${total}`;

    return {
      sessionId,
      playerId,
      position,
      pointsBase: base,
      bonus,
      malus,
      pointsTotal: total,
      calculationDetail: detail
    };
  });
}

function seedResults() {
  const rule = defaultScoringRule;
  const results = [];
  for (const s of sessions) {
    const placements = sessionPlacements[s.id] ?? [];
    results.push(...computeSessionResults(rule, placements, s.id));
  }
  return results;
}

const scoringRules = [defaultScoringRule];

const initialData = {
  players,
  office,
  upcomingEvents,
  scoringRules,
  sessions,
  results: seedResults()
};

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialData);
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return structuredClone(initialData);
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
}