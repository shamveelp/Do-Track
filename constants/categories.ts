export interface Category {
    id: string;
    name: string;
    icon: string;
    type: 'income' | 'expense';
}

export const EXPENSE_CATEGORIES: Category[] = [
    { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', type: 'expense' },
    { id: 'food', name: 'Food', icon: 'restaurant', type: 'expense' },
    { id: 'phone', name: 'Phone', icon: 'smartphone', type: 'expense' },
    { id: 'entertainment', name: 'Entertainment', icon: 'movie', type: 'expense' },
    { id: 'education', name: 'Education', icon: 'school', type: 'expense' },
    { id: 'beauty', name: 'Beauty', icon: 'favorite', type: 'expense' },
    { id: 'sports', name: 'Sports', icon: 'fitness-center', type: 'expense' },
    { id: 'social', name: 'Social', icon: 'people-alt', type: 'expense' },
    { id: 'transportation', name: 'Transportation', icon: 'directions-bus', type: 'expense' },
    { id: 'fuel', name: 'Fuel', icon: 'local-gas-station', type: 'expense' },
    { id: 'clothing', name: 'Clothing', icon: 'checkroom', type: 'expense' },
    { id: 'alcohol', name: 'Alcohol', icon: 'local-bar', type: 'expense' },
    { id: 'cigarettes', name: 'Cigarettes', icon: 'smoking-rooms', type: 'expense' },
    { id: 'electronics', name: 'Electronics', icon: 'devices', type: 'expense' },
    { id: 'travel', name: 'Travel', icon: 'flight', type: 'expense' },
    { id: 'health', name: 'Health', icon: 'medical-services', type: 'expense' },
    { id: 'pets', name: 'Pets', icon: 'pets', type: 'expense' },
    { id: 'housing', name: 'Housing', icon: 'home-filled', type: 'expense' },
    { id: 'gifts', name: 'Gifts', icon: 'card-giftcard', type: 'expense' },
    { id: 'donation', name: 'Donation', icon: 'volunteer-activism', type: 'expense' },
    { id: 'lottery', name: 'Lottery', icon: 'casino', type: 'expense' },
    { id: 'snacks', name: 'Snacks', icon: 'fastfood', type: 'expense' },
    { id: 'kids', name: 'Kids', icon: 'child-care', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
    { id: 'salary', name: 'Salary', icon: 'payments', type: 'income' },
    { id: 'investments', name: 'Investments', icon: 'trending-up', type: 'income' },
    { id: 'part_time', name: 'Part Time', icon: 'work', type: 'income' },
    { id: 'bonus', name: 'Bonus', icon: 'redeem', type: 'income' },
    { id: 'others', name: 'Others', icon: 'category', type: 'income' },
    { id: 'airdrops', name: 'Airdrops', icon: 'airplanemode-active', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryById = (id: string) => ALL_CATEGORIES.find(c => c.id === id) || ALL_CATEGORIES[0];
