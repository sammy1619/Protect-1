import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import {
  X,
  ShieldCheck,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  FileCheck,
  Smartphone,
} from "lucide-react";

export const PurchaseModal: React.FC = () => {
  const {
    selectedListing,
    setSelectedListing,
    isPurchaseModalOpen,
    setIsPurchaseModalOpen,
    showToast,
    refreshOrders,
    refreshListings,
    setActiveChatId,
    setActiveTab,
    currentUser,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<"PalmPay" | "OPay">("PalmPay");
  const [copied, setCopied] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  if (!isPurchaseModalOpen || !selectedListing) return null;

  const price = selectedListing.price;
  const currentAccountNumber = paymentMethod === "PalmPay" ? "7067252385" : "8081885757";

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(currentAccountNumber);
    setCopied(true);
    showToast(`${paymentMethod} Account Number (${currentAccountNumber}) copied!`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image receipt (JPG/PNG)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReceiptUrl(reader.result);
        showToast("Payment receipt screenshot loaded!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPurchase = async () => {
    if (!currentUser) {
      showToast("Please log in to place an escrow order", "error");
      return;
    }
    if (!receiptUrl.trim()) {
      showToast("Please upload your transfer payment receipt before proceeding", "error");
      return;
    }
    if (!agreedTerms) {
      showToast("Please accept the escrow terms to continue", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createOrder({
        listingId: selectedListing.id,
        paymentMethod,
        accountNumberPaid: currentAccountNumber,
        receiptUrl: receiptUrl.trim(),
        receiptNotes: receiptNotes.trim(),
      });

      showToast(`Order #${res.order.id} submitted! Status: PENDING seller review.`, "success");
      setIsPurchaseModalOpen(false);
      setSelectedListing(null);
      await Promise.all([refreshOrders(), refreshListings()]);

      // Switch to transaction chat to track status
      setActiveChatId(res.chatId);
      setActiveTab("messages");
    } catch (err: any) {
      showToast(err.message || "Failed to create order", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="purchase-checkout-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsPurchaseModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-[#0f121e] border border-[#262c42] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f253a] bg-[#121524]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                RAY Escrow Checkout
              </h3>
              <p className="text-[10px] text-gray-400">PalmPay & OPay Transfer with Receipt</p>
            </div>
          </div>
          <button
            onClick={() => setIsPurchaseModalOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1b2032] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Item Preview */}
          <div className="flex gap-3 p-3 rounded-2xl bg-[#131726] border border-[#21273e]">
            <img
              src={selectedListing.images[0]}
              alt={selectedListing.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#2e3752]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/40 uppercase">
                  {selectedListing.rank} • LVL {selectedListing.level}
                </span>
                <span className="text-[9px] font-bold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/40 uppercase">
                  UID {selectedListing.freeFireUid}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white line-clamp-1 mt-1">
                {selectedListing.title}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-gray-400">
                  Seller: <span className="text-gray-200 font-medium">@{selectedListing.sellerUsername}</span>
                </p>
                <span className="text-sm font-bold font-gaming text-emerald-400">
                  ₦{price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector: PalmPay & OPay */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block">
              1. Choose Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* PalmPay Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod("PalmPay")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  paymentMethod === "PalmPay"
                    ? "bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-white"
                    : "bg-[#141827] border-[#22283e] text-gray-400 hover:bg-[#1a2034]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400 font-bold text-xs">
                    P
                  </div>
                  {paymentMethod === "PalmPay" && (
                    <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-gray-100">PalmPay</div>
                <div className="text-[10px] text-purple-300 font-mono font-bold mt-0.5">
                  7067252385
                </div>
              </button>

              {/* OPay Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod("OPay")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  paymentMethod === "OPay"
                    ? "bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white"
                    : "bg-[#141827] border-[#22283e] text-gray-400 hover:bg-[#1a2034]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    O
                  </div>
                  {paymentMethod === "OPay" && (
                    <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-gray-100">OPay</div>
                <div className="text-[10px] text-emerald-300 font-mono font-bold mt-0.5">
                  8081885757
                </div>
              </button>
            </div>
          </div>

          {/* Account Transfer Card with Copy Button */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#141827] to-[#121623] border border-[#232a42] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-300 uppercase font-gaming">
                Official {paymentMethod} Account Details
              </span>
              <span className="text-[10px] text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded-full border border-red-900/40">
                Amount: ₦{price.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#0b0e17] p-2.5 rounded-xl border border-[#1f253a]">
              <div>
                <div className="text-[10px] text-gray-400">Account Number:</div>
                <div className="text-sm font-mono font-bold text-white tracking-wider">
                  {currentAccountNumber}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Account Name: <strong className="text-gray-200">RAY SHOP ESCROW</strong> ({paymentMethod})
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-[#1f253a] hover:bg-[#2b334e] text-xs font-semibold text-white transition-colors border border-gray-700 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Open your {paymentMethod} app, transfer <strong className="text-white">₦{price.toLocaleString()}</strong> to <strong className="text-white">{currentAccountNumber}</strong>, take a screenshot of your transfer receipt, and attach it below.
            </p>
          </div>

          {/* Receipt Upload Section (Mandatory) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-red-400" />
                <span>2. Upload Payment Receipt *</span>
              </label>
              <span className="text-[10px] text-red-400 font-bold">Mandatory</span>
            </div>

            {/* Drag/Drop or Select Box */}
            <div className="relative border-2 border-dashed border-[#2d354f] hover:border-red-500/60 rounded-2xl p-3.5 bg-[#121524] transition-colors text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {receiptUrl ? (
                <div className="flex items-center gap-3 text-left">
                  <img
                    src={receiptUrl}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded-xl border border-emerald-500/50 shadow-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      Receipt Attached
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                      Click or drag to replace screenshot
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400 mb-1.5">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-white">Click or Drag & Drop Transfer Receipt</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG screenshot of {paymentMethod}</p>
                </div>
              )}
            </div>

            {/* Optional URL or note */}
            <input
              type="text"
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              placeholder="Optional: Sender Name or Transaction Reference (e.g. John Doe / REF1293)"
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status workflow notice */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200/90 leading-relaxed">
            <strong className="text-amber-400 font-bold block mb-0.5">How Verification Works:</strong>
            1. Your order enters <strong className="text-white">Pending</strong> upon receipt submission.
            <br />
            2. The seller inspects your transfer receipt and clicks <strong className="text-white">"Approve / Seen"</strong>.
            <br />
            3. Order becomes <strong className="text-white">Confirmed</strong>, and login credentials are automatically unlocked.
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] text-gray-300">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-600 bg-gray-900 text-red-600 focus:ring-red-500 accent-red-600"
            />
            <span>
              I have sent ₦{price.toLocaleString()} to {paymentMethod} ({currentAccountNumber}) and attached my legitimate transaction receipt.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e2437] bg-[#111422] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPurchaseModalOpen(false)}
            className="py-2.5 px-4 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-purchase-btn"
            disabled={isSubmitting || !receiptUrl}
            onClick={handleConfirmPurchase}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold font-gaming rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Submit Receipt & Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
