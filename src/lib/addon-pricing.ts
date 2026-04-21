import type { AddonRule } from "@/types/database";

export function calculateConditionalPrice(
  rules: AddonRule[],
  quantity: number,
): number {
  const rule = rules.find(
    (r) => quantity >= r.min && (r.max === null || quantity <= r.max),
  );
  return rule?.price ?? 0;
}

export function getRuleLabel(rules: AddonRule[], quantity: number): string {
  const rule = rules.find(
    (r) => quantity >= r.min && (r.max === null || quantity <= r.max),
  );
  return rule?.label ?? "";
}
