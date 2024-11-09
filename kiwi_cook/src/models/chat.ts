import { Recipe } from 'src/models/recipe';

export type MessageType = 'text' | 'image' | 'recipe' | 'options' | 'multiOptions' | 'slider';

export type ChatState =
  | 'start'
  | 'checkStatusRecipes'
  | 'welcome'
  | 'findRecQServings'
  | 'findRecQRecipeType'
  | 'findRecQDietaryRestrictions'
  | 'findRecQCookingTime'
  | 'findRecQCuisine'
  | 'findRecASearch'
  | 'findRecAResults'
  | 'genPlan'
  | 'genPlanQWeekDays'
  | 'genPlanQIngredients'
  | 'genPlanQShoppingList'
  | 'genPlanAPlan'
  | 'findRecSNoResults'
  | 'globAReset'

interface SliderOptions {
  min: number;
  max: number;
  step: number;
  unit: string | ((input: number) => string);
}

export interface ChatConfig {
  [key: string]: {
    message?: string | (() => string);
    options?: string[];
    type?: 'slider';
    sliderOptions?: SliderOptions;
    nextState?: ChatState | ((input: string) => ChatState);
    updatePreference?: (input: string | number) => void;
    action?: () => Promise<void>;
  };
}

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

export interface OptionsMessage extends BaseMessage {
  type: 'options' | 'multiOptions';
  content: string[];
}

export interface SliderMessage extends BaseMessage {
  type: 'slider';
  content: {
    label: string;
    value: number;
  } & SliderOptions;
}

export type Message = TextMessage | ImageMessage | RecipeMessage | OptionsMessage | SliderMessage;
