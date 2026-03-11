import { useEffect, useState } from "react";
import client from "../api/client";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);

const DashboardPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const response = await client.get("/dashboard");
      setData(response.data);
    };

    loadDashboard();
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div className="container">
      <h1>Dashboard</h1>

      {/* totals */}
      <div className="dashboard-totals">
        <div className="card">
          <h3>Total Balance</h3>
          <p>{formatMoney(data.totals.balance)}</p>
        </div>

        <div className="card">
          <h3>Total Income</h3>
          <p>{formatMoney(data.totals.income)}</p>
        </div>

        <div className="card">
          <h3>Total Expenses</h3>
          <p>{formatMoney(data.totals.expenses)}</p>
        </div>
      </div>

      {/* account balances */}
      <div className="card">
        <h2>Account Balances</h2>
        {data.balances.map((account) => (
          <div key={account.id}>
            {account.name}: {formatMoney(account.balance, account.currency)}
          </div>
        ))}
      </div>

      {/* recent transactions */}
      <div className="card">
        <h2>Recent Transactions</h2>

        {data.recentTransactions.map((tx) => (
          <div key={tx._id}>
            {tx.account?.name} • {tx.type} •{" "}
            {formatMoney(tx.amount)} •{" "}
            {new Date(tx.date).toLocaleDateString()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;