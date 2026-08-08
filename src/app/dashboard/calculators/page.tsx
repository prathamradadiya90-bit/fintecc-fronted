'use client';

import React, { useState } from 'react';
import { CalculatorTabs } from '@/components/calculators/CalculatorTabs';
import { EmiCalculator } from '@/components/calculators/EmiCalculator';
import { SipCalculator } from '@/components/calculators/SipCalculator';
import { SwpCalculator } from '@/components/calculators/SwpCalculator';

type CalculatorType = 'EMI' | 'SIP' | 'SWP';

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('EMI');

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Calculators</h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
          Calculate EMI, systematic investments, and withdrawals.
        </p>
      </div>

      {/* Tabs */}
      <CalculatorTabs 
        activeCalculator={activeCalculator} 
        onChange={setActiveCalculator} 
      />

      {/* Active Calculator Component */}
      <div className="mt-6">
        {activeCalculator === 'EMI' && <EmiCalculator />}
        {activeCalculator === 'SIP' && <SipCalculator />}
        {activeCalculator === 'SWP' && <SwpCalculator />}
      </div>

    </div>
  );
}
