import { Step, StepItem } from '@/api/types';
import { deepCopy } from './util';

enum State {
    Ignore,
    Amount,
    Unit,
    AmountWithUnit,
    Ingredient
}

export const descriptionToSteps = (description: string): Step[] => {
    // tokenize the description
    const descriptions = description.trim().split('.').map((token) => token.trim()).filter((token) => token.length > 0);

    const steps: Step[] = [];

    // create step from tokens
    for (let i = 0; i < descriptions.length; i++) {
        const stepItems = descriptionToItems(descriptions[i]) ?? [];
        steps.push({
            description: descriptions[i],
            items: stepItems
        });
    }

    return steps;
}

const UNITS = [
    'kg', 'kilos', 'kilogramm',
    'g', 'gr', 'gramm',
    'litre', 'l', 'millilitre', 'ml',
    'piece', 'pcs',
    'tsp', 'teaspoon',
    'tbsp', 'tablespoon',
    'cup', 'cups',
    'pinch',
    'dash',
    'slice',
    'can',
    'bunch'
];

const normalizeUnit = (unit: string): string => {
    switch (unit.toLocaleLowerCase()) {
        case 'kilogramm':
        case 'kg':
            return 'kg';
        case 'gramm':
        case 'gr':
        case 'g':
            return 'g';
        case 'litre':
        case 'l':
            return 'l';
        case 'millilitre':
        case 'ml':
            return 'ml';
        case 'piece':
        case 'pcs':
            return 'pcs';
        case 'teaspoon':
        case 'tsp':
            return 'tsp';
        case 'tablespoon':
        case 'tbsp':
            return 'tbsp';
        case 'cups':
        case 'cup':
            return 'cup';
        default:
            return unit.toLocaleLowerCase();
    }
}

const PRONOUNS = ['me', 'you', 'him', 'her', 'it', 'us', 'them', 'we', 'they', 'i', 'he', 'she', 'your'];
const CONDITIONS = ['if', 'unless']
const MODALS = ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would', 'ought', 'need', 'dare', 'get', 'got', 'gets', 'getting', 'had', 'has', 'have', 'having', 'was', 'were', 'be', 'been', 'being', 'am', 'is', 'are', 'do', 'does', 'did']
const VERBS = ['fill', 'spoon', 'continue', 'decorate', 'dissolve', 'serve', 'wish', 'pop', 'cool', 'want', 'would', 'place', 'add', 'cut', 'chop', 'slice', 'dice', 'mince', 'peel', 'grate', 'crush', 'mash', 'mix', 'stir', 'bake', 'roast', 'fry', 'boil', 'steam', 'saute', 'grill', 'broil', 'poach', 'simmer', 'blanch', 'marinate', 'season', 'sprinkle', 'put', 'pour', 'top', 'wash', 'cook', 'get', 'take'];
const ADVERBS = ['slowly', 'quickly', 'carefully', 'gently', 'lightly', 'thoroughly', 'well', 'badly', 'perfectly', 'barely', 'even', 'evenly', 'fully', 'hard', 'hardly', 'highly', 'just', 'justly', 'loosely', 'low', 'lowly', 'mostly', 'neatly', 'nicely', 'often', 'perfectly', 'poorly', 'quickly', 'quietly', 'rarely', 'regularly', 'roughly', 'slowly', 'smoothly', 'softly', 'strongly', 'thoroughly', 'tightly', 'too', 'well', 'widely', 'wrongly', 'yet'];
const ADJECTIVES = ['glossy', 'fitted', 'smooth', 'cool', 'pale', 'mousse-y', 'fresh', 'simmering', 'dried', 'frozen', 'ripe', 'unripe', 'cooked', 'raw', 'chilled', 'warm', 'hot', 'cold', 'soft', 'suspended', 'hard', 'crispy', 'crunchy', 'juicy', 'dry', 'sticky', 'tender', 'bitter', 'sour', 'sweet', 'spicy', 'salty', 'savory', 'mild', 'strong', 'flavorful', 'tasty', 'delicious', 'nutritious', 'healthy', 'organic', 'natural', 'freshly', 'homemade', 'home-made'];
const PREPOSITIONS = ['of', 'with', 'to', 'in', 'into', 'on', 'under', 'over', 'from']
const NOUNS = ['mixture']
const JOINER = ['and', 'or', ',', 'then'];
const ARTICLES = ['a', 'an', 'the'];
const OTHERS = ['rid']

const TIMINGPREPOSITIONS = ['until', 'for', 'while', 'during', 'after', 'before', 'till', 'by']
const TIMINGUNITS = ['min', 'mins', 'minute', 'minutes', 'sec', 'secs', 'second', 'seconds', 'hour', 'hours', 'day', 'days', 'week', 'weeks'];

const IGNORE = [
    ...PRONOUNS,
    ...CONDITIONS,
    ...MODALS,
    ...VERBS,
    ...ADJECTIVES,
    ...ADVERBS,
    ...PREPOSITIONS,
    ...NOUNS,
    ...OTHERS,
    ...TIMINGPREPOSITIONS,
    ...TIMINGUNITS,
    ...ARTICLES,
    ...JOINER
];

// define helper functions
const isIgnore = (token: string): boolean => IGNORE.includes(token.toLocaleLowerCase());

const isNumber = (token: string): boolean => !isNaN(Number(token));
const isAmountWithUnit = (token: string): boolean => !isNumber(token) && /^\d+\s*\w+$/.test(token) && UNITS.some((unit: string) => token.includes(unit));
const isUnit = (token: string): boolean => UNITS.includes(token.toLocaleLowerCase());

const isTiming = (token: string): boolean => isNumber(token);
const isTimingWithUnit = (token: string): boolean => !isNumber(token) && /^\d+\s*\w+$/.test(token) && TIMINGUNITS.some((unit: string) => token.includes(unit));
const isDuration = (token: string): boolean => TIMINGUNITS.includes(token.toLocaleLowerCase());

const isIngredient = (token: string): boolean => !isIgnore(token) &&
    !isNumber(token) &&
    !isAmountWithUnit(token) &&
    !isUnit(token) &&
    !isTiming(token) &&
    !isTimingWithUnit(token) &&
    !isDuration(token);

const normalizeIngredient = (ingredient: string): string => {
    return ingredient[0].toLocaleUpperCase() + ingredient.slice(1);
}

export const descriptionToItems = (description: string): StepItem[] => {
    // prepare and tokenize the description
    const tokens = description.trim()
        // keep comma as separate token
        .replace(/(.),/g, '$1 ,')
        // replace parentheses
        .replace(/\(|\)/g, '')
        // split by dot or space
        .split(/\.|\s+/)
        // remove trailing spaces
        .map((token) => token.trim())
        // remove empty tokens
        .filter((token) => token.length > 0);

    const stepItems: StepItem[] = [];
    let stepItem: StepItem = deepCopy(new StepItem());

    type StateMachine = {
        is: (token: string) => boolean,
        action?: (token: string, nextToken: string) => void,
        doNotConsumeToken?: boolean,
        next: State[]
    }

    const states: { [key in State]: StateMachine } = {
        [State.Ignore]: {
            is: (token: string) => isIgnore(token),
            next: [...Object.values(State) as State[]].filter(e => typeof e === 'number')
        },
        [State.Amount]: {
            is: (token: string) => isNumber(token),
            action: (token: string, _: string) => {
                stepItem.amount = parseInt(token);
            },
            next: [
                State.Unit,
                State.Ingredient,
            ]
        },
        [State.Unit]: {
            is: (token: string) => isUnit(token),
            action: (token: string, _: string) => {
                stepItem.unit = normalizeUnit(token);
            },
            next: [
                State.Ignore,
                State.Ingredient,
            ]
        },
        [State.AmountWithUnit]: {
            is: (token: string) => isAmountWithUnit(token),
            action: (token: string, _: string) => {
                const number = (token.match(/\d+/) ?? ['1'])[0];
                const unit = (token.match(/[a-zA-Z]+/) ?? ['pcs'])[0]

                stepItem.amount = parseInt(number);
                stepItem.unit = normalizeUnit(unit);
            },
            next: [
                State.Ignore,
                State.Ingredient
            ]
        },
        [State.Ingredient]: {
            is: (token: string) => isIngredient(token),
            action: (token: string, nextToken: string) => {
                const ingredient = normalizeIngredient(token);
                stepItem.item.name = stepItem.item.name === '' ? ingredient : `${stepItem.item.name} ${ingredient}`;
                if (!isIngredient(nextToken)) {
                    console.debug(deepCopy(stepItem))
                    stepItems.push(deepCopy(stepItem));
                    stepItem = deepCopy(new StepItem());
                }
            },
            next: [
                State.Ingredient,
                State.Ignore
            ]
        }
    }

    // example: Add 5 g peanut. Add 100 ml water to the pot. Mix everything.
    let state: State = State.Ignore
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (states[state].is(token)) {
            console.debug(`token: ${token}`, `currentState: ${state}`)

            // execute action for the current state
            states[state].action?.(token, tokens[i + 1] ?? '');

            // go back to the previous state if the token should not be consumed
            if (states[state].doNotConsumeToken) {
                i--;
            }

            // check if the token next token is valid for the current state
            state = states[state].next.find((nextState: State) => {
                console.debug(`possible nextState: ${nextState}`, states[nextState].is(tokens[i + 1] ?? ''));
                return states[nextState].is(tokens[i + 1] ?? '')
            }) ?? State.Ignore;
        } else {
            // reset state
            state = State.Ignore;
        }
    }

    return stepItems;
}