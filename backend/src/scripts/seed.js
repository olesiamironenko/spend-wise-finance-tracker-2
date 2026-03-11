require("dotenv").config();

const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const connectDB = require("../config/db"); // adjust path if your connect file is elsewhere

const seed = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    console.log("Connected to database");

    const existingUser = await User.findOne({ email: "bill@spendwise.com" });

    if (existingUser) {
      await Transaction.deleteMany({ user: existingUser._id });
      await Account.deleteMany({ user: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });

      console.log("Old Bill seed data removed")
    } else {
      console.log("No existing Bill seed data found")
    }

    const user = await User.create({
      name: "Bill",
      email: "bill@spendwise.com",
      password: "secret4321",
    });

    const accounts = await Account.insertMany([
      {
        user: user._id,
        name: "Checking",
        type: "debit",
        startingBalance: 2500,
        currency: "USD",
      },
      {
        user: user._id,
        name: "Savings",
        type: "savings",
        startingBalance: 5000,
        currency: "USD",
      },
      {
        user: user._id,
        name: "Chase Credit",
        type: "credit",
        startingBalance: 0,
        currency: "USD",
      },
    ]);

    const checking = accounts[0];
    const savings = accounts[1];
    const credit = accounts[2];

    await Transaction.insertMany([
      {
        user: user._id,
        account: checking._id,
        type: "income",
        amount: 3200,
        category: "salary",
        description: "Monthly paycheck",
        date: new Date("2026-03-01"),
      },
      {
        user: user._id,
        account: checking._id,
        type: "expense",
        amount: 120,
        category: "groceries",
        description: "Trader Joe's",
        date: new Date("2026-03-03"),
      },
      {
        user: user._id,
        account: checking._id,
        type: "expense",
        amount: 60,
        category: "fuel",
        description: "Gas station",
        date: new Date("2026-03-04"),
      },
      {
        user: user._id,
        account: credit._id,
        type: "expense",
        amount: 85,
        category: "dining_out",
        description: "Dinner out",
        date: new Date("2026-03-05"),
      },
      {
        user: user._id,
        account: checking._id,
        type: "transfer",
        direction: "out",
        amount: 500,
        description: "Move money to savings",
        date: new Date("2026-03-06"),
        transferToAccount: savings._id,
        transferGroupId: "seed-transfer-1",
      },
      {
        user: user._id,
        account: savings._id,
        type: "transfer",
        direction: "in",
        amount: 500,
        description: "Move money to savings",
        date: new Date("2026-03-06"),
        transferToAccount: checking._id,
        transferGroupId: "seed-transfer-1",
      },
      {
        user: user._id,
        account: checking._id,
        type: "transfer",
        direction: "out",
        amount: 100,
        description: "Credit card payoff",
        date: new Date("2026-03-09"),
        transferToAccount: credit._id,
        transferGroupId: "seed-transfer-2",
      },
      {
        user: user._id,
        account: credit._id,
        type: "transfer",
        direction: "in",
        amount: 100,
        description: "Credit card payoff",
        date: new Date("2026-03-09"),
        transferToAccount: checking._id,
        transferGroupId: "seed-transfer-2",
      },
    ]);

    console.log("Seed data created");
    console.log("Bill login:");
    console.log("email: bill@spendwise.com");
    console.log("password: secret4321");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();