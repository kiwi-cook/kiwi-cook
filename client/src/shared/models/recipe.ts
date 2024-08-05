/*
 * Copyright (c) 2024 Josef Müller.
 */

import { MultiLanguageField } from '@/shared/locales/i18n';
import { APP_NAME, Ingredient, parseTemperature, share, tmpId } from '@/shared';
import { logDebug, logError, logWarn } from '@/shared/utils/logging';
import { ERROR_MSG } from '@/shared/utils/errors.ts';
import { distance } from 'fastest-levenshtein';

const MODULE = 'shared.types.recipe.';


export class RecipeIngredient {
    ingredient: Ingredient;
    quantity: number;
    unit?: string;
    servings: number;
    comment?: string;

    constructor(recipeIngredient?: Partial<RecipeIngredient>) {
        this.ingredient = Ingredient.fromJSON(recipeIngredient?.ingredient) ?? Ingredient.empty();
        this.quantity = recipeIngredient?.quantity ?? 0
        this.unit = recipeIngredient?.unit ?? '';
        this.servings = recipeIngredient?.servings ?? 1;
        this.comment = recipeIngredient?.comment;
    }

    static empty() {
        return new RecipeIngredient({ ingredient: Ingredient.empty() });
    }

    static fromJSON(recipeItem?: RecipeIngredient) {
        logDebug(MODULE + 'RecipeIngredient.fromJSON', recipeItem);
        return new RecipeIngredient(recipeItem);
    }

    setServings(servings: number) {
        this.servings = servings;
    }

    getQuantity(): number {
        return this.quantity * this.servings;
    }

    getId(): string {
        return this.ingredient.id;
    }
}

export enum STEP_TYPES {
    HEADER = 'header', STEP = 'step', NOTE = 'note'
}

export class RecipeStep {
    description: MultiLanguageField;
    ingredients?: RecipeIngredient[];
    imgUrl?: string;
    duration?: number;
    temperature?: number;
    type: STEP_TYPES;

    constructor(recipeStep?: Partial<RecipeStep>) {
        const description = MultiLanguageField.fromJSON(recipeStep?.description) ?? MultiLanguageField.new()
        this.description = description
        this.ingredients = recipeStep?.ingredients ?? [];
        this.imgUrl = recipeStep?.imgUrl ?? '';
        this.duration = recipeStep?.duration ?? 0;
        this.temperature = parseTemperature(recipeStep?.temperature, description.get());
        this.type = recipeStep?.type ?? STEP_TYPES.STEP
    }

    static empty() {
        return new RecipeStep({ description: MultiLanguageField.new() });
    }

    static fromJSON(recipeStep: RecipeStep) {
        logDebug(MODULE + 'RecipeStep.fromJSON', recipeStep);
        return new RecipeStep(recipeStep);
    }

    static fromIngredients(ingredientNames: string[], description?: string): RecipeStep {
        const recipeStep = new RecipeStep({})
        recipeStep.ingredients = ingredientNames
            .map((name) => {
                const ingredient = Ingredient.empty()
                ingredient.name.set(name)
                return new RecipeIngredient({ ingredient: ingredient })
            })
        recipeStep.setDescription(description ?? '')
        return recipeStep
    }

    public getDescription(lang?: string): string {
        return this.description.get(lang)
    }

    public setDescription(description: string, lang?: string): void {
        this.description.set(description, lang)
    }

    public descriptionToHtml(className: string): string {
        let description = this.getDescription()
        if (!description) {
            return ''
        }

        for (const itemName of this.getIngredients()) {
            if (!itemName || itemName === '') {
                continue;
            }
            const regex = new RegExp(`\\s+${itemName}`, 'ig')
            description = description.replace(regex, ` <span class="${className}">${itemName}</span>`)
        }
        return description
    }

    public getIngredients(): string[] {
        return [...new Set((this.ingredients ?? []).map((item) => item.ingredient.name.get()))]
    }
}


export class RecipeAuthor {
    name: string;
    url?: string;

    constructor(recipeAuthor?: Partial<RecipeAuthor>) {
        this.name = recipeAuthor?.name ?? '';
        this.url = recipeAuthor?.url;
    }
}

export class RecipeSource {
    url?: string;
    authors?: RecipeAuthor[];
    cookbooks?: string[];

    constructor(recipeSource?: Partial<RecipeSource>) {
        this.url = recipeSource?.url;
        this.authors = recipeSource?.authors?.map((author) => new RecipeAuthor(author));
        this.cookbooks = recipeSource?.cookbooks;
    }
}

export class Nutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;

    constructor(nutrition?: Partial<Nutrition>) {
        this.calories = nutrition?.calories ?? 0;
        this.protein = nutrition?.protein ?? 0;
        this.carbs = nutrition?.carbs ?? 0;
        this.fat = nutrition?.fat ?? 0;
        this.fiber = nutrition?.fiber ?? 0;
    }
}

export class Recipe {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    props: { [key: string]: any };
    src?: RecipeSource;
    deleted: boolean;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    cuisine?: string;
    difficulty: string;
    rating?: number;
    nutrition?: Nutrition;
    imageUrl?: string;
    videoUrl?: string;
    servings: number;
    notes?: MultiLanguageField;

    constructor(recipe?: Partial<Recipe>) {
        this.id = recipe?.id ?? tmpId();
        this.name = MultiLanguageField.fromJSON(recipe?.name) ?? MultiLanguageField.new();
        this.description = MultiLanguageField.fromJSON(recipe?.description) ?? MultiLanguageField.new();
        this.ingredients = recipe?.ingredients?.map(RecipeIngredient.fromJSON) ?? [];
        this.steps = recipe?.steps?.map(RecipeStep.fromJSON) ?? [];
        this.props = recipe?.props ?? { imgUrl: '', duration: 0, date: new Date(), tags: [] };
        this.src = recipe?.src ?? { url: '', authors: [] };
        this.deleted = recipe?.deleted ?? false;
        this.duration = recipe?.duration ?? 0;
        this.createdAt = recipe?.createdAt ?? new Date();
        this.updatedAt = recipe?.updatedAt ?? new Date();
        this.cuisine = recipe?.cuisine;
        this.difficulty = recipe?.difficulty ?? 'medium';
        this.rating = recipe?.rating;
        this.nutrition = recipe?.nutrition;
        this.imageUrl = recipe?.imageUrl;
        this.videoUrl = recipe?.videoUrl;
        this.servings = recipe?.servings ?? 1;
        this.notes = recipe?.notes ?? MultiLanguageField.new();
    }

    static fromJSON(json: any): Recipe {
        const fName = MODULE + 'Recipe.' + this.fromJSON.name;
        if (typeof json === 'undefined' || json === null) {
            const errorMsg = json === null ? ERROR_MSG.isNull : ERROR_MSG.isUndefined;
            logError(fName, errorMsg);
            return new Recipe();
        }

        logDebug(fName, json);

        return new Recipe({
            id: json._id ?? json.id ?? tmpId(),
            name: MultiLanguageField.fromJSON(json.name),
            description: MultiLanguageField.fromJSON(json.description),
            ingredients: json.ingredients?.map(RecipeIngredient.fromJSON) ?? [],
            steps: json.steps?.map(RecipeStep.fromJSON) ?? [],
            props: {
                imgUrl: json.props?.imgUrl,
                tags: json.props?.tags,
                duration: json.props?.duration,
                date: new Date(json.props?.date)
            },
            src: json.src,
            deleted: json.deleted ?? false,
            duration: json.duration ?? 0,
            createdAt: new Date(json.created_at) ?? new Date(json.createdAt),
            updatedAt: new Date(json.updated_at) ?? new Date(json.updatedAt),
            cuisine: json.cuisine,
            difficulty: json.difficulty ?? 'medium',
            rating: json.rating,
            nutrition: json.nutrition,
            imageUrl: json.image_url ?? json.imageUrl,
            videoUrl: json.video_url ?? json.videoUrl,
        });
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name.get();
    }

    getDescription(): string {
        return this.description.get();
    }

    getShortDescription(): string {
        const desc = this.description.get()
            .split('.')
            .slice(0, 2)
            .join('.');
        if (desc.endsWith('.')) {
            return desc;
        }
        return desc + '.';
    }

    getAuthors(): string {
        return this.src?.authors?.map((author: RecipeAuthor) => author.name).join(', ') ?? '';
    }

    getDuration(): number {
        return this.duration;
    }

    getTags(): string[] {
        return this.props.tags ?? [];
    }

    getRecipeIngredients(): RecipeIngredient[] {
        return this.ingredients;
    }

    hasIngredient(id?: string): boolean {
        const fName = MODULE + 'Recipe.' + this.hasIngredient.name;
        if (typeof id === 'undefined') {
            logWarn(fName, ERROR_MSG.noId);
            return false;
        }
        return this.ingredients.some((item: RecipeIngredient) => item.getId() === id);
    }

    async share() {
        return share({
            title: 'Share your recipe with your friends',
            text: `Check out this recipe for ${this.getName()} on ${APP_NAME}!`,
            url: '#' + this.getRoute(),
            dialogTitle: 'Share with your friends',
        });
    }

    getRoute(): string {
        return `/recipe/show/${this.getId()}`;
    }

    setServings(servings?: number) {
        if (typeof servings === 'undefined') {
            return;
        }

        this.servings = servings;
        this.ingredients.forEach((item) => {
            item.setServings(servings);
        });
    }

    getPrice(): number {
        let price = 0;
        for (const item of this.ingredients) {
            // TODO: get price from item
            price += item.servings;
        }
        return Math.floor(price);
    }

    /**
     * Checks if the item has the name
     * @param name
     */
    public hasName(name: string): boolean {
        const splitName = name.toLowerCase().split(' ');
        const recipeNames = this.name.getAll().map(n => n.toLowerCase().split(' '));

        return recipeNames.some(recipeWords =>
            splitName.every(nameWord =>
                recipeWords.some(recipeWord =>
                    distance(nameWord, recipeWord) <= 1 || recipeWord.match(nameWord) !== null
                )
            )
        );
    }
}
