import {StepItem, stepItemFromJSON} from "@/shared/ts";
import {getLocaleStr, LocaleStr, newLocaleStr, setLocaleStr} from "@/shared/locales/i18n.ts";
import {parseTemperature} from "@/editor/parser/utils.ts";

/**
 * Step of a recipe
 * It is a step with a list of StepItems
 * It can have an image, a description and a preparation time for the step
 */
export class Step {
    items: StepItem[];
    imgUrl?: string;
    desc: LocaleStr;
    duration?: number;
    temperature?: number;

    constructor() {
        this.items = []
        this.imgUrl = ''
        this.desc = newLocaleStr()
        this.duration = 0
    }

    /**
     * Initialize an stepItem from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new step
     */
    public static fromJSON(json: any): Step {
        const item = new Step()
        item.items = json.items?.map((item: any) => stepItemFromJSON(item)) ?? []
        item.imgUrl = json.imgUrl
        item.desc = json.desc
        item.duration = json.duration
        item.temperature = parseTemperature(json.temperature, item.getDescription())
        return item
    }

    /**
     * Create a step from a list of step items
     * @param stepItems
     * @param description
     * @returns a new step
     */
    public static fromStepItems(stepItems: StepItem[], description?: string): Step {
        const step = new Step()
        step.items = stepItems
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
     * Get the description of the step
     * as HTML with highlighted items
     * @param className the class name of the highlighted items
     */
    public printDescription(className: string): string {
        let description = this.getDescription()
        if (!description) {
            return ''
        }

        this.getStepItems().forEach((item: StepItem) => {
            const itemName = item.getName()
            const regex = new RegExp(`\\s+${itemName}`, 'ig')
            description = description.replace(regex, ` <span class="${className}">${itemName}</span>`)
        })
        return description
    }

    /**
     * Get all unique items in the step
     * @returns a list of all items in the step
     */
    public getStepItems(): StepItem[] {
        return [...new Set(this.items)]
    }

    /**
     * Update the servings of the step
     * @param servings
     * @returns the step to allow chaining
     */
    public updateServings(servings = 1): this {
        this.items.forEach((stepItem: StepItem) => {
            stepItem.servings = stepItem.quantity * servings
        })
        return this
    }
}
