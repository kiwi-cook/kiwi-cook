/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

export * from '@/models/ingredient';
export * from '@/models/recipe';
export * from '@/models/suggestion';

export const tmpId = () => `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
