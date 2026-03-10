const calculateAccountSummary = (account, transactions) => {
  let incomeTotal = 0
  let expenseTotal = 0
  let transferInTotal = 0
  let transferOutTotal = 0

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      incomeTotal += transaction.amount
    } else if (transaction.type === 'expense') {
      expenseTotal += transaction.amount
    } else if (transaction.type === 'transfer') {
      if (transaction.direction === 'in') {
        transferInTotal += transaction.amount
      } else if (transaction.direction === 'out') {
        transferOutTotal += transaction.amount
      }
    }
  }

  const currentBalance =
    account.startingBalance +
    incomeTotal -
    expenseTotal +
    transferInTotal -
    transferOutTotal

  return {
    startingBalance: account.startingBalance,
    incomeTotal,
    expenseTotal,
    transferInTotal,
    transferOutTotal,
    currentBalance,
    transactionCount: transactions.length
  }
}

module.exports = {
  calculateAccountSummary
}