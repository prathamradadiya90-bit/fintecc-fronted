import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicNavbar } from '@/components/layouts/PublicNavbar';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { CalculatorShell } from '@/components/calculators/CalculatorShell';
import { CalculatorRenderer } from '@/components/calculators/CalculatorRenderer';
import { CALCULATORS_LIST } from '@/lib/constants/calculatorRegistry';
import { CALCULATOR_FAQS } from '@/lib/constants/calculatorFaqs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CALCULATORS_LIST.map((calc) => ({
    slug: calc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const calculator = CALCULATORS_LIST.find((c) => c.slug === slug);

  if (!calculator) {
    return {
      title: 'Calculator Not Found — Fintecc',
    };
  }

  return {
    title: `${calculator.name} — Free Online Financial Calculator | Fintecc`,
    description: calculator.description,
    keywords: calculator.keywords.join(', '),
    openGraph: {
      title: `${calculator.name} — Fintecc`,
      description: calculator.description,
      type: 'website',
    },
  };
}

export default async function CalculatorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const calculator = CALCULATORS_LIST.find((c) => c.slug === slug);

  if (!calculator) {
    notFound();
  }

  const faqs = CALCULATOR_FAQS[slug] || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#00C2B3] selection:text-white flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 md:px-12 py-10">
        <CalculatorShell calculator={calculator} faqs={faqs}>
          <CalculatorRenderer slug={slug} />
        </CalculatorShell>
      </main>

      <PublicFooter />
    </div>
  );
}
