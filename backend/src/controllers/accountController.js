const Account = require('../models/Account');

// Get /api/accounts
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ count: accounts.length, accounts });
  } catch (err) {
    return next(err);
  }
};

// Get /api/accounts/:id
const getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await Account.findOne({ _id: id, user: req.user.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    return res.status(200).json({ account });
  } catch (err) {
    return next(err);
  }
}

// POST /api/accounts
const createAccount = async (req, res, next) => {
  try {
    const { name, type, startingBalance = 0, currency = 'USD' } = req.validated?.body || req.body;

    const account = await Account.create({
      user: req.user.userId,
      name,
      type,
      startingBalance,
      currency,
    });
    return res.status(201).json({ account });
  } catch (err) {
    return next(err);
  }
};

// PATCH /api/accounts/:id
const updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedUpdates = ['name', 'type', 'startingBalance', 'currency'];
    const updates = req.validated?.body || req.body;

    // Filter updates to only include allowed fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedUpdates.includes(key))
    );

    const account = await Account.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { $set: filteredUpdates },
      { 
        returnDocument: 'after', 
        runValidators: true 
      }
    );

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    return res.status(200).json({ 
      message: 'Account updated', 
      account });
  }
  catch (err) {
    return next(err);
  }
};

// DELETE /api/accounts/:id
const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await Account.findOneAndDelete({ _id: id, user: req.user.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    return res.status(200).json({ message: 'Account deleted' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};