/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { Recipe, RecipeIngredient } from '@/shared';

export class RecipeSuggestion {
    recipe: Recipe;
    recipe_price?: number;
    missing_ingredients?: {
        item: RecipeIngredient;
        price?: number;
    }[];

    constructor(recipe: Recipe) {
        this.recipe = recipe;
        this.recipe_price = 0;
        this.missing_ingredients = [];
    }

    public getMissingItems(): RecipeIngredient[] {
        return (
            this.missing_ingredients?.map(
                (missing_item) => missing_item.item ?? new RecipeIngredient()
            ) ?? []
        );
    }
}

export type ItemQuery = {
    id?: string;
    exclude?: boolean;
};

export type SearchQuery = {
    duration?: number;
    servings?: number;
    items: ItemQuery[];
    tags: string[];
    price?: number;
    city?: string;
};

export class SearchQueryBuilder {
    private duration: number | undefined;
    private servings: number | undefined;
    private readonly items: ItemQuery[];
    private tags: string[];
    private price: number | undefined;
    private city?: string;

    constructor() {
        this.duration = undefined;
        this.servings = undefined;
        this.items = [];
        this.tags = [];
        this.price = undefined;
        this.city = undefined;
    }

    public addItem(item: ItemQuery): this {
        this.items.push(item);
        return this;
    }

    public setItemIds(itemIds: { [id: string]: boolean }): this {
        const items = Object.entries(itemIds).map(
            ([id, include]: [string, boolean]) => ({
                id,
                name: '',
                exclude: !include,
            })
        );
        this.items.push(...items);
        return this;
    }

    public setItems(items: ItemQuery[]): this {
        this.items.push(...items);
        return this;
    }

    public setTags(tags: string[]): this {
        this.tags = tags;
        return this;
    }

    public setPrice(price?: number): this {
        this.price = price;
        return this;
    }

    public setDuration(duration?: number): this {
        this.duration = duration;
        return this;
    }

    public setServings(servings?: number): this {
        this.servings = servings;
        return this;
    }

    public setCity(city: string): this {
        this.city = city;
        return this;
    }

    public build(): SearchQuery {
        return {
            items: this.items,
            tags: this.tags,
            price: this.price,
            duration: this.duration,
        };
    }
}
