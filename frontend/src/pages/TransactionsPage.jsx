import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import "../styles/transactions.css";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_LABELS
} from "../constants/transactionCategories";

const initialFormData = {
  account: "",
  type: "expense",
  amount: "",
  category: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  transferToAccount: "",
};

const formatMoney = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const isTransfer = formData.type === "transfer";

  const fetchData = async () => {
    try {
      setError("");
      setIsLoading(true);

      const [transactionsRes, accountsRes] = await Promise.all([
        client.get("/transactions"),
        client.get("/accounts"),
      ]);

      setTransactions(transactionsRes.data.transactions || []);
      setAccounts(accountsRes.data.accounts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      account: accounts[0]?._id || "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    if (accounts.length && !formData.account) {
      setFormData((prev) => ({
        ...prev,
        account: accounts[0]._id,
      }));
    }
  }, [accounts, formData.account]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && value !== "transfer" ? { transferToAccount: "" } : {}),
      ...(name === "type" && value === "transfer" ? { category: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const payload = {
      ...formData,
      amount: Number(formData.amount),
    };

    if (!isTransfer) {
      delete payload.transferToAccount;
    }

    try {
      if (isEditing) {
        const response = await client.patch(`/transactions/${editingId}`, payload);
        const updatedTransaction = response.data.transaction;

        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction._id === editingId ? updatedTransaction : transaction
          )
        );

        setSuccessMessage("Transaction updated successfully.");
      } else {
        const response = await client.post("/transactions", payload);

        if (response.data.transaction) {
          setTransactions((prev) => [response.data.transaction, ...prev]);
        } else if (response.data.transactions) {
          setTransactions((prev) => [...response.data.transactions, ...prev]);
        }

        setSuccessMessage(
          isTransfer ? "Transfer created successfully." : "Transaction created successfully."
        );
      }

      resetForm();
    } catch (err) {
      if (err.response?.data?.errors?.length) {
        setError(err.response.data.errors[0].message);
      } else {
        setError(
          err.response?.data?.message ||
            `Failed to ${isEditing ? "update" : "create"} transaction.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    if (transaction.type === "transfer") {
      setError("Transfers cannot be edited. Please delete and recreate the transfer.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setEditingId(transaction._id);

    setFormData({
      account: transaction.account?._id || transaction.account || "",
      type: transaction.type || "expense",
      amount: transaction.amount ?? "",
      category: transaction.category || "",
      description: transaction.description || "",
      date: transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      transferToAccount: "",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");

      await client.delete(`/transactions/${id}`);
      await fetchData();

      if (editingId === id) {
        resetForm();
      }

      setSuccessMessage("Transaction deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete transaction.");
    }
  };

  return (
    <div className="transactions-page container">
      <div className="transactions-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="transactions-subtitle">
            Track expenses, income, and transfers.
          </p>
        </div>
      </div>

      <div className="transactions-grid">
        <section className="card transaction-form-card">
          <h2>{isEditing ? "Edit Transaction" : "Create Transaction"}</h2>

          <form className="transaction-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="account">Account</label>
              <select
                id="account"
                className="form-input"
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                className="form-input"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            {isTransfer && (
              <div className="form-group">
                <label htmlFor="transferToAccount">Transfer To</label>
                <select
                  id="transferToAccount"
                  className="form-input"
                  name="transferToAccount"
                  value={formData.transferToAccount}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select destination account</option>
                  {accounts
                    .filter((account) => account._id !== formData.account)
                    .map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name} ({account.type})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                className="form-input"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {!isTransfer && (
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-input"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>

                  {(formData.type === "expense"
                    ? EXPENSE_CATEGORIES
                    : INCOME_CATEGORIES
                  ).map((category) => (
                    <option key={category.value} value={
                        category.value
                      }>
                      {
                        category.label
                      }
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                className="form-input"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                className="form-input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="transaction-form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                  ? "Save Changes"
                  : "Create Transaction"}
              </button>

              {isEditing && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card transactions-list-card">
          <h2>Your Transactions</h2>

          {isLoading ? (
            <p>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <article key={transaction._id} className="transaction-item">
                  <div className="transaction-item-main">
                    <h3>
                      {transaction.type === "transfer"
                        ? `Transfer ${transaction.direction}`
                        : CATEGORY_LABELS[transaction.category]
                      }
                    </h3>

                    <p>
                      {transaction.type === "transfer" ? (
                        transaction.direction === "out"
                          ? `From: ${transaction.account?.name} → To: ${transaction.transferToAccount?.name}`
                          : `To: ${transaction.account?.name} ← From: ${transaction.transferToAccount?.name}`
                      ) : (
                        `Account: ${transaction.account?.name}`
                      )}
                      {" • "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>

                    {transaction.description && <p>{transaction.description}</p>}

                    <p className="transaction-amount">
                      {formatMoney(transaction.amount, transaction.account?.currency)}
                    </p>
                  </div>

                  <div className="transaction-item-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEdit(transaction)}
                      disabled={transaction.type === "transfer"}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(transaction._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TransactionsPage;