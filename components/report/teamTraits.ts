import { TRAIT_KO, type Report } from "./types";

/**
 * Strengths and cautions, read straight off the numbers the report already
 * carries — no extra model call, and every line names the figure it came from.
 *
 * Nothing is padded to reach a count: a team with no missing element simply
 * gets one fewer caution. The competitor this borrows its shape from lists six
 * strengths and four cautions every time, which is how "극과 극의 조합" and
 * "결 차이가 작아" ended up in the same list contradicting each other.
 */
export function deriveTeamTraits(report: Report) {
  const traits = Object.entries(report.traitAvgs)
    .map(([k, v]) => ({ key: k, ko: TRAIT_KO[k] ?? k, value: Math.round(v) }))
    .sort((a, b) => b.value - a.value);

  const missing = Object.entries(report.elementTotals).filter(([, v]) => v === 0).map(([k]) => k);
  const strongPairs = report.pairs.filter((p) => p.total >= 66);
  const weakPairs = report.pairs.filter((p) => p.total < 52);

  const strengths: string[] = [];
  const cautions: string[] = [];

  const [first, second] = traits;
  if (first && first.value >= 55) {
    strengths.push(
      second && second.value >= 55
        ? `${first.ko} ${first.value} · ${second.ko} ${second.value}가 팀에서 가장 두드러져요.`
        : `${first.ko} ${first.value}가 팀에서 가장 두드러져요.`,
    );
  }
  if (missing.length === 0) {
    strengths.push("오행이 하나도 빠지지 않고 갖춰진 팀이에요.");
  }
  if (strongPairs.length > 0) {
    strengths.push(`좋은 궁합 이상인 조합이 ${strongPairs.length}개 있어요.`);
  }
  if (report.harmonyScore >= 65) {
    strengths.push(`하모니 ${report.harmonyScore}점 — 조합 간 편차가 작은 편이에요.`);
  }

  const last = traits[traits.length - 1];
  if (last && last.value <= 48) {
    cautions.push(`${last.ko} ${last.value}가 가장 낮아요. 그 몫을 누가 맡을지 정해두면 좋아요.`);
  }
  if (missing.length > 0) {
    cautions.push(`오행 중 ${missing.join("·")} 기운이 비어 있어요.`);
  }
  if (weakPairs.length > 0) {
    cautions.push(`조율이 필요한 조합이 ${weakPairs.length}개 있어요.`);
  }
  if (report.riskNote) cautions.push(report.riskNote);
  if (report.samjaeMembers.length > 0) {
    cautions.push(`올해 삼재: ${report.samjaeMembers.join(", ")} — 무리하지 말고 서로 챙겨주기!`);
  }

  return { strengths, cautions, traits };
}
