/**
 * Banking & Interest Calculators Utility Functions
 */

export interface SimpleInterestResult {
  principal: number;
  totalInterest: number;
  totalAmount: number;
}

export function calculateSimpleInterest(
  principal: number,
  ratePerAnnum: number,
  timePeriodYears: number
): SimpleInterestResult {
  if (principal <= 0 || ratePerAnnum <= 0 || timePeriodYears <= 0) {
    return { principal: Math.max(0, principal), totalInterest: 0, totalAmount: Math.max(0, principal) };
  }
  const totalInterest = (principal * ratePerAnnum * timePeriodYears) / 100;
  const totalAmount = principal + totalInterest;

  return {
    principal: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
  };
}

export interface CompoundInterestResult {
  principal: number;
  totalInterest: number;
  totalAmount: number;
}

export function calculateCompoundInterest(
  principal: number,
  ratePerAnnum: number,
  timePeriodYears: number,
  compoundingFrequencyPerYear: number = 4 // quarterly standard in India
): CompoundInterestResult {
  if (principal <= 0 || ratePerAnnum <= 0 || timePeriodYears <= 0) {
    return { principal: Math.max(0, principal), totalInterest: 0, totalAmount: Math.max(0, principal) };
  }
  const n = compoundingFrequencyPerYear;
  const r = ratePerAnnum / 100;
  const t = timePeriodYears;

  // A = P * (1 + r/n)^(n*t)
  const totalAmount = principal * Math.pow(1 + r / n, n * t);
  const totalInterest = totalAmount - principal;

  return {
    principal: Math.round(principal),
    totalInterest: Math.max(0, Math.round(totalInterest)),
    totalAmount: Math.round(totalAmount),
  };
}

export interface FDResult {
  investmentAmount: number;
  estimatedInterest: number;
  maturityValue: number;
}

export function calculateFD(
  totalInvestment: number,
  rateOfInterest: number,
  timePeriodYears: number,
  compoundingFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' = 'quarterly'
): FDResult {
  if (totalInvestment <= 0 || rateOfInterest <= 0 || timePeriodYears <= 0) {
    return { investmentAmount: Math.max(0, totalInvestment), estimatedInterest: 0, maturityValue: Math.max(0, totalInvestment) };
  }

  const freqMap = {
    monthly: 12,
    quarterly: 4,
    'half-yearly': 2,
    yearly: 1,
  };

  const n = freqMap[compoundingFrequency] || 4;
  const r = rateOfInterest / 100;
  const t = timePeriodYears;

  const maturityValue = totalInvestment * Math.pow(1 + r / n, n * t);
  const estimatedInterest = maturityValue - totalInvestment;

  return {
    investmentAmount: Math.round(totalInvestment),
    estimatedInterest: Math.max(0, Math.round(estimatedInterest)),
    maturityValue: Math.round(maturityValue),
  };
}

export interface RDResult {
  monthlyDeposit: number;
  totalInvestment: number;
  estimatedInterest: number;
  maturityValue: number;
}

export function calculateRD(
  monthlyDeposit: number,
  rateOfInterest: number,
  timePeriodYears: number
): RDResult {
  if (monthlyDeposit <= 0 || rateOfInterest <= 0 || timePeriodYears <= 0) {
    return { monthlyDeposit: Math.max(0, monthlyDeposit), totalInvestment: 0, estimatedInterest: 0, maturityValue: 0 };
  }

  const months = timePeriodYears * 12;
  const totalInvestment = monthlyDeposit * months;
  const i = rateOfInterest / 400; // quarterly compounding factor

  // Standard Indian Bank RD Formula (Quarterly compounding):
  // M = P * [ (1+i)^(n/3) - 1 ] / (1 - (1+i)^(-1/3))
  // Or sum of each installment compounding for remaining quarters
  let maturityValue = 0;
  for (let m = 1; m <= months; m++) {
    const quartersRemaining = (months - m + 1) / 3;
    maturityValue += monthlyDeposit * Math.pow(1 + i, quartersRemaining);
  }

  const estimatedInterest = maturityValue - totalInvestment;

  return {
    monthlyDeposit: Math.round(monthlyDeposit),
    totalInvestment: Math.round(totalInvestment),
    estimatedInterest: Math.max(0, Math.round(estimatedInterest)),
    maturityValue: Math.round(maturityValue),
  };
}

export interface ROIResult {
  investedAmount: number;
  returnedAmount: number;
  absoluteReturn: number;
  roiPercentage: number;
  annualizedRoiPercentage: number;
}

export function calculateROI(
  initialInvestment: number,
  finalValue: number,
  investmentPeriodYears: number = 1
): ROIResult {
  if (initialInvestment <= 0) {
    return {
      investedAmount: 0,
      returnedAmount: 0,
      absoluteReturn: 0,
      roiPercentage: 0,
      annualizedRoiPercentage: 0,
    };
  }

  const absoluteReturn = finalValue - initialInvestment;
  const roiPercentage = (absoluteReturn / initialInvestment) * 100;
  
  // Annualized ROI = ((Final / Initial) ^ (1 / years) - 1) * 100
  const years = Math.max(0.01, investmentPeriodYears);
  const annualizedRoiPercentage =
    finalValue > 0
      ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100
      : -100;

  return {
    investedAmount: Math.round(initialInvestment),
    returnedAmount: Math.round(finalValue),
    absoluteReturn: Math.round(absoluteReturn),
    roiPercentage: Number(roiPercentage.toFixed(2)),
    annualizedRoiPercentage: Number(annualizedRoiPercentage.toFixed(2)),
  };
}
