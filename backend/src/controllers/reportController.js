const Transaction = require("../models/Transaction");

const buildTransactionFilter = (userId, query = {}, type) => {
  const filter = {
    user: userId,
  };

  if (type) {
    filter.type = type;
  }

  if (query.account) {
    filter.account = query.account;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};

    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      filter.date.$lte = new Date(query.endDate);
    }
  }

  return filter;
};

const getTransactionsForReport = async (userId, query, type, fields) => {
  const filter = buildTransactionFilter(userId, query, type);
  return Transaction.find(filter).select(fields).lean();
};

const groupExpensesByCategory = (transactions) => {
  const totals = {};

  for (const transaction of transactions) {
    if (!totals[transaction.category]) {
      totals[transaction.category] = 0;
    }

    totals[transaction.category] += transaction.amount;
  }

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total,
    }))
    .sort((a, b) => b.total - a.total);
};

const groupMonthlyExpensesTrend = (transactions) => {
  const monthlyTotals = {};

  for (const transaction of transactions) {
    const month = transaction.date.toISOString().slice(0, 7);

    if (!monthlyTotals[month]) {
      monthlyTotals[month] = 0;
    }

    monthlyTotals[month] += transaction.amount;
  }

  return Object.entries(monthlyTotals)
    .map(([month, total]) => ({
      month,
      total,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const groupIncomeVsExpenses = (transactions) => {
  const monthlyTotals = {};

  for (const transaction of transactions) {
    const month = transaction.date.toISOString().slice(0, 7);

    if (!monthlyTotals[month]) {
      monthlyTotals[month] = {
        income: 0,
        expenses: 0,
      };
    }

    if (transaction.type === "income") {
      monthlyTotals[month].income += transaction.amount;
    } else if (transaction.type === "expense") {
      monthlyTotals[month].expenses += transaction.amount;
    }
  }

  return Object.entries(monthlyTotals)
    .map(([month, totals]) => ({
      month,
      income: totals.income,
      expenses: totals.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const getExpensesByCategory = async (req, res, next) => {
  try {
    const transactions = await getTransactionsForReport(
      req.user.userId,
      req.query,
      "expense",
      "category amount"
    );

    const report = groupExpensesByCategory(transactions);

    return res.status(200).json({ report });
  } catch (err) {
    return next(err);
  }
};

const getMonthlyExpensesTrend = async (req, res, next) => {
  try {
    const transactions = await getTransactionsForReport(
      req.user.userId,
      req.query,
      "expense",
      "amount date"
    );

    const report = groupMonthlyExpensesTrend(transactions);

    return res.status(200).json({ report });
  } catch (err) {
    return next(err);
  }
};

const getIncomeVsExpenses = async (req, res, next) => {
  try {
    const filter = buildTransactionFilter(req.user.userId, req.query);
    filter.type = { $in: ["income", "expense"] };

    const transactions = await Transaction.find(filter)
      .select("type amount date")
      .lean();

    const report = groupIncomeVsExpenses(transactions);

    return res.status(200).json({ report });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getExpensesByCategory,
  getMonthlyExpensesTrend,
  getIncomeVsExpenses,
};