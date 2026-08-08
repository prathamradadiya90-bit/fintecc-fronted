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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* NAV */}
      <PublicNavbar />

      {/* HERO */}
      <Hero />

      {/* PRODUCTS SECTION */}
      <Products />

      {/* ABOUT */}
      <About />

      {/* PRICING */}
      <Pricing />

      {/* CONTACT */}
      <ContactForm />

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
