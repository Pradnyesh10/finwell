/**
 * FINWELL AI - ML PREDICTION ENGINE (SIMULATED)
 * 
 * This module simulates the logic of advanced ML models like Random Forest, 
 * XGBoost, and Prophet to provide predictive financial insights.
 */

export interface FinancialSnapshot {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalEMI: number;
  savingsRate: number;
  liquidityMonths: number;
}

export type StressLevel = 'Calm' | 'Pressure Building' | 'High Stress' | 'Critical';
export type RiskLevel = 'Healthy' | 'Attention' | 'Danger';

// --- 1. STRESS PREDICTION MODEL (Simulated Random Forest) ---
export function predictStress(data: FinancialSnapshot) {
  const emiRatio = data.totalEMI / data.monthlyIncome;
  const savingsRatio = (data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome;
  
  // Weights for our "Random Forest" simulation
  let score = (emiRatio * 0.6) + ((1 - savingsRatio) * 0.3) + ((1 / Math.max(data.liquidityMonths, 1)) * 0.1);
  
  // Normalize to 0-100
  const probability = Math.min(Math.round(score * 100), 99);
  
  let level: StressLevel = 'Calm';
  if (probability > 75) level = 'Critical';
  else if (probability > 50) level = 'High Stress';
  else if (probability > 25) level = 'Pressure Building';

  return {
    probability,
    level,
    model: 'Random Forest Classifier',
    features: ['EMI-to-Salary Ratio', 'Savings Velocity', 'Liquidity Buffer'],
    confidence: 0.89
  };
}

// --- 2. ROI PREDICTION ENGINE (Simulated XGBoost / Prophet) ---
export interface AssetROI {
  asset: string;
  expectedROI: number;
  confidence: number;
  risk: 'Low' | 'Moderate' | 'High' | 'Very High';
  algorithm: string;
}

export function predictROI(assets: string[]): AssetROI[] {
  // Simulating market momentum and news sentiment
  return assets.map(asset => {
    let baseROI = 8 + Math.random() * 15;
    let confidence = 0.75 + Math.random() * 0.2;
    
    if (asset.includes('IT') || asset.includes('Tech')) baseROI += 5;
    if (asset.includes('Gold')) { baseROI = 7; confidence = 0.95; }
    if (asset.includes('Crypto')) { baseROI = 35 + Math.random() * 50; confidence = 0.45; }

    return {
      asset,
      expectedROI: parseFloat(baseROI.toFixed(1)),
      confidence: Math.round(confidence * 100),
      risk: baseROI > 25 ? 'Very High' : baseROI > 15 ? 'High' : baseROI > 10 ? 'Moderate' : 'Low',
      algorithm: 'XGBoost Regressor'
    };
  });
}

// --- 3. EXPENSE FORECAST ENGINE (Simulated ARIMA / Prophet) ---
export function forecastExpenses(history: { month: string; amount: number }[]) {
  if (history.length === 0) return { prediction: 0, trend: 'stable' };
  
  const lastAmount = history[history.length - 1].amount;
  const avgGrowth = 0.03; // Simulated 3% monthly inflation/growth
  
  const prediction = Math.round(lastAmount * (1 + avgGrowth));
  
  return {
    prediction,
    trend: 'increasing',
    algorithm: 'Prophet Time-Series',
    confidence: 0.82,
    lowerBound: Math.round(prediction * 0.95),
    upperBound: Math.round(prediction * 1.05)
  };
}

// --- 4. RISK CLASSIFICATION (Simulated Gradient Boosting) ---
export function classifyRisk(data: FinancialSnapshot) {
  const emiRatio = data.totalEMI / data.monthlyIncome;
  const burnRate = data.monthlyExpenses / data.monthlyIncome;
  
  let riskScore = 0;
  if (emiRatio > 0.45) riskScore += 50;
  if (burnRate > 0.8) riskScore += 30;
  if (data.liquidityMonths < 3) riskScore += 20;

  let level: RiskLevel = 'Healthy';
  if (riskScore >= 70) level = 'Danger';
  else if (riskScore >= 40) level = 'Attention';

  return {
    score: riskScore,
    level,
    algorithm: 'Gradient Boosting Machine',
    topRiskFactor: emiRatio > 0.45 ? 'High EMI Burden' : 'Low Savings Rate'
  };
}
