export * from '@/shared/types/item.ts';
export * from '@/shared/types/recipe.ts';
export * from '@/shared/types/step.ts';

export const tmpId = () => `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`