"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useCreateContactMessageMutation } from "@/lib/store/api/contactApi";
import { useToast } from "@/components/ui/Toast";
import type { RootState } from "@/lib/store/store";

export function ContactForm() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [createContactMessage, { isLoading }] = useCreateContactMessageMutation();

  const [localEmail, setLocalEmail] = useState("");
  const [message, setMessage] = useState("");

  const email = user?.email || localEmail;

  const handleContactSubmit = async () => {
    if (!user) {
      showToast("Please log in to contact support.", "error");
      router.push("/auth");
      return;
    }
    if (!email || !message) {
      showToast("Please fill out both email and message.", "error");
      return;
    }
    try {
      await createContactMessage({ email, message }).unwrap();
      showToast("Message sent successfully!");
      if (!user?.email) {
        setLocalEmail("");
      }
      setMessage("");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } } | null;
      showToast(error?.data?.message || "Failed to send message", "error");
    }
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-12 bg-slate-50">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-extrabold text-[#0A1628] mb-3">Get in touch</h2>
        <p className="text-sm text-slate-500 mb-8">
          Have questions or want early access to upcoming products?
        </p>
        <div className="flex flex-col gap-3">
          <input 
            placeholder="Your email address" 
            type="email"
            value={email}
            onChange={(e) => setLocalEmail(e.target.value)}
            readOnly={!!user?.email}
            className={`w-full px-4 py-3 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm bg-white outline-none transition-colors ${
              user?.email ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
            }`}
          />
          <textarea 
            placeholder="Your message" 
            rows={4} 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm bg-white outline-none resize-none transition-colors"
          />
          <button 
            onClick={handleContactSubmit}
            disabled={isLoading}
            className="w-full py-3 bg-[#0A1628] hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-70"
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </section>
  );
}
