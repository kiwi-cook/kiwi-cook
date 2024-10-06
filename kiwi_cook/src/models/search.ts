export type PreferenceValue<T extends 'single' | 'all' | 'any'> =
  T extends 'single' ? never :
    T extends 'all' | 'any' ? never[] :
      never;

// Define the basic preference types
export type UserPreference<T> = {
  property: T;
  type: 'single';
};

export type UserPreferenceArray<T> = {
  property: T[];
  type: 'all' | 'any';
};

// Define the UserPreferences interface
export interface UserPreferences {
  tags: UserPreferenceArray<string>;
  servings: UserPreference<number>;
  recipeType: UserPreference<string>;
  dietaryRestrictions: UserPreferenceArray<string>;
  cookingTime: UserPreference<number>;
  skillLevel: UserPreference<string>;
  cuisine: UserPreference<string>;
}

// Helper functions to create preferences
export function createUserPreference<T>(defaultValue: T): UserPreference<T> {
  return {
    property: defaultValue,
    type: 'single',
  };
}

export function createUserPreferenceArray<T>(defaultValue: T[], type: 'all' | 'any' = 'all'): UserPreferenceArray<T> {
  return {
    property: defaultValue,
    type,
  };
}
