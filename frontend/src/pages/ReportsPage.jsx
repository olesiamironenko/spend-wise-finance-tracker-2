import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import client from "../api/client";
import { CATEGORY_LABELS } from "../constants/transactionCategories";
import "../styles/reports.css";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);

const formatMonthLabel = (value) => {
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const ReportsPage = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    account: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyExpensesTrend, setMonthlyExpensesTrend] = useState([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.account) params.append("account", filters.account);

    const query = params.toString();
    return query ? `?${query}` : "";
  }, [filters]);

  const fetchReports = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);

      const [accountsRes, categoryRes, trendRes, incomeExpenseRes] =
        await Promise.all([
          client.get("/accounts"),
          client.get(`/reports/expenses-by-category${queryString}`),
          client.get(`/reports/monthly-expenses-trend${queryString}`),
          client.get(`/reports/income-vs-expenses${queryString}`),
        ]);

      setAccounts(accountsRes.data.accounts || []);
      setExpensesByCategory(categoryRes.data.report || []);
      setMonthlyExpensesTrend(trendRes.data.report || []);
      setIncomeVsExpenses(incomeExpenseRes.data.report || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      account: "",
    });
  };

  const pieData = expensesByCategory.map((item) => ({
    ...item,
    label: CATEGORY_LABELS[item.category] || item.category,
  }));

  const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#7c3aed", "#0891b2", "#ea580c"];

  return (
    <div className="container reports-page">
      <div className="reports-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="reports-subtitle">Spending trends and category insights</p>
        </div>
      </div>

      <section className="card reports-filters-card">
        <h2>Filters</h2>

        <div className="reports-filters">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              className="form-input"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              className="form-input"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="account">Account</label>
            <select
              id="account"
              className="form-input"
              name="account"
              value={filters.account}
              onChange={handleChange}
            >
              <option value="">All accounts</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="reports-filter-actions">
            <button className="secondary-button" type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="card">
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div className="card">
          <p className="error-message">{error}</p>
        </div>
      ) : (
        <div className="reports-grid">
          <section className="card report-card">
            <h2>Expenses by Category</h2>

            {pieData.length === 0 ? (
              <p>No expense data for selected filters.</p>
            ) : (
              <>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="total"
                        nameKey="label"
                        outerRadius={110}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMoney(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="report-list">
                  {pieData.map((item) => (
                    <div className="report-row" key={item.category}>
                      <span>{item.label}</span>
                      <span>{formatMoney(item.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="card report-card">
            <h2>Monthly Expenses Trend</h2>

            {monthlyExpensesTrend.length === 0 ? (
              <p>No monthly expense data for selected filters.</p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyExpensesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonthLabel}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatMoney(value)}
                      labelFormatter={formatMonthLabel}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="card report-card report-card-full">
            <h2>Income vs Expenses</h2>

            {incomeVsExpenses.length === 0 ? (
              <p>No income/expense data for selected filters.</p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={incomeVsExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonthLabel}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatMoney(value)}
                      labelFormatter={formatMonthLabel}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" />
                    <Bar dataKey="expenses" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;