import { z } from 'zod';
import { ChatStateEnum, getNextOf, getPreviousOf } from 'src/models/chat.ts';

const UserSchema = z.object({
  username: z.string(),
  disabled: z.boolean().default(false).describe('User account status'),
  paying_customer: z.boolean().default(false).describe('Payment status'),
  is_student: z.boolean().default(false).describe('Student status'),
  is_admin: z.boolean().default(false).describe('Admin status'),
  friends: z.array(z.string()).default([]),
  recipes: z.array(z.string()).default([]),
  weekplan: z.array(z.string()).default([]),
  chat_state: z.nativeEnum(ChatStateEnum).default(ChatStateEnum.NotStarted),
});

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

  chat_state!: ChatStateEnum;

  constructor(data: Partial<User>) {
    Object.assign(this, UserSchema.parse(data));
  }

  getNextState(): ChatStateEnum {
    return getNextOf(this.chat_state);
  }

  setNextState(): ChatStateEnum {
    this.chat_state = getNextOf(this.chat_state);
    return this.chat_state;
  }

  setPreviousState(): ChatStateEnum {
    this.chat_state = getPreviousOf(this.chat_state);
    return this.chat_state;
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
