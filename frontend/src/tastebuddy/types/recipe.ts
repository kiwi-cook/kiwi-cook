import {useRecipeStore} from "@/storage";
import {useIonRouter} from "@ionic/vue";
import {getLocaleStr, LocaleStr, newLocaleStr, setLocaleStr} from "@/locales/i18n.ts";
import {Item, logDebug, logError, Step, StepItem, tmpId} from "@/tastebuddy";
import {CanShareResult, Share} from "@capacitor/share";

/**
 * Recipe
 * It is a recipe with a list of steps
 * It contains all the information about a recipe
 */
export class Recipe {
    id?: string;
    private readonly tmpId?: string;
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
        this.tmpId = tmpId()
        this.name = newLocaleStr('New recipe', 'en')
        this.desc = newLocaleStr('New recipe description', 'en')
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
     * Initialize a recipe from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new recipe
     */
    public static fromJSON(json: any): Recipe {
        const recipe = new Recipe()

        // Id
        recipe.id = json.id
        // if the id is undefined, throw an error
        if (recipe.id === undefined) {
            throw new Error("recipe id is undefined")
        }

        recipe.name = json.name
        recipe.desc = json.desc
        recipe.steps = json.steps?.map((step: any) => Step.fromJSON(step)) ?? [new Step()]
        recipe.computeItems()

        // Props
        recipe.props.imgUrl = json?.props?.imgUrl
        recipe.props.tags = json?.props?.tags
        recipe.props.duration = json?.props?.duration
        recipe.props.date = new Date(json?.props?.date)

        // Source
        recipe.src = json.src
        recipe.computeAuthors()

        return recipe
    }

    /**
     * Initialize a new recipe with a temporary id
     * @returns a new recipe with a temporary id
     */
    public static newRecipe(): Recipe {
        return new Recipe()
    }

    /**
     * Get the id of the recipe
     * @returns the id of the recipe
     * @throws an error if the id is undefined
     */
    public getId(): string {
        // if the id is undefined, throw an error
        if (this.id === undefined && this.tmpId === undefined) {
            throw new Error("recipe id is undefined")
        }
        return this.id ?? this.tmpId as string
    }

    /**
     * Get the localized name of the recipe
     */
    public getName(): string {
        return getLocaleStr(this.name)
    }

    /**
     * Set the localized name of the recipe
     */
    public setName(name: string, lang?: string) {
        setLocaleStr(this.name, name, lang)
    }

    /**
     * Get the localized description of the recipe
     */
    public getDescription(): string {
        return getLocaleStr(this.desc)
    }

    /**
     * Set the localized description of the recipe
     */
    public setDescription(description: string, lang?: string): void {
        setLocaleStr(this.desc, description, lang)
    }

    /**
     * Add an author to the list of authors
     * @param author
     */
    public addAuthor(author: string): void {
        if (this.src.authors === undefined) {
            this.src.authors = []
        }
        this.src.authors.push({name: author})
        this.computeAuthors()
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
     * Updates the recipe in the store
     * @returns the recipe to allow chaining
     */
    public update(): this {
        logDebug('recipe.update', this.getId())
        const store = useRecipeStore()
        store.setRecipes(this)
        return this
    }

    /**
     * Save the recipe to the database
     * @returns the id of the recipe
     */
    public save() {
        logDebug('recipe.save', this.getId())
        const store = useRecipeStore()
        return store.saveRecipes([this])
    }

    /**
     * Delete the recipe from the database
     */
    public delete() {
        const store = useRecipeStore()
        logDebug('recipe.delete', this.getId())
        return store.deleteRecipes(this)
    }

    /**
     * Add a step to the recipe
     * @param step
     * @param stepIndex
     * @returns the recipe to allow chaining
     */
    public addStep(step?: Step, stepIndex?: number): this {
        const _step: Step = step ?? new Step()

        if (stepIndex !== undefined) {
            // insert the step at the given index
            this.steps.splice(stepIndex + 1, 0, _step)
        } else {
            // add the step to the end
            this.steps.push(_step)
        }
        this.computeItems()
        return this
    }

    /**
     * Remove a step from the recipe
     * @param index
     * @returns the recipe to allow chaining
     */
    public removeStep(index: number): this {
        this.steps.splice(index, 1)
        this.computeItems()
        return this
    }

    /**
     * Add an item to a step
     * @param stepIndex index of the step
     * @param itemIndex index of the item
     * @param item the item to add
     * @returns the recipe and the item
     */
    public addItem(stepIndex?: number, itemIndex?: number, item?: Item): { item: Item, recipe: Recipe } {
        item = item ?? new Item();
        logDebug('recipe.addItem', `add item to recipe ${this.getId()} at step ${stepIndex} and item position ${itemIndex}:`, item)
        const stepItem = new StepItem(item);

        if (stepIndex === undefined) {
            // add a new step if no step is specified
            this.steps[this.steps.length - 1].items.push(stepItem);
        } else if (itemIndex === undefined) {
            // add a new item to the step if no item is specified
            this.steps[stepIndex].items.push(stepItem);
        } else {
            // update the item at the specified index
            this.steps[stepIndex].items[itemIndex] = stepItem;
        }
        this.computeItems()
        return {item, recipe: this};
    }

    public replaceItem(itemId: string, newItem?: Item) {
        if (!newItem) {
            return
        }

        for (const step of this.steps) {
            for (const item of step.items) {
                if (item.getId() === itemId) {
                    item.updateItem(newItem)
                }
            }
        }
        this.computeItems()
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
     * Add a tag to the recipe
     * @param tag
     * @returns the recipe to allow chaining
     */
    public addTag(tag: string): this {
        if (!this.props.tags) {
            // initialize the tags array if it is undefined
            this.props.tags = []
        }
        this.props.tags.push(tag)
        return this
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

