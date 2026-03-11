import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";
import "../styles/account-detail.css";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);

const AccountDetailPage = () => {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setError("");
        setIsLoading(true);

        const [accountResponse, summaryResponse] = await Promise.all([
          client.get(`/accounts/${id}`),
          client.get(`/accounts/${id}/summary`),
        ]);

        setAccount(accountResponse.data.account);
        setSummary(summaryResponse.data.summary);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load account details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container account-detail-page">
        <p>Loading account details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container account-detail-page">
        <p className="error-message">{error}</p>
        <Link to="/accounts" className="secondary-button back-link">
          Back to Accounts
        </Link>
      </div>
    );
  }

  if (!account || !summary) {
    return (
      <div className="container account-detail-page">
        <p className="error-message">Account details are unavailable.</p>
        <Link to="/accounts" className="secondary-button back-link">
          Back to Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="container account-detail-page">
      <div className="account-detail-header">
        <div>
          <h1 className="page-title">{account.name}</h1>
          <p className="account-detail-subtitle">
            {account.type} • {account.currency}
          </p>
        </div>

        <Link className="secondary-button account-back-link" to="/accounts">
          Back to Accounts
        </Link>
      </div>

      <div className="account-summary-grid">
        <div className="card summary-card">
          <h2>Current Balance</h2>
          <p className="summary-value">{formatMoney(summary.currentBalance, account.currency)}</p>
        </div>

        <div className="card summary-card">
          <h2>Starting Balance</h2>
          <p className="summary-value">{formatMoney(summary.startingBalance, account.currency)}</p>
        </div>

        <div className="card summary-card">
          <h2>Total Income</h2>
          <p className="summary-value">
            {formatMoney(summary.incomeTotal, account.currency)}
          </p>
        </div>

        <div className="card summary-card">
          <h2>Total Expenses</h2>
          <p className="summary-value">{formatMoney(summary.expenseTotal, account.currency)}</p>
        </div>

        <div className="card summary-card">
          <h2>Transfer In</h2>
          <p className="summary-value">{formatMoney(summary.transferInTotal, account.currency)}</p>
        </div>

        <div className="card summary-card">
          <h2>Transfer Out</h2>
          <p className="summary-value">{formatMoney(summary.transferOutTotal, account.currency)}</p>
        </div>
      </div>

      <section className="card account-meta-card">
        <h2>Account Details</h2>
        <p><strong>Name:</strong> {account.name}</p>
        <p><strong>Type:</strong> {account.type}</p>
        <p><strong>Currency:</strong> {account.currency}</p>
        <p><strong>Transactions:</strong> {summary.transactionCount}</p>
      </section>
    </div>
  );
};

export default AccountDetailPage;