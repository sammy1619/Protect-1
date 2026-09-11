import React, { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import { ChatMessage, ChatConversation, OrderStatus } from "../types";
import {
  Send,
  ShieldCheck,
  Flame,
  ArrowLeft,
  Lock,
  CheckCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Smile,
} from "lucide-react";

export const ChatView: React.FC = () => {
  const {
    chats,
    refreshChats,
    activeChatId,
    setActiveChatId,
    currentUser,
    orders,
    refreshOrders,
    showToast,
    setSelectedListing,
    openReportModal,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId);
  }, [chats, activeChatId]);

  // Find linked order if any
  const linkedOrder = useMemo(() => {
    if (!currentChat?.orderId) return null;
    return orders.find((o) => o.id === currentChat.orderId) || null;
  }, [currentChat, orders]);

  // Fetch messages when chat is opened
  useEffect(() => {
    if (!activeChatId) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    api
      .getChatMessages(activeChatId)
      .then((res) => {
        if (isMounted) {
          setMessages(res.messages);
          setIsLoadingMessages(false);
          refreshChats();
        }
      })
      .catch((err) => {
        console.error("Failed to load chat messages", err);
        if (isMounted) setIsLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeChatId, refreshChats]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodic fallback refresh for open chat
  useEffect(() => {
    if (!activeChatId) return;
    const interval = setInterval(() => {
      api.getChatMessages(activeChatId).then((res) => {
        setMessages(res.messages);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeChatId]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeChatId) return;

    setInputText("");
    setIsSending(true);

    try {
      const res = await api.sendMessage(activeChatId, text.trim());
      setMessages((prev) => [...prev, res.message]);
      refreshChats();
    } catch (err: any) {
      showToast(err.message || "Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Order Handover Actions
  const handleUpdateStatus = async (status: OrderStatus, disputeReason?: string) => {
    if (!linkedOrder) return;
    setIsUpdatingOrder(true);
    try {
      await api.updateOrderStatus(linkedOrder.id, { status, disputeReason });
      showToast(`Order status updated to [${status}]`, "success");
      await Promise.all([refreshOrders(), refreshChats()]);
      // Refetch messages to see system update
      const res = await api.getChatMessages(linkedOrder.chatId);
      setMessages(res.messages);
    } catch (err: any) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!linkedOrder) return;
    setIsUpdatingOrder(true);
    try {
      await api.updateOrderStatus(linkedOrder.id, {
        credentialsDelivered: true,
        status: "Processing",
      });
      await handleSendMessage("🔑 Credentials have been delivered! Please login and change the security settings.");
      showToast("Credentials marked as delivered!", "success");
      await refreshOrders();
    } catch (err: any) {
      showToast(err.message || "Failed to mark delivered", "error");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Helper to determine the other participant
  const getOtherParticipant = (chat: ChatConversation) => {
    if (!currentUser) return null;
    const otherId = chat.participantIds.find((id) => id !== currentUser.id);
    if (!otherId || !chat.participants[otherId]) {
      return { username: "Trader", avatar: "", isVerified: false };
    }
    return chat.participants[otherId];
  };

  // INBOX VIEW (When no conversation is open)
  if (!activeChatId) {
    return (
      <div className="space-y-3 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-gaming text-white uppercase tracking-wider">
              Messages
            </h2>
            <p className="text-[11px] text-gray-400">
              Real-time escrow conversations & trade discussions
            </p>
          </div>
          <span className="text-[11px] font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-900/40">
            {chats.length} active chats
          </span>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-16 bg-[#111422] rounded-3xl border border-[#20263b] p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-800/40 flex items-center justify-center mx-auto text-red-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">No active conversations</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Find an account on the marketplace and tap "Chat with Seller" or start an Escrow order to begin trading!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => {
              const other = getOtherParticipant(chat);
              const unread = currentUser ? chat.unreadCounts?.[currentUser.id] || 0 : 0;
              const hasOrder = Boolean(chat.orderId);

              return (
                <div
                  key={chat.id}
                  id={`chat-item-${chat.id}`}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-3 rounded-2xl bg-[#121524] hover:bg-[#191e32] border transition-all cursor-pointer flex items-center gap-3 ${
                    unread > 0
                      ? "border-red-500/50 bg-[#161a2d] shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                      : "border-[#21273c]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={other?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                      alt={other?.username}
                      className="w-11 h-11 rounded-full object-cover border border-[#2e3752]"
                    />
                    {other?.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-[#0e111a] rounded-full p-0.5" title="Verified Seller">
                        <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-500/20" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-xs text-white truncate">
                          {other?.username || "Trader"}
                        </span>
                        {hasOrder && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-950/80 text-red-400 border border-red-800/40 uppercase font-gaming">
                            Order {chat.orderStatus || "Escrow"}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Listing context preview */}
                    {chat.listingTitle && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        📦 {chat.listingTitle}
                      </p>
                    )}

                    {/* Last message */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className={`text-xs truncate ${unread > 0 ? "font-semibold text-white" : "text-gray-400"}`}>
                        {chat.lastMessage || "No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ACTIVE CONVERSATION SCREEN
  const otherParticipant = currentChat ? getOtherParticipant(currentChat) : null;
  const isBuyer = linkedOrder && currentUser?.id === linkedOrder.buyerId;
  const isSeller = linkedOrder && currentUser?.id === linkedOrder.sellerId;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[650px] bg-[#0c0e16] rounded-3xl border border-[#20263b] overflow-hidden">
      {/* Active Chat Header */}
      <div className="p-3 bg-[#111422] border-b border-[#20263b] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setActiveChatId(null)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1b2034] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={otherParticipant?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
            alt={otherParticipant?.username}
            className="w-9 h-9 rounded-full object-cover border border-[#29324c]"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white truncate">
                {otherParticipant?.username}
              </span>
              {otherParticipant?.isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
            </div>
            <div className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Online • Real-Time Escrow</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (currentChat?.listingId) {
                api.getListingById(currentChat.listingId).then((r) => setSelectedListing(r.listing));
              }
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1c2235]"
            title="View Listing Details"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Linked Order Status & Handover Action Banner */}
      {linkedOrder && (
        <div className="p-2.5 bg-[#14192b] border-b border-[#232c45] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white font-gaming">
                Order #{linkedOrder.id}
              </span>
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-gaming ${
                  linkedOrder.status === "Completed"
                    ? "bg-green-950 text-green-400 border border-green-700/50"
                    : linkedOrder.status === "Disputed"
                    ? "bg-red-950 text-red-400 border border-red-700/50"
                    : "bg-amber-950 text-amber-300 border border-amber-700/50"
                }`}
              >
                {linkedOrder.status}
              </span>
            </div>
            <span className="font-bold text-emerald-400 font-gaming text-xs">
              ₦{linkedOrder.totalAmount.toLocaleString()} (Held in Escrow)
            </span>
          </div>

          {/* Contextual Action Bar for Buyer / Seller */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#1e263d]">
            {isSeller && linkedOrder.status !== "Completed" && (
              <button
                disabled={isUpdatingOrder || linkedOrder.credentialsDelivered}
                onClick={handleMarkDelivered}
                className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[11px] font-bold rounded-xl font-gaming transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {linkedOrder.credentialsDelivered ? "Credentials Delivered ✓" : "Mark Credentials Delivered"}
              </button>
            )}

            {isBuyer && linkedOrder.status !== "Completed" && (
              <>
                <button
                  disabled={isUpdatingOrder}
                  onClick={() => handleUpdateStatus("Completed")}
                  className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-[11px] font-bold rounded-xl font-gaming transition-colors flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confirm & Release Escrow
                </button>
                <button
                  disabled={isUpdatingOrder}
                  onClick={() => {
                    const reason = prompt("Enter dispute reason (e.g. invalid password, wrong bind):");
                    if (reason) handleUpdateStatus("Disputed", reason);
                  }}
                  className="py-1.5 px-2.5 bg-[#251a22] hover:bg-[#34202e] text-red-400 text-[11px] font-bold rounded-xl border border-red-800/40 transition-colors"
                >
                  Dispute
                </button>
              </>
            )}

            {linkedOrder.status === "Completed" && (
              <div className="w-full text-center text-[11px] text-green-400 font-bold font-gaming flex items-center justify-center gap-1 py-1">
                <CheckCheck className="w-4 h-4" />
                TRANSACTION COMPLETED • ESCROW FUNDS RELEASED
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoadingMessages ? (
          <div className="text-center py-8 text-xs text-gray-400">Loading live messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            Send a message to begin real-time communication.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const isSystem = msg.isSystem || msg.senderId === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="p-2.5 rounded-xl bg-red-950/40 border border-red-900/40 text-[11px] text-gray-300 leading-relaxed max-w-sm mx-auto text-center space-y-1 my-2">
                  <div className="font-bold text-red-400 font-gaming uppercase tracking-wider flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    {msg.senderUsername}
                  </div>
                  <p>{msg.text}</p>
                  <span className="text-[9px] text-gray-500 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderUsername}
                    className="w-6 h-6 rounded-full object-cover mb-1 border border-[#2b334a]"
                  />
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs shadow-sm space-y-0.5 ${
                    isMe
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-none"
                      : "bg-[#181d2e] text-gray-200 border border-[#28314c] rounded-bl-none"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-80 mb-0.5">
                    {isMe ? "You" : msg.senderUsername}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <div
                    className={`text-[9px] flex items-center justify-end gap-1 ${
                      isMe ? "text-red-200" : "text-gray-400"
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Tray */}
      <div className="px-3 py-1.5 bg-[#0f121d] border-t border-[#1c2234] flex gap-1.5 overflow-x-auto scrollbar-none">
        {[
          "Is this account still available?",
          "Can you send the Free Fire UID verification?",
          "I've linked my recovery phone!",
          "Credentials tested successfully 👍",
        ].map((quick, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(quick)}
            className="px-2.5 py-1 bg-[#161a2b] hover:bg-[#1f253d] text-gray-300 hover:text-white rounded-lg text-[10px] whitespace-nowrap border border-[#252c42] transition-colors"
          >
            {quick}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-2.5 bg-[#111422] border-t border-[#20263b] flex items-center gap-2">
        <input
          id="chat-message-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type message to seller/buyer..."
          className="flex-1 bg-[#181d2e] border border-[#272f47] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
        />
        <button
          id="send-message-btn"
          disabled={!inputText.trim() || isSending}
          onClick={() => handleSendMessage()}
          className="p-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
