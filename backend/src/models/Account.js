const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      minlenght: [3, 'Account name must be at least 3 characters'],
      maxlength: [50, 'Account name must be less than 50 characters'],
    },
    type: {
      type: String,
      required: [true, 'Account type is required'],
      enum: {
        values: ['debit', 'credit', 'savings', 'investment'],
        message: '{VALUE} is not a valid account type. Valid types are: debit, credit, savings, investment',
      },
    },
    startingBalance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency code must be 3 characters'],
      maxlength: [3, 'Currency code must be 3 characters'],
    },
  },
  { timestamps: true }
);

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;