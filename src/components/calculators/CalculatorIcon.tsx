import React from 'react';
import {
  Calculator,
  Car,
  TrendingUp,
  Coins,
  Wallet,
  PieChart,
  LineChart,
  Percent,
  Sparkles,
  Building2,
  Layers,
  BarChart3,
  ShieldCheck,
  Briefcase,
  Landmark,
  Award,
  HeartHandshake,
  Mail,
  Compass,
  Wheat,
  FileSpreadsheet,
  BadgePercent,
  Receipt,
  Clock,
  ShieldPlus,
  DollarSign,
  Tag,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Calculator,
  Car,
  TrendingUp,
  Coins,
  Wallet,
  PieChart,
  LineChart,
  Percent,
  Sparkles,
  Building2,
  Layers,
  BarChart3,
  ShieldCheck,
  Briefcase,
  Landmark,
  Award,
  HeartHandshake,
  Mail,
  Compass,
  Wheat,
  FileSpreadsheet,
  BadgePercent,
  Receipt,
  Clock,
  ShieldPlus,
  DollarSign,
  Tag,
};

interface CalculatorIconProps extends LucideProps {
  name: string;
}

export function CalculatorIcon({ name, ...props }: CalculatorIconProps) {
  const IconComponent = ICON_MAP[name] || Calculator;
  return <IconComponent {...props} />;
}
