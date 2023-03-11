import { Item, Recipe } from "./types";

export function getItemsFromRecipe(recipe: Recipe): Item[] {
    const items: Item[] = recipe.steps.flatMap((step) => step.items).map((item) => item.item);
    const uniqueItems: Item[] = [];
    items.forEach((item) => {
        if (!uniqueItems.find((i) => i._id === item._id)) {
            uniqueItems.push(item);
        }
    })
    return uniqueItems;
}