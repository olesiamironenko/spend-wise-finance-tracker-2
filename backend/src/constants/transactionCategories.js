const EXPENSE_CATEGORIES = [
  'Groceries',
  'Transportation',
  'Entertainment',
  'Health',
  'Education',
  'Utilities',
  'Shopping',
  'Travel',
  'Other',
  'Housing',
  'Dining Out',
  'Fuel',
  'Car Maintenance',
  'Car Insurance',
  'Subscriptions',
  'Taxes',
  'Personal Care',
  'Child Care',
  'Pet Care',
  'Home Maintenance',
  'Hobbies',
  'Electronics',
  'Gifts',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Bonus',
  'Freelance',
  'Business',
  'Investment',
  'Dividends',
  'Rental Income',
  'Refund',
  'Gifts',
  'Other',
];

const TRANSACTION_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_CATEGORIES,
};