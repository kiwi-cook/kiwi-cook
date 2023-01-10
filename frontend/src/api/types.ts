// define data types for the API

// types for recipe

type Item = {
    _id: string;
    name: string;
    type: string;
    imgUrl: string;
}

type StepItem = {
    amount: number;
    unit: string;
    itemID: string;
}

type Step = {
    items: StepItem[];
    description: string;
}

type Recipe = {
    _id: string;
    name: string;
    author: string;
    description: string;
    imgUrl: string;
    tags: string[];
    cookingTime: number;
    steps: Step[];
};

// types for discounts

type Discount = {
    _id: string;
    title: string;
    price: string;
    imageUrl: string;
    validUntil: number;
    internalMarketId: string;
    marketName: string;
    marketLocation: string;
}

type Market = {
    _id: string;
    distributor: string;
    distributorSpecificId: string;
    name: string;
    city: string;
    location: string;
}