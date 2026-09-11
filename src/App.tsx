import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { HomeView } from "./components/HomeView";
import { MarketplaceView } from "./components/MarketplaceView";
import { SellView } from "./components/SellView";
import { ChatView } from "./components/ChatView";
import { ProfileView } from "./components/ProfileView";
import { ListingDetailModal } from "./components/ListingDetailModal";
import { PurchaseModal } from "./components/PurchaseModal";
import { VerificationModal } from "./components/VerificationModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { ReportModal } from "./components/ReportModal";
import { SafetyModal } from "./components/SafetyModal";
import { SupportChatModal } from "./components/SupportChatModal";
import { TransactionsModal } from "./components/TransactionsModal";
import { AuthGateView } from "./components/AuthGateView";
import { Flame } from "lucide-react";

const AppContent: React.FC = () => {
  const { activeTab, isAdminDashboardOpen, currentUser, isLoadingUser } = useApp();

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4">
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.5)] mb-4 animate-pulse">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <p className="font-gaming text-sm font-bold tracking-widest text-white">RAY SHOP</p>
        <p className="text-xs text-gray-500 mt-1">Connecting to Escrow Network...</p>
      </div>
    );
  }

  // Strict Authentication Gate: User must register or log in first
  if (!currentUser) {
    return <AuthGateView />;
  }

  return (
    <div className="min-h-screen bg-[#090b11] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Mobile-centric Frame Container */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col bg-[#0b0e17] border-x border-[#1a1f30] shadow-2xl relative">
        {/* Header */}
        <Header />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto">
          {activeTab === "home" && <HomeView />}
          {activeTab === "marketplace" && <MarketplaceView />}
          {activeTab === "sell" && <SellView />}
          {activeTab === "messages" && <ChatView />}
          {activeTab === "profile" && <ProfileView />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Global Modals */}
        <ListingDetailModal />
        <PurchaseModal />
        <VerificationModal />
        <ReportModal />
        <SafetyModal />
        <SupportChatModal />
        <TransactionsModal />

        {/* Private Administrator Portal (Protected) */}
        {isAdminDashboardOpen && <AdminDashboard />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
