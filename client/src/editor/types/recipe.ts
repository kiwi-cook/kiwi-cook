import {Item, logDebug, Recipe, Step, StepItem} from "@/shared/ts";
import {useRecipeStore} from "@/editor/storage";
import {setLocaleStr} from "@/shared/locales/i18n.ts";

export class MutableRecipe extends Recipe {

    private readonly tmpId?: string;

    /**
     * Initialize a new recipe with a temporary id
     * @returns a new recipe with a temporary id
     */
    public static newRecipe(): MutableRecipe {
        return new MutableRecipe()
    }

    public getId(): string {
        return this.tmpId ?? super.getId()
    }

    /**
     * Updates the recipe in the store
     * @returns the recipe to allow chaining
     */
    public update(): this {
        logDebug("recipe.update", this.getId())
        const store = useRecipeStore()
        store.setRecipes(this)
        return this
    }

    /**
     * Save the recipe to the database
     * @returns the id of the recipe
     */
    public save() {
        logDebug("recipe.save", this.getId())
        const store = useRecipeStore()
        return store.saveRecipes([this])
    }

    /**
     * Delete the recipe from the database
     */
    public delete() {
        const store = useRecipeStore()
        logDebug("recipe.delete", this.getId())
        return store.deleteRecipes(this)
    }

    /**
     * Set the localized name of the recipe
     */
    public setName(name: string, lang?: string) {
        setLocaleStr(this.name, name, lang)
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
        logDebug("recipe.addItem", `add item to recipe ${this.getId()} at step ${stepIndex} and item position ${itemIndex}:`, item)
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
}