const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { tr } = require('zod/v4/locales');

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .sort({ date: -1 })
      .populate('account', 'name type')
      .populate('transferToAccount', 'name type');

    return res.status(200).json({
     count: transactions.length, 
     transactions 
    });
  } catch (err) {
    return next(err);
  }
}

const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id, 
      user: req.user.userId 
    })
    .populate('account', 'name type')
    .populate('transferToAccount', 'name type');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ transaction});
  } catch (err) {
    return next(err);
  }
}

const createTransaction = async (req, res, next) => {
  try {
    const { 
      account,
      type,
      amount,
      category,
      description,
      date,
      transferToAccount
    } = req.validated?.body || req.body;

    const sourceAccount = await Account.findOne({ 
      _id: account, 
      user: req.user.userId
    });
    
    if (!sourceAccount) {
      return res.status(404).json({ message: 'Source account not found' });
    }

    if (transferToAccount) {
      const destinationAccount = await Account.findOne({ 
        _id: transferToAccount, 
        user: req.user.userId 
      });

      if (!destinationAccount) {
        return res.status(404).json({ message: 'Destination account not found' });
      }
    }

    const transaction = await Transaction.create({
      user: req.user.userId,
      account,
      type,
      amount,
      category,
      description,
      date,
      transferToAccount
    });

    return res.status(201).json({ 
      message: 'Transaction created',
      transaction 
    });
  } catch (err) {
    return next(err);
  }
}

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.validated?.body || req.body;

    const allowedUpdates = [
      'account', 
      'type', 
      'amount', 
      'category', 
      'description', 
      'date', 
      'transferToAccount'
    ];

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedUpdates.includes(key))
    );

    if (filteredUpdates.account) {
      const sourceAccount = await Account.findOne({ 
        _id: filteredUpdates.account, 
        user: req.user.userId 
      });

      if (!sourceAccount) {
        return res.status(404).json({ message: 'Source account not found' });
      }
    }

    if (filteredUpdates.transferToAccount) {
      const destinationAccount = await Account.findOne({ 
        _id: filteredUpdates.transferToAccount, 
        user: req.user.userId 
      });

      if (!destinationAccount) {
        return res.status(404).json({ message: 'Destination account not found' });
      }
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { $set: filteredUpdates },
      { returnDocument: 'after', runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ 
      message: 'Transaction updated',
      transaction 
    });
  } catch (err) {
    return next(err);
  }
}

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findOneAndDelete({
      _id: id, 
      user: req.user.userId 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ message: 'Transaction deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
}