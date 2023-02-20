// Data types for the API

// types for recipe

export type Item = {
    _id: string;
    name: string;
    type: string;
    imgUrl: string;
}

type StepItem = {
    amount: number;
    unit: string;
    item: Item;
}

type Step = {
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

// dummy recipe
export const dummyRecipe: Recipe = {
    name: 'Veggie Burger',
    author: 'Josef & Vasilij',
    description: 'The best burger recipe in Konschtanz!',
    imgUrl: 'https://source.unsplash.com/random/900x450?burger',
    tags: ['vegan', 'burger', 'veggie'],
    cookingTime: 1800,
    steps: [
        {
            description: 'This is a description',
            items: [
                {
                    amount: 1,
                    unit: 'pcs',
                    item: {
                        _id: '1',
                        name: 'Bread',
                        type: 'Bread',
                        imgUrl: 'https://source.unsplash.com/random/900x450?bread',
                    }
                }
            ]
        }
    ]
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