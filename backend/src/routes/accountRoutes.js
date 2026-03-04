const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const { 
  createAccountValidator, 
  updateAccountValidator, 
  accountIdParamValidator
} = require('../validators/accountValidators');

const { 
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
} = require('../controllers/accountController');

// Protect everything after this middleware
router.use(authMiddleware);

// /api/accounts
router.get('/', getAccounts);
router.post('/', validate(createAccountValidator),createAccount);

// GET /api/accounts/:id
router.get('/:id', validate(accountIdParamValidator), getAccountById);
router.patch('/:id', validate(updateAccountValidator), updateAccount);
router.delete('/:id', validate(accountIdParamValidator),deleteAccount); 

module.exports = router;