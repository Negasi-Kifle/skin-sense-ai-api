import { Goal } from "@/models/Goal";
import { toGoalDTO } from "@/utils/mappers";

export async function listGoals(opts: { includeInactive?: boolean } = {}) {
  const filter = opts.includeInactive ? {} : { active: true };
  const docs = await Goal.find(filter).sort({ order: 1, label: 1 });
  return docs.map(toGoalDTO);
}
