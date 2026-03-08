const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const {
  createTransactionValidator,
  updateTransactionValidator,
  transactionIdParamValidator,
} = require('../validators/transactionValidators');

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', validate(createTransactionValidator), createTransaction);

router.get('/:id', validate(transactionIdParamValidator), getTransactionById);
router.patch('/:id', validate(updateTransactionValidator), updateTransaction);
router.delete('/:id', validate(transactionIdParamValidator), deleteTransaction);

module.exports = router;