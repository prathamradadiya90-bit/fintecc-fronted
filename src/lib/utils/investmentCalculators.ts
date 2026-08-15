export function calculateSIP(monthlyInvestment: number, expectedReturnRate: number, timePeriodYears: number) {
  if (monthlyInvestment <= 0 || expectedReturnRate <= 0 || timePeriodYears <= 0) {
    return { investedAmount: 0, estimatedReturns: 0, totalValue: 0 };
  }

  const r = expectedReturnRate / 12 / 100; // Monthly interest rate
  const n = timePeriodYears * 12; // Total number of months

  // Future Value of SIP formula: M = P * [((1 + i)^n - 1) / i] * (1 + i)
  const totalValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const investedAmount = monthlyInvestment * n;
  const estimatedReturns = totalValue - investedAmount;

  return {
    investedAmount: Math.round(investedAmount),
    estimatedReturns: Math.max(0, Math.round(estimatedReturns)),
    totalValue: Math.round(totalValue)
  };
}

export function calculateSWP(totalInvestment: number, withdrawalPerMonth: number, expectedReturnRate: number, timePeriodYears: number) {
  if (totalInvestment <= 0 || expectedReturnRate <= 0 || timePeriodYears <= 0) {
    return { totalWithdrawal: 0, finalValue: 0, initialInvestment: totalInvestment };
  }

  const r = expectedReturnRate / 12 / 100; // Monthly interest rate
  const n = timePeriodYears * 12; // Total number of months

  // Future Value after SWP: FV = P * (1 + r)^n - W * [((1 + r)^n - 1) / r]
  const part1 = totalInvestment * Math.pow(1 + r, n);
  const part2 = withdrawalPerMonth * ((Math.pow(1 + r, n) - 1) / r);
  
  const finalValue = part1 - part2;
  const totalWithdrawal = withdrawalPerMonth * n;

  return {
    initialInvestment: Math.round(totalInvestment),
    totalWithdrawal: Math.round(totalWithdrawal),
    finalValue: Math.max(0, Math.round(finalValue))
  };
}

export function calculateLumpsum(totalInvestment: number, expectedReturnRate: number, timePeriodYears: number) {
  if (totalInvestment <= 0 || expectedReturnRate <= 0 || timePeriodYears <= 0) {
    return { investedAmount: Math.max(0, totalInvestment), estimatedReturns: 0, totalValue: Math.max(0, totalInvestment) };
  }

  const r = expectedReturnRate / 100;
  const n = timePeriodYears;

  // A = P * (1 + r)^n
  const totalValue = totalInvestment * Math.pow(1 + r, n);
  const estimatedReturns = totalValue - totalInvestment;

  return {
    investedAmount: Math.round(totalInvestment),
    estimatedReturns: Math.max(0, Math.round(estimatedReturns)),
    totalValue: Math.round(totalValue)
  };
}

export function calculateMutualFund(
  investmentType: 'SIP' | 'Lumpsum',
  amount: number,
  expectedReturnRate: number,
  timePeriodYears: number
) {
  if (investmentType === 'SIP') {
    return calculateSIP(amount, expectedReturnRate, timePeriodYears);
  }
  return calculateLumpsum(amount, expectedReturnRate, timePeriodYears);
}

export function calculateCAGR(initialInvestment: number, finalValue: number, timePeriodYears: number) {
  if (initialInvestment <= 0 || finalValue <= 0 || timePeriodYears <= 0) {
    return { cagr: 0, absoluteReturns: 0, totalGain: 0 };
  }

  // CAGR = ((Final / Initial) ^ (1 / n) - 1) * 100
  const cagr = (Math.pow(finalValue / initialInvestment, 1 / timePeriodYears) - 1) * 100;
  const totalGain = finalValue - initialInvestment;
  const absoluteReturns = (totalGain / initialInvestment) * 100;

  return {
    cagr: Number(cagr.toFixed(2)),
    absoluteReturns: Number(absoluteReturns.toFixed(2)),
    totalGain: Math.round(totalGain)
  };
}
