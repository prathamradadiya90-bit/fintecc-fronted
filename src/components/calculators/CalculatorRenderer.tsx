'use client';

import React from 'react';
import { EmiCalculator } from '@/components/calculators/EmiCalculator';
import { CarLoanEmiCalculator } from '@/components/calculators/CarLoanEmiCalculator';
import { SipCalculator } from '@/components/calculators/SipCalculator';
import { SwpCalculator } from '@/components/calculators/SwpCalculator';
import { LumpsumCalculator } from '@/components/calculators/LumpsumCalculator';
import { MutualFundCalculator } from '@/components/calculators/MutualFundCalculator';
import { CagrCalculator } from '@/components/calculators/CagrCalculator';
import { SimpleInterestCalculator } from '@/components/calculators/SimpleInterestCalculator';
import { CompoundInterestCalculator } from '@/components/calculators/CompoundInterestCalculator';
import { FdCalculator } from '@/components/calculators/FdCalculator';
import { RdCalculator } from '@/components/calculators/RdCalculator';
import { RoiCalculator } from '@/components/calculators/RoiCalculator';
import { PpfCalculator } from '@/components/calculators/PpfCalculator';
import { PfCalculator } from '@/components/calculators/PfCalculator';
import { NpsCalculator } from '@/components/calculators/NpsCalculator';
import { GratuityCalculator } from '@/components/calculators/GratuityCalculator';
import { SsyCalculator } from '@/components/calculators/SsyCalculator';
import { PostOfficeMisCalculator } from '@/components/calculators/PostOfficeMisCalculator';
import { RetirementPlanningCalculator } from '@/components/calculators/RetirementPlanningCalculator';
import { KvpCalculator } from '@/components/calculators/KvpCalculator';
import { IncomeTaxCalculator } from '@/components/calculators/IncomeTaxCalculator';
import { LtcgCalculator } from '@/components/calculators/LtcgCalculator';
import { GstCalculator } from '@/components/calculators/GstCalculator';
import { Gstr3bInterestCalculator } from '@/components/calculators/Gstr3bInterestCalculator';
import { TaxSavingCalculator } from '@/components/calculators/TaxSavingCalculator';
import { SalaryCalculator } from '@/components/calculators/SalaryCalculator';
import { DiscountCalculator } from '@/components/calculators/DiscountCalculator';

const COMPONENT_MAP: Record<string, React.ComponentType> = {
  'emi-calculator': EmiCalculator,
  'car-loan-emi-calculator': CarLoanEmiCalculator,
  'sip-calculator': SipCalculator,
  'swp-calculator': SwpCalculator,
  'lumpsum-calculator': LumpsumCalculator,
  'mutual-fund-calculator': MutualFundCalculator,
  'cagr-calculator': CagrCalculator,
  'simple-interest-calculator': SimpleInterestCalculator,
  'compound-interest-calculator': CompoundInterestCalculator,
  'fd-calculator': FdCalculator,
  'rd-calculator': RdCalculator,
  'roi-calculator': RoiCalculator,
  'ppf-calculator': PpfCalculator,
  'pf-calculator': PfCalculator,
  'nps-calculator': NpsCalculator,
  'gratuity-calculator': GratuityCalculator,
  'ssy-calculator': SsyCalculator,
  'post-office-mis-calculator': PostOfficeMisCalculator,
  'retirement-planning-calculator': RetirementPlanningCalculator,
  'kvp-calculator': KvpCalculator,
  'income-tax-calculator': IncomeTaxCalculator,
  'ltcg-calculator': LtcgCalculator,
  'gst-calculator': GstCalculator,
  'gstr3b-interest-calculator': Gstr3bInterestCalculator,
  'tax-saving-calculator': TaxSavingCalculator,
  'salary-calculator': SalaryCalculator,
  'discount-calculator': DiscountCalculator,
};

interface CalculatorRendererProps {
  slug: string;
}

export function CalculatorRenderer({ slug }: CalculatorRendererProps) {
  const Component = COMPONENT_MAP[slug] || EmiCalculator;
  return <Component />;
}
