import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Listing, Order, ChatConversation } from "../types";
import * as api from "../services/api";

interface ToastInfo {
  message: string;
  type: "info" | "success" | "error";
}

interface AppContextType {
  currentUser: User | null;
  isLoadingUser: boolean;
  activeTab: "home" | "marketplace" | "sell" | "messages" | "profile";
  setActiveTab: (tab: "home" | "marketplace" | "sell" | "messages" | "profile") => void;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  isPurchaseModalOpen: boolean;
  setIsPurchaseModalOpen: (open: boolean) => void;
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  isCreateListingModalOpen: boolean;
  setIsCreateListingModalOpen: (open: boolean) => void;
  isSafetyModalOpen: boolean;
  setIsSafetyModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportTarget: {
    type: "user" | "listing" | "message" | "transaction";
    id: string;
    title?: string;
  } | null;
  openReportModal: (target: {
    type: "user" | "listing" | "message" | "transaction";
    id: string;
    title?: string;
  }) => void;
  isSupportChatOpen: boolean;
  setIsSupportChatOpen: (open: boolean) => void;
  isTransactionsModalOpen: boolean;
  setIsTransactionsModalOpen: (open: boolean) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  demoUsers: User[];
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  listings: Listing[];
  refreshListings: () => Promise<void>;
  chats: ChatConversation[];
  refreshChats: () => Promise<void>;
  unreadMessagesCount: number;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  toast: ToastInfo | null;
  showToast: (message: string, type?: "info" | "success" | "error") => void;
  openChatWithSeller: (sellerId: string, listingId?: string) => Promise<void>;
  logout: () => void;
  unlockAdminWithPin: (pin: string) => Promise<boolean>;
  updateProfilePicture: (newAvatar: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "marketplace" | "sell" | "messages" | "profile">("home");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: "user" | "listing" | "message" | "transaction";
    id: string;
    title?: string;
  } | null>(null);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((message: string, type: "info" | "success" | "error" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const openReportModal = useCallback(
    (target: { type: "user" | "listing" | "message" | "transaction"; id: string; title?: string }) => {
      setReportTarget(target);
      setIsReportModalOpen(true);
    },
    []
  );

  const refreshUser = useCallback(async () => {
    const token = api.getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setIsLoadingUser(false);
      return;
    }
    try {
      const data = await api.getMe();
      setCurrentUser(data.user);
    } catch {
      api.clearAuthToken();
      setCurrentUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.clearAuthToken();
    setCurrentUser(null);
    setChats([]);
    setOrders([]);
    setIsAdminDashboardOpen(false);
    setActiveChatId(null);
    showToast("Signed out successfully", "info");
  }, [showToast]);

  const unlockAdminWithPin = useCallback(
    async (pin: string) => {
      try {
        const res = await api.unlockAdminWithPin(pin);
        setCurrentUser(res.user);
        setIsAdminDashboardOpen(true);
        showToast("Master Admin Override Confirmed", "success");
        return true;
      } catch (err: any) {
        showToast(err.message || "Invalid Admin Override PIN", "error");
        return false;
      }
    },
    [showToast]
  );

  const refreshListings = useCallback(async () => {
    try {
      const res = await api.getListings();
      setListings(res.listings);
    } catch (e) {
      console.error("Failed to fetch listings", e);
    }
  }, []);

  const refreshChats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.getChats();
      setChats(res.chats);
    } catch (e) {
      console.error("Failed to fetch chats", e);
    }
  }, [currentUser]);

  const refreshOrders = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.getOrders();
      setOrders(res.orders);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    }
  }, [currentUser]);

  const updateProfilePicture = useCallback(
    async (newAvatar: string) => {
      try {
        const res = await api.updateUserProfile({ avatar: newAvatar });
        setCurrentUser(res.user);
        await Promise.all([refreshListings(), refreshChats()]);
        showToast("Profile picture updated successfully!", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to update profile picture", "error");
        throw err;
      }
    },
    [refreshListings, refreshChats, showToast]
  );

  const fetchDemoUsers = useCallback(async () => {
    try {
      const res = await api.getDemoUsers();
      setDemoUsers(res.users);
    } catch (e) {
      console.error("Failed to fetch demo users", e);
    }
  }, []);

  const switchUser = useCallback(
    async (userId: string) => {
      api.setAuthToken(userId);
      setIsLoadingUser(true);
      setActiveChatId(null);
      try {
        const res = await api.getMe();
        setCurrentUser(res.user);
        showToast(`Logged in as ${res.user.username} (${res.user.role.toUpperCase()})`, "success");
        // refresh user data
        const [cRes, oRes] = await Promise.all([api.getChats(), api.getOrders()]);
        setChats(cRes.chats);
        setOrders(oRes.orders);
      } catch (err: any) {
        showToast(err.message || "Switch user failed", "error");
      } finally {
        setIsLoadingUser(false);
      }
    },
    [showToast]
  );

  const openChatWithSeller = useCallback(
    async (sellerId: string, listingId?: string) => {
      if (!currentUser) {
        showToast("Please log in to chat with the seller", "error");
        return;
      }
      try {
        const res = await api.getOrCreateChat(sellerId, listingId);
        setActiveChatId(res.chat.id);
        setActiveTab("messages");
        refreshChats();
      } catch (err: any) {
        showToast(err.message || "Failed to start chat", "error");
      }
    },
    [currentUser, refreshChats, showToast]
  );

  // Initial load
  useEffect(() => {
    refreshUser();
    refreshListings();
    fetchDemoUsers();
  }, [refreshUser, refreshListings, fetchDemoUsers]);

  // When user is loaded or changed, fetch chats & orders
  useEffect(() => {
    if (currentUser) {
      refreshChats();
      refreshOrders();
    }
  }, [currentUser, refreshChats, refreshOrders]);

  // Real-time SSE subscriptions
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = api.subscribeToRealtimeEvents(currentUser.id, (eventType, data) => {
      console.log("[SSE Event Received]", eventType, data);

      if (eventType === "chat:message") {
        refreshChats();
        // If message is from someone else, show alert toast
        if (data.message && data.message.senderId !== currentUser.id) {
          showToast(`💬 New message from @${data.message.senderUsername}`, "info");
        }
      } else if (eventType === "chat:new" || eventType === "chat:updated") {
        refreshChats();
      } else if (eventType === "order:new" || eventType === "order:updated") {
        refreshOrders();
        showToast(`⚡ Order update: ${data.order?.id || "status changed"}`, "info");
      } else if (eventType === "listing:new" || eventType === "listing:updated" || eventType === "listing:deleted") {
        refreshListings();
      } else if (eventType === "user:updated") {
        if (data.user?.id === currentUser.id) {
          setCurrentUser(data.user);
          if (data.user.isVerifiedSeller) {
            showToast("🎉 Congratulations! Your seller verification has been APPROVED!", "success");
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, refreshChats, refreshOrders, refreshListings, showToast]);

  const unreadMessagesCount = chats.reduce((acc, chat) => {
    if (!currentUser) return acc;
    return acc + (chat.unreadCounts?.[currentUser.id] || 0);
  }, 0);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoadingUser,
        activeTab,
        setActiveTab,
        selectedListing,
        setSelectedListing,
        isPurchaseModalOpen,
        setIsPurchaseModalOpen,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isCreateListingModalOpen,
        setIsCreateListingModalOpen,
        isSafetyModalOpen,
        setIsSafetyModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        isSupportChatOpen,
        setIsSupportChatOpen,
        isTransactionsModalOpen,
        setIsTransactionsModalOpen,
        reportTarget,
        openReportModal,
        activeChatId,
        setActiveChatId,
        isAdminDashboardOpen,
        setIsAdminDashboardOpen,
        isMobileFrame,
        setIsMobileFrame,
        demoUsers,
        switchUser,
        refreshUser,
        listings,
        refreshListings,
        chats,
        refreshChats,
        unreadMessagesCount,
        orders,
        refreshOrders,
        toast,
        showToast,
        openChatWithSeller,
        logout,
        unlockAdminWithPin,
        updateProfilePicture,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
