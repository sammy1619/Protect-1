import React from "react";
import { useApp } from "../context/AppContext";
import { Home, Store, PlusCircle, MessageSquare, User as UserIcon, ShieldAlert } from "lucide-react";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadMessagesCount, currentUser } = useApp();

  const isVerifiedSeller = currentUser?.isVerifiedSeller || currentUser?.role === "admin";

  return (
    <nav className="sticky bottom-0 z-30 bg-[#0c0e15]/95 backdrop-blur-lg border-t border-[#1c2130] px-3 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Home */}
        <button
          id="nav-home"
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-colors py-1 px-2.5 rounded-xl ${
            activeTab === "home"
              ? "text-red-500 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeTab === "home" ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Marketplace */}
        <button
          id="nav-marketplace"
          onClick={() => setActiveTab("marketplace")}
          className={`flex flex-col items-center gap-1 transition-colors py-1 px-2.5 rounded-xl ${
            activeTab === "marketplace"
              ? "text-red-500 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Store className={`w-5 h-5 transition-transform ${activeTab === "marketplace" ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Market</span>
        </button>

        {/* Sell (Verified Gated) */}
        <button
          id="nav-sell"
          onClick={() => setActiveTab("sell")}
          className={`relative flex flex-col items-center gap-1 transition-colors py-1 px-2.5 rounded-xl ${
            activeTab === "sell"
              ? "text-red-500 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <div className="relative">
            <PlusCircle className={`w-5 h-5 transition-transform ${activeTab === "sell" ? "scale-110" : ""}`} />
            {!isVerifiedSeller && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-[#0c0e15]" title="Verification Required" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Sell</span>
        </button>

        {/* Messages */}
        <button
          id="nav-messages"
          onClick={() => setActiveTab("messages")}
          className={`relative flex flex-col items-center gap-1 transition-colors py-1 px-2.5 rounded-xl ${
            activeTab === "messages"
              ? "text-red-500 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 transition-transform ${activeTab === "messages" ? "scale-110" : ""}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#0c0e15] shadow-sm animate-pulse">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Messages</span>
        </button>

        {/* Profile */}
        <button
          id="nav-profile"
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 transition-colors py-1 px-2.5 rounded-xl ${
            activeTab === "profile"
              ? "text-red-500 font-semibold"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <UserIcon className={`w-5 h-5 transition-transform ${activeTab === "profile" ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
