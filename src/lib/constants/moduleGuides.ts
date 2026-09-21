export interface GuideStep {
  step: number;
  title: string;
  description: string;
  tip?: string;
}

export interface KeyFeature {
  title: string;
  description: string;
  tag?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ModuleGuide {
  id: string;
  routePrefix: string;
  title: string;
  tagline: string;
  category: string;
  overview: string;
  whereToStart: GuideStep[];
  keyFeatures: KeyFeature[];
  proTips: string[];
  faqs?: FaqItem[];
}

export const MODULE_GUIDES: Record<string, ModuleGuide> = {
  dashboard: {
    id: 'dashboard',
    routePrefix: '/dashboard',
    title: 'Firm Dashboard',
    tagline: 'High-level operational overview, firm metrics, and pending client alerts.',
    category: 'Practice Overview',
    overview:
      'The Dashboard is your daily command center. It gives partners and staff an instant summary of active clients, team member strength, recent uploads, and statutory compliance health across your CA firm.',
    whereToStart: [
      {
        step: 1,
        title: 'Review Top Metric Cards',
        description: 'Check Total Clients, active Staff Count, and converted documents to gauge daily capacity.',
        tip: 'Click any metric card to jump into its dedicated management section.',
      },
      {
        step: 2,
        title: 'Action Immediate Alerts',
        description: 'Inspect the DSC Token Tracker alert banner for digital signatures expiring within 30 days.',
      },
      {
        step: 3,
        title: 'Launch Quick Actions',
        description: 'Use the Quick Actions grid to create new clients, launch PDF-to-XML converters, or access financial calculators in 1 click.',
      },
      {
        step: 4,
        title: 'Inspect Recent Clients Table',
        description: 'Review recent client activity, filing statuses, and direct action shortcuts.',
      },
    ],
    keyFeatures: [
      {
        title: 'Metric Cards',
        description: 'Live counts for clients, verified staff, and converted PDFs synced in real-time.',
        tag: 'Analytics',
      },
      {
        title: 'DSC Expiry Widget',
        description: 'Automated warnings for client tokens nearing statutory expiration to prevent filing penalties.',
        tag: 'Compliance',
      },
      {
        title: 'AI Insights Banner',
        description: 'AI-generated operational observations highlighting due dates, bottlenecks, or pending returns.',
        tag: 'Fintecc AI',
      },
      {
        title: 'Recent Clients Roster',
        description: 'Fast access to recently modified client records with portal verification tags.',
        tag: 'Navigation',
      },
    ],
    proTips: [
      'Use the Fintecc AI widget at the bottom right to ask natural-language questions about any client or statutory deadline.',
      'Staff members see customized views corresponding to their assigned roles and tasks.',
    ],
    faqs: [
      {
        question: 'How do I add a new client quickly?',
        answer: 'Click the "+ Add New Client" button in the Quick Actions section on the dashboard.',
      },
      {
        question: 'Why does my client count not include archive files?',
        answer: 'The dashboard metric reflects active clients enrolled in your firm workspace only.',
      },
    ],
  },

  tasks: {
    id: 'tasks',
    routePrefix: '/dashboard/tasks',
    title: 'Work Board',
    tagline: 'End-to-end task assignment, progress tracking, Kanban/Grid boards, and Excel import.',
    category: 'Workflow & Practice',
    overview:
      'The Work Board is where your firm organizes audits, GST filings, ITR filings, and custom jobs. Assign tasks to specific accountants, enforce due dates, track priority, and import bulk client tasks seamlessly.',
    whereToStart: [
      {
        step: 1,
        title: 'Filter by Status or Assignee',
        description: 'Use the top filter bar to filter tasks by Assignee, Compliance Type (GST, ITR, TDS), or Status (Pending, In Progress, Done).',
      },
      {
        step: 2,
        title: 'Create or Import Tasks',
        description: 'Click "+ Add Task" for single jobs or "Import Excel" to mass-upload 50+ monthly compliance tasks at once.',
        tip: 'Download our pre-formatted Excel template for flawless bulk upload.',
      },
      {
        step: 3,
        title: 'Update Task Progress',
        description: 'Click directly on any task row or use the status dropdown to move tasks through verification stages.',
      },
      {
        step: 4,
        title: 'Perform Bulk Actions',
        description: 'Select multiple tasks via checkboxes to reassign staff, update due dates, or mark as completed in bulk.',
      },
    ],
    keyFeatures: [
      {
        title: 'Grid & Kanban Modes',
        description: 'Toggle between detailed spreadsheet-like table view and visual drag-and-drop Kanban columns.',
        tag: 'Views',
      },
      {
        title: 'Bulk Excel Importer',
        description: 'Upload client task lists with automatic column matching and validation checks.',
        tag: 'Automation',
      },
      {
        title: 'Role-Based Status Control',
        description: 'Junior staff can flag tasks as prepared while partners review and sign off as Done.',
        tag: 'Permissions',
      },
      {
        title: 'Statutory Due Date Flags',
        description: 'Visual color-coded tags highlighting overdue, urgent, and upcoming tasks.',
        tag: 'Alerts',
      },
    ],
    proTips: [
      'Filter by your name to view your personal daily work agenda instantly.',
      'Assign compliance categories like "GSTR-3B" so tasks automatically link with compliance reminders.',
    ],
    faqs: [
      {
        question: 'Can junior staff mark tasks as Done?',
        answer: 'Depending on your firm settings, junior staff mark tasks as "Ready for Review", allowing senior CAs to give final sign-off.',
      },
    ],
  },

  gst: {
    id: 'gst',
    routePrefix: '/dashboard/gst',
    title: 'GST Compliance Hub',
    tagline: 'GSTR-1, GSTR-3B filings, automated ITC 2B matching, and taxpayer health checks.',
    category: 'Taxation & Filing',
    overview:
      'Manage all GST registered clients in one centralized interface. Track return filing statuses, verify GSTR-2B Input Tax Credit reconciliation, and inspect turnover trends before statutory cutoffs.',
    whereToStart: [
      {
        step: 1,
        title: 'Select a Client',
        description: 'Pick the client whose GST records you wish to inspect using the top client selector.',
      },
      {
        step: 2,
        title: 'Choose Return Type & Period',
        description: 'Select GSTR-1, GSTR-3B, or GSTR-2B along with the target Financial Year and Return Month.',
      },
      {
        step: 3,
        title: 'Run ITC 2B Reconciliation',
        description: 'Compare purchase register ledgers against portal 2B data to catch missing ITC invoices.',
        tip: 'Flag mismatched vendors to send automated payment-hold notices.',
      },
      {
        step: 4,
        title: 'Export Filing Payload',
        description: 'Download audited JSON payloads ready for direct upload to the GSTN portal.',
      },
    ],
    keyFeatures: [
      {
        title: 'GSTR-2B vs Books Matcher',
        description: 'Algorithmically reconciles invoice numbers, tax amounts, and GSTINs with customizable tolerance.',
        tag: 'Reconciliation',
      },
      {
        title: 'Portal Status Checker',
        description: 'Fetches real-time filing status directly from the GSTN database.',
        tag: 'Verification',
      },
      {
        title: 'Filing Calendar & Penalties',
        description: 'Tracks monthly 11th, 13th, and 20th due dates with interest calculation previews.',
        tag: 'Compliance',
      },
    ],
    proTips: [
      'Complete 2B matching prior to the 18th of each month to leave buffer for vendor communications.',
      'Check the Client Vault if you need to fetch saved GST portal login credentials.',
    ],
  },

  itr: {
    id: 'itr',
    routePrefix: '/dashboard/itr',
    title: 'ITR Filing Workspace',
    tagline: 'Income tax returns computation, AIS/TIS comparison, and e-filing status.',
    category: 'Direct Tax',
    overview:
      'Streamlines personal and corporate income tax computations. Compare client financial ledgers with AIS/26AS, draft tax schedules, and maintain acknowledgment records for Assessment Years.',
    whereToStart: [
      {
        step: 1,
        title: 'Select Client & Assessment Year',
        description: 'Choose the taxpayer profile and the relevant Assessment Year (e.g., AY 2025-26).',
      },
      {
        step: 2,
        title: 'Ingest Financial Statements & 26AS',
        description: 'Import trial balance or bank statements alongside downloaded 26AS/AIS JSON data.',
      },
      {
        step: 3,
        title: 'Compute Tax under New vs Old Regime',
        description: 'Compare tax liabilities under Sec 115BAC (New Regime) versus Old Regime deductions (80C, 80D).',
        tip: 'The system highlights optimal tax saving opportunities automatically.',
      },
      {
        step: 4,
        title: 'Record ITR-V Acknowledgment',
        description: 'Once filed, upload the ITR-V acknowledgment number to mark the client task as compliant.',
      },
    ],
    keyFeatures: [
      {
        title: 'Regime Comparator',
        description: 'Side-by-side computation of tax liability under Old vs New Tax Regime.',
        tag: 'Tax Optimizer',
      },
      {
        title: 'AIS/26AS Matcher',
        description: 'Identifies high-value transactions, dividend payouts, and TDS discrepancies.',
        tag: 'Audit Defense',
      },
      {
        title: 'Acknowledgment Archive',
        description: 'Instant client certificate and ITR-V retrieval for loan applications and tenders.',
        tag: 'Documents',
      },
    ],
    proTips: [
      'Always reconcile interest income reported in AIS against Savings Bank certificates to prevent demand notices under Sec 143(1).',
    ],
  },

  tds: {
    id: 'tds',
    routePrefix: '/dashboard/tds',
    title: 'TDS Compliance & TRACES',
    tagline: 'Form 24Q, 26Q, 27Q processing, challan verification, and justification reports.',
    category: 'Withholding Tax',
    overview:
      'Track quarterly TDS deductions, verify challan payments on OLTAS/TIN-NSDL, generate returns (24Q/26Q/27Q), and detect late filing fees or interest under Section 201.',
    whereToStart: [
      {
        step: 1,
        title: 'Select Quarter & Deductor',
        description: 'Choose the client entity and the respective quarter (Q1, Q2, Q3, Q4).',
      },
      {
        step: 2,
        title: 'Verify Deductions & Challan Tagging',
        description: 'Ensure each deduction entry is matched to an active BSR-coded tax challan.',
      },
      {
        step: 3,
        title: 'Validate PAN Records',
        description: 'Run bulk PAN verification to identify inoperative or invalid PANs attracting 20% higher TDS.',
        tip: 'Section 206AA mandates higher deduction for non-linked PAN-Aadhaar accounts.',
      },
      {
        step: 4,
        title: 'Export FVU & Form 16/16A',
        description: 'Generate verified FVU files for submission and dispatch digital Form 16 certificates.',
      },
    ],
    keyFeatures: [
      {
        title: 'Challan Matching Engine',
        description: 'Automatic matching of challan CIN and amount with deductor line items.',
        tag: 'OLTAS',
      },
      {
        title: 'PAN Operative Validator',
        description: 'Bulk check to avoid short-deduction defaults prior to return submission.',
        tag: 'Sec 206AB',
      },
    ],
    proTips: [
      'Deposit monthly TDS by the 7th of the succeeding month to avoid compound interest charges of 1.5% p.m.',
    ],
  },

  'bank-statements': {
    id: 'bank-statements',
    routePrefix: '/dashboard/bank-statements',
    title: 'Bank Statement Automation & OCR',
    tagline: 'Convert scanned PDF bank statements into clean Excel sheets and Tally XML vouchers.',
    category: 'Automation & OCR',
    overview:
      'Eliminate manual data entry. Upload statement PDFs from 50+ Indian banks (HDFC, SBI, ICICI, Axis, PNB, etc.) to extract transactional ledgers, detect narration patterns, and generate accounting vouchers.',
    whereToStart: [
      {
        step: 1,
        title: 'Upload Bank PDF',
        description: 'Drag and drop statement files. Enter the PDF password if the statement is protected.',
      },
      {
        step: 2,
        title: 'Select Bank & Format',
        description: 'Choose the bank institution or allow our automated OCR parser to auto-detect columns.',
      },
      {
        step: 3,
        title: 'Review Extracted Rows',
        description: 'Verify starting/closing balances, deposit totals, and narration categorization.',
        tip: 'Use automated narration rules to tag repetitive UPI or vendor transactions.',
      },
      {
        step: 4,
        title: 'Export to Excel or Tally XML',
        description: 'Download spreadsheet summaries or push directly into Tally Prime via the sync bridge.',
      },
    ],
    keyFeatures: [
      {
        title: 'Password-Protected Support',
        description: 'Securely unlocks encrypted bank PDFs without storing passwords on servers.',
        tag: 'Security',
      },
      {
        title: '50+ Bank OCR Templates',
        description: 'Trained on all major national and private Indian bank statement layouts.',
        tag: 'High Accuracy',
      },
      {
        title: 'Tally Voucher Generator',
        description: 'Outputs standard Tally Prime Payment/Receipt XML files ready for batch import.',
        tag: 'Tally Ready',
      },
    ],
    proTips: [
      'Check that the calculated closing balance matches the statement summary before exporting to accounting software.',
    ],
  },

  dsc: {
    id: 'dsc',
    routePrefix: '/dashboard/dsc',
    title: 'DSC Token Tracker',
    tagline: 'Manage physical USB crypto tokens, client validity periods, and renewal reminders.',
    category: 'Token & Security',
    overview:
      'Avoid missed filing cutoffs caused by expired Digital Signature Certificates. Maintain a registry of client USB tokens, tracking cert types (Class 3), expiry dates, storage locations, and custody logs.',
    whereToStart: [
      {
        step: 1,
        title: 'Add Client Tokens',
        description: 'Click "+ Register Token" to enter client details, cert serial number, and expiration date.',
      },
      {
        step: 2,
        title: 'Track Location & Custody',
        description: 'Record whether the physical token is kept in office vault safe, with partner, or with client.',
        tip: 'Custody logs prevent lost tokens during peak audit and MCA filing seasons.',
      },
      {
        step: 3,
        title: 'Send Automated Renewal Notices',
        description: 'Trigger email/WhatsApp renewal notices to clients whose DSC expires within 30 days.',
      },
    ],
    keyFeatures: [
      {
        title: 'Color-Coded Expiry Badges',
        description: 'Green (>60 days), Amber (15-60 days), and Red (<15 days or expired).',
        tag: 'Alerts',
      },
      {
        title: 'Physical Location Tracker',
        description: 'Maintains exact drawer/shelf or person-in-charge custody records.',
        tag: 'Asset Control',
      },
    ],
    proTips: [
      'Prompt clients for renewal 20 days early to account for video KYC and paper verification lead times.',
    ],
  },

  'my-clients': {
    id: 'my-clients',
    routePrefix: '/dashboard/my-clients',
    title: 'My Clients Directory',
    tagline: 'Centralized master directory for client business entities, PANs, GSTINs, and contacts.',
    category: 'Client Relationship',
    overview:
      'The single source of truth for all clients registered with your practice. View compliance summaries, launch client vaults, invite them to the client portal, and organize by firm branches.',
    whereToStart: [
      {
        step: 1,
        title: 'Search or Filter Clients',
        description: 'Use the search bar to find clients by Trade Name, Legal Name, GSTIN, or PAN.',
      },
      {
        step: 2,
        title: 'Create Client Profile',
        description: 'Click "+ Add New Client" and provide company details, constitution (Pvt Ltd, LLP, Prop), and contacts.',
      },
      {
        step: 3,
        title: 'Enable Client Portal Access',
        description: 'Grant login credentials so clients can upload invoices and chat directly with your team.',
      },
      {
        step: 4,
        title: 'Access Client Sub-Modules',
        description: 'Click on any client card to inspect their documents, ledger vault, tasks, and historical returns.',
      },
    ],
    keyFeatures: [
      {
        title: 'Entity Verification Tags',
        description: 'Distinguishes between verified corporate clients, proprietors, and portal users.',
        tag: 'Verification',
      },
      {
        title: 'Branch Assignment',
        description: 'Organize clients across multiple firm branch offices for segmented team management.',
        tag: 'Branches',
      },
    ],
    proTips: [
      'Maintain an active primary email and phone number for automated statutory reminder broadcasts.',
    ],
  },

  vault: {
    id: 'vault',
    routePrefix: '/dashboard/vault',
    title: 'Client Password Vault',
    tagline: 'Zero-knowledge encrypted storage for GST, Income Tax, TRACES, MCA, and DGFT credentials.',
    category: 'Security & Credentials',
    overview:
      'Safely store and retrieve portal login credentials without sticky notes or plaintext spreadsheets. All passwords are encrypted with AES-256 and accessible only to authorized staff members.',
    whereToStart: [
      {
        step: 1,
        title: 'Select Client & Portal Type',
        description: 'Pick the client and portal destination (Income Tax, GSTN, TRACES, MCA/V3, DGFT).',
      },
      {
        step: 2,
        title: 'Save Login Credentials',
        description: 'Input portal username, password, and optional recovery hints.',
        tip: 'Click the "Copy" icon next to any credential to paste directly into government portals.',
      },
      {
        step: 3,
        title: 'Manage Staff Access',
        description: 'Restrict sensitive portal passwords to senior CAs or designated audit staff.',
      },
    ],
    keyFeatures: [
      {
        title: 'AES-256 Encryption',
        description: 'Industry-standard encryption ensuring credentials remain secure.',
        tag: 'Security',
      },
      {
        title: 'One-Click Copying',
        description: 'Copy usernames and masked passwords quickly without exposing text on screen.',
        tag: 'Productivity',
      },
    ],
    proTips: [
      'Always update passwords in the vault whenever government portals prompt for mandatory 90-day password resets.',
    ],
  },

  'tally-sync': {
    id: 'tally-sync',
    routePrefix: '/dashboard/tally-sync',
    title: 'Tally Prime Sync Bridge',
    tagline: 'Bi-directional synchronization between local Tally Prime installations and Fintecc cloud.',
    category: 'Accounting Sync',
    overview:
      'Connects your on-premise Tally Prime instance directly to the Fintecc cloud. Push bank transactions, client invoices, and journal entries straight into company ledgers without manual XML uploads.',
    whereToStart: [
      {
        step: 1,
        title: 'Download Desktop Agent',
        description: 'Install the lightweight Fintecc Tally Agent on the Windows machine running Tally Prime.',
      },
      {
        step: 2,
        title: 'Enter Sync Key & Port',
        description: 'Ensure Tally Prime is running on port 9000 with ODBC/XML enabled, then bind your firm sync key.',
        tip: 'Ensure Tally displays "Tally is listening on port 9000" in its status window.',
      },
      {
        step: 3,
        title: 'Select Target Company',
        description: 'Verify that the company open in Tally matches the client selected on the dashboard.',
      },
      {
        step: 4,
        title: 'Trigger Sync Job',
        description: 'Click "Start Sync" to transmit pending transactions and inspect the live sync status log.',
      },
    ],
    keyFeatures: [
      {
        title: 'Real-Time Sync Jobs Log',
        description: 'Monitors payload transmission, success counts, and error descriptions line-by-line.',
        tag: 'Observability',
      },
      {
        title: 'Ledger Auto-Mapping',
        description: 'Matches bank transaction descriptions to existing Tally ledger accounts automatically.',
        tag: 'Smart Mapping',
      },
    ],
    proTips: [
      'Keep Tally Prime in "Server/Host" mode to avoid timeout interruptions during large sync batches.',
    ],
  },

  invoices: {
    id: 'invoices',
    routePrefix: '/dashboard/invoices',
    title: 'Invoice & Fee Management',
    tagline: 'Client billing, retainer invoices, GST breakdown, payment status, and automated reminders.',
    category: 'Billing & Revenue',
    overview:
      'Professional invoicing built specifically for chartered accountancy practices. Create compliant tax invoices, manage recurring retainer billing, track payment receipts, and record TDS under Sec 194J.',
    whereToStart: [
      {
        step: 1,
        title: 'Create New Invoice',
        description: 'Click "+ Create Invoice" and select the client, service items (Audit, Filing, Consultation), and rate.',
      },
      {
        step: 2,
        title: 'Apply GST & TDS',
        description: 'System automatically applies CGST+SGST or IGST depending on client state, with Sec 194J TDS notes.',
      },
      {
        step: 3,
        title: 'Send PDF to Client',
        description: 'Download the certified invoice PDF or dispatch directly to the client portal with one click.',
      },
      {
        step: 4,
        title: 'Record Payment Receipt',
        description: 'Log received payments, bank reference numbers, and TDS deducted by client.',
      },
    ],
    keyFeatures: [
      {
        title: 'Section 194J TDS Tracking',
        description: 'Separately tracks professional fees receivable net of 10% TDS withholding.',
        tag: 'Tax Ready',
      },
      {
        title: 'Payment Status Badges',
        description: 'Color-coded tags for Paid, Partially Paid, Overdue, and Draft invoices.',
        tag: 'Cashflow',
      },
    ],
    proTips: [
      'Clients can view and download all historical invoices anytime via their secure Client Portal.',
    ],
  },

  mca: {
    id: 'mca',
    routePrefix: '/dashboard/mca',
    title: 'MCA Company Registry',
    tagline: 'Live corporate master data, director search, DIN status, and charges lookup.',
    category: 'Corporate Legal',
    overview:
      'Direct integration with Ministry of Corporate Affairs data. Search companies by CIN or name, review authorized and paid-up capital, inspect registered office addresses, and track active directors.',
    whereToStart: [
      {
        step: 1,
        title: 'Search by CIN or Name',
        description: 'Enter the 21-digit Corporate Identification Number (CIN) or company name in the search field.',
      },
      {
        step: 2,
        title: 'Inspect Company Profile',
        description: 'Review registration date, ROC jurisdiction, authorized capital, and last AGM/balance sheet filing dates.',
      },
      {
        step: 3,
        title: 'Examine Director Signatories',
        description: 'Check active DINs, appointment dates, and disqualification status under Section 164(2).',
      },
    ],
    keyFeatures: [
      {
        title: 'Real-time MCA Master Data',
        description: 'Direct pull of officially registered company profile data.',
        tag: 'Official Records',
      },
      {
        title: 'Director DIN Verification',
        description: 'Instant overview of other company directorships tied to each DIN.',
        tag: 'Due Diligence',
      },
    ],
    proTips: [
      'Verify the last AGM date to confirm if ROC annual returns (AOC-4 & MGT-7) have fallen overdue.',
    ],
  },

  roc: {
    id: 'roc',
    routePrefix: '/dashboard/roc',
    title: 'ROC Annual Filings',
    tagline: 'Annual compliance tracker for Private Limiteds, OPCs, and LLPs (AOC-4, MGT-7, Form 11).',
    category: 'Corporate Compliance',
    overview:
      'Manage corporate statutory annual obligations under the Companies Act 2013. Track due dates for financial statements (AOC-4), annual returns (MGT-7/7A), and LLP annual filings (Form 8 & Form 11).',
    whereToStart: [
      {
        step: 1,
        title: 'Filter by Company Type',
        description: 'Segment entities by Private Limited, Section 8, OPC, or LLP to view respective deadlines.',
      },
      {
        step: 2,
        title: 'Track AGM Completion',
        description: 'Record AGM date (statutorily within 6 months of FY end) which determines filing cutoffs.',
        tip: 'AOC-4 is due within 30 days of AGM; MGT-7 is due within 60 days of AGM.',
      },
      {
        step: 3,
        title: 'Update SRN & Challan Data',
        description: 'Record the Service Request Number (SRN) and upload MCA payment receipts upon filing.',
      },
    ],
    keyFeatures: [
      {
        title: 'Penalty Calculator',
        description: 'Estimates late filing fees of Rs 100/day under Section 403 for delayed returns.',
        tag: 'Penalty Guard',
      },
      {
        title: 'Filing Status Tracker',
        description: 'Tracks Pending, In-Preparation, Signed with DSC, and Approved on V3 portal.',
        tag: 'Workflow',
      },
    ],
    proTips: [
      'Ensure all director DSCs are registered on the MCA V3 portal well before the 30th October rush.',
    ],
  },

  notices: {
    id: 'notices',
    routePrefix: '/dashboard/notices',
    title: 'Notice Board & Defense',
    tagline: 'Track Income Tax, GST, and MCA notices, assign case owners, and monitor response deadlines.',
    category: 'Litigation & Defense',
    overview:
      'Manage statutory notices (IT Sec 143(1), 148, 142(1), GST DRC-01, DRC-07) with zero missed deadlines. Assign case officers, draft replies, attach legal annexures, and track hearing dates.',
    whereToStart: [
      {
        step: 1,
        title: 'Log New Notice',
        description: 'Click "+ Register Notice" and specify client, issuing authority, section, and date received.',
      },
      {
        step: 2,
        title: 'Set Statutory Response Deadline',
        description: 'Enter the response cutoff to trigger automated alerts 7 and 3 days prior to expiration.',
      },
      {
        step: 3,
        title: 'Assign Case Leader',
        description: 'Delegate reply preparation to a specialized tax associate or litigation partner.',
      },
      {
        step: 4,
        title: 'Archive Reply & Acknowledgment',
        description: 'Attach the filed response PDF and portal submission acknowledgment once submitted.',
      },
    ],
    keyFeatures: [
      {
        title: 'Statutory Section Taxonomy',
        description: 'Pre-configured with all common sections under Income Tax Act & CGST Act.',
        tag: 'Tax Law',
      },
      {
        title: 'Countdown Urgency Badges',
        description: 'Highlights critical deadlines expiring in less than 48 hours to avoid adverse orders.',
        tag: 'Urgent',
      },
    ],
    proTips: [
      'Always request an adjournment on the portal if additional client documentation is required beyond the deadline.',
    ],
  },

  staff: {
    id: 'staff',
    routePrefix: '/dashboard/staff',
    title: 'Staff Management',
    tagline: 'Firm team directory, role-based access, accountant invites, and branch assignments.',
    category: 'Team & Governance',
    overview:
      'Manage your firm team members, articled assistants, accountants, and senior partners. Configure permissions, invite staff via email, and allocate members across different firm branches.',
    whereToStart: [
      {
        step: 1,
        title: 'Invite Team Member',
        description: 'Click "+ Invite Staff" to enter their name, email, and assign an initial role.',
      },
      {
        step: 2,
        title: 'Configure Roles & Permissions',
        description: 'Select between FIRM_OWNER, SENIOR_CA, ACCOUNTANT, or EMPLOYEE to control module visibility.',
        tip: 'Junior staff cannot delete clients or mark audit tasks completed without partner review.',
      },
      {
        step: 3,
        title: 'Assign Firm Branch',
        description: 'If operating multiple physical offices, bind staff members to their respective branch.',
      },
    ],
    keyFeatures: [
      {
        title: 'Granular Role Control',
        description: 'Restricts sensitive client financial vaults and billing to authorized personnel.',
        tag: 'Security',
      },
      {
        title: 'One-Click Deactivation',
        description: 'Instantly revoke portal access when an employee or article departs the firm.',
        tag: 'Governance',
      },
    ],
    proTips: [
      'Keep your staff list updated so task assignments in the Work Board reflect active team capacity.',
    ],
  },

  attendance: {
    id: 'attendance',
    routePrefix: '/dashboard/attendance',
    title: 'Staff Attendance & Time Clock',
    tagline: 'Track daily clock-in/out times, leaves, working hours, and monthly payroll summaries.',
    category: 'Team Operations',
    overview:
      'Streamline article assistant and accountant time tracking. Staff members can clock in and out daily with optional notes, while firm administrators can inspect attendance records and approve leave requests.',
    whereToStart: [
      {
        step: 1,
        title: 'Daily Clock In/Out',
        description: 'Staff members click "Clock In" upon starting their work day and "Clock Out" when concluding.',
      },
      {
        step: 2,
        title: 'Filter by Month & Member',
        description: 'Select calendar months to review aggregate presence, half-days, and absences.',
      },
      {
        step: 3,
        title: 'Export Payroll Report',
        description: 'Download monthly attendance CSVs formatted for stipend and salary calculations.',
      },
    ],
    keyFeatures: [
      {
        title: 'Automatic Hours Calculator',
        description: 'Computes net daily working hours and flags overtime or short-hours automatically.',
        tag: 'Time Tracking',
      },
    ],
    proTips: [
      'Encourage articles to note their primary client engagement in daily clock-out notes for billable hour auditing.',
    ],
  },

  compliance: {
    id: 'compliance',
    routePrefix: '/dashboard/compliance',
    title: 'Statutory Compliance Calendar',
    tagline: 'Interactive calendar tracking Indian tax, corporate, labor, and audit statutory cutoffs.',
    category: 'Statutory Deadlines',
    overview:
      'Never miss a statutory deadline. Displays unified monthly due dates across Income Tax, GST, PF/ESI, MCA, and Advance Tax installments with color-coded statutory importance ratings.',
    whereToStart: [
      {
        step: 1,
        title: 'View Current Month Deadlines',
        description: 'Inspect the calendar grid for scheduled 7th (TDS), 11th (GSTR-1), 15th (PF/Advance Tax), and 20th (GSTR-3B) cutoffs.',
      },
      {
        step: 2,
        title: 'Filter by Act / Law',
        description: 'Toggle categories (GST, Income Tax, ROC, Labor Law) to view domain-specific obligations.',
      },
      {
        step: 3,
        title: 'Send Due Date Alerts',
        description: 'Click on any upcoming event to broadcast deadline reminders to all subscribed clients.',
      },
    ],
    keyFeatures: [
      {
        title: 'Live Indian Statutory Updates',
        description: 'Automatically updated whenever CBDT or CBIC notifies official due date extensions.',
        tag: 'Live Updates',
      },
    ],
    proTips: [
      'Bookmark critical dates 3 days in advance to prevent portal server downtime bottlenecks on cutoff evenings.',
    ],
  },
};

/**
 * Returns the module guide matching the active pathname, or a generic fallback guide.
 */
export function getModuleGuide(pathname: string): ModuleGuide {
  if (!pathname || pathname === '/dashboard') {
    return MODULE_GUIDES.dashboard;
  }

  // Remove leading/trailing slashes and split
  const cleanPath = pathname.replace(/^\/dashboard\/?/, '');
  const segment = cleanPath.split('/')[0];

  if (segment && MODULE_GUIDES[segment]) {
    return MODULE_GUIDES[segment];
  }

  // Generic fallback guide
  return {
    id: 'general',
    routePrefix: pathname,
    title: 'Module Workspace',
    tagline: 'Centralized workspace for your Chartered Accountancy practice operations.',
    category: 'Workspace Guide',
    overview:
      'This module is designed to streamline client management, compliance filing, and firm operations. Use the tools below to review records, update details, or export certified reports.',
    whereToStart: [
      {
        step: 1,
        title: 'Review Active Records',
        description: 'Check the data table or cards on this page to inspect current entries.',
      },
      {
        step: 2,
        title: 'Use Search & Filters',
        description: 'Narrow down records using client names, dates, or status filters.',
      },
      {
        step: 3,
        title: 'Execute Primary Action',
        description: 'Use the primary action buttons in the top-right toolbar to create, import, or export data.',
      },
    ],
    keyFeatures: [
      {
        title: 'Data Filtering & Export',
        description: 'Easily filter records and export clean reports for clients or statutory authorities.',
        tag: 'Data Control',
      },
      {
        title: 'Fintecc AI Integration',
        description: 'Ask Fintecc AI at any time if you have questions regarding procedures or compliance guidelines.',
        tag: 'Assistance',
      },
    ],
    proTips: [
      'Use the Fintecc AI chatbot in the bottom right corner for immediate answers to complex compliance questions.',
    ],
  };
}
