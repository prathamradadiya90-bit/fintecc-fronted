"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useCreateContactMessageMutation } from "@/lib/store/api/contactApi";
import { useToast } from "@/components/ui/Toast";
import type { RootState } from "@/lib/store/store";
import { ArrowRight, Loader2 } from "lucide-react";

export function ContactForm() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [createContactMessage, { isLoading }] = useCreateContactMessageMutation();

  const [localEmail, setLocalEmail] = useState("");
  const [message, setMessage] = useState("");

  const email = user?.email || localEmail;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      showToast("Please fill out both email and message.", "error");
      return;
    }
    if (message.trim().length < 5) {
      showToast("Message must be at least 5 characters long.", "error");
      return;
    }
    try {
      await createContactMessage({ email: email.trim(), message: message.trim() }).unwrap();
      showToast("Thank you! Your message has been sent successfully. We will reach out shortly.");
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
    <section className="py-12 md:py-16 lg:py-20 relative bg-[#F7F9FB] border-t border-[#E2E8F0]" data-purpose="contact-form" id="contact">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 mb-2 shadow-xs">
            Contact
          </div>
          <h2 className="text-2xl font-bold text-[#1E2A38] tracking-tight mb-1.5">Get in touch</h2>
          <p className="text-[#5A6E85] text-xs sm:text-sm">Have questions or want early access to upcoming modules?</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-sm">
          <form className="space-y-3.5" onSubmit={handleContactSubmit}>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#1E2A38] mb-1.5"
                htmlFor="contact-email"
              >
                Your email address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setLocalEmail(e.target.value)}
                readOnly={!!user?.email}
                placeholder="ca.name@yourfirm.in"
                className={`w-full px-3.5 py-2.5 bg-[#F7F9FB] border border-[#E2E8F0] rounded-xl text-[#1E2A38] placeholder-[#8E9FAA] focus:outline-none focus:border-[#4A6FA5] focus:bg-white focus:ring-1 focus:ring-[#4A6FA5] text-sm transition-colors ${
                  user?.email ? "opacity-75 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#1E2A38] mb-1.5"
                htmlFor="contact-message"
              >
                Your message
              </label>
              <textarea
                id="contact-message"
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your firm size, required features, or custom bank format needs..."
                className="w-full px-3.5 py-2.5 bg-[#F7F9FB] border border-[#E2E8F0] rounded-xl text-[#1E2A38] placeholder-[#8E9FAA] focus:outline-none focus:border-[#4A6FA5] focus:bg-white focus:ring-1 focus:ring-[#4A6FA5] text-sm transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-5 rounded-xl font-semibold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] shadow-[0_4px_20px_rgba(74,111,165,0.25)] transition-all text-sm flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-xs text-[#5A6E85] gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3D7A64]" />
              <span>
                Direct support: <strong className="text-[#4A6FA5]">finteccsolutions@gmail.com</strong>
              </span>
            </div>
            <span>Mon–Sat • 9:30 AM to 7:00 PM IST</span>
          </div>
        </div>
      </div>
    </section>
  );
}
