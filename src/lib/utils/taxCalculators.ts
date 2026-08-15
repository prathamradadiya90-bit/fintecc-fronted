/**
 * Tax, GST & Compensation Calculators Utility Functions
 */

export interface IncomeTaxResult {
  taxableIncomeOld: number;
  taxableIncomeNew: number;
  totalTaxOld: number;
  totalTaxNew: number;
  rebate87AOld: number;
  rebate87ANew: number;
  cessOld: number;
  cessNew: number;
  betterRegime: 'NEW' | 'OLD';
  taxDifference: number;
}

export function calculateIncomeTax(
  annualIncome: number,
  deductions80C: number = 0,
  deductions80D: number = 0,
  hraExemption: number = 0,
  homeLoanInterest: number = 0,
  otherDeductions: number = 0
): IncomeTaxResult {
  const stdDeductionOld = 50000;
  const stdDeductionNew = 75000; // Updated as per Budget 2024 for New Tax Regime

  // 1. OLD REGIME CALCULATION
  const capped80C = Math.min(deductions80C, 150000);
  const capped80D = Math.min(deductions80D, 100000);
  const cappedHomeLoan = Math.min(homeLoanInterest, 200000);
  const totalDeductionsOld =
    stdDeductionOld + capped80C + capped80D + hraExemption + cappedHomeLoan + otherDeductions;

  const taxableIncomeOld = Math.max(0, annualIncome - totalDeductionsOld);

  let taxOld = 0;
  if (taxableIncomeOld <= 250000) {
    taxOld = 0;
  } else if (taxableIncomeOld <= 500000) {
    taxOld = (taxableIncomeOld - 250000) * 0.05;
  } else if (taxableIncomeOld <= 1000000) {
    taxOld = 12500 + (taxableIncomeOld - 500000) * 0.2;
  } else {
    taxOld = 112500 + (taxableIncomeOld - 1000000) * 0.3;
  }

  // Old Regime Rebate 87A (Up to 5L taxable income, rebate up to 12,500)
  let rebate87AOld = 0;
  if (taxableIncomeOld <= 500000) {
    rebate87AOld = taxOld;
    taxOld = 0;
  }

  const cessOld = Math.round(taxOld * 0.04);
  const totalTaxOld = Math.round(taxOld + cessOld);

  // 2. NEW REGIME CALCULATION (Budget 2024 Slabs: 0-3L Nil, 3-7L 5%, 7-10L 10%, 10-12L 15%, 12-15L 20%, >15L 30%)
  const taxableIncomeNew = Math.max(0, annualIncome - stdDeductionNew);
  let taxNew = 0;

  if (taxableIncomeNew <= 300000) {
    taxNew = 0;
  } else if (taxableIncomeNew <= 700000) {
    taxNew = (taxableIncomeNew - 300000) * 0.05;
  } else if (taxableIncomeNew <= 1000000) {
    taxNew = 20000 + (taxableIncomeNew - 700000) * 0.10;
  } else if (taxableIncomeNew <= 1200000) {
    taxNew = 50000 + (taxableIncomeNew - 1000000) * 0.15;
  } else if (taxableIncomeNew <= 1500000) {
    taxNew = 80000 + (taxableIncomeNew - 1200000) * 0.20;
  } else {
    taxNew = 140000 + (taxableIncomeNew - 1500000) * 0.30;
  }

  // New Regime Rebate 87A (Taxable income up to 7L gets full rebate)
  let rebate87ANew = 0;
  if (taxableIncomeNew <= 700000) {
    rebate87ANew = taxNew;
    taxNew = 0;
  }

  const cessNew = Math.round(taxNew * 0.04);
  const totalTaxNew = Math.round(taxNew + cessNew);

  const betterRegime = totalTaxNew <= totalTaxOld ? 'NEW' : 'OLD';
  const taxDifference = Math.abs(totalTaxOld - totalTaxNew);

  return {
    taxableIncomeOld: Math.round(taxableIncomeOld),
    taxableIncomeNew: Math.round(taxableIncomeNew),
    totalTaxOld,
    totalTaxNew,
    rebate87AOld: Math.round(rebate87AOld),
    rebate87ANew: Math.round(rebate87ANew),
    cessOld,
    cessNew,
    betterRegime,
    taxDifference,
  };
}

export interface LTCGResult {
  purchaseValue: number;
  saleValue: number;
  totalGain: number;
  exemptionLimit: number;
  taxableGain: number;
  ltcgTaxAmount: number;
}

export function calculateLTCG(
  purchaseValue: number,
  saleValue: number,
  assetType: 'equity' | 'debt' | 'real_estate' = 'equity'
): LTCGResult {
  const totalGain = Math.max(0, saleValue - purchaseValue);

  // Budget 2024 Rules:
  // Listed equity/equity MF LTCG rate is 12.5% with ₹1.25 Lakh exemption
  let exemptionLimit = 125000;
  let taxRate = 0.125;

  if (assetType === 'debt') {
    exemptionLimit = 0;
    taxRate = 0.20; // taxed at applicable slab, placeholder standard
  } else if (assetType === 'real_estate') {
    exemptionLimit = 0;
    taxRate = 0.125; // 12.5% without indexation as per new budget
  }

  const taxableGain = Math.max(0, totalGain - exemptionLimit);
  const ltcgTaxAmount = Math.round(taxableGain * taxRate * 1.04); // 4% cess included

  return {
    purchaseValue: Math.round(purchaseValue),
    saleValue: Math.round(saleValue),
    totalGain: Math.round(totalGain),
    exemptionLimit,
    taxableGain: Math.round(taxableGain),
    ltcgTaxAmount,
  };
}

export interface GSTResult {
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export function calculateGST(
  amount: number,
  gstRate: number,
  type: 'exclusive' | 'inclusive' = 'exclusive',
  isInterState: boolean = false
): GSTResult {
  if (amount <= 0 || gstRate <= 0) {
    return {
      baseAmount: Math.max(0, amount),
      gstRate: 0,
      gstAmount: 0,
      totalAmount: Math.max(0, amount),
      cgst: 0,
      sgst: 0,
      igst: 0,
    };
  }

  let baseAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (type === 'exclusive') {
    baseAmount = amount;
    gstAmount = (amount * gstRate) / 100;
    totalAmount = baseAmount + gstAmount;
  } else {
    // Inclusive: Base = Total / (1 + Rate/100)
    totalAmount = amount;
    baseAmount = totalAmount / (1 + gstRate / 100);
    gstAmount = totalAmount - baseAmount;
  }

  const cgst = isInterState ? 0 : gstAmount / 2;
  const sgst = isInterState ? 0 : gstAmount / 2;
  const igst = isInterState ? gstAmount : 0;

  return {
    baseAmount: Math.round(baseAmount),
    gstRate,
    gstAmount: Math.round(gstAmount),
    totalAmount: Math.round(totalAmount),
    cgst: Math.round(cgst),
    sgst: Math.round(sgst),
    igst: Math.round(igst),
  };
}

export interface GSTR3BInterestResult {
  taxLiability: number;
  delayDays: number;
  interestRate: number;
  interestAmount: number;
  totalPayableWithInterest: number;
}

export function calculateGSTR3BInterest(
  netTaxLiability: number,
  delayDays: number,
  interestRateAnnual: number = 18 // Section 50(1) CGST Act specifies 18% p.a.
): GSTR3BInterestResult {
  if (netTaxLiability <= 0 || delayDays <= 0) {
    return {
      taxLiability: Math.max(0, netTaxLiability),
      delayDays: 0,
      interestRate: interestRateAnnual,
      interestAmount: 0,
      totalPayableWithInterest: Math.max(0, netTaxLiability),
    };
  }

  // Interest = Net Tax Liability * (Rate / 100) * (Days / 365)
  const interestAmount = (netTaxLiability * (interestRateAnnual / 100) * delayDays) / 365;

  return {
    taxLiability: Math.round(netTaxLiability),
    delayDays,
    interestRate: interestRateAnnual,
    interestAmount: Math.round(interestAmount),
    totalPayableWithInterest: Math.round(netTaxLiability + interestAmount),
  };
}

export interface TaxSavingResult {
  totalDeductions: number;
  taxBracketPercent: number;
  totalTaxSaved: number;
  breakup: {
    section80C: number;
    section80D: number;
    section80CCD1B: number;
    homeLoanInterest: number;
  };
}

export function calculateTaxSavings(
  section80C: number = 0,
  section80D: number = 0,
  section80CCD1B: number = 0,
  homeLoanInterest: number = 0,
  taxBracketPercent: number = 30
): TaxSavingResult {
  const capped80C = Math.min(section80C, 150000);
  const capped80D = Math.min(section80D, 100000);
  const capped80CCD = Math.min(section80CCD1B, 50000);
  const cappedHomeLoan = Math.min(homeLoanInterest, 200000);

  const totalDeductions = capped80C + capped80D + capped80CCD + cappedHomeLoan;
  // Tax saved = Deductions * (Tax Bracket Rate + 4% cess)
  const effectiveRate = (taxBracketPercent * 1.04) / 100;
  const totalTaxSaved = Math.round(totalDeductions * effectiveRate);

  return {
    totalDeductions,
    taxBracketPercent,
    totalTaxSaved,
    breakup: {
      section80C: capped80C,
      section80D: capped80D,
      section80CCD1B: capped80CCD,
      homeLoanInterest: cappedHomeLoan,
    },
  };
}

export interface SalaryBreakupResult {
  ctcAnnual: number;
  basicSalaryMonthly: number;
  hraMonthly: number;
  specialAllowanceMonthly: number;
  employeeEPFMonthly: number;
  employerEPFMonthly: number;
  professionalTaxMonthly: number;
  estimatedTDSMonthly: number;
  netInHandMonthly: number;
  netInHandAnnual: number;
}

export function calculateSalary(
  annualCTC: number,
  basicSalaryPercent: number = 50, // Standard 40-50% of CTC
  hraPercent: number = 20,
  professionalTaxMonthly: number = 200
): SalaryBreakupResult {
  const monthlyCTC = annualCTC / 12;

  const basicSalaryMonthly = (monthlyCTC * basicSalaryPercent) / 100;
  const hraMonthly = (monthlyCTC * hraPercent) / 100;

  // EPF: 12% of basic (or capped at 1800 if opted)
  const employeeEPFMonthly = basicSalaryMonthly * 0.12;
  const employerEPFMonthly = basicSalaryMonthly * 0.12;

  const specialAllowanceMonthly = Math.max(
    0,
    monthlyCTC - (basicSalaryMonthly + hraMonthly + employerEPFMonthly)
  );

  // Simplified Tax Deduction at Source estimation (New Regime by default)
  const taxCalc = calculateIncomeTax(annualCTC);
  const estimatedTDSMonthly = Math.round(taxCalc.totalTaxNew / 12);

  // Take home = Monthly Gross (Basic + HRA + Special) - Employee EPF - PT - TDS
  const grossMonthly = basicSalaryMonthly + hraMonthly + specialAllowanceMonthly;
  const totalDeductionsMonthly =
    employeeEPFMonthly + professionalTaxMonthly + estimatedTDSMonthly;
  const netInHandMonthly = Math.max(0, Math.round(grossMonthly - totalDeductionsMonthly));

  return {
    ctcAnnual: Math.round(annualCTC),
    basicSalaryMonthly: Math.round(basicSalaryMonthly),
    hraMonthly: Math.round(hraMonthly),
    specialAllowanceMonthly: Math.round(specialAllowanceMonthly),
    employeeEPFMonthly: Math.round(employeeEPFMonthly),
    employerEPFMonthly: Math.round(employerEPFMonthly),
    professionalTaxMonthly,
    estimatedTDSMonthly,
    netInHandMonthly,
    netInHandAnnual: netInHandMonthly * 12,
  };
}

export interface DiscountResult {
  originalPrice: number;
  discountPercentage: number;
  savingsAmount: number;
  finalPrice: number;
}

export function calculateDiscount(
  originalPrice: number,
  discountPercentage: number
): DiscountResult {
  if (originalPrice <= 0 || discountPercentage <= 0) {
    return {
      originalPrice: Math.max(0, originalPrice),
      discountPercentage: 0,
      savingsAmount: 0,
      finalPrice: Math.max(0, originalPrice),
    };
  }

  const cappedDiscount = Math.min(100, Math.max(0, discountPercentage));
  const savingsAmount = (originalPrice * cappedDiscount) / 100;
  const finalPrice = originalPrice - savingsAmount;

  return {
    originalPrice: Math.round(originalPrice),
    discountPercentage: cappedDiscount,
    savingsAmount: Math.round(savingsAmount),
    finalPrice: Math.round(finalPrice),
  };
}
