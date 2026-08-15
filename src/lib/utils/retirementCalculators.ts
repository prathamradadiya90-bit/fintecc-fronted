/**
 * Retirement & Government Savings Scheme Calculators
 */

export interface PPFResult {
  totalInvested: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakup: Array<{
    year: number;
    invested: number;
    interest: number;
    totalBalance: number;
  }>;
}

export function calculatePPF(
  yearlyInvestment: number,
  timePeriodYears: number = 15,
  rateOfInterest: number = 7.1 // Current government PPF rate
): PPFResult {
  if (yearlyInvestment <= 0 || timePeriodYears <= 0) {
    return { totalInvested: 0, totalInterest: 0, maturityAmount: 0, yearlyBreakup: [] };
  }

  // Max PPF investment per year is ₹1.5 Lakhs
  const cappedInvestment = Math.min(yearlyInvestment, 150000);
  const r = rateOfInterest / 100;
  let balance = 0;
  let totalInvested = 0;
  const yearlyBreakup = [];

  for (let year = 1; year <= timePeriodYears; year++) {
    totalInvested += cappedInvestment;
    // PPF interest calculated annually on balance + contribution
    const interest = (balance + cappedInvestment) * r;
    balance += cappedInvestment + interest;

    yearlyBreakup.push({
      year,
      invested: Math.round(totalInvested),
      interest: Math.round(interest),
      totalBalance: Math.round(balance),
    });
  }

  const totalInterest = balance - totalInvested;

  return {
    totalInvested: Math.round(totalInvested),
    totalInterest: Math.max(0, Math.round(totalInterest)),
    maturityAmount: Math.round(balance),
    yearlyBreakup,
  };
}

export interface EPFResult {
  employeeTotalContribution: number;
  employerTotalContribution: number;
  totalInterestEarned: number;
  totalMaturityCorpus: number;
}

export function calculateEPF(
  monthlyBasicSalary: number,
  currentAge: number = 25,
  retirementAge: number = 58,
  employeeContributionPercent: number = 12,
  employerContributionToEPFPercent: number = 3.67, // 8.33% goes to EPS, 3.67% to EPF
  annualSalaryGrowthPercent: number = 5,
  epfInterestRate: number = 8.25 // EPFO current rate
): EPFResult {
  const years = Math.max(1, retirementAge - currentAge);
  const monthlyRate = epfInterestRate / 12 / 100;
  
  let currentSalary = monthlyBasicSalary;
  let totalBalance = 0;
  let totalEmployeeContrib = 0;
  let totalEmployerContrib = 0;

  for (let yr = 0; yr < years; yr++) {
    for (let m = 0; m < 12; m++) {
      const empShare = (currentSalary * employeeContributionPercent) / 100;
      const emplyrShare = (currentSalary * employerContributionToEPFPercent) / 100;
      
      totalEmployeeContrib += empShare;
      totalEmployerContrib += emplyrShare;
      
      totalBalance += empShare + emplyrShare;
      // Monthly interest compounding on closing balance
      totalBalance += totalBalance * monthlyRate;
    }
    // Increment salary annually
    currentSalary += (currentSalary * annualSalaryGrowthPercent) / 100;
  }

  const totalInterestEarned = totalBalance - (totalEmployeeContrib + totalEmployerContrib);

  return {
    employeeTotalContribution: Math.round(totalEmployeeContrib),
    employerTotalContribution: Math.round(totalEmployerContrib),
    totalInterestEarned: Math.max(0, Math.round(totalInterestEarned)),
    totalMaturityCorpus: Math.round(totalBalance),
  };
}

export interface NPSResult {
  totalInvestment: number;
  totalCorpus: number;
  lumpSumAmount: number;
  annuityCorpus: number;
  expectedMonthlyPension: number;
}

export function calculateNPS(
  monthlyInvestment: number,
  currentAge: number = 30,
  retirementAge: number = 60,
  expectedReturnRate: number = 10,
  annuityPercent: number = 40, // Min 40% mandatory
  annuityReturnRate: number = 6 // Standard LIC/Pension annuity rate
): NPSResult {
  const tenureYears = Math.max(1, retirementAge - currentAge);
  const months = tenureYears * 12;
  const r = expectedReturnRate / 12 / 100;

  // FV of monthly investment
  const totalCorpus = monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  const totalInvestment = monthlyInvestment * months;

  const annuityCorpus = (totalCorpus * annuityPercent) / 100;
  const lumpSumAmount = totalCorpus - annuityCorpus;

  // Monthly pension from annuity
  const expectedMonthlyPension = (annuityCorpus * (annuityReturnRate / 100)) / 12;

  return {
    totalInvestment: Math.round(totalInvestment),
    totalCorpus: Math.round(totalCorpus),
    lumpSumAmount: Math.round(lumpSumAmount),
    annuityCorpus: Math.round(annuityCorpus),
    expectedMonthlyPension: Math.round(expectedMonthlyPension),
  };
}

export interface GratuityResult {
  gratuityAmount: number;
  taxExemptLimit: number;
  isTaxFree: boolean;
}

export function calculateGratuity(
  monthlyBasicPlusDA: number,
  tenureYears: number
): GratuityResult {
  if (tenureYears < 5 || monthlyBasicPlusDA <= 0) {
    return { gratuityAmount: 0, taxExemptLimit: 2000000, isTaxFree: true };
  }

  // Gratuity formula as per Payment of Gratuity Act: (15 * Last Drawn Salary * Tenure) / 26
  const rawGratuity = (15 * monthlyBasicPlusDA * tenureYears) / 26;
  const maxExemption = 2000000; // ₹20 Lakhs statutory limit
  const gratuityAmount = Math.round(rawGratuity);

  return {
    gratuityAmount,
    taxExemptLimit: maxExemption,
    isTaxFree: gratuityAmount <= maxExemption,
  };
}

export interface SSYResult {
  totalInvested: number;
  interestEarned: number;
  maturityAmount: number;
}

export function calculateSSY(
  yearlyInvestment: number,
  girlChildAge: number = 1,
  interestRate: number = 8.2 // Current SSY rate
): SSYResult {
  // SSY deposits for 15 years, account matures after 21 years from opening
  const depositYears = 15;
  const maturityYears = 21;
  const cappedInvestment = Math.min(yearlyInvestment, 150000);
  const r = interestRate / 100;

  let balance = 0;
  let totalInvested = 0;

  for (let yr = 1; yr <= maturityYears; yr++) {
    if (yr <= depositYears) {
      totalInvested += cappedInvestment;
      balance += cappedInvestment;
    }
    // Annual compound interest
    balance += balance * r;
  }

  return {
    totalInvested: Math.round(totalInvested),
    interestEarned: Math.max(0, Math.round(balance - totalInvested)),
    maturityAmount: Math.round(balance),
  };
}

export interface PostOfficeMISResult {
  investmentAmount: number;
  monthlyInterestIncome: number;
  annualInterestIncome: number;
  totalInterest5Years: number;
}

export function calculatePostOfficeMIS(
  investmentAmount: number,
  interestRate: number = 7.4 // Post Office MIS current rate
): PostOfficeMISResult {
  // Max single account ₹9L, joint ₹15L
  const annualInterest = (investmentAmount * interestRate) / 100;
  const monthlyInterest = annualInterest / 12;
  const totalInterest5Years = annualInterest * 5;

  return {
    investmentAmount: Math.round(investmentAmount),
    monthlyInterestIncome: Math.round(monthlyInterest),
    annualInterestIncome: Math.round(annualInterest),
    totalInterest5Years: Math.round(totalInterest5Years),
  };
}

export interface RetirementPlanningResult {
  currentMonthlyExpenses: number;
  futureMonthlyExpensesAtRetirement: number;
  targetRetirementCorpus: number;
  monthlySavingsNeeded: number;
}

export function calculateRetirementPlanning(
  currentAge: number = 30,
  retirementAge: number = 60,
  lifeExpectancy: number = 85,
  currentMonthlyExpenses: number = 50000,
  expectedInflationRate: number = 6,
  preRetirementReturnRate: number = 12,
  postRetirementReturnRate: number = 8
): RetirementPlanningResult {
  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const retirementYears = Math.max(1, lifeExpectancy - retirementAge);

  // Future monthly expense adjusted for inflation
  const futureMonthlyExpenses =
    currentMonthlyExpenses * Math.pow(1 + expectedInflationRate / 100, yearsToRetirement);
  const annualExpenseAtRetirement = futureMonthlyExpenses * 12;

  // Real rate of return post-retirement
  const realRate =
    (1 + postRetirementReturnRate / 100) / (1 + expectedInflationRate / 100) - 1;

  // Required Corpus formula (Present value of growing annuity):
  // Corpus = Annual_Expense * [ (1 - (1+realRate)^(-n)) / realRate ]
  const targetCorpus =
    realRate === 0
      ? annualExpenseAtRetirement * retirementYears
      : annualExpenseAtRetirement * ((1 - Math.pow(1 + realRate, -retirementYears)) / realRate);

  // Monthly SIP needed to build this corpus
  const r = preRetirementReturnRate / 12 / 100;
  const n = yearsToRetirement * 12;
  const monthlySavingsNeeded =
    (targetCorpus * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));

  return {
    currentMonthlyExpenses: Math.round(currentMonthlyExpenses),
    futureMonthlyExpensesAtRetirement: Math.round(futureMonthlyExpenses),
    targetRetirementCorpus: Math.round(targetCorpus),
    monthlySavingsNeeded: Math.max(0, Math.round(monthlySavingsNeeded)),
  };
}

export interface KVPResult {
  principalAmount: number;
  maturityAmount: number;
  doublingPeriodMonths: number;
  doublingPeriodYears: string;
  interestRate: number;
}

export function calculateKVP(
  principalAmount: number,
  interestRate: number = 7.5 // Current KVP rate (115 months doubling)
): KVPResult {
  const doublingPeriodMonths = 115; // Official post office KVP maturity tenure
  const years = Math.floor(doublingPeriodMonths / 12);
  const remMonths = doublingPeriodMonths % 12;

  return {
    principalAmount: Math.round(principalAmount),
    maturityAmount: Math.round(principalAmount * 2),
    doublingPeriodMonths,
    doublingPeriodYears: `${years} years ${remMonths} months`,
    interestRate,
  };
}
