import React from "react";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { Hero } from "@/components/landing/Hero";
import { FeatureStrip } from "@/components/landing/FeatureStrip";
import { AutomationSteps } from "@/components/landing/AutomationSteps";
import { Products } from "@/components/landing/Products";
import { Pricing } from "@/components/landing/Pricing";
import { ContactForm } from "@/components/landing/ContactForm";

export default function Landing() {
  return (
    <div className="bg-[#F7F9FB] text-[#1E2A38] antialiased font-sans selection:bg-[#4A6FA5] selection:text-white relative overflow-x-hidden min-h-screen">
      {/* Ambient background glow elements */}
      <div className="fixed inset-0 pointer-events-none z-0 hero-glow-radial" />
      <div className="fixed -top-40 right-1/4 w-[550px] h-[550px] bg-[#4A6FA5]/6 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed top-1/2 -left-36 w-[500px] h-[500px] bg-[#A8C5DA]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* NAV */}
      <PublicNavbar />

      <main className="relative z-10">
        {/* HERO */}
        <Hero />

        {/* FEATURE STRIP (Below first section) */}
        <FeatureStrip />

        {/* 3 STEPS CA OFFICE AUTOMATION */}
        <AutomationSteps />

        {/* PRODUCTS / EVERYTHING YOUR CA FIRM NEEDS (Section-wise cards) */}
        <Products />

        {/* PRICING */}
        <Pricing />

        {/* CONTACT */}
        <ContactForm />
      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
