export type CalculatorCategory =
  | 'Loans & EMI'
  | 'Banking & Interest'
  | 'Investments'
  | 'Retirement & Savings'
  | 'Tax & GST'
  | 'General';

export interface CalculatorMeta {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  category: CalculatorCategory;
  badge?: string;
  iconName: string;
  keywords: string[];
  popular?: boolean;
}
