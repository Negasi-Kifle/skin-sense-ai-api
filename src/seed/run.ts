import { env } from "@/config/env";
import { connectDB, disconnectDB } from "@/db/connect";
import { logger } from "@/utils/logger";
import { hashPassword } from "@/utils/hash";
import { User } from "@/models/User";
import { Ingredient, type IngredientRole } from "@/models/Ingredient";
import { Treatment } from "@/models/Treatment";
import { SEED_INGREDIENTS, SEED_TREATMENTS } from "./data";

interface SeededIngredient {
  _id: unknown;
  name: string;
  role: IngredientRole | undefined;
  irritantForSensitive: boolean;
}

// Idempotent: re-running upserts rather than duplicating. Safe to run after
// schema/menu tweaks without nuking bookings or guests.

async function seedUsers(): Promise<void> {
  const [adminHash, therapistHash] = await Promise.all([
    hashPassword(env.SEED_ADMIN_PASSWORD),
    hashPassword(env.SEED_THERAPIST_PASSWORD),
  ]);

  await User.updateOne(
    { email: env.SEED_ADMIN_EMAIL.toLowerCase() },
    {
      $setOnInsert: { email: env.SEED_ADMIN_EMAIL.toLowerCase(), role: "admin" as const },
      $set: { name: "Kuriftu Admin", passwordHash: adminHash, isFirstTimeAccount: false },
    },
    { upsert: true }
  );
  await User.updateOne(
    { email: env.SEED_THERAPIST_EMAIL.toLowerCase() },
    {
      $setOnInsert: { email: env.SEED_THERAPIST_EMAIL.toLowerCase(), role: "therapist" as const },
      $set: { name: "Kuriftu Therapist", passwordHash: therapistHash, isFirstTimeAccount: false },
    },
    { upsert: true }
  );

  logger.info(
    { admin: env.SEED_ADMIN_EMAIL, therapist: env.SEED_THERAPIST_EMAIL },
    "Seeded users (passwords from env)"
  );
}

async function seedIngredients(): Promise<Map<string, SeededIngredient>> {
  const byName = new Map<string, SeededIngredient>();

  for (const ing of SEED_INGREDIENTS) {
    const doc = await Ingredient.findOneAndUpdate(
      { name: ing.name },
      {
        $set: { role: ing.role, irritantForSensitive: ing.irritantForSensitive },
        $setOnInsert: { name: ing.name },
      },
      { upsert: true, new: true }
    );
    byName.set(ing.name, {
      _id: doc._id,
      name: doc.name,
      role: doc.role ?? undefined,
      irritantForSensitive: doc.irritantForSensitive,
    });
  }
  logger.info({ count: byName.size }, "Seeded ingredient catalog");
  return byName;
}

async function seedTreatments(
  ingredientByName: Map<string, SeededIngredient>
): Promise<void> {
  for (const seed of SEED_TREATMENTS) {
    const ingredients = seed.ingredientNames.map((n) => {
      const ing = ingredientByName.get(n);
      if (!ing) throw new Error(`Seed ingredient not found: ${n}`);
      return {
        ingredientId: ing._id,
        name: ing.name,
        role: ing.role,
        irritantForSensitive: ing.irritantForSensitive,
      };
    });

    await Treatment.updateOne(
      { name: seed.name },
      {
        $set: {
          category: seed.category,
          description: seed.description,
          durationMinutes: seed.durationMinutes,
          priceETB: seed.priceETB,
          targetAttributes: seed.targetAttributes,
          ingredients,
          active: seed.active,
        },
        $setOnInsert: { name: seed.name },
      },
      { upsert: true }
    );
  }
  logger.info({ count: SEED_TREATMENTS.length }, "Seeded Kuriftu treatments");
}

async function main(): Promise<void> {
  await connectDB();
  try {
    await seedUsers();
    const ingredientByName = await seedIngredients();
    await seedTreatments(ingredientByName);
    logger.info("Seed complete");
  } finally {
    await disconnectDB();
  }
}

main().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
