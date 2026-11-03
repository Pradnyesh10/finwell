# System Instructions: AI-Powered Smart Financial Wellness Dashboard  
## Project Type: Final Year / BTP Minor Project  
## Goal: Build a modern AI-powered personal finance dashboard web application that helps users manage income, expenses, loans, EMI burden, investments, risk level, and financial stress through machine learning predictions, alerts, and intelligent recommendations.

---

# Project Overview

Build a premium, futuristic, highly interactive **Financial Wellness Dashboard** where users can:

- Track salary, expenses, savings, investments
- Detect EMI-to-salary ratio automatically
- Detect financial stress before it happens
- Get AI alerts for risky spending behavior
- Receive loan due reminders
- See recommended investment allocations
- Predict top ROI assets using ML
- Build emergency funds smartly
- Get stress relief spending-cut suggestions
- Manage complete personal finances in one platform

Design should look like:

- Apple + Bloomberg + Zerodha + Notion + Tesla Dashboard
- Dark / Light mode
- Smooth animations
- Premium charts
- Responsive mobile + desktop

---

# Core Navigation Tabs

1. Dashboard
2. Transactions
3. EMI & Loans
4. Investments
5. Emergency Fund
6. Risk Analysis
7. Stress Alerts
8. Reports
9. Profile
10. Settings

---

# Header Elements

- Logo
- Search Bar
- AI Assistant Chat Icon
- Notifications Bell
- Theme Toggle
- User Profile Avatar
- Real Time Financial Score Badge

---

# DASHBOARD PAGE

## Hero Section

Display:

- Welcome user name
- Current Net Worth
- Monthly Salary
- Total Investments
- Total EMI Due
- Financial Health Score (0-100)
- AI Mood Indicator (Stable / Warning / Critical)

---

# Key Metric Cards (6 Cards)

## Card 1: Monthly Income

- Total salary credited
- Side income
- Growth from last month %

## Card 2: Monthly Expense

- Total expense
- Fixed expense
- Variable expense
- Change %

## Card 3: EMI Burden

- Total EMI amount
- Salary ratio %
- Safe / Moderate / Dangerous tag

Formula:

EMI Ratio = (Total EMI / Monthly Salary) × 100

Color Logic:

- < 25% = Green
- 25% to 45% = Yellow
- > 45% = Red

## Card 4: Investment Growth

- Current invested amount
- Profit/Loss
- ROI %

## Card 5: Emergency Fund

- Available liquid reserve
- How many months expenses covered

## Card 6: Stress Risk Score

- Based on ML model
- Low / Medium / High

---

# Charts Section

## Income vs Expense Trend

Line chart:

- Week
- Month
- Year

## Expense Category Pie Chart

Categories:

- Food
- Rent
- Travel
- Shopping
- Subscriptions
- Healthcare
- Loan EMI
- Others

## EMI Forecast Chart

Next 12 month EMI obligations

## Net Worth Growth Graph

Past performance + predicted next 6 months

---

# SMART EMI & LOAN PAGE

## Loan Cards

For each loan show:

- Loan Name
- Remaining Balance
- EMI amount
- Due Date
- Interest %
- Tenure Left
- Prepayment Suggestion

## Alerts

- EMI due in 3 days
- Over-borrowing detected
- Too many active loans warning

## AI Suggestions

- Close high interest loan first
- Refinance suggestion
- Reduce EMI burden plan

---

# INVESTMENT PAGE

Split into 2 Smart Sections:

---

# Section A: Emergency Fund Smart Liquidity Allocation

Goal:
Protect user during emergency while generating returns.

Money auto allocated into:

- Liquid Mutual Funds
- Sweep FD
- Treasury Bills
- Ultra Short Debt Funds
- High yield savings

Display:

- Withdraw anytime badge
- Low risk score
- Expected return %

Show:

Emergency Coverage = months expenses covered

If less than 6 months:
Show urgent warning

---

# Section B: Wealth Creation Engine

Allow investment in:

- Stocks
- ETFs
- Gold
- Government Bonds
- Crypto
- Index Funds
- SIP Mutual Funds
- REITs

Each asset card shows:

- Risk Level
- Expected ROI
- Recommended Allocation
- Confidence %

---

# ML ROI Prediction ENGINE

Train model using:

- 1 Week data
- 1 Month data
- 1 Year data
- 5 Year data

Predict:

- Highest probable ROI asset next cycle
- Best risk-adjusted asset
- Momentum winners
- Safe compounding assets

Display Leaderboard:

1. Top Predicted ROI
2. Runner Up
3. Stable Long Term Pick

---

# TOP STOCK PICKER MODEL

Show:

Top performing stocks predicted by AI

Metrics:

- CAGR
- Volatility
- Momentum
- News Sentiment
- Sharpe Ratio
- Risk %

Time filters:

- Weekly
- Monthly
- Yearly
- 5 Year

---

# RISK ANALYSIS PAGE

## Detect Financial Risks

Model checks:

- Spending faster than salary
- EMI overload
- Savings dropping
- Emergency fund low
- Credit utilization high
- Investment concentration risk
- Irregular cashflow

Display Risk Meter:

- Green = Healthy
- Yellow = Attention
- Red = Danger

---

# STRESS ALERT PAGE (UNIQUE FEATURE)

AI predicts mental + financial stress from money behavior.

Inputs:

- Rising EMI ratio
- Low balance before salary date
- Increasing unnecessary expenses
- Missed payments
- No emergency fund
- Negative monthly cashflow

Output:

Stress Probability %

Levels:

- Calm
- Pressure Building
- High Stress
- Critical

---

# POTENTIAL CUTS RECOMMENDATION ENGINE

When stress rises show:

Possible relief cuts:

- Reduce food delivery by ₹X
- Pause subscriptions ₹X
- Lower shopping by ₹X
- Delay travel ₹X
- Refinance EMI save ₹X
- Shift entertainment budget ₹X

Display:

"You can free ₹14,500/month and reduce stress score by 32%"

---

# TRANSACTIONS PAGE

Features:

- Add income
- Add expense
- Categorize
- Search
- Filter
- Export CSV
- Smart tags
- Auto recurring bills detection

Columns:

- Name
- Type
- Category
- Date
- Amount
- Payment Mode
- Status

---

# REPORTS PAGE

Generate downloadable reports:

- Monthly Financial Summary
- EMI Burden Report
- Stress Trend Report
- Investment ROI Report
- Tax Friendly Summary
- Savings Growth Report

Download:

- PDF
- Excel
- CSV

---

# AI CHAT ASSISTANT

Floating assistant can answer:

- Can I afford a car loan?
- How to reduce EMI burden?
- Where should I invest ₹50,000?
- Why is my stress score high?
- How to save tax legally?
- How much emergency fund needed?

---

# Machine Learning Models Suggested

## 1. Stress Prediction

Use:

- Logistic Regression
- Random Forest

## 2. ROI Prediction

Use:

- XGBoost
- LSTM
- Prophet

## 3. Expense Forecast

Use:

- ARIMA / Prophet

## 4. Risk Classification

Use:

- Gradient Boosting

---

# Tech Stack Recommendation

Frontend:

- React.js / Next.js
- Tailwind CSS
- Framer Motion
- Chart.js / Recharts

Backend:

- Node.js / Express
or
- Python Flask / FastAPI

Database:

- PostgreSQL / MongoDB

ML:

- Python
- Scikit-learn
- TensorFlow

Deployment:

- Vercel
- Render
- Railway

---

# UI Design Rules

- Glassmorphism cards
- Rounded corners
- Neon graphs
- Smooth transitions
- Premium finance colors
- Dark navy background
- Green profit indicators
- Red warning indicators

---

# Bonus Features (For Best Grade)

- Voice AI Assistant
- OCR Salary Slip Upload
- Bank SMS Auto Parsing
- Credit Score Estimator
- Tax Saving Suggestions
- WhatsApp EMI Reminder
- Goal Based Investing
- Family Finance Dashboard

---

# Final Teacher Impression Line

This project combines:
Finance + AI + Machine Learning + UX Design + Real World Utility + Predictive Intelligence

Perfect BTP project because it solves real middle-class financial stress.

---

# Build Priority

1. Dashboard UI
2. EMI Ratio Logic
3. Stress Prediction
4. Investment Predictor
5. Alerts System
6. Final Polish

---

# Prompt to Antigravity Final Line

Build this as a premium production-grade web application with stunning UI, complete frontend + backend architecture, realistic dummy data, animations, responsive layout, advanced charts, AI modules placeholders, and enterprise level code quality.
