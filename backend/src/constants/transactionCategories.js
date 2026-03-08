const EXPENSE_CATEGORIES = [
  'groceries',
  'transportation',
  'entertainment',
  'health',
  'health_insurance',
  'education',
  'utilities',
  'shopping',
  'travel',
  'other',
  'housing',
  'home_insurance',
  'dining_out',
  'fuel',
  'car_maintenance',
  'car_insurance',
  'subscriptions',
  'taxes',
  'personal_care',
  'child_care',
  'pet_care',
  'home_maintenance',
  'hobbies',
  'electronics',
  'gifts',
  'other',
];

const INCOME_CATEGORIES = [
  'salary',
  'bonus',
  'freelance',
  'business',
  'investment',
  'dividends',
  'rental_income',
  'refund',
  'gifts',
  'other',
];

const TRANSACTION_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_CATEGORIES,
};