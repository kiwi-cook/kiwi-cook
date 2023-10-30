import {Recipe, StepItem} from "@/shared/ts";
import {searchRecipes} from "@/app/suggestions/search.ts";

export class RecipeSuggestion {
    id: string;
    recipe?: Recipe;
    recipe_price?: number;
    missing_items?: {
        item: StepItem;
        price?: number;
    }[]

    constructor() {
        this.id = ''
        this.recipe_price = 0
        this.missing_items = []
    }


    /**
     * Get the recipe of the suggestion
     */
    public getRecipe(): Recipe {
        return this.recipe ?? new Recipe()
    }

    public getMissingItems(): StepItem[] {
        return this.missing_items?.map(missing_item => missing_item.item ?? new StepItem()) ?? []
    }
}

export type ItemQuery = {
    id?: string,
    exclude?: boolean,
}

export type SearchQuery = {
    items: ItemQuery[],
    tags: string[]
    price?: number,
    duration?: number,
}

export class SearchQueryBuilder {
    private readonly items: ItemQuery[]
    private tags: string[]
    private price: number | undefined
    private duration: number | undefined
    private city?: string

    constructor() {
        this.items = []
        this.tags = []
        this.price = undefined
        this.duration = undefined
        this.city = undefined
    }

    public addItem(item: ItemQuery): this {
        this.items.push(item)
        return this
    }

    public setItemIds(itemIds: {
        [id: string]: boolean
    }): this {
        const items = Object.entries(itemIds).map(([id, include]: [string, boolean]) => ({
            id,
            name: '',
            exclude: !include
        }))
        this.items.push(...items)
        return this
    }

    public setItems(items: ItemQuery[]): this {
        this.items.push(...items)
        return this
    }

    public setTags(tags: string[]): this {
        this.tags = tags
        return this
    }

    public setPrice(price?: number): this {
        this.price = price
        return this
    }

    public setDuration(duration?: number): this {
        this.duration = duration
        return this
    }

    public setCity(city: string): this {
        this.city = city
        return this
    }

    public build(): SearchQuery {
        return {
            items: this.items,
            tags: this.tags,
            price: this.price,
            duration: this.duration
        }
    }
}

export {
    searchRecipes
}