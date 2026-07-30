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
