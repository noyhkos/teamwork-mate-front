export type PairView = {
  a: string;
  b: string;
  total: number;
  factors: string[];
  reason: string | null;
};

export type RoleView = {
  nickname: string;
  role: string;
  roleKo: string;
  score: number;
  reason: string;
};

export interface Report {
  teamName: string;
  archetype: string;
  archetypeDesc: string | null;
  intro: string | null;
  harmonyScore: number;
  roles: RoleView[];
  bestPair: PairView | null;
  worstPair: PairView | null;
  pairs: { a: string; b: string; total: number }[];
  traitAvgs: Record<string, number>;
  elementTotals: Record<string, number>;
  riskNote: string | null;
  samjaeMembers: string[];
  shareSlug: string | null;
}

export const TRAIT_KO: Record<string, string> = {
  DRIVE: "추진력", CAUTION: "신중함", SOCIAL: "사교성", DETAIL: "꼼꼼함",
  CREATIVE: "창의성", HARMONY: "조율력", COMMAND: "리더십", STEADY: "안정감",
};

export const ELEMENT_CLASS: Record<string, string> = {
  목: "bg-wood", 화: "bg-fire", 토: "bg-earth", 금: "bg-metal", 수: "bg-water",
};
