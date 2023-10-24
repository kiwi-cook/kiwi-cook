// Step 1: load data or create some data
import {useRecipeStore} from "../storage";
import {Recipe} from "@/shared/types";
import {NeuralNetwork} from "brain.js";
import {INumberHash} from "brain.js/dist/lookup";
import {INeuralNetworkDatum} from "brain.js/dist/neural-network";
import {logDebug} from "@/shared/ts";

interface IRecipeInput extends INumberHash {
    duration: number;
    items: number;
    steps: number;
}

interface IRecipeOutput extends INumberHash {
    wanted: number;
}

/**
 * Predict the favorite recipes of the user
 *
 * The network collects the following data:
 * - time to prepare
 * - number of items
 * - number of steps
 * - items
 *
 * The network predicts the following data:
 * - is the recipe saved?
 *
 * The network is trained with the following data:
 * - saved recipes
 *
 * The network is tested with the following data:
 * - all recipes
 *
 * The input vector has the following structure:
 * [time to prepare, number of items, number of steps]
 *
 * The output vector has the following structure:
 * [is the recipe saved?]
 *
 * @returns the predicted recipes
 */
export function predictRecipes(cb: (recipes: Recipe[]) => void) {
    const recipeStore = useRecipeStore();
    const recipes = recipeStore.getRecipesAsList;
    const savedRecipes = recipeStore.getSavedRecipes;
    logDebug(`predictRecipes`, `${recipes.length} recipes, ${savedRecipes.length} saved recipes`)
    if (savedRecipes.length === 0) {
        return [];
    }

    const trainingData: Array<INeuralNetworkDatum<IRecipeInput, IRecipeOutput>> = recipes.map((recipe: Recipe) => {
        const duration = recipe.getDuration();
        const items = recipe.getItems().length;
        const steps = recipe.steps.length;

        return {
            input: {
                duration,
                items,
                steps
            },
            output: {wanted: recipe.isSaved() ? 1 : 0},
        }
    })

    const recipeNet = new NeuralNetwork<IRecipeInput, IRecipeOutput>({
        activation: 'sigmoid',
        hiddenLayers: [3],
    });

    // Step 1: train
    recipeNet.trainAsync(trainingData, {
        log: true,
        errorThresh: 0.2
    }).then(() => {

        // Step 2: predict
        const predictions = recipes.map((recipe: Recipe) => {
            const duration = recipe.getDuration();
            const items = recipe.getItems().length;
            const steps = recipe.steps.length;

            const output = recipeNet.run({duration, items, steps})
            return {
                recipe,
                output
            }
        })

        // Step 3: sort
        predictions.sort((a, b) => b.output.wanted - a.output.wanted);

        logDebug(`predictRecipes`, predictions)
        cb(predictions.map((prediction) => prediction.recipe))
    })
}

