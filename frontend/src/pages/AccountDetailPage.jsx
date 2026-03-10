import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";
import "../styles/account-detail.css";

const AccountDetailPage = () => {
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccountData = async () => {
    try {
      setError("");
      setIsLoading(true);

      const [accountRes, summaryRes] = await Promise.all([
        client.get(`/accounts/${id}`),
        client.get(`/accounts/${id}/summary`),
      ]);

      setAccount(accountRes.data.account);
      setSummary(summaryRes.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load account details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
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
      </div>
    );
  }

  if (!account || !summary) {
    return null;
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
          <p className="summary-value">{summary.currentBalance}</p>
        </div>

        <div className="card summary-card">
          <h2>Starting Balance</h2>
          <p className="summary-value">{summary.startingBalance}</p>
        </div>

        <div className="card summary-card">
          <h2>Total Income</h2>
          <p className="summary-value">{summary.incomeTotal}</p>
        </div>

        <div className="card summary-card">
          <h2>Total Expenses</h2>
          <p className="summary-value">{summary.expenseTotal}</p>
        </div>

        <div className="card summary-card">
          <h2>Transfer In</h2>
          <p className="summary-value">{summary.transferInTotal}</p>
        </div>

        <div className="card summary-card">
          <h2>Transfer Out</h2>
          <p className="summary-value">{summary.transferOutTotal}</p>
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