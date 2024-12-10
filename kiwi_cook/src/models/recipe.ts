import { z } from 'zod'

// Custom JSON encoders for specific types
const Url = z.string().url() // URL validation

// Nutrition schema
const Nutrition = z.object({
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0),
})

// Recipe schema
const Recipe = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  image: z.array(z.string()).optional(),
  language: z.string().default('en'),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  author: z.string().optional(),
  url: Url.optional(),
  servings: z.number().min(1).default(1),
  prep_time: z.number().optional(),
  cook_time: z.number().optional(),
  total_time: z.number().optional(),
  nutrition: Nutrition.optional(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  deleted: z.boolean().default(false),
})

// Infer the TypeScript type from the Zod schema
export type RecipeType = z.infer<typeof Recipe>
