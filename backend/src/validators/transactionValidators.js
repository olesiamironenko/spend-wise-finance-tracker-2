const { z } = require('zod');
const { TRANSACTION_TYPES } = require('../constants/transactionTypes');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../constants/transactionCategories');

const objectIdField = z
  .string({ required_error: 'ID is required' })
  .refine((val) => /^[a-fA-F0-9]{24}$/.test(val), { message: 'Invalid ID format' 
});

const amountField = z.coerce.number({ 
  error: 'Amount must be a number' 
}).refine((n) => n >= 0, { 
  message: 'Amount must be a positive number' 
});

const typeField = z.enum(TRANSACTION_TYPES, {
  required_error: 'Transaction type is required',
});

const categoryField = z.string().optional()

const descriptionField = z
  .string()
  .trim()
  .min(3, 'Description must be at least 3 characters')
  .max(255, 'Description must be at most 255 characters')
  .optional();

const dateField = z.coerce.date({
  required_error: 'Date is required',
  invalid_type_error: 'Invalid date format',
});

const createTransactionValidator = z.object({
  body: z
    .object({
      account: objectIdField,
      type: typeField,
      amount: amountField,
      category: categoryField,
      description: descriptionField,
      date: dateField.default(new Date()),
      transferToAccount: objectIdField.optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === 'transfer' && data.category) {
        if (!data.transferToAccount) {
          ctx.addIssue({
            code: 'custom',
            path: ['transferToAccount'],
            message: 'Destination account is required for transfer transactions',
          });
        }

        if (data.category) {
          ctx.addIssue({
            code: 'custom',
            path: ['category'],
            message: 'Transfer transactions cannot have a category',
          });
        }

        if (data.transferToAccount && data.account === data.transferToAccount) {
          ctx.addIssue({
            code: 'custom',
            path: ['transferToAccount'],
            message: 'Source and destination accounts must be different for transfer transactions',
          });
        }
      }

      if (data.type === 'expense') {
        if (!data.category) {
          ctx.addIssue({
            code: 'custom',
            path: ['category'],
            message: 'Category is required for expense transactions',
          });
        } else if (!EXPENSE_CATEGORIES.includes(data.category)) {
          ctx.addIssue({
            code: 'custom',
            path: ['category'],
            message: 'Invalid expense category',
          });
        }
      }

      if (data.type === 'income') {
        if (!data.category) {
          ctx.addIssue({
            code: 'custom',
            path: ['category'],
            message: 'Category is required for income transactions',
          });
        } else if (!INCOME_CATEGORIES.includes(data.category)) {
          ctx.addIssue({
            code: 'custom',
            path: ['category'],
            message: 'Invalid income category',
          });
        }
      }

      if (data.type === 'transfer' && data.category) {
        ctx.addIssue({
          code: 'custom',
          path: ['category'],
          message: 'Transfer transactions cannot have category',
        });
      }
    }),
});

const updateTransactionValidator = z.object({
  params: z.object({
    id: objectIdField,
  }),
  body: z
    .object({
      account: objectIdField.optional(),
      type: typeField.optional(),
      amount: amountField.optional(),
      category: categoryField.optional(),
      description: descriptionField.optional(),
      date: dateField.optional(),
      transferToAccount: objectIdField.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required to update',
    })
});

const transactionIdParamValidator = z.object({
  params: z.object({
    id: objectIdField,
  }),
});

module.exports = {
  createTransactionValidator,
  updateTransactionValidator,
  transactionIdParamValidator,
};