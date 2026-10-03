import React from "react";
import Link from "next/link";
import { Kanban, Bell, Download, Hourglass, Lock } from "lucide-react";

interface FeatureItem {
  name: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const features: FeatureItem[] = [
  {
    name: "Kanban Task Board",
    href: "/dashboard/tasks",
    icon: Kanban,
    iconColor: "text-[#4A6FA5]",
    iconBg: "bg-[#4A6FA5]/10 border-[#4A6FA5]/20",
  },
  {
    name: "WhatsApp & Email Reminders",
    href: "/dashboard/campaigns",
    icon: Bell,
    iconColor: "text-[#9E6B42]",
    iconBg: "bg-[rgba(158,107,66,0.08)] border-[rgba(158,107,66,0.2)]",
  },
  {
    name: "GST Portal Auto-Fetch",
    href: "/dashboard/gst",
    icon: Download,
    iconColor: "text-[#3D7A64]",
    iconBg: "bg-[rgba(61,122,100,0.08)] border-[rgba(61,122,100,0.2)]",
  },
  {
    name: "Document & DSC Expiry Reminders",
    href: "/dashboard/dsc",
    icon: Hourglass,
    iconColor: "text-[#4A6FA5]",
    iconBg: "bg-[#A8C5DA]/20 border-[#A8C5DA]/40",
  },
  {
    name: "Secure Document Vault",
    href: "/dashboard/vault",
    icon: Lock,
    iconColor: "text-[#9E6B42]",
    iconBg: "bg-[rgba(158,107,66,0.08)] border-[rgba(158,107,66,0.2)]",
  },
];

export function FeatureStrip() {
  return (
    <section 
      className="relative z-20 bg-white border-y border-[#E2E8F0] shadow-xs" 
      data-purpose="feature-ribbon"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1E2A38] hover:text-[#4A6FA5] transition-all whitespace-nowrap shrink-0 group py-1"
                >
                  <div className={`w-7 h-7 rounded-lg border ${item.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.iconColor}`} />
                  </div>
                  <span className="tracking-tight group-hover:underline underline-offset-4 decoration-[#4A6FA5]/40">
                    {item.name}
                  </span>
                </Link>

                {/* Separator dot */}
                {idx < features.length - 1 && (
                  <span className="hidden xl:inline-block w-1 h-1 rounded-full bg-[#CBD5E1] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
