import type { Recipe } from 'src/models/recipe';

export type MessageType = 'text' | 'image' | 'recipe' | 'options' | 'multiOptions' | 'slider' | 'suggestion'

export type ChatState =
  | 'start'
  | 'checkStatusRecipes'
  | 'welcome'
  | 'findRecOType'
  | 'findRecFQuery'
  | 'findRecQServings'
  | 'findRecQRecipeType'
  | 'findRecQDietaryRestrictions'
  | 'findRecQCookingTime'
  | 'findRecQCuisine'
  | 'findRecASearch'
  | 'findRecAResults'
  | 'genPlanQWeekDays'
  | 'genPlanQIngredients'
  | 'genPlanQShoppingList'
  | 'genPlanAPlan'
  | 'findRecSNoResults'
  | 'globAReset'

type OptionsConfig = string

interface SliderConfig {
  min: number;
  max: number;
  step: number;
  unit: string | ((input: number) => string);
}

interface SuggestionsConfig {
  suggestions: ((input: string) => string[]);
  withSubmit?: boolean;
  withPhoto?: boolean;
  placeholder?: string;
  submitText?: string;
  notFoundText?: string;
}

export interface ChatConfig {
  [key: string]: {
    message?: string | (() => string);
    messageType?: string;
    optionsConfig?: OptionsConfig[];
    sliderConfig?: SliderConfig;
    suggestionsConfig?: SuggestionsConfig;
    onInput?: (input: string | number) => void;
    noMessage?: boolean;
    nextState?: ChatState | ((input: string) => ChatState);
    action?: () => Promise<void>;
  };
}

export interface BaseMessage {
  id: number;
  sender: string;
  sent: boolean;
  type: MessageType;
  timestamp: string;
  state: ChatState; // Current state of the chat
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
  } & SliderConfig;
}

export interface SuggestionsMessage extends BaseMessage {
  type: 'suggestion';
  content: ((input: string) => string[]);
  withSubmit?: boolean;
  withPhoto?: boolean;
  placeholder?: string;
  submitText?: string;
  notFoundText?: string;
}

export type Message = TextMessage | ImageMessage | RecipeMessage | OptionsMessage | SliderMessage | SuggestionsMessage;
