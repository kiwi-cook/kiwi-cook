/*
 * Copyright (c) 2023 Josef Müller.
 */

import { parseTemperature } from '@/shared';
import { getLocaleStr, LocaleStr, newLocaleStr, setLocaleStr } from '@/shared/locales/i18n';

export enum STEP_TYPES {
    HEADER = 'header', STEP = 'step', NOTE = 'note'
}

/**
 * Step of a recipe
 * It is a step with a list of RecipeItems
 * It can have an image, a description and a preparation time for the step
 */
export class Step {
    items: string[]; // list of item names
    desc: LocaleStr;
    imgUrl?: string;
    duration?: number;
    temperature?: number;
    type: STEP_TYPES

    constructor() {
        this.items = []
        this.imgUrl = ''
        this.desc = newLocaleStr()
        this.duration = 0
        this.type = STEP_TYPES.STEP
    }

    /**
     * Initialize an recipeItem from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new step
     */
    public static fromJSON(json: any): Step {
        const item = new Step()
        item.items = json.items
        item.imgUrl = json.imgUrl
        item.desc = json.desc
        item.duration = json.duration
        item.temperature = parseTemperature(json.temperature, item.getDescription())
        item.type = json.type ?? STEP_TYPES.STEP
        return item
    }

    /**
     * Create a step from a list of step items
     * @param recipeItems
     * @param description
     * @returns a new step
     */
    public static fromRecipeItems(recipeItems: string[], description?: string): Step {
        const step = new Step()
        step.items = recipeItems
        step.setDescription(description ?? '')
        return step
    }

    /**
     * Get the localized description of the recipe
     */
    public getDescription(lang?: string): string {
        return getLocaleStr(this.desc, lang)
    }

    /**
     * Set the localized description of the recipe
     */
    public setDescription(description: string, lang?: string): void {
        setLocaleStr(this.desc, description, lang)
    }

    /**
     * Pretty print the description of the recipe
     * @param className the class name of the highlighted items
     */
    public pPrintStepDescription(className: string): string {
        let description = this.getDescription()
        if (!description) {
            return ''
        }

        for (const itemName of this.getItems()) {
            if (!itemName || itemName === '') {
                continue;
            }
            const regex = new RegExp(`\\s+${itemName}`, 'ig')
            description = description.replace(regex, ` <span class="${className}">${itemName}</span>`)
        }
        return description
    }

    /**
     * Get all unique items in the step
     * @returns a list of all items in the step
     */
    public getItems(): string[] {
        return [...new Set(this.items ?? [])]
    }
}
