'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/layouts/PublicNavbar';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { CalculatorTabs } from '@/components/calculators/CalculatorTabs';
import { EmiCalculator } from '@/components/calculators/EmiCalculator';
import { SipCalculator } from '@/components/calculators/SipCalculator';
import { SwpCalculator } from '@/components/calculators/SwpCalculator';

type CalculatorType = 'EMI' | 'SIP' | 'SWP';

export default function PublicCalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('EMI');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 md:px-12 py-10">
        
        {/* Header */}
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#091124]">Calculators</h1>
          <p className="text-slate-500 mt-2 text-[15px]">
            Plan your finances with our easy-to-use EMI, SIP, and SWP calculators.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center md:justify-start">
          <CalculatorTabs 
            activeCalculator={activeCalculator} 
            onChange={setActiveCalculator} 
          />
        </div>

        {/* Active Calculator Component */}
        <div className="mt-6">
          {activeCalculator === 'EMI' && <EmiCalculator />}
          {activeCalculator === 'SIP' && <SipCalculator />}
          {activeCalculator === 'SWP' && <SwpCalculator />}
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
