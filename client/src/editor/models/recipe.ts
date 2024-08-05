/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { MultiLanguageField, Recipe, RecipeIngredient, RecipeStep } from '@/shared';
import { logDebug, logWarn } from '@/shared/utils/logging';
import { useRecipeEditorStore } from '@/editor/storage';

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
        logDebug('recipe.update', this.getId())
        const store = useRecipeEditorStore()
        store.setRecipes(this)
        return this
    }

    /**
     * Save the recipe to the database
     * @returns the id of the recipe
     */
    public save() {
        logDebug('recipe.save', this.getId())
        const store = useRecipeEditorStore()
        return store.saveRecipes([this])
    }

    /**
     * Delete the recipe from the database
     */
    public delete() {
        const store = useRecipeEditorStore()
        logDebug('recipe.delete', this.getId())
        return store.deleteRecipes(this)
    }

    /**
     * Set the localized name of the recipe
     */
    public setName(name: string, lang?: string) {
        this.name.set(name, lang)
    }

    public isSaved(): boolean {
        return false;
    }

    /**
     * Add a step to the recipe
     * @param step
     * @param stepIndex
     * @returns the recipe to allow chaining
     */
    public addStep(step?: RecipeStep, stepIndex?: number): this {
        const _step: RecipeStep = step ?? RecipeStep.empty()

        if (stepIndex !== undefined) {
            // insert the step at the given index
            this.steps.splice(stepIndex + 1, 0, _step)
        } else {
            // add the step to the end
            this.steps.push(_step)
        }
        return this
    }

    /**
     * Remove a step from the recipe
     * @param index
     * @returns the recipe to allow chaining
     */
    public removeStep(index: number): this {
        this.steps.splice(index, 1)
        return this
    }

    /**
     * Add an ingredient to a step
     * @param ingredient the ingredient to add
     * @returns the recipe and the ingredient
     */
    public putRecipeIngredient(ingredient?: RecipeIngredient): {
        ingredient: RecipeIngredient, recipe: MutableRecipe
    } {
        ingredient = ingredient ?? RecipeIngredient.empty()
        this.ingredients.push(ingredient)
        return { ingredient: ingredient, recipe: this };
    }

    public removeRecipeIngredient(ingredient: RecipeIngredient): void {
        this.ingredients = this.ingredients.filter((i: RecipeIngredient) => i !== ingredient)
    }

    /**
     * Set the localized description of the recipe
     */
    public setDescription(description: string, lang?: string): void {
        this.description.set(description, lang)
    }

    /**
     * Add an author to the list of authors
     * @param author
     */
    public addAuthor(author: string): void {
        if (this.src?.authors !== undefined) {
            this.src?.authors.push({ name: author })
        } else {
            logWarn('MutableRecipe.addAuthor', 'No authors array found')
        }
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

    setSteps(steps: string[], lang?: string): void {
        this.steps = steps.map((description: string) => {
            const step = RecipeStep.empty()
            step.description = new MultiLanguageField({ [lang ?? 'en']: description })
            return step
        })
    }
}
