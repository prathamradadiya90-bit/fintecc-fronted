export interface AmortizationRow {
  month: Date;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

export function calculateEMI(principal: number, ratePerAnnum: number, tenureInYears: number): number {
  if (principal <= 0 || ratePerAnnum <= 0 || tenureInYears <= 0) return 0;
  
  const r = ratePerAnnum / 12 / 100; // Monthly interest rate
  const n = tenureInYears * 12; // Total number of months
  
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi;
}

export function generateAmortizationSchedule(
  principal: number, 
  ratePerAnnum: number, 
  tenureInYears: number, 
  startDate: Date = new Date()
): AmortizationRow[] {
  if (principal <= 0 || ratePerAnnum <= 0 || tenureInYears <= 0) return [];

  const emi = calculateEMI(principal, ratePerAnnum, tenureInYears);
  const r = ratePerAnnum / 12 / 100;
  const n = tenureInYears * 12;
  
  let balance = principal;
  const schedule: AmortizationRow[] = [];
  
  let currentDate = new Date(startDate);
  // Start from next month
  currentDate.setMonth(currentDate.getMonth() + 1);

  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    let principalPaid = emi - interest;
    
    // Handle rounding issues on the final month
    if (i === n) {
      principalPaid = balance;
    }
    
    const closingBalance = balance - principalPaid;
    
    schedule.push({
      month: new Date(currentDate),
      openingBalance: balance,
      emi: emi,
      principal: principalPaid,
      interest: interest,
      closingBalance: Math.max(0, closingBalance),
    });
    
    balance = closingBalance;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return schedule;
}

export function formatCurrency(value: number): string {
  // Format as Indian Rupees (lakhs/crores)
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(value)}`;
}

export function formatCurrencyExact(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
