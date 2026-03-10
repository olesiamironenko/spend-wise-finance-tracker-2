import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import "../styles/accounts.css";

const initialFormData = {
  name: "",
  type: "debit",
  startingBalance: 0,
  currency: "USD",
};

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const fetchAccounts = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await client.get("/accounts");
      setAccounts(response.data.accounts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "startingBalance" ? value : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const payload = {
      ...formData,
      startingBalance: Number(formData.startingBalance),
    };

    try {
      if (isEditing) {
        const response = await client.patch(`/accounts/${editingId}`, payload);
        const updatedAccount = response.data.account;

        setAccounts((prev) =>
          prev.map((account) =>
            account._id === editingId ? updatedAccount : account
          )
        );

        setSuccessMessage("Account updated successfully.");
      } else {
        const response = await client.post("/accounts", payload);
        const newAccount = response.data.account;

        setAccounts((prev) => [newAccount, ...prev]);
        setSuccessMessage("Account created successfully.");
      }

      resetForm();
    } catch (err) {
      if (err.response?.data?.errors?.length) {
        setError(err.response.data.errors[0].message);
      } else {
        setError(
          err.response?.data?.message ||
            `Failed to ${isEditing ? "update" : "create"} account.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account) => {
    setError("");
    setSuccessMessage("");
    setEditingId(account._id);
    setFormData({
      name: account.name || "",
      type: account.type || "debit",
      startingBalance: account.startingBalance ?? 0,
      currency: account.currency || "USD",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");

      await client.delete(`/accounts/${id}`);
      setAccounts((prev) => prev.filter((account) => account._id !== id));

      if (editingId === id) {
        resetForm();
      }

      setSuccessMessage("Account deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account.");
    }
  };

  return (
    <div className="accounts-page container">
      <div className="accounts-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="accounts-subtitle">
            Manage your financial accounts.
          </p>
        </div>
      </div>

      <div className="accounts-grid">
        <section className="card account-form-card">
          <h2>{isEditing ? "Edit Account" : "Create Account"}</h2>

          <form className="account-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Account Name</label>
              <input
                id="name"
                className="form-input"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Checking"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Account Type</label>
              <select
                id="type"
                className="form-input"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
                <option value="savings">Savings</option>
                <option value="investment">Investment</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startingBalance">Starting Balance</label>
              <input
                id="startingBalance"
                className="form-input"
                name="startingBalance"
                type="number"
                step="0.01"
                value={formData.startingBalance}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <input
                id="currency"
                className="form-input"
                name="currency"
                type="text"
                maxLength="3"
                value={formData.currency}
                onChange={handleChange}
                placeholder="USD"
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}

            <div className="account-form-actions">
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
                  : "Create Account"}
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

        <section className="card accounts-list-card">
          <h2>Your Accounts</h2>

          {isLoading ? (
            <p>Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p>No accounts yet. Create your first one.</p>
          ) : (
            <div className="accounts-list">
              {accounts.map((account) => (
                <article key={account._id} className="account-item">
                  <div className="account-item-main">
                    <h3>{account.name}</h3>
                    <p>
                      {account.type} • {account.currency}
                    </p>
                    <p className="account-balance">
                      Starting balance: {account.startingBalance}
                    </p>
                  </div>

                  <div className="account-item-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEdit(account)}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(account._id)}
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

export default AccountsPage;