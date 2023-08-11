import {useRecipeStore} from "@/storage";
import {Item, StepItem} from "@/tastebuddy/types";


export function getItemsFromDescription(description: string): StepItem[] {
    const recipeStore = useRecipeStore()
    const items = recipeStore.getItems
    const itemsFromDescription: Set<StepItem> = new Set()
    items.forEach((item: Item) => {
        if (description.toLowerCase().includes(item.name.toLowerCase())) {
            itemsFromDescription.add(new StepItem(item))
        }
    })
    return [...itemsFromDescription]
}