// Data types for the API

// types for recipe

export type Item = {
    _id?: string;
    name: string;
    type: string;
    imgUrl: string;
}

export type StepItem = {
    amount: number;
    unit: string;
    item: Item;
}

export type Step = {
    items: StepItem[];
    description: string;
}

export type Recipe = {
    _id?: string;
    name: string;
    author: string;
    description: string;
    imgUrl: string;
    tags: string[];
    cookingTime: number;
    steps: Step[];
};

// empty recipe
export const emptyRecipe: Recipe = {
    name: 'New Recipe',
    author: '',
    description: '',
    imgUrl: 'https://source.unsplash.com/random/900x450?',
    tags: [],
    cookingTime: 10,
    steps: []
}

// types for discounts

export type Discount = {
    _id: string;
    title: string;
    price: string;
    imageUrl: string;
    validUntil: number;
    internalMarketId: string;
    marketName: string;
    marketLocation: string;
}

export type Market = {
    _id: string;
    distributor: string;
    distributorSpecificId: string;
    name: string;
    city: string;
    location: string;
}