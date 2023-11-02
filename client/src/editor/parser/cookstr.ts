import {Recipe, Step, StepItem} from '@/shared/ts';
import {extractDurationFromText, extractStepItemsFromText, findMostSimilarItems,} from '@/editor/parser/utils.ts';
import {closest, distance} from 'fastest-levenshtein';
import {MutableRecipe} from '@/editor/types/recipe.ts';
import {convertUnits, normalizeUnit, parseQuantity, parseTemperature} from '@/shared/ts/parser.ts';

type CookstrRecipe = {
    chef: string;
    comment_count: number;
    contributors: null | any[];
    cookbook: string;
    cookbook_publisher: string;
    cooking_method: string;
    copyright: string;
    cost: string;
    course: string | null;
    date_modified: string;
    description: string;
    dietary_considerations: string;
    difficulty: null | string;
    ingredients: string[];
    ingredients_detailed: {
        ingredients: string[];
        line: string;
    }[];
    instructions: string[];
    kid_friendly: boolean;
    make_ahead: boolean;
    makes: string;
    meal: string | null;
    occasion: string;
    photo_credit_name: string;
    photo_credit_site: string;
    photo_url: string;
    rating_count: number;
    rating_value: null | number;
    taste_and_texture: string | null;
    time_scraped: number;
    title: string;
    total_time: string;
    type_of_dish: string;
    url: string;
};

export class CookstrParser {

    /**
     * Parses a Cookstr recipe into a Recipe.
     * @param recipe
     */
    static parse(recipe: CookstrRecipe): Recipe {
        /*
        {
            "chef": "James Beard",
            "comment_count": 0,
            "contributors": null,
            "cookbook": "James Beard's Theory and Practice Of Good Cooking",
            "cookbook_publisher": "Running Press",
            "cooking_method": "baking",
            "copyright": "1977 James Beard",
            "cost": "Inexpensive",
            "course": "dessert",
            "date_modified": "2017-06-01",
            "description": "This layer cake was a standard in our house. The recipe is a very old one that people could keep in their heads because of the utter simplicity of the formula that gave the cake its name—1 cup of butter, 2 cups of sugar, 3 cups of flour, and 4 eggs. Here baking powder is the leavening agent, so this is a very easy cake to make. You might like to try mixing it the first time with your hands, which will give you a good idea of the basic techniques of beating and folding. If you don’t want to use your hands to mix the cake, use a whisk, a rotary hand beater, or an electric beater or mixer to cream the butter and sugar and to beat in the egg yolks, milk, flour, and vanilla. Fold in the egg whites by hand.",
            "dietary_considerations": "peanut free, soy free, tree nut free, vegetarian",
            "difficulty": null,
            "error": false,
            "ingredients": [
                "1 tablespoon softened butter",
                "2 tablespoons flour",
                "3 cups sifted cake flour (if you can’t find cake flour, the same quantityof all-purpose flour can be substituted)",
                "4 teaspoons double-acting baking powder",
                "½ teaspoon salt",
                "8 ounces (2 sticks) unsalted butter, at room temperature",
                "2 cups granulated sugar",
                ...
            ],
            "ingredients_detailed": [
                {
                    "ingredients": [
                        "butter"
                    ],
                    "line": "1 tablespoon softened butter"
                },
                ...
            ],
            "instructions": [
                "Preheat the oven to 350°. Butter the bottom and sides of each layer-cake pan with the softened butter, using your hands, then sprinkle the flour inside and shake this around so you get a thin coating on the butter. Tip out any excess.",
                "Now to sift your flour. Lay a large piece of waxed paper on a board, put a dry measuring cup in the center, hold a sifter directly over it, scoop cake flour from the package into the sifter, and sift the flour directly into the cup. When the cup is full, draw the back of a knife blade lightly across the top of the cup (don’t shake the flour down, or it will become dense) and then tip the measured flour into a mixing bowl. Repeat with the other 2 cups of flour (you can put any flour that spilled onto the waxed paper back in the sifter).",
                "When you have 3 cups of sifted flour in the bowl, put the baking powder and salt in the sifter, holding it over the mixing bowl, and sift it over the flour. Then mix the baking powder and salt lightly with the flour, using your hands.",
                "Next, Put the butter into a second, large mixing bowl. If it is very firm (it shouldn’t be, if you have left it out of the refrigerator), squeeze it through your fingers until it softens up. When it is soft enough to work, form your right hand into a big fork, as it were, and cream the butter—which means that you beat it firmly and quickly with your hand, beating and aerating it, until it becomes light, creamy, and fluffy.",
            ],
            "kid_friendly": true,
            "make_ahead": true,
            "makes": "1 3-layer cake",
            "meal": "dinner, snack, tea",
            "occasion": "Buffet, Casual Dinner Party, Family Get-together",
            "photo_credit_name": "Joseph DeLeo",
            "photo_credit_site": "http://www.jdeleophoto.com",
            "photo_url": "https://irepo.primecp.com/2016/03/266187/recipe-11083_Large400_ID-1493899.jpg?v=1493899",
            "rating_count": 0,
            "rating_value": null,
            "taste_and_texture": "buttery, fruity, sweet",
            "time_scraped": 1499058605,
            "title": "1-2-3-4 Cake",
            "total_time": "under 2 hours",
            "type_of_dish": "cake",
            "url": "https://www.cookstr.com/recipes/1-2-3-4-cake-james-beard"
        },
         */
        const newRecipe: MutableRecipe = new MutableRecipe()
        newRecipe.setName(recipe.title, 'en')
        newRecipe.setDescription(recipe.description, 'en')

        // Source
        newRecipe.src.url = recipe.url
        newRecipe.src.authors = [{name: recipe.chef}]
        newRecipe.src.cr = recipe.copyright
        newRecipe.src.cookBook = {
            pub: recipe.cookbook_publisher,
            name: recipe.cookbook
        }

        // Props
        newRecipe.props.tags = [
            ...(recipe.course ?? '').split(','),
            ...(recipe.meal ?? '').split(','),
            ...(recipe.taste_and_texture ?? '').split(','),
            ...(recipe.cooking_method ?? '').split(','),
        ].filter(tag => tag !== '').map(tag => tag.trim().toLowerCase())
        newRecipe.props.imgUrl = recipe.photo_url
        newRecipe.props.date = new Date(recipe.date_modified)

        // Ingredients
        const stepItemsFromIngredients = this.ingredientsToStepItems(recipe.ingredients_detailed)
        const stepItemsFromInstructions = this.instructionsToStepItems(recipe.instructions)
        let stepItemsFromIngredientsAndInstructions = [...stepItemsFromIngredients, ...stepItemsFromInstructions]
        stepItemsFromIngredientsAndInstructions = findMostSimilarItems(stepItemsFromIngredientsAndInstructions)

        newRecipe.steps = recipe.instructions.map(instruction => this.instructionToStep(instruction, stepItemsFromIngredientsAndInstructions))

        return newRecipe
    }

    /**
     * Parse a cookstr ingredient into a step item
     */
    static ingredientsToStepItems(cookstrIngredients: {
        ingredients: string[],
        line: string
    }[]): StepItem[] {
        const stepItems: StepItem[] = []
        for (const ingredient of cookstrIngredients) {
            const stepItem = new StepItem()

            // Set the name based on the first ingredient
            let itemName = ingredient.ingredients[0] ?? ''

            const ingredientRegex = /^(\d(?:[/.]\d+)?|[½⅓¼⅕⅙⅛⅔¾⅖⅜⅗⅝⅞]|\s+)\s*(?:(t(?:a)?b(?:le)?sp(?:oon)?s?|t(?:ea)?s(?:poon)?s?|ounces?|cups?|tbsp|m(?:illi)?l(?:itre)?s?)\s*)?(.+)$/i
            const matchesLine = RegExp(ingredientRegex).exec(ingredient.line)
            if (matchesLine) {
                // Use the name from the line if the name from the ingredients is empty
                if (itemName === '') {
                    itemName = matchesLine[3]
                }

                if (itemName !== '') {
                    stepItem.setName(itemName)
                } else {
                    continue
                }

                // Parse the quantity and unit
                const quantity = parseQuantity(matchesLine[1])
                const normalizedUnit = normalizeUnit(matchesLine[2])
                const {value, unit} = convertUnits(quantity, normalizedUnit)
                stepItem.quantity = value
                stepItem.unit = unit

                stepItems.push(stepItem)
            }

        }

        return stepItems
    }

    /**
     * Parse a cookstr instruction into a list of step items
     * @param instruction
     */
    static instructionsToStepItems(instruction: string[]): StepItem[] {
        return instruction.flatMap(extractStepItemsFromText)
    }

    /**
     * Parse a cookstr instruction into a step
     * @param instruction
     * @param stepItems
     */
    static instructionToStep(instruction: string, stepItems: StepItem[]): Step {
        const step = new Step()

        step.setDescription(instruction)
        const items = new Set<StepItem>()

        // Prepare the instruction
        const words = instruction
            .split(/[ .,!?)]/)
            .filter(word => word.length > 0)
            .map(word => word.toLowerCase())

        // Find the step items
        const maxDistance = 2
        const stepItemNames = stepItems.map(stepItem => stepItem.getName())
        words.forEach((word) => {
            const closestWord = closest(word, stepItemNames)
            const closestWordIndex = stepItemNames.indexOf(closestWord)
            if (distance(word, closestWord) <= maxDistance) {
                const stepItem = stepItems[closestWordIndex]
                // logDebug("parseCookstrInstruction", `Found step item ${closestWord} for word ${word} with distance ${distance(word, closestWord)} and step item ${stepItem.getName()}`)
                items.add(stepItem)
            }
        })

        step.duration = extractDurationFromText(instruction)
        step.temperature = parseTemperature(undefined, instruction)

        step.items = [...items]

        return step
    }
}