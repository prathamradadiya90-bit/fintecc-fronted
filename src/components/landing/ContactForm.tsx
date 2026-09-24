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
    <section className="py-20 relative bg-[#070A11] border-t border-white/5" data-purpose="contact-form" id="contact">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Get in touch</h2>
          <p className="text-slate-400 text-sm">Have questions or want early access to upcoming modules?</p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleContactSubmit}>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
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
                className={`w-full px-4 py-3 bg-[#0B111E] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-colors ${
                  user?.email ? "opacity-75 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
                htmlFor="contact-message"
              >
                Your message
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your firm size, required features, or custom bank format needs..."
                className="w-full px-4 py-3 bg-[#0B111E] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-emerald-500/50 transition-all text-sm flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Direct support: <strong className="text-slate-300">support@fintecc.in</strong>
              </span>
            </div>
            <span>Mon–Sat • 9:30 AM to 7:00 PM IST</span>
          </div>
        </div>
      </div>
    </section>
  );
}
