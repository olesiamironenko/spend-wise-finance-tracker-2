const mongoose = require('mongoose');

const { TRANSACTION_TYPES } = require('../constants/transactionTypes');
const { TRANSACTION_CATEGORIES } = require('../constants/transactionCategories');

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: TRANSACTION_TYPES,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
    },
    category: {
      type: String,
      enum: TRANSACTION_CATEGORIES,
      required: false, // category is optional, but if provided must be valid
    },
    description: {
      type: String,
      trim: true,
      minlength: [3, 'Description must be at least 3 characters'],
      maxlength: [255, 'Description must be at most 255 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    transferToAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    transferGroupId: {
      type: String,
      default: null,
      index: true,
    }
  },
  { 
    timestamps: true, 
    versionKey: false }
);

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;