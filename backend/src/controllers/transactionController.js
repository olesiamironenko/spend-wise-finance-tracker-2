const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .sort({ date: -1, createdAt: -1 }) 
      .populate('account', 'name type currency')
      .populate('transferToAccount', 'name type currency');

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
    .populate('account', 'name type currency')
    .populate('transferToAccount', 'name type currency');

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

    if (type === 'transfer') {
      const destinationAccount = await Account.findOne({ 
        _id: transferToAccount, 
        user: req.user.userId 
      });

      if (!destinationAccount) {
        return res.status(404).json({ message: 'Destination account not found' });
      }

      if (String(account) === String(transferToAccount)) {
        return res.status(400).json({ message: 'Source and destination accounts cannot be the same' });
      }

      const transferGroupId = crypto.randomUUID();

      const createdTransactions = await Transaction.insertMany([
        {
          user: req.user.userId,
          account,
          type: 'transfer',
          direction: 'out',
          amount,
          description,
          date,
          transferToAccount,
          transferGroupId
        },
        {
          user: req.user.userId,
          account: transferToAccount,
          type: 'transfer',
          direction: 'in',
          amount,
          description,
          date,
          transferToAccount: account,
          transferGroupId
        }
      ]);

      const transactionIds = createdTransactions.map((transaction) => transaction._id);

      const transactions = await Transaction.find({
        _id: { $in: transactionIds }
      })
        .sort({ direction: 1 })
        .populate('account', 'name type currency')
        .populate('transferToAccount', 'name type currency');

      return res.status(201).json({
        message: 'Transfer transactions created',
        transferGroupId,
        transactions
      });
    }

    const transaction = await Transaction.create({
      user: req.user.userId,
      account,
      type,
      amount,
      category,
      description,
      date
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

    const existingTransaction = await Transaction.findOne({
      _id: id, 
      user: req.user.userId 
    });
    
    if (!existingTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    } 

    if (existingTransaction.type === 'transfer') {
      return res.status(400).json({ message: 'Transfer transactions cannot be updated. Please delete and recreate the transfer if you need to make changes.' });
    }

    const allowedUpdates = [
      'account', 
      'type', 
      'amount', 
      'category', 
      'description', 
      'date'
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

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { $set: filteredUpdates },
      { returnDocument: 'after', runValidators: true }
    );

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
    
    const transaction = await Transaction.findOne({
      _id: id, 
      user: req.user.userId 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.type === 'transfer' && transaction.transferGroupId) {
      await Transaction.deleteMany({
        user: req.user.userId,
        transferGroupId: transaction.transferGroupId
      });

      return res.status(200).json({ message: 'Transfer transactions deleted' });
    }

    await Transaction.deleteOne({ 
      _id: id, 
      user: req.user.userId 
    });

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