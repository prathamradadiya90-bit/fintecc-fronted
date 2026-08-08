"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useCreateContactMessageMutation } from "@/lib/store/api/contactApi";
import { useToast } from "@/components/ui/Toast";
import type { RootState } from "@/lib/store/store";

export default function ContactPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [createContactMessage, { isLoading }] = useCreateContactMessageMutation();
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      showToast("Please fill out both fields.", "error");
      return;
    }

    try {
      await createContactMessage({ email, message }).unwrap();
      showToast("Your message has been sent successfully!");
      if (!user?.email) {
        setEmail("");
      }
      setMessage("");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to send message.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="p-6" style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-subtle)' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Contact Support</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Have a question, feedback, or need help? Send us a message and we'll get back to you shortly.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-on-card)' }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              readOnly={!!user?.email}
              className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors ${user?.email ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                background: user?.email ? 'var(--color-bg-subtle)' : 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-on-card)' }}>
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
              className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#0A1628] hover:bg-slate-800 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-70 flex items-center justify-center min-w-[140px]"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
