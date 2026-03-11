const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { calculateAccountSummary } = require("../utils/accountSummary");

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const accounts = await Account.find({ user: userId });

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalBalance = 0;

    const accountBalances = [];

    for (const account of accounts) {
      const transactions = await Transaction.find({
        user: userId,
        account: account._id,
      }).select("type amount direction");

      const summary = calculateAccountSummary(account, transactions);

      totalIncome += summary.incomeTotal;
      totalExpenses += summary.expenseTotal;
      totalBalance += summary.currentBalance;

      accountBalances.push({
        id: account._id,
        name: account.name,
        type: account.type,
        currency: account.currency,
        balance: summary.currentBalance,
      });
    }

    const recentTransactions = await Transaction.find({
      user: userId,
    })
      .sort({ date: -1 })
      .limit(5)
      .populate("account", "name");

    return res.status(200).json({
      balances: accountBalances,
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalBalance,
      },
      recentTransactions,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getDashboard,
};