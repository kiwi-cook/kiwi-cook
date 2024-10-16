import { z } from 'zod';

const UserSchema = z.object({
  username: z.string(),
  disabled: z.boolean().default(false).describe('User account status'),
  paying_customer: z.boolean().default(false).describe('Payment status'),
  is_student: z.boolean().default(false).describe('Student status'),
  is_admin: z.boolean().default(false).describe('Admin status'),
  friends: z.array(z.string()).default([]),
  recipes: z.array(z.string()).default([]),
  weekplan: z.array(z.string()).default([]),
});
// Define the UserPreferences interface
export interface UserPreferences {
  tags: string[],
  servings?: number,
  recipeType: string,
  dietaryRestrictions: string[],
  cookingTime: number,
  skillLevel: string,
  cuisine: string,
}

type User = z.infer<typeof UserSchema>;

const UserInDBSchema = UserSchema.extend({
  hashed_password: z.string(),
});

type UserInDB = z.infer<typeof UserInDBSchema>;

class UserModel implements User {
  username!: string;

  disabled!: boolean;

  paying_customer!: boolean;

  is_student!: boolean;

  is_admin!: boolean;

  friends!: string[];

  recipes!: string[];

  weekplan!: string[];

  constructor(data: Partial<User>) {
    Object.assign(this, UserSchema.parse(data));
  }
}

class UserInDBModel extends UserModel implements UserInDB {
  hashed_password!: string;

  constructor(data: Partial<UserInDB>) {
    super(data);
    const parsedData = UserInDBSchema.parse(data);
    this.hashed_password = parsedData.hashed_password;
  }
}

export {
  UserSchema, UserInDBSchema,
};

export type {
  User, UserInDB, UserModel, UserInDBModel,
};
