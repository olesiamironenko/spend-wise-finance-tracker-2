const { z } = require('zod');

const ACCOUNT_TYPES = ['debit', 'credit', 'savings', 'investment'];

const objectIdField = z
  .string({ required_error: 'ID is required' })
  .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), 'Invalid id format');

const nameField = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(3, 'Name must be at least 3 characters')
  .max(50, 'Name must be less than 50 characters');

const typeField = z.enum(ACCOUNT_TYPES, {
  required_error: 'Account type is required'
});

const startingBalanceField = z.coerce.number({ 
  error: 'Starting balance must be a number'
})
  
const currencyField = z
  .string()
  .trim()
  .toUpperCase()
  .length(3, 'Currency code must be exactly 3 characters');

const createAccountValidator = z.object({
  body: z.object({
    name: nameField,
    type: typeField,
    startingBalance: startingBalanceField.default(0),
    currency: currencyField,
  }),
});

const updateAccountValidator = z.object({
  params: z.object({
    accountId: objectIdField,
  }),
  body: z.object({
    name: nameField.optional(),
    type: typeField.optional(),
    startingBalance: startingBalanceField.optional(),
    currency: currencyField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  }),
});

const IDParamValidator = z.object({
  params: z.object({
    accountId: objectIdField,
  }),
});

module.exports = {
  createAccountValidator,
  updateAccountValidator,
  IDParamValidator,
};