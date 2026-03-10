export const EXPENSE_CATEGORIES = [
  { value: "groceries", label: "Groceries" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "health_insurance", label: "Health Insurance" },
  { value: "education", label: "Education" },
  { value: "utilities", label: "Utilities" },
  { value: "shopping", label: "Shopping" },
  { value: "travel", label: "Travel" },
  { value: "housing", label: "Housing" },
  { value: "home_insurance", label: "Home Insurance" },
  { value: "dining_out", label: "Dining Out" },
  { value: "fuel", label: "Fuel" },
  { value: "car_maintenance", label: "Car Maintenance" },
  { value: "car_insurance", label: "Car Insurance" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "taxes", label: "Taxes" },
  { value: "personal_care", label: "Personal Care" },
  { value: "child_care", label: "Child Care" },
  { value: "pet_care", label: "Pet Care" },
  { value: "home_maintenance", label: "Home Maintenance" },
  { value: "hobbies", label: "Hobbies" },
  { value: "electronics", label: "Electronics" },
  { value: "gifts", label: "Gifts" },
  { value: "other", label: "Other" },
];

export const INCOME_CATEGORIES = [
  { value: "salary", label: "Salary" },
  { value: "bonus", label: "Bonus" },
  { value: "freelance", label: "Freelance" },
  { value: "business", label: "Business Income" },
  { value: "investment", label: "Investment Income" },
  { value: "dividends", label: "Dividends" },
  { value: "rental_income", label: "Rental Income" },
  { value: "refund", label: "Refund" },
];

export const CATEGORY_LABELS = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES
].reduce((map, category) => {
  map[category.value] = category.label;
  return map;
}, {});