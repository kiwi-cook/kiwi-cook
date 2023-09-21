import {useRecipeStore} from "@/storage";
import {Item, Recipe, Step, StepItem} from "@/tastebuddy";
import {closest, distance} from "fastest-levenshtein";
import {Ref} from "vue";


/**
 * Parses a string into a list of step items.
 * @param text
 */
export function extractStepItemsFromText(text: string): StepItem[] {
    const recipeStore = useRecipeStore()
    const items = recipeStore.getItemsAsList
    const itemsFromDescription: Set<StepItem> = new Set()
    items.forEach((item: Item) => {
        const itemName = item.getName().toLowerCase()
        if (itemName !== '' && text.toLowerCase().includes(itemName)) {
            itemsFromDescription.add(new StepItem(item))
        }
    })
    return [...itemsFromDescription]
}

/**
 * Extracts the duration from a text in minutes.
 * @param text
 */
export function extractDurationFromText(text: string): number {
    let dur = 0
    const durationRegex = RegExp(/\b(\d+)\s*((min(?:ute)?s?)|(h(?:ou)?rs?))\b/, 'gi')

    // Find all durations in the text and sum them up
    const durations = text.matchAll(durationRegex)
    for (const duration of durations) {
        let factor = 1
        // only check the first character of the duration unit
        if (duration[2].charAt(0) === 'h') {
            factor = 60
        }
        dur += parseInt(duration[1]) * factor
    }


    return dur
}

/**
 * Extracts the temperature from a text.
 * @param text
 */
export function extractTemperatureFromText(text: string): number {
    const temperature = RegExp(/(\d+)°([CF]?)/).exec(text ?? '')
    const unit = temperature?.[2] ?? 'C'
    let unitFactor = 1
    if (unit === 'F') {
        unitFactor = 0.55
    }
    return parseInt(temperature?.[1] ?? '0') * unitFactor
}

/**
 * Parses a string quantity into a number.
 * @param quantity
 */
function parseQuantity(quantity: string): number {
    const fractionalMap: { [fraction: string]: number } = {
        '½': 0.5,
        '⅓': 1 / 3,
        '¼': 0.25,
        '⅕': 0.2,
        '⅙': 1 / 6,
        '⅛': 0.125,
        '⅔': 2 / 3,
        '¾': 0.75,
        '⅖': 0.4,
        '⅜': 0.375,
        '⅗': 0.6,
        '⅝': 0.625,
        '⅞': 0.875,
    };

    const normalizedQuantity: string = quantity.trim();

    if (normalizedQuantity in fractionalMap) {
        return fractionalMap[normalizedQuantity];
    }

    const parsedFloat = parseFloat(normalizedQuantity);
    if (!isNaN(parsedFloat)) {
        return parsedFloat;
    }

    return 0;
}

/**
 * Parses a string unit into a normalized unit.
 * @param unit
 * @param defaultUnit
 */
function normalizeUnit(unit?: string, defaultUnit = 'pcs'): string {
    const unitMap: { [unit: string]: string } = {
        "teaspoons": "tsp",
        "tsps": "tsp",
        "tablespoons": "tbsp",
        "tbsps": "tbsp",
        "fluid ounces": "fl oz",
        "fl ozs": "fl oz",
        "cups": "cup",
        "pieces": "pcs",
    };

    return unitMap[(unit ?? '').toLowerCase()] || unit || defaultUnit;
}

/**
 * Parses a string unit into a normalized unit.
 * @param value
 * @param normalizedUnit
 */
function convertUnits(value: number, normalizedUnit: string): { value: number, unit: string } {
    const unitConversion: { [fromUnit: string]: { factor: number, unit: string } } = {
        "tsp": {
            "factor": 1 / 3,
            "unit": "tbsp",
        },
        "tbsp": {
            "factor": 3,
            "unit": "tsp",
        },
        "fl oz": {
            "factor": 6,
            "unit": "tsp",
        },
        "oz": {
            "factor": 28.3495,
            "unit": "g",
        },
        "l": {
            "factor": 1000,
            "unit": "ml",
        },
        "cup": {
            "factor": 236.588,
            "unit": "ml",
        },
        "kg": {
            "factor": 1000,
            "unit": "g",
        }
    };

    const conversionResult: { value: number, unit: string } = {
        value: value,
        unit: normalizedUnit,
    }

    // Convert unit if possible
    const toUnit = unitConversion[normalizedUnit]
    if (toUnit) {
        conversionResult.value = toUnit.factor * value
        conversionResult.unit = toUnit.unit
    }

    return conversionResult
}

function findMostSimilarItems(stepItemsFromRecipe: StepItem[]): StepItem[] {
    const recipeStore = useRecipeStore()
    const items = recipeStore.getItemsAsList
    const itemsNames = items.map((item: Item) => item.getName())
    const maxDistance = 2
    stepItemsFromRecipe.forEach((stepItem: StepItem, index: number) => {
        const closestItemName = closest(stepItem.getName(), itemsNames)
        if (distance(stepItem.getName(), closestItemName) <= maxDistance) {
            const closestItem = items.find((item: Item) => item.getName() === closestItemName)
            stepItemsFromRecipe[index].id = closestItem?.id ?? ''
            stepItemsFromRecipe[index].setName(closestItemName)
        }
    })

    return stepItemsFromRecipe
}


export const enum RecipeParser {
    Cookstr = 'cookstr',
    KptnCook = 'kptncook',
}

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


/**
 * Parses a JSON string into a list of recipes.
 * @param jsonString
 * @param options
 */
export function parseRecipes(jsonString: string, options: { parser: RecipeParser, max: number, list: Ref<Recipe[]> }) {
    const recipes = JSON.parse(jsonString) as unknown[]
    let selectedParser: (recipe: unknown) => Recipe

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (options.parser) {
        case RecipeParser.Cookstr:
            selectedParser = parseCookstr as (recipe: unknown) => Recipe
    }

    recipes.slice(0, options.max).forEach((recipe: any) => {
        const parsedRecipe = selectedParser(recipe)
        options.list.value.push(parsedRecipe)
    })
}

/**
 * Parses a Cookstr recipe into a Recipe.
 * @param cookstrRecipe
 */
function parseCookstr(cookstrRecipe: CookstrRecipe): Recipe {
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
    const recipe: Recipe = new Recipe()
    recipe.setName(cookstrRecipe.title, 'en')
    recipe.setDescription(cookstrRecipe.description, 'en')

    // Source
    recipe.src.url = cookstrRecipe.url
    recipe.src.authors = [{name: cookstrRecipe.chef}]
    recipe.src.cr = cookstrRecipe.copyright
    recipe.src.cookBook = {
        pub: cookstrRecipe.cookbook_publisher,
        name: cookstrRecipe.cookbook
    }

    // Props
    recipe.props.tags = [
        ...(cookstrRecipe.course ?? '').split(','),
        ...(cookstrRecipe.meal ?? '').split(','),
        ...(cookstrRecipe.taste_and_texture ?? '').split(','),
        ...(cookstrRecipe.cooking_method ?? '').split(','),
    ].filter(tag => tag !== '').map(tag => tag.trim().toLowerCase())
    recipe.props.imgUrl = cookstrRecipe.photo_url
    recipe.props.date = new Date(cookstrRecipe.date_modified)

    // Ingredients
    const stepItemsFromIngredients = cookstrIngredientsToStepItems(cookstrRecipe.ingredients_detailed)
    const stepItemsFromInstructions = stepItemsFromInstruction(cookstrRecipe.instructions)
    let stepItemsFromIngredientsAndInstructions = [...stepItemsFromIngredients, ...stepItemsFromInstructions]
    stepItemsFromIngredientsAndInstructions = findMostSimilarItems(stepItemsFromIngredientsAndInstructions)

    recipe.steps = cookstrRecipe.instructions.map(instruction => parseCookstrInstruction(instruction, stepItemsFromIngredientsAndInstructions))

    return recipe
}

/**
 * Parse a cookstr ingredient into a step item
 */
function cookstrIngredientsToStepItems(cookstrIngredients: { ingredients: string[], line: string }[]): StepItem[] {
    const stepItems: StepItem[] = []
    for (const ingredient of cookstrIngredients) {
        const stepItem = new StepItem()

        // Set the name based on the first ingredient
        let itemName = ingredient.ingredients[0] ?? ''

        const ingredientRegex = /^(\d(?:[/.]\d+)?|[½⅓¼⅕⅙⅛⅔¾⅖⅜⅗⅝⅞]|\s+)\s*(?:(t(?:a)?b(?:le)?sp(?:oon)?s?|t(?:ea)?s(?:poon)?s?|ounces?|cups?|tbsp|m(?:illi)?l(?:itre)?s?)\s*)?(.+)$/i
        const matchesLine = ingredient.line.match(ingredientRegex)
        console.log(matchesLine)
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
function stepItemsFromInstruction(instruction: string[]): StepItem[] {
    return instruction.flatMap(extractStepItemsFromText)
}

/**
 * Parse a cookstr instruction into a step
 * @param instruction
 * @param stepItems
 */
function parseCookstrInstruction(instruction: string, stepItems: StepItem[]): Step {
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
            // logDebug('parseCookstrInstruction', `Found step item ${closestWord} for word ${word} with distance ${distance(word, closestWord)} and step item ${stepItem.getName()}`)
            items.add(stepItem)
        }
    })

    step.duration = extractDurationFromText(instruction)
    step.temperature = extractTemperatureFromText(instruction)

    step.items = [...items]

    return step
}