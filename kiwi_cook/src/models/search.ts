interface UserPreference<T> {
  property: T;
}

interface UserPreferenceArray<T> {
  property: T[];
  validation: 'all' | 'any';
}

// Factory functions
export function createUserPreference<T>(value: T): UserPreference<T> {
  return { property: value };
}

export function createUserPreferenceArray<T>(value: T[], validation: 'all' | 'any'): UserPreferenceArray<T> {
  return { property: value, validation };
}

export interface UserPreferences {
  tags: UserPreferenceArray<string>;
  servings: UserPreference<number>;
  recipeType: UserPreference<string>;
  dietaryRestrictions: UserPreferenceArray<string>;
  cookingTime: UserPreference<number>;
  skillLevel: UserPreference<string>;
  cuisine: UserPreference<string>;
}
