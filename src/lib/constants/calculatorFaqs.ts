export const CALCULATOR_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  'emi-calculator': [
    {
      question: 'What is an EMI?',
      answer:
        'An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are applied to both interest and principal each month so that over a specified number of years, the loan is paid off in full.',
    },
    {
      question: 'How is loan EMI calculated in India?',
      answer:
        'Loan EMI is computed using the formula: EMI = [P × R × (1+R)^N] / [(1+R)^N – 1], where P is Principal, R is the monthly interest rate (Annual rate / 12 / 100), and N is the number of monthly installments.',
    },
  ],
  'car-loan-emi-calculator': [
    {
      question: 'What is an ideal down payment for a car loan?',
      answer:
        'Financial experts recommend paying at least 20% of the on-road price as down payment. This lowers your monthly EMI and prevents you from owing more than the vehicle’s depreciated value.',
    },
    {
      question: 'Can I prepay my car loan?',
      answer:
        'Most Indian banks allow prepayment after completing 6 to 12 monthly installments. Check with your bank for applicable foreclosure charges.',
    },
  ],
  'sip-calculator': [
    {
      question: 'What is a Systematic Investment Plan (SIP)?',
      answer:
        'A SIP allows you to invest a fixed amount regularly (monthly or quarterly) in mutual funds. It averages out purchase costs (rupee cost averaging) and instills financial discipline without having to time the market.',
    },
    {
      question: 'What returns can I expect from equity SIPs?',
      answer:
        'Historically, diversified equity mutual funds in India have delivered 12% to 15% annualized returns over 7+ year investment periods.',
    },
  ],
  'swp-calculator': [
    {
      question: 'How does an SWP work?',
      answer:
        'A Systematic Withdrawal Plan (SWP) allows you to withdraw a fixed sum regularly from your mutual fund investments while the remaining balance continues to earn returns.',
    },
    {
      question: 'Is SWP better than dividend option for regular income?',
      answer:
        'Yes, SWPs are generally much more tax-efficient than mutual fund dividends, as only the capital gains portion in each withdrawal is subject to tax, not the entire amount.',
    },
  ],
  'lumpsum-calculator': [
    {
      question: 'When should I choose lumpsum investment over SIP?',
      answer:
        'Lumpsum investments are ideal when you have a surplus windfall (bonus, property sale proceeds) and a long-term investment horizon of 5 to 10+ years.',
    },
  ],
  'mutual-fund-calculator': [
    {
      question: 'What is the difference between Direct and Regular mutual funds?',
      answer:
        'Direct plans have lower expense ratios because no distributor commission is paid, resulting in 0.5% to 1.5% higher returns per year compared to Regular plans.',
    },
  ],
  'cagr-calculator': [
    {
      question: 'What is CAGR and why is it important?',
      answer:
        'Compound Annual Growth Rate (CAGR) measures the geometric mean return of an investment over multiple years. It provides an accurate metric to compare diverse assets like stocks, real estate, and gold.',
    },
  ],
  'simple-interest-calculator': [
    {
      question: 'Where is Simple Interest commonly used?',
      answer:
        'Simple interest is used in short-term personal loans, car loans in some institutions, and certain government bonds.',
    },
  ],
  'compound-interest-calculator': [
    {
      question: 'Why is compound interest called the 8th wonder of the world?',
      answer:
        'Because interest earned is added back to the principal, accelerating wealth growth exponentially over time.',
    },
  ],
  'fd-calculator': [
    {
      question: 'Is Fixed Deposit interest taxable in India?',
      answer:
        'Yes, interest earned on FDs is fully taxable as per your income tax slab under "Income from Other Sources". Banks deduct TDS at 10% if interest exceeds ₹40,000/year (₹50,000 for senior citizens).',
    },
    {
      question: 'Are bank FDs safe?',
      answer:
        'Yes, deposits up to ₹5 Lakhs per bank (including principal and interest) are insured by the DICGC (a subsidiary of the RBI).',
    },
  ],
  'rd-calculator': [
    {
      question: 'What is the minimum tenure for a Recurring Deposit?',
      answer:
        'In India, bank RDs have a minimum tenure of 6 months and can extend up to 10 years (120 months). Post Office RDs typically have a 5-year lock-in.',
    },
  ],
  'roi-calculator': [
    {
      question: 'How do I interpret positive vs negative ROI?',
      answer:
        'A positive ROI indicates a net financial gain on your invested capital, while a negative ROI signifies capital erosion or a net loss.',
    },
  ],
  'ppf-calculator': [
    {
      question: 'What is the EEE status of PPF?',
      answer:
        'PPF enjoys Exempt-Exempt-Exempt (EEE) status: the investment is exempt under 80C (up to ₹1.5L), the interest earned annually is tax-free, and the maturity amount is 100% tax-free.',
    },
    {
      question: 'Can I withdraw PPF money before 15 years?',
      answer:
        'Partial withdrawals are permitted starting from the 7th financial year for medical emergencies or higher education.',
    },
  ],
  'pf-calculator': [
    {
      question: 'What is the current EPF interest rate in India?',
      answer:
        'The EPFO currently offers an attractive 8.25% annual interest rate for employee provident fund accounts.',
    },
    {
      question: 'Is EPF withdrawal taxable?',
      answer:
        'EPF withdrawal is completely tax-free if you have completed 5 or more continuous years of service.',
    },
  ],
  'nps-calculator': [
    {
      question: 'What is the tax benefit of Section 80CCD(1B)?',
      answer:
        'Under Section 80CCD(1B), you can claim an exclusive additional tax deduction of up to ₹50,000 for NPS investments, over and above the ₹1.5 Lakh limit under Section 80C.',
    },
    {
      question: 'How much can I withdraw at retirement from NPS?',
      answer:
        'At age 60, you can withdraw up to 60% of the total corpus completely tax-free. The remaining 40% must be used to purchase an annuity plan to provide monthly pension.',
    },
  ],
  'gratuity-calculator': [
    {
      question: 'When does an employee become eligible for gratuity?',
      answer:
        'An employee becomes eligible for gratuity after completing 5 continuous years of full-time service with the same employer.',
    },
    {
      question: 'What is the tax-free limit for gratuity?',
      answer:
        'Under Section 10(10) of the Income Tax Act, gratuity received up to ₹20 Lakhs is 100% tax-exempt for private sector employees covered under the Act.',
    },
  ],
  'ssy-calculator': [
    {
      question: 'Who is eligible for Sukanya Samriddhi Yojana (SSY)?',
      answer:
        'Parents or legal guardians can open an SSY account for a girl child from her birth until she reaches 10 years of age. A maximum of 2 accounts per family is allowed (except in case of twins/triplets).',
    },
  ],
  'post-office-mis-calculator': [
    {
      question: 'What is the investment limit in Post Office MIS?',
      answer:
        'The maximum investment limit is ₹9 Lakhs for a single account and ₹15 Lakhs for a joint account. Tenure is fixed at 5 years.',
    },
  ],
  'retirement-planning-calculator': [
    {
      question: 'Why should I factor inflation into retirement planning?',
      answer:
        'Inflation erodes purchasing power. A monthly living expense of ₹50,000 today will require approximately ₹2.87 Lakhs per month in 30 years assuming a 6% average annual inflation rate.',
    },
  ],
  'kvp-calculator': [
    {
      question: 'What is Kisan Vikas Patra (KVP)?',
      answer:
        'KVP is a government-backed small savings scheme offered through India Post that doubles your initial deposit in 115 months (~9.58 years) at a fixed 7.5% annual compound interest.',
    },
  ],
  'income-tax-calculator': [
    {
      question: 'Which is better: Old or New Tax Regime for FY 2024-25 / 2025-26?',
      answer:
        'With the Budget 2024 updates, the New Tax Regime offers standard deduction of ₹75,000 and full tax rebate up to ₹7.75 Lakhs total income. The Old Regime is beneficial only if your total eligible deductions (80C, 80D, HRA, Home Loan) exceed ₹3.75 to ₹4 Lakhs.',
    },
    {
      question: 'What is Section 87A rebate?',
      answer:
        'Under the New Tax Regime, resident individuals with taxable income up to ₹7 Lakhs receive a rebate under Section 87A that reduces their income tax liability to zero.',
    },
  ],
  'ltcg-calculator': [
    {
      question: 'What are the new Budget 2024 LTCG tax rules?',
      answer:
        'As per Budget 2024, Long Term Capital Gains on listed equities and equity mutual funds are taxed at 12.5% on gains exceeding ₹1.25 Lakhs per financial year. Short-term capital gains (STCG) on equity are taxed at 20%.',
    },
  ],
  'gst-calculator': [
    {
      question: 'What is the difference between CGST, SGST, and IGST?',
      answer:
        'For sales within the same state (Intra-state), GST is split equally between CGST (Central) and SGST (State). For sales across state borders (Inter-state), 100% of the tax is collected as IGST (Integrated GST).',
    },
  ],
  'gstr3b-interest-calculator': [
    {
      question: 'How is interest on delayed GSTR-3B calculated?',
      answer:
        'Under Section 50(1) of the CGST Act, interest at 18% p.a. is calculated only on the net tax liability paid through the Electronic Cash Ledger for each day of delay beyond the statutory 20th due date.',
    },
  ],
  'tax-saving-calculator': [
    {
      question: 'What are the best tax saving investment options in India?',
      answer:
        'Key instruments include ELSS Mutual Funds (lowest 3-year lock-in with equity returns), PPF (7.1% EEE tax-free), NPS (extra ₹50K under 80CCD), Term Insurance, and Health Insurance under 80D.',
    },
  ],
  'salary-calculator': [
    {
      question: 'Why is my take-home salary less than my CTC?',
      answer:
        'CTC includes non-cash benefits and employer contributions. Deductions like Employee EPF (12%), Employer EPF (12%), Professional Tax (₹200/mo), and estimated monthly TDS are subtracted before arriving at your in-hand bank credit.',
    },
  ],
  'discount-calculator': [
    {
      question: 'How do I calculate percentage discount?',
      answer:
        'Discount % = [(Original Price - Sale Price) / Original Price] × 100.',
    },
  ],
};
