import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import {
  X,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";

export const VerificationModal: React.FC = () => {
  const {
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    currentUser,
    refreshUser,
    showToast,
  } = useApp();

  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [reasonLetter, setReasonLetter] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVerificationModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast("Phone number is required", "error");
      return;
    }
    if (!email.trim()) {
      showToast("Email address is required", "error");
      return;
    }
    if (!reasonLetter.trim() || reasonLetter.trim().length < 15) {
      showToast("Please write a reasonable letter explaining why you want to be verified", "error");
      return;
    }
    if (!agreeTerms) {
      showToast("You must agree to the merchant code of conduct", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitVerification({
        phone: phone.trim(),
        email: email.trim(),
        reasonLetter: reasonLetter.trim(),
      });

      showToast("Verification application submitted! Admin will review your letter shortly.", "success");
      await refreshUser();
      setIsVerificationModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Failed to submit verification", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="verification-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsVerificationModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-[#0f121e] border border-[#262c42] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f253a] bg-[#121524]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                Seller Verification
              </h3>
              <p className="text-[10px] text-gray-400">Apply for Verified Merchant Badge</p>
            </div>
          </div>
          <button
            onClick={() => setIsVerificationModalOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1b2032] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Explicit No NIN Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-blue-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 font-bold block">No NIN Required</strong>
              <span className="text-[11px] text-gray-300">
                You do NOT need to upload your NIN or national ID card. Just provide your phone number, email, and a reasonable letter of intent below.
              </span>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider flex items-center gap-1.5 mb-1.5">
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span>Phone Number *</span>
            </label>
            <input
              id="verification-phone-input"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08081885757 or +234 706 725 2385"
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider flex items-center gap-1.5 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email Address *</span>
            </label>
            <input
              id="verification-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Reasonable Letter of why you want to be verified */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Letter of Intent (Reason for Verification) *</span>
              </label>
              <span className="text-[10px] text-gray-400">Min. 15 chars</span>
            </div>
            <textarea
              id="verification-letter-input"
              rows={4}
              required
              value={reasonLetter}
              onChange={(e) => setReasonLetter(e.target.value)}
              placeholder="Explain why you want to be verified on RAY SHOP (e.g. your Free Fire trading background, reliability, commitment to fast escrow delivery, and account quality)..."
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] text-gray-300 bg-[#141826] p-2.5 rounded-xl border border-[#20273c]">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-600 bg-gray-900 text-red-600 focus:ring-red-500 accent-red-600"
            />
            <span className="leading-snug">
              I certify that all account credentials I offer are authentic, free from 3rd-party claims, and will be transferred immediately upon buyer payment confirmation.
            </span>
          </label>

          {/* Submit Button */}
          <button
            id="submit-verification-request-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:brightness-110 active:scale-95 disabled:opacity-50 text-white text-xs font-bold font-gaming rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Letter...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Submit Verification Application</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
