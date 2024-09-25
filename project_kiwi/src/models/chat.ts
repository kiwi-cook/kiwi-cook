export enum ChatStateEnum {
  NotStarted = 'not_started',
  Servings = 'servings',
  Ingredients = 'ingredients',
  RecipeSuggestions = 'recipe_suggestions',
  Finished = 'finished',
}

const stateOrder: ChatStateEnum[] = [
  ChatStateEnum.NotStarted,
  ChatStateEnum.Servings,
  ChatStateEnum.Ingredients,
  ChatStateEnum.RecipeSuggestions,
  ChatStateEnum.Finished,
];

export function getNextOf(state: ChatStateEnum): ChatStateEnum {
  const currentIndex = stateOrder.indexOf(state);
  return stateOrder[(currentIndex + 1) % stateOrder.length];
}

export function getPreviousOf(state: ChatStateEnum): ChatStateEnum {
  const currentIndex = stateOrder.indexOf(state);
  return stateOrder[(currentIndex - 1 + stateOrder.length) % stateOrder.length];
}

export function isChatStateEnum(value: string): value is ChatStateEnum {
  return Object.values(ChatStateEnum).includes(value as ChatStateEnum);
}
