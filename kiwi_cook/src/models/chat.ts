import { UserPreferences } from 'src/models/search.ts';
import { Recipe } from 'src/models/recipe.ts';

export type MessageType = 'text' | 'image' | 'recipe' | 'options' | 'multiOptions' | 'slider';

export interface BaseMessage {
  id: number;
  sender: string;
  sent: boolean;
  type: MessageType;
  timestamp: string;
  disableChat?: boolean;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
}

export interface ImageMessage extends BaseMessage {
  type: 'image';
  content: string;
}

export interface RecipeMessage extends BaseMessage {
  type: 'recipe';
  content: Recipe[];
}

export interface MessageOption {
  label: string;
  mapping: string | number | (() => void);
}

export function isMessageOption(option: MessageOption | string): option is MessageOption {
  return (option as MessageOption).mapping !== undefined;
}

export interface OptionsMessage extends BaseMessage {
  type: 'options' | 'multiOptions';
  content: MessageOption[] | string[];
}

export interface SliderMessage extends BaseMessage {
  type: 'slider';
  content: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
  };
}

export type Message = TextMessage | ImageMessage | RecipeMessage | OptionsMessage | SliderMessage;

export type KiwiMessageState =
  | 'start'
  | 'generateWeekplan'
  | 'askRecipeType'
  | 'askDietaryRestrictions'
  | 'askCookingTime'
  | 'cuisine'
  | 'searching'
  | 'displayingResults'
  | 'displayMoreResults'
  | 'startingOver';

export class ChatHistory {
  timestamp: string;

  messages: Message[];

  preferences: UserPreferences;

  constructor(messages: Message[], preferences: UserPreferences) {
    this.timestamp = new Date().toISOString();
    this.messages = messages;
    this.preferences = preferences;
  }
}
