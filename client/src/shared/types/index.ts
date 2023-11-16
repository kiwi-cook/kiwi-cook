export * from '@/shared/types/item';
export * from '@/shared/types/recipe';
export * from '@/shared/types/step';

export const tmpId = () => `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`