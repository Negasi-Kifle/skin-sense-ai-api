import mongoose from "mongoose";
import { Ingredient } from "@/models/Ingredient";
import { Treatment } from "@/models/Treatment";
import { HttpError } from "@/utils/HttpError";
import { toIngredientDTO } from "@/utils/mappers";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from "@/validators/ingredient.schema";

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  );
}

async function cascadeCatalogChangesToTreatments(
  id: string,
  input: UpdateIngredientInput
): Promise<void> {
  const oid = new mongoose.Types.ObjectId(id);
  const filter = { "ingredients.ingredientId": oid };
  const arrayFilters = [{ "elem.ingredientId": oid }];

  if (input.name !== undefined) {
    await Treatment.updateMany(
      filter,
      { $set: { "ingredients.$[elem].name": input.name } },
      { arrayFilters }
    );
  }
  if (input.role !== undefined) {
    await Treatment.updateMany(
      filter,
      { $set: { "ingredients.$[elem].role": input.role } },
      { arrayFilters }
    );
  }
}

export async function listIngredients() {
  const docs = await Ingredient.find({}).sort({ name: 1 });
  return docs.map(toIngredientDTO);
}

export async function createIngredient(input: CreateIngredientInput) {
  const name = input.name.trim();
  const existing = await Ingredient.findOne({ name });
  if (existing) {
    throw HttpError.conflict("An ingredient with this name already exists");
  }

  try {
    const doc = await Ingredient.create({
      name,
      role: input.role,
      irritantForSensitive: input.irritantForSensitive,
    });
    return toIngredientDTO(doc);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw HttpError.conflict("An ingredient with this name already exists");
    }
    throw err;
  }
}

export async function updateIngredient(id: string, input: UpdateIngredientInput) {
  if (input.name !== undefined) {
    const name = input.name.trim();
    const duplicate = await Ingredient.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      throw HttpError.conflict("An ingredient with this name already exists");
    }
  }

  try {
    const doc = await Ingredient.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw HttpError.notFound("Ingredient not found");

    if (input.name !== undefined || input.role !== undefined) {
      await cascadeCatalogChangesToTreatments(id, input);
    }

    return toIngredientDTO(doc);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw HttpError.conflict("An ingredient with this name already exists");
    }
    throw err;
  }
}

export async function deleteIngredient(id: string) {
  const inUse = await Treatment.exists({ "ingredients.ingredientId": id });
  if (inUse) {
    throw HttpError.conflict("This ingredient is used by one or more services.");
  }

  const doc = await Ingredient.findByIdAndDelete(id);
  if (!doc) throw HttpError.notFound("Ingredient not found");
  return { id };
}
