import React from "react";
import { useApp } from "../context/AppContext";
import {
  Flame,
  ShieldCheck,
  Smartphone,
  Monitor,
  ShieldAlert,
  LogOut,
  Bot,
  Receipt,
  Sparkles,
  Clock,
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    isMobileFrame,
    setIsMobileFrame,
    setIsSafetyModalOpen,
    setIsSupportChatOpen,
    setIsTransactionsModalOpen,
    setActiveTab,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#0d0f17]/95 backdrop-blur-md border-b border-[#1f2433] px-3.5 py-2.5 select-none">
      {/* Brand & Action Bar */}
      <div className="flex items-center justify-between">
        {/* Brand Logo - Returns to home */}
        <div
          id="brand-logo"
          className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform"
          onClick={() => setActiveTab("home")}
          title="RAY SHOP"
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-gaming font-bold tracking-wider text-base text-white">
                RAY <span className="text-red-500">SHOP</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/70 text-red-400 border border-red-800/50 font-gaming">
                FF
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight -mt-0.5">
              Free Fire Escrow Market
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Support Button (Gemini) */}
          <button
            id="header-support-chat-btn"
            onClick={() => setIsSupportChatOpen(true)}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 text-purple-300 border border-purple-500/40 text-xs font-bold font-gaming transition-all shadow-sm active:scale-95"
            title="Ask RAY Support AI (Gemini)"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Support</span>
            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
          </button>

          {/* Track Transactions Button */}
          <button
            id="header-track-transactions-btn"
            onClick={() => setIsTransactionsModalOpen(true)}
            className="flex items-center gap-1 py-1 px-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 hover:from-emerald-900/80 hover:to-teal-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-gaming transition-all shadow-sm active:scale-95"
            title="Track Transactions (Pending / Confirmed)"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Track</span>
          </button>

          {/* Active User Display */}
          {currentUser && (
            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-1.5 bg-[#141724] hover:bg-[#1b2032] border border-[#23293d] hover:border-red-500/40 rounded-xl px-2 py-1 text-xs transition-colors cursor-pointer"
              title="View Profile & Change Avatar"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-5 h-5 rounded-full object-cover border border-red-500/40"
              />
              <span className="max-w-[70px] sm:max-w-[85px] truncate font-gaming font-bold text-white text-[11px]">
                {currentUser.username}
              </span>
              {currentUser.isVerifiedSeller && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
            </button>
          )}

          {/* Escrow Safety Guide Button */}
          <button
            id="safety-guide-btn"
            onClick={() => setIsSafetyModalOpen(true)}
            className="p-1.5 rounded-xl bg-[#161926] hover:bg-[#1f2438] text-gray-300 hover:text-red-400 border border-[#272e42] transition-colors"
            title="Escrow Safety Protocol"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </button>

          {/* Mobile Chassis Toggle */}
          <button
            id="toggle-frame-btn"
            onClick={() => setIsMobileFrame((prev) => !prev)}
            className="p-1.5 rounded-xl bg-[#161926] hover:bg-[#1f2438] text-gray-300 border border-[#272e42] transition-colors hidden md:flex items-center"
            title={isMobileFrame ? "Expand to full responsive view" : "Switch to mobile frame view"}
          >
            {isMobileFrame ? (
              <Monitor className="w-4 h-4 text-gray-300" />
            ) : (
              <Smartphone className="w-4 h-4 text-red-400" />
            )}
          </button>

          {/* Log Out Button */}
          <button
            id="header-logout-btn"
            onClick={logout}
            className="p-1.5 rounded-xl bg-[#161926] hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-[#272e42] hover:border-red-800/60 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

