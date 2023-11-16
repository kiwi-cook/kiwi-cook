import {logDebug, normalizeUnit, Recipe, StepItem} from '@/shared';
import nlp from 'compromise';
import {findMostSimilarItem} from '@/editor/parser/utils';
import {newItemFromName} from '@/editor/types/item';
import {MutableRecipe} from '@/editor/types/recipe';
import {newLocaleStr} from '@/shared/locales/i18n';

type AllRecipesRecipe = {
    images: string[];
    categories: string[];
    ingredients: string[];
    steps: {
        step: number;
        instruction: string;
    }[];
    id: string;
    name: string;
    title: string;
    description: string;
    rating: string;
    prep_time: string;
    cook_time: string;
    total_time: string;
    nutritional_information: {
        calories: string;
        servings: string;
        total_fat: string;
        saturated_fat: string;
        cholesterol: string;
        sodium: string;
        potassium: string;
        total_carbohydrate: string;
        dietry_fibre: string;
        protein: string;
        sugars: string;
        vitamin_a: string;
        vitamin_c: string;
        calcium: string;
        iron: string;
        thiamin: string;
        niacin: string;
        vitamin_b6: string;
        magnesium: string;
        folate: string;
    };
    notes: null | string;
}

export class AllRecipesParser {
    public static parse(allRecipesRecipe: AllRecipesRecipe): Recipe {
        const recipe: MutableRecipe = new MutableRecipe()
        recipe.setName(allRecipesRecipe.title, 'en')
        recipe.setDescription(allRecipesRecipe.description, 'en')

        // Props
        recipe.props.tags = [
            ...allRecipesRecipe.categories,
        ].filter(tag => tag !== '').map(tag => tag.trim().toLowerCase())

        // StepItems
        const stepItems: StepItem[] = []
        for (const ingredient of allRecipesRecipe.ingredients) {
            const doc = nlp(ingredient);
            const quantities = doc.match('#Value+').out('text').split(' ');
            const unit = doc.match('#Unit').out('text');
            const ingredientName = doc.not('#Value').not('#Unit').text();

            const stepItem = new StepItem()
            let item = findMostSimilarItem(ingredientName)
            if (!item) {
                item = newItemFromName(ingredientName)
            }
            stepItem.updateItem(item)
            stepItem.unit = normalizeUnit(unit)
            logDebug('parseAllRecipes', quantities, unit, ingredientName)
            stepItems.push(stepItem)
        }

        // Steps
        const steps = allRecipesRecipe.steps.map((step) => step.instruction)
        recipe.setSteps(steps, 'en')

        // Notes
        recipe.notes = newLocaleStr(allRecipesRecipe.notes ?? '', 'en')


        logDebug('parseAllRecipes', stepItems)
        return recipe
    }


}