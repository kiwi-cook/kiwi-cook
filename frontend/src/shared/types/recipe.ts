import {useRecipeStore} from "@/app/storage";
import {useIonRouter} from "@ionic/vue";
import {getLocaleStr, LocaleStr, newLocaleStr} from "@/shared/locales/i18n.ts";
import {Item, logError, Step, StepItem, tmpId} from "@/shared";
import {CanShareResult, Share} from "@capacitor/share";

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
    props: {
        imgUrl?: string;
        duration?: number;
        date: Date;
        tags?: string[];
    };
    src: {
        url?: string;
        authors: {
            name: string;
            url?: string;
        }[];
        cr?: string;
        cookBook?: {
            name: string;
            url?: string;
            pub?: string;
        }
    };
    servings: number;
    liked: boolean;
    computed: {
        itemsById: { [id: string]: StepItem }
        items: StepItem[],
        authors: string
    }

    constructor() {
        // create a temporary id to identify the recipe in the store before it is saved
        this.id = tmpId()
        this.name = newLocaleStr()
        this.desc = newLocaleStr()
        this.props = {
            imgUrl: '',
            duration: 0,
            date: new Date(),
            tags: [],
        }
        this.steps = [new Step()]
        this.servings = 1
        this.liked = false;
        this.src = {
            url: '',
            authors: [],
        }
        this.computed = {
            itemsById: {},
            items: [],
            authors: ''
        }
    }

    /**
     * Get the id of the recipe
     * @returns the id of the recipe
     * @throws an error if the id is undefined
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
        return getLocaleStr(this.desc).split('.').slice(0, 2).join('.') + '.';
    }

    public getAuthors(): string {
        return this.computed.authors
    }

    /**
     * Get the duration of the recipe. It is the sum of the duration of all steps.
     * @returns the duration of the recipe
     */
    public getDuration(): number {
        return this.steps.reduce((acc, step) => acc + (step.duration ?? 0), 0)
    }

    public getTags(): string[] {
        return this.props.tags ?? []
    }

    /**
     * Get all unique items in the recipe
     * @returns a list of all items in the recipe
     */
    public getStepItems(): StepItem[] {
        return this.computed.items ?? []
    }

    public getItems(): Item[] {
        return this.getStepItems().map(stepItem => stepItem.narrow(stepItem))
    }

    public hasItem(id?: string): boolean {
        return typeof id !== 'undefined' && typeof this.computed.itemsById[id] !== 'undefined'
    }

    /**
     * Share the recipe with buddies
     * This will open the share dialog of the device
     * @returns a promise that resolves when the share dialog is closed
     */
    public async share() {
        return Share.canShare().then((canShare: CanShareResult) => {
            if (!canShare.value) {
                return
            }

            try {
                return Share.share({
                    title: 'Share with your recipe with your buddies',
                    text: `Check out this recipe for ${this.getName()} on Taste Buddy!`,
                    url: '#' + this.getRoute(),
                    dialogTitle: 'Share with buddies',
                })
            } catch (e) {
                logError('sharing failed', e)
            }
        }).catch((error: Error) => {
            logError('sharing failed', error)
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
    public updateServings(servings: number) {
        this.servings = servings
        for (const step of this.steps) {
            step.updateServings(servings)
        }
    }

    /**
     * Like or unlike the recipe
     */
    public toggleLike() {
        const store = useRecipeStore()
        this.liked = !this.liked
        store.setLike(this)
    }

    /**
     * Prototype function to get the price of the recipe
     */
    public getPrice(): number {
        let price = 0
        for (const item of this.getStepItems()) {
            price += item.getPrice() * item.servings
        }
        return Math.floor(price)
    }

    /**
     * Compute items
     */
    computeItems(): void {
        // Iterate over all steps and all items to compute the list of items
        this.computed.itemsById = {}
        for (const step of this.steps) {
            for (const item of step.getStepItems()) {
                this.computed.itemsById[item.getId()] = item
            }
        }
        this.computed.items = Object.values(this.computed.itemsById)
    }

    /**
     * Compute authors
     */
    computeAuthors(): void {
        switch ((this.src.authors ?? []).length) {
            case 0:
                this.computed.authors = ''
                break
            case 1:
                this.computed.authors = this.src.authors[0].name
                break
            case 2:
                this.computed.authors = this.src.authors[0].name + ' and ' + this.src.authors[1].name
                break
            default:
                this.computed.authors = this.src.authors.map((author) => author.name)
                    .slice(0, length - 1).join(', ') + ' and ' + this.src.authors[length - 1].name
                break
        }
    }
}

/**
 * Initialize a recipe from a json object
 * This is done because the json object does not have the methods of the class
 *
 * @param json
 * @returns a new recipe
 */
export function recipeFromJSON(json: any): Promise<Recipe> {
    return new Promise<Recipe>((resolve, reject) => {
        const recipe = new Recipe()

        // Id
        recipe.id = json.id
        // if the id is undefined, throw an error
        if (recipe.id === undefined) {
            throw reject(Error("recipe id is undefined"))
        }

        recipe.name = json.name
        recipe.desc = json.desc
        recipe.steps = json.steps?.map((step: any) => Step.fromJSON(step)) ?? [new Step()]

        // Props
        recipe.props.imgUrl = json?.props?.imgUrl
        recipe.props.tags = json?.props?.tags
        recipe.props.duration = json?.props?.duration
        recipe.props.date = new Date(json?.props?.date)

        // Source
        recipe.src = json.src
        resolve(recipe)
    }).then((recipe) => {
        recipe.computeItems()
        return recipe
    }).then((recipe) => {
        recipe.computeAuthors()
        return recipe
    }).catch((error: Error) => {
        logError('recipe.fromJSON', error)
        throw error
    })
}