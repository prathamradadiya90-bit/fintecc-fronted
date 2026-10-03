"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Landmark, 
  ReceiptText, 
  ArrowRight, 
  Kanban, 
  Repeat, 
  CheckSquare, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Building2, 
  Calculator, 
  ShieldCheck, 
  FileStack, 
  FileWarning, 
  RefreshCw, 
  Wallet, 
  ShoppingBag, 
  Users, 
  KeyRound, 
  Key, 
  Megaphone, 
  FileText, 
  UserPlus, 
  Shield, 
  Sparkles,
  Layers
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "live" | "popular" | "automated" | "audit";
  tags: string[];
}

interface FeatureSection {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  description: string;
  cards: FeatureCard[];
}

const featureSections: FeatureSection[] = [
  {
    id: "tasks",
    name: "Task & Workflow Management",
    shortName: "Tasks & Workflow",
    icon: Kanban,
    description: "Organize, assign, and track every client return, internal review, and recurring statutory due date.",
    cards: [
      {
        title: "Kanban Task Board",
        description: "Visualize work across stages — Todo, In Progress, Review, Done. Drag-and-drop cards filtered by client, staff member, or return type.",
        icon: Kanban,
        href: "/dashboard/tasks",
        badge: "Core Workflow",
        badgeVariant: "popular",
        tags: ["Drag & Drop", "Client Filter", "Stage Columns"],
      },
      {
        title: "Automated Recurring Tasks",
        description: "Set once, run on schedule. Tasks auto-create for GST, TDS, and ITR deadlines with automated staff assignments and recurrence intervals.",
        icon: Repeat,
        href: "/dashboard/tasks",
        badge: "Automated",
        badgeVariant: "automated",
        tags: ["Statutory Recurrence", "Zero-Manual Setup", "Due Date Sync"],
      },
      {
        title: "Maker-Checker Review Pipeline",
        description: "The review workflow CA firms require: articles prepare, seniors review, and partners sign off. Rejected tasks return with detailed review notes.",
        icon: CheckSquare,
        href: "/dashboard/approvals",
        badge: "Quality Control",
        badgeVariant: "audit",
        tags: ["Partner Sign-Off", "Notes & Audit", "Role Pipeline"],
      },
      {
        title: "Compliance Calendar & Due Dates",
        description: "Unified statutory compliance calendar tracking CBDT, GSTN, and MCA filing deadlines with proactive alert triggers for your team.",
        icon: Calendar,
        href: "/dashboard/compliance",
        badge: "Calendar",
        badgeVariant: "popular",
        tags: ["CBDT & GSTN", "Escalation Alerts", "Firm View"],
      },
      {
        title: "Staff Timesheets & Capacity Logs",
        description: "Staff log time against clients and specific returns Jira-style. See billable vs non-billable hours and allocate capacity before busy seasons.",
        icon: Clock,
        href: "/dashboard/attendance",
        tags: ["Jira-Style Logs", "Billable Hours", "Resource Planning"],
      },
      {
        title: "Task Discussions & Attachments",
        description: "Discuss returns directly inside the task card. Threaded comments, @mentions, and quick attachments for challans and portal screenshots.",
        icon: MessageSquare,
        href: "/dashboard/chat",
        tags: ["@Mentions", "Challan Uploads", "File History"],
      },
    ],
  },
  {
    id: "compliance",
    name: "Tax & Statutory Compliance",
    shortName: "Tax & Compliance",
    icon: Building2,
    description: "Built-in compliance engines tailored specifically for Indian direct and indirect tax governance.",
    cards: [
      {
        title: "GST Compliance & 2B Auto-Reconciliation",
        description: "Track GSTR-1 and GSTR-3B filing cycles. Auto-match purchase registers against GSTR-2B JSON with instant ITC mismatch detection.",
        icon: Building2,
        href: "/dashboard/gst",
        badge: "2B Engine",
        badgeVariant: "live",
        tags: ["GSTR-1 & 3B", "GSTR-2B Matching", "ITC Discrepancies"],
      },
      {
        title: "Income Tax & ITR Filing Register",
        description: "Track ITR-1 through ITR-7 filings, computations, e-filing acknowledgments, and refund statuses in one unified client register.",
        icon: ReceiptText,
        href: "/dashboard/itr",
        tags: ["ITR 1-7 Tracker", "Acknowledgement Vault", "Refund Tracking"],
      },
      {
        title: "TDS & TCS Compliance Register",
        description: "Form 24Q, 26Q, and 27Q processing, challan ITNS 281 tracking, Section 194 matching, and quarterly return deadline management.",
        icon: Calculator,
        href: "/dashboard/tds",
        tags: ["24Q / 26Q / 27Q", "Challan Matching", "Deduction Schedules"],
      },
      {
        title: "UDIN Register & Verification",
        description: "Generate and maintain a searchable register of Unique Document Identification Numbers for tax audits, GST audits, and attestations.",
        icon: ShieldCheck,
        href: "/dashboard/udin",
        badge: "ICAI Standard",
        badgeVariant: "audit",
        tags: ["Audit Register", "Fast Copy & Search", "Compliance Trail"],
      },
      {
        title: "MCA Registry & ROC Filings",
        description: "Company master data lookups, annual filings (AOC-4, MGT-7), DIR-3 KYC tracking, and statutory registers for private limited entities.",
        icon: FileStack,
        href: "/dashboard/roc",
        tags: ["AOC-4 / MGT-7", "Director KYC", "Company Master Search"],
      },
      {
        title: "Statutory Notice Management",
        description: "Track Section 143(1), 148, or GST ASMT-10 notices with scheduled hearing dates, draft replies, and escalation timelines.",
        icon: FileWarning,
        href: "/dashboard/notices",
        tags: ["Hearing Calendar", "Draft Responses", "Notice Archive"],
      },
    ],
  },
  {
    id: "converters",
    name: "Smart Converters & Accounting Engines",
    shortName: "Converters & Tools",
    icon: Calculator,
    description: "Proprietary AI and parsing engines that convert hours of manual data entry into instant structured exports.",
    cards: [
      {
        title: "Bank Statement Converter",
        description: "Upload any PDF bank statement and get clean, structured Excel and Tally XML in seconds. Supports 1000+ Indian banks with automated contra detection.",
        icon: Landmark,
        href: "/dashboard/converters?type=bank",
        badge: "Live v2.4",
        badgeVariant: "live",
        tags: ["1000+ Banks", "Tally XML", "Password Unlock"],
      },
      {
        title: "Tax Invoice Converter",
        description: "Extract line items, GSTIN, and tax amounts from scanned or digital invoices. Auto-splits CGST, SGST, and IGST for GST reconciliation.",
        icon: ReceiptText,
        href: "/dashboard/converters?type=tax",
        badge: "Live v2.4",
        badgeVariant: "live",
        tags: ["OCR Line Items", "Tax Splits", "Batch Processing"],
      },
      {
        title: "Bi-directional Tally Sync",
        description: "Export parsed bank entries and invoices directly into TallyPrime and Tally ERP 9 with proper ledger mapping and zero manual re-entry.",
        icon: RefreshCw,
        href: "/dashboard/tally-sync",
        tags: ["TallyPrime", "Tally ERP 9", "XML Ledger Mapping"],
      },
      {
        title: "Petty Cash & Voucher Manager",
        description: "Digital voucher capture, receipt uploads via mobile, daily cash balance reconciliations, and instant partner approvals.",
        icon: Wallet,
        href: "/dashboard/petty-cash",
        tags: ["Digital Receipts", "Voucher Log", "Approval System"],
      },
      {
        title: "Statutory CA Calculators",
        description: "Interactive calculators for Advance Tax, Depreciation (Companies Act vs IT Act), Gratuity, Capital Gains, and EMI amortizations.",
        icon: Calculator,
        href: "/dashboard/calculators",
        tags: ["CBDT Rules", "Depreciation Matrix", "Instant Computations"],
      },
      {
        title: "E-Commerce Marketplace Reconciliation",
        description: "Reconcile Amazon, Flipkart, and Meesho settlement reports against bank receipts, TCS, and TDS deductions.",
        icon: ShoppingBag,
        href: "/dashboard/ecommerce",
        tags: ["Amazon & Flipkart", "TCS / TDS Audit", "Fee Reconciliation"],
      },
    ],
  },
  {
    id: "crm",
    name: "Client CRM & Security Vault",
    shortName: "Client CRM & Vault",
    icon: Users,
    description: "Bank-level encrypted client data, credential vaults, and automated multi-channel client communications.",
    cards: [
      {
        title: "Client Directory & Master Profile",
        description: "Single-pane view of every client with PAN, GSTIN, TAN, authorized signatories, billing ledger, and assigned staff members.",
        icon: Users,
        href: "/dashboard/my-clients",
        tags: ["Master Profile", "PAN/GSTIN Lookup", "Audit History"],
      },
      {
        title: "Client Credentials Vault",
        description: "Securely store GST, Income Tax, TRACES, and MCA portal passwords with AES-256 encryption and immutable staff access logs.",
        icon: KeyRound,
        href: "/dashboard/vault",
        badge: "AES-256 Encrypted",
        badgeVariant: "audit",
        tags: ["Zero-Knowledge Safe", "Access Logs", "Portal Logins"],
      },
      {
        title: "DSC Movement & Expiry Tracker",
        description: "Track physical USB token custody, key holder logs, and receive automated WhatsApp/Email warnings 30, 15, and 7 days before DSC expiry.",
        icon: Key,
        href: "/dashboard/dsc",
        badge: "Auto-Alerts",
        badgeVariant: "popular",
        tags: ["Token Custody", "Expiry Reminders", "Client Signature Log"],
      },
      {
        title: "WhatsApp & Email Broadcast Campaigns",
        description: "Send automated compliance due-date reminders, missing document requests, and payment follow-ups via WhatsApp and Email.",
        icon: Megaphone,
        href: "/dashboard/campaigns",
        badge: "WhatsApp API",
        badgeVariant: "live",
        tags: ["Bulk Reminders", "Payment Links", "Delivery Tracking"],
      },
      {
        title: "Secure Client Self-Service Portal",
        description: "Give clients dedicated access to upload requested documents, download filed returns, view fee invoices, and collaborate on queries.",
        icon: FileText,
        href: "/dashboard/portal",
        tags: ["Document Intake", "Invoice Archive", "Real-Time Query Chat"],
      },
      {
        title: "Leads Pipeline & Proposals",
        description: "Capture client inquiries, track proposals through stages, and convert accepted quotes into active client engagements in one click.",
        icon: UserPlus,
        href: "/dashboard/leads",
        tags: ["Lead Board", "Quote Conversion", "Client Intake"],
      },
    ],
  },
  {
    id: "firm",
    name: "Firm Administration & Team Management",
    shortName: "Firm Management",
    icon: Shield,
    description: "Manage partners, managers, and article assistants with fine-grained access control, attendance, and audit trails.",
    cards: [
      {
        title: "Role-Based Access Control",
        description: "Granular access tiers for Partners, Managers, Paid Staff, and Article Assistants to maintain strict client confidentiality.",
        icon: Shield,
        href: "/dashboard/staff",
        badge: "Granular RBAC",
        badgeVariant: "audit",
        tags: ["Staff Permissions", "Confidentiality", "Role Templates"],
      },
      {
        title: "Staff Attendance & Shift Logs",
        description: "Log daily office check-ins, field-duty visits, shift timings, overtime tracking, and leave management with one-click approvals.",
        icon: Clock,
        href: "/dashboard/attendance",
        tags: ["Shift Timings", "Field Duty Logs", "Leave Management"],
      },
      {
        title: "Partner Approvals Hub",
        description: "Single unified inbox for firm partners to approve task submissions, leave applications, fee quotes, and expense reimbursements.",
        icon: CheckSquare,
        href: "/dashboard/approvals",
        tags: ["One-Click Approval", "Expense Audits", "Queue Overview"],
      },
      {
        title: "Immutable Compliance Audit Logs",
        description: "Complete timestamped audit trail of all staff activities and file conversions adhering to ICAI code of ethics.",
        icon: ShieldCheck,
        href: "/dashboard/audit-logs",
        badge: "ICAI Compliant",
        badgeVariant: "audit",
        tags: ["Tamper-Proof Logs", "User Actions", "Security Oversight"],
      },
    ],
  },
];

export function Products() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const visibleSections = activeTab === "all" 
    ? featureSections 
    : featureSections.filter((sec) => sec.id === activeTab);

  const renderBadge = (badge?: string, variant?: "live" | "popular" | "automated" | "audit") => {
    if (!badge) return null;
    let badgeClasses = "bg-[#4A6FA5]/10 text-[#4A6FA5] border-[#4A6FA5]/25";
    if (variant === "live") {
      badgeClasses = "bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border-[rgba(61,122,100,0.2)]";
    } else if (variant === "popular") {
      badgeClasses = "bg-[rgba(158,107,66,0.08)] text-[#9E6B42] border-[rgba(158,107,66,0.2)]";
    } else if (variant === "automated") {
      badgeClasses = "bg-[#60A5FA]/10 text-[#3B82F6] border-[#3B82F6]/25";
    } else if (variant === "audit") {
      badgeClasses = "bg-[#4A6FA5]/10 text-[#4A6FA5] border-[#4A6FA5]/20";
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClasses} shrink-0`}>
        {variant === "live" && <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A64] animate-pulse" />}
        {badge}
      </span>
    );
  };

  return (
    <section 
      className="py-16 md:py-24 relative bg-white border-t border-[#E2E8F0]" 
      id="products"
      data-purpose="core-products-suite"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#4A6FA5]" />
            Complete Practice Suite
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2A38] tracking-tight mb-3">
            Everything your CA firm needs
          </h2>
          <p className="text-[#5A6E85] text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Purpose-built for Indian Chartered Accountants — from task automation and statutory filings to AI bank statement conversions and encrypted client vaults.
          </p>
        </div>

        {/* Category Navigation Pills / Filter Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-10">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-[#4A6FA5] text-white shadow-sm"
                : "bg-[#F7F9FB] text-[#5A6E85] hover:text-[#1E2A38] border border-[#E2E8F0] hover:border-[#4A6FA5]/40"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              All Capabilities
            </span>
          </button>

          {featureSections.map((sec) => {
            const SecIcon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#4A6FA5] text-white shadow-sm"
                    : "bg-[#F7F9FB] text-[#5A6E85] hover:text-[#1E2A38] border border-[#E2E8F0] hover:border-[#4A6FA5]/40"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <SecIcon className="w-3.5 h-3.5" />
                  {sec.shortName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section-Wise Card Layout */}
        <div className="space-y-14 md:space-y-16">
          {visibleSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id} className="relative">
                {/* Section Sub-Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-center text-[#4A6FA5] shrink-0">
                      <SectionIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#1E2A38] tracking-tight">
                        {section.name}
                      </h3>
                      <p className="text-xs text-[#5A6E85]">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#8E9FAA] uppercase tracking-wider pl-12 sm:pl-0">
                    {section.cards.length} Modules
                  </span>
                </div>

                {/* Section Cards Grid - ALL CARDS UNIFORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {section.cards.map((card) => {
                    const CardIcon = card.icon;

                    return (
                      <Link
                        key={card.title}
                        href={card.href}
                        className="group relative rounded-2xl flex flex-col justify-between bg-white border border-[#E2E8F0] hover:border-[#4A6FA5]/40 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="w-9 h-9 rounded-xl bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-center text-[#4A6FA5] group-hover:scale-105 transition-transform">
                              <CardIcon className="w-4.5 h-4.5" />
                            </div>
                            {renderBadge(card.badge, card.badgeVariant)}
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-[#1E2A38] mb-1.5 group-hover:text-[#4A6FA5] transition-colors">
                            {card.title}
                          </h4>
                          <p className="text-xs text-[#5A6E85] leading-relaxed mb-4">
                            {card.description}
                          </p>
                        </div>

                        {/* Feature Tags and Link Arrow */}
                        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {card.tags.slice(0, 2).map((tag) => (
                              <span 
                                key={tag}
                                className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F7F9FB] text-[#5A6E85] border border-[#E2E8F0]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-[#4A6FA5] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                            <span>Explore</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
