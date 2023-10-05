export * from '@/tastebuddy/types/item';
export * from '@/tastebuddy/types/recipe';
export * from '@/tastebuddy/types/step';

export const tmpId = () => `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`