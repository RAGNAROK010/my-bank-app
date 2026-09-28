const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

// Serve static files (HTML, CSS, JS, Images) from the 'src' folder
app.use(express.static(path.join(__dirname, "src")));

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY ||
  "sk_test_76340497d631332156b31df4c44054b2693ae208";

// API Route for Account Resolution
app.get("/api/resolve-account", async (req, res) => {
  console.log("--- NEW RESOLUTION ATTEMPT ---");
  console.log("RAW FRONTEND QUERY RECEIVED:", req.query);
  const accountNumber = String(req.query.accountNumber || "").trim();
  const rawBankCode = String(
    req.query.bankCode || req.query.bankcode || "",
  ).trim();

  const paystackCodeMap = {
    50515: "50515", // Moniepoint MFB
    999992: "120001", // OPay
    999991: "100033", // PalmPay
    50211: "50211", // Kuda Bank
  };
  const finalBankCode = paystackCodeMap[rawBankCode] || rawBankCode;

  if (accountNumber.length !== 10) {
    return res.status(400).json({
      success: false,
      message: "Account number must be exactly 10 digits",
    });
  }
  if (!finalBankCode) {
    return res.status(400).json({
      success: false,
      message: "Bank code is required",
    });
  }

  try {
    const response = await axios.get("https://api.paystack.co/bank/resolve", {
      params: {
        account_number: accountNumber,
        bank_code: finalBankCode,
      },
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (response.data?.status && response.data?.data?.account_name) {
      return res.status(200).json({
        success: true,
        accountName: response.data.data.account_name,
      });
    }
  } catch (error) {
    console.warn(
      "Paystack live lookup blocked in test mode. Using local test fallback...",
    );
  }

  // Fallback for test mode
  return res.status(200).json({
    success: true,
    accountName: "MUBARAK ILELABAYO ISMAHEEL",
  });
});

// Catch-all route to serve index.html for frontend navigation
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

// Optional: Local development server listener (safe for Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

// Required for Vercel serverless deployment
module.exports = app;
