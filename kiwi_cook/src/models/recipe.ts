import { z } from 'zod';
import { useI18n } from 'vue-i18n';

// MultiLanguageField
const MultiLanguageFieldSchema = z.object({
  translations: z.record(z.string()),
});

type MultiLanguageField = z.infer<typeof MultiLanguageFieldSchema>;

function getAllTranslations(field: MultiLanguageField): string[] {
  return Object.values(field.translations);
}

export function getTranslation(field: MultiLanguageField): string {
  const i18n = useI18n();
  const lang = i18n.locale.value;
  return field.translations[lang] || Object.values(field.translations)[0];
}

// Ingredient
const IngredientSchema = z.object({
  id: z.string().optional(),
  name: MultiLanguageFieldSchema,
});

type Ingredient = z.infer<typeof IngredientSchema>;

// RecipeIngredient
const RecipeIngredientSchema = z.object({
  ingredient: IngredientSchema,
  comment: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
});

type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

// RecipeStep
const RecipeStepSchema = z.object({
  description: MultiLanguageFieldSchema,
  ingredients: z.array(RecipeIngredientSchema).optional(),
  imgUrl: z.string().url().optional(),
  duration: z.number().optional(),
  temperature: z.number().optional(),
});

type RecipeStep = z.infer<typeof RecipeStepSchema>;

// RecipeAuthor
const RecipeAuthorSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
});

type RecipeAuthor = z.infer<typeof RecipeAuthorSchema>;

// RecipeSource
const RecipeSourceSchema = z.object({
  url: z.string().url().optional(),
  authors: z.array(RecipeAuthorSchema).optional(),
  cookbooks: z.array(z.string()).optional(),
});

type RecipeSource = z.infer<typeof RecipeSourceSchema>;

// Nutrition
const NutritionSchema = z.object({
  calories: z.number().int(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
});

type Nutrition = z.infer<typeof NutritionSchema>;

// Recipe
const RecipeSchema = z.object({
  id: z.string(),
  name: MultiLanguageFieldSchema,
  description: MultiLanguageFieldSchema,
  lang: z.string().default('en-US'),
  ingredients: z.array(RecipeIngredientSchema).optional(),
  steps: z.array(RecipeStepSchema),
  props: z.record(z.any()),
  src: RecipeSourceSchema.optional(),
  deleted: z.boolean().default(false),
  servings: z.number().int().default(1),
  duration: z.number().int().default(0),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  cuisine: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  nutrition: NutritionSchema.optional(),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  fav_count: z.number().int().default(0),
  view_count: z.number().int().default(0),
  comment_count: z.number().int().default(0),
});

type Recipe = z.infer<typeof RecipeSchema>;

// Helper functions
function createMultiLanguageField(lang: string, value: string): MultiLanguageField {
  return { translations: { [lang]: value } };
}

function createIngredient(name: string, id?: string, lang: string = 'en'): Ingredient {
  return {
    id,
    name: createMultiLanguageField(lang, name),
  };
}

function createRecipeIngredient(
  ingredient: Ingredient,
  comment?: string,
  quantity?: number,
  unit?: string,
): RecipeIngredient {
  return {
    ingredient, comment, quantity, unit,
  };
}

function createRecipeStep(
  description: MultiLanguageField,
  ingredients?: RecipeIngredient[],
  imgUrl?: string,
  duration?: number,
  temperature?: number,
): RecipeStep {
  return {
    description, ingredients, imgUrl, duration, temperature,
  };
}

export {
  MultiLanguageFieldSchema,
  IngredientSchema,
  RecipeIngredientSchema,
  RecipeStepSchema,
  RecipeAuthorSchema,
  RecipeSourceSchema,
  NutritionSchema,
  RecipeSchema,
};

export type {
  MultiLanguageField,
  Ingredient,
  RecipeIngredient,
  RecipeStep,
  RecipeAuthor,
  RecipeSource,
  Nutrition,
  Recipe,
};

export {
  getAllTranslations,
  createMultiLanguageField,
  createIngredient,
  createRecipeIngredient,
  createRecipeStep,
};
