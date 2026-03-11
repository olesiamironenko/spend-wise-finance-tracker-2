const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getExpensesByCategory,
  getMonthlyExpensesTrend,
  getIncomeVsExpenses,
} = require("../controllers/reportController");

router.use(authMiddleware);

router.get("/expenses-by-category", getExpensesByCategory);
router.get("/monthly-expenses-trend", getMonthlyExpensesTrend);
router.get("/income-vs-expenses", getIncomeVsExpenses);

module.exports = router;