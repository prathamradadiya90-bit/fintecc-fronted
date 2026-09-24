import React from "react";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { Hero } from "@/components/landing/Hero";
import { Products } from "@/components/landing/Products";
import { About } from "@/components/landing/About";
import { Pricing } from "@/components/landing/Pricing";
import { ContactForm } from "@/components/landing/ContactForm";

export default function Landing() {
  return (
    <div className="dark bg-[#070A11] text-slate-200 antialiased font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden min-h-screen">
      {/* Ambient background glow elements */}
      <div className="fixed inset-0 pointer-events-none z-0 hero-glow-radial" />
      <div className="fixed -top-40 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* NAV */}
      <PublicNavbar />

      <main className="relative z-10">
        {/* HERO */}
        <Hero />

        {/* PRODUCTS SECTION */}
        <Products />

        {/* ABOUT / TRUST METRICS */}
        <About />

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
