/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

export * from '@/shared/models/ingredient';
export * from '@/shared/models/recipe';

export const tmpId = () => `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
