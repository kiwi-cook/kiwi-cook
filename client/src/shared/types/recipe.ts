/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { useIonRouter } from '@ionic/vue';
import { getLocaleStr, LocaleStr, newLocaleStr } from '@/shared/locales/i18n';
import { APP_NAME, RecipeItem, share, Step, tmpId } from '@/shared';
import { logDebug, logError, logWarn } from '@/shared/utils/logging';
import { ERROR_MSG } from '@/shared/utils/errors.ts';

const MODULE = 'shared.types.recipe.'

/**
 * Recipe
 * It is a recipe with a list of steps
 * It contains all the information about a recipe
 */
export class Recipe {
    id: string;
    name: LocaleStr;
    desc: LocaleStr;
    steps: Step[];
    items: RecipeItem[];
    props: {
        imgUrl?: string; duration?: number; date: Date; tags?: string[];
    };
    src: {
        url?: string; authors: {
            name: string; url?: string;
        }[]; cr?: string; cookBook?: {
            name: string; url?: string; pub?: string;
        }
    };
    notes?: LocaleStr;
    servings: number;

    /**
     * Copy constructor for a recipe
     * @param recipe the recipe to copy
     */
    constructor(recipe?: Recipe) {
        // create a temporary id to identify the recipe in the store before it is saved
        this.id = recipe?.id ?? tmpId()
        this.name = recipe?.name ?? newLocaleStr()
        this.desc = recipe?.desc ?? newLocaleStr()
        this.props = recipe?.props ?? {
            imgUrl: '', duration: 0, date: new Date(), tags: [],
        }
        this.steps = recipe?.steps ?? []
        this.items = recipe?.items.map((recipeItem: any) => RecipeItem.fromJSON(recipeItem)) ?? []
        this.src = recipe?.src ?? {
            url: '', authors: [],
        }
        this.servings = 1
        this.notes = newLocaleStr()
    }

    /**
     * Initialize a recipe from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json the json object
     * @returns a new recipe
     */
    static fromJSON(json: any): Promise<Recipe> {
        const fName = MODULE + 'Recipe.' + this.fromJSON.name
        return new Promise<Recipe>((resolve, reject) => {
            const recipe = new Recipe()

            if (typeof json === 'undefined' || json === null) {
                const errorMsg = json === null ? ERROR_MSG.isNull : ERROR_MSG.isUndefined
                logError(fName, errorMsg)
                return reject(new Error(errorMsg))
            }

            logDebug(fName, json)

            // Id
            recipe.id = json.id ?? tmpId()
            if (json.id === undefined) {
                logError(fName, ERROR_MSG.noId)
            }

            recipe.name = json?.name
            recipe.desc = json?.desc
            recipe.steps = json?.steps?.map(Step.fromJSON) ?? [new Step()]
            recipe.items = json?.items?.map((recipeItem: RecipeItem) => RecipeItem.fromJSON(recipeItem)) ?? []

            // Props
            recipe.props.imgUrl = json?.props?.imgUrl
            recipe.props.tags = json?.props?.tags
            recipe.props.duration = json?.props?.duration
            recipe.props.date = new Date(json?.props?.date)

            // Source
            recipe.src = json.src
            resolve(recipe)
        }).catch((error: Error) => {
            logError(fName, error, json)
            throw error
        })
    }

    /**
     * Get the id of the recipe
     * @returns the id of the recipe
     */
    public getId(): string {
        return this.id
    }

    /**
     * Get the localized name of the recipe
     */
    public getName(): string {
        return getLocaleStr(this.name)
    }

    /**
     * Get the localized description of the recipe
     */
    public getDescription(): string {
        return getLocaleStr(this.desc)
    }

    public getShortDescription(): string {
        const desc = getLocaleStr(this.desc).split('.').slice(0, 2).join('.');
        if (desc.endsWith('.')) {
            return desc
        }
        return desc + '.'
    }

    public getAuthors(): string {
        return this.src.authors.map(author => author.name).join(', ')
    }

    /**
     * Get the duration of the recipe. It is the sum of the duration of all steps.
     * @returns the duration of the recipe
     */
    public getDuration(): number {
        return this.props.duration ?? 0
    }

    public getTags(): string[] {
        return this.props.tags ?? []
    }

    /**
     * Get all unique items in the recipe
     * @returns a list of all items in the recipe
     */
    public getRecipeItems(): RecipeItem[] {
        return this.items
    }

    public hasItem(id?: string): boolean {
        const fName = MODULE + 'Recipe.' + this.hasItem.name
        if (typeof id === 'undefined') {
            logWarn(fName, ERROR_MSG.noId)
            return false
        }
        return this.items.some((item: RecipeItem) => item.getId() === id)
    }

    /**
     * Share the recipe with buddies
     * This will open the share dialog of the device
     * @returns a promise that resolves when the share dialog is closed
     */
    public async share() {
        return share({
            title: 'Share your recipe with your friends',
            text: `Check out this recipe for ${this.getName()} on ${APP_NAME}!`,
            url: '#' + this.getRoute(),
            dialogTitle: 'Share with your friends',
        })
    }

    /**
     * Get the route to the recipe
     */
    public getRoute(): string {
        return '/recipe/show/' + this.getId()
    }

    /**
     * Navigate to the recipe
     */
    public route(): void {
        const router = useIonRouter()
        router.push(this.getRoute())
    }

    /**
     * Update the servings of the recipe
     * @param servings
     */
    public setServings(servings?: number) {
        if (typeof servings === 'undefined') {
            return
        }

        this.servings = servings
        this.items.forEach((item) => {
            item.setServings(servings)
        })
    }

    /**
     * Prototype function to get the price of the recipe
     */
    public getPrice(): number {
        let price = 0
        for (const item of this.getRecipeItems()) {
            // TODO: get price from item
            price += 1 * item.servings
        }
        return Math.floor(price)
    }
}