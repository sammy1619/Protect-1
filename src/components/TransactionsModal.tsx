import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  MessageSquare,
  Eye,
  Check,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import { Order } from "../types";

export const TransactionsModal: React.FC = () => {
  const {
    isTransactionsModalOpen,
    setIsTransactionsModalOpen,
    orders,
    refreshOrders,
    currentUser,
    setActiveChatId,
    setActiveTab,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "confirmed">("all");
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isTransactionsModalOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };

  const handleApproveReceipt = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      const res = await api.approveOrderReceipt(orderId);
      showToast("Payment receipt seen and approved! Order is now CONFIRMED.", "success");
      await refreshOrders();
    } catch (err: any) {
      showToast(err.message || "Failed to approve receipt", "error");
    } finally {
      setApprovingOrderId(null);
    }
  };

  const openOrderChat = (chatId: string) => {
    setIsTransactionsModalOpen(false);
    setActiveChatId(chatId);
    setActiveTab("messages");
  };

  // Filter orders
  const pendingOrders = orders.filter(
    (o) => o.status === "Pending" || !o.sellerApproved
  );
  const confirmedOrders = orders.filter(
    (o) => o.status === "Confirmed" || o.status === "Completed" || o.sellerApproved
  );

  const displayedOrders =
    activeFilter === "pending"
      ? pendingOrders
      : activeFilter === "confirmed"
      ? confirmedOrders
      : orders;

  return (
    <div
      id="transactions-tracking-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsTransactionsModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0f121e] border border-[#262c42] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f253a] bg-[#121524]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                Track Transactions
              </h3>
              <p className="text-[10px] text-gray-400">Escrow Payment Receipts & Approvals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-[#191f32] hover:bg-[#232b45] text-gray-300 hover:text-white transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-red-400" : ""}`} />
            </button>
            <button
              onClick={() => setIsTransactionsModalOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1b2032] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: All, Pending, Confirmed */}
        <div className="p-3 bg-[#0d101a] border-b border-[#1c2235] flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-gaming transition-all flex items-center justify-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-[#1f263d] text-white shadow-sm border border-[#2f3a5c]"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#141827]"
            }`}
          >
            <span>All Orders</span>
            <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("pending")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-gaming transition-all flex items-center justify-center gap-1.5 ${
              activeFilter === "pending"
                ? "bg-amber-950/50 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#141827]"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending</span>
            <span className="text-[10px] bg-amber-900/60 text-amber-200 px-1.5 py-0.2 rounded-full border border-amber-700/40">
              {pendingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("confirmed")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-gaming transition-all flex items-center justify-center gap-1.5 ${
              activeFilter === "confirmed"
                ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#141827]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirmed</span>
            <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.2 rounded-full border border-emerald-700/40">
              {confirmedOrders.length}
            </span>
          </button>
        </div>

        {/* Orders List Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0d16]">
          {displayedOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#141827] border border-[#232b44] flex items-center justify-center text-gray-500 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-300">No {activeFilter} transactions found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                When you buy or sell a Free Fire account with PalmPay/OPay, all transfer receipts and confirmations will appear here.
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const isBuyer = currentUser?.id === order.buyerId;
              const isSeller = currentUser?.id === order.sellerId;
              const isPending = order.status === "Pending" || !order.sellerApproved;
              const isConfirmed = order.status === "Confirmed" || order.sellerApproved || order.status === "Completed";

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPending
                      ? "bg-[#111422] border-amber-600/30 hover:border-amber-500/60"
                      : "bg-[#111422] border-emerald-600/30 hover:border-emerald-500/60"
                  }`}
                >
                  {/* Top Bar: Order ID & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white bg-[#191f33] px-2 py-0.5 rounded-lg border border-[#27314d]">
                        #{order.id}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {isBuyer ? "You purchased" : "You are selling"}
                      </span>
                    </div>

                    {/* Status badge */}
                    {isPending ? (
                      <span className="text-[10px] font-bold font-gaming uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                        Pending Approval
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-gaming uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Confirmed
                      </span>
                    )}
                  </div>

                  {/* Listing Details & Price */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0b0e17] border border-[#1b2135] mb-3">
                    <img
                      src={order.listingImage}
                      alt={order.listingTitle}
                      className="w-14 h-14 rounded-lg object-cover border border-[#262f49] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{order.listingTitle}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[11px] text-gray-400">
                          {isBuyer ? (
                            <>
                              Seller: <strong className="text-gray-200">@{order.sellerUsername}</strong>
                            </>
                          ) : (
                            <>
                              Buyer: <strong className="text-gray-200">@{order.buyerUsername}</strong>
                            </>
                          )}
                        </div>
                        <div className="text-sm font-bold font-gaming text-emerald-400">
                          ₦{order.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Pill & Receipt Thumbnail */}
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-400 py-1.5 border-t border-[#1b2237] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]">Method:</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                          order.paymentMethod === "PalmPay"
                            ? "bg-purple-950/60 text-purple-300 border border-purple-800/40"
                            : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                        }`}
                      >
                        {order.paymentMethod || "PalmPay"} ({order.accountNumberPaid || "7067252385"})
                      </span>
                    </div>

                    {order.receiptUrl ? (
                      <button
                        onClick={() => setSelectedReceiptUrl(order.receiptUrl || null)}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Transfer Receipt</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-red-400 font-medium">No receipt attached</span>
                    )}
                  </div>

                  {/* Seller Action Bar: "Approve / Seen" Button */}
                  {isSeller && isPending && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/40 mb-3 flex items-center justify-between gap-3">
                      <div className="text-xs text-amber-200 leading-tight">
                        <strong>Buyer submitted receipt.</strong>
                        <br />
                        <span className="text-[11px] text-amber-300/80">
                          Inspect the payment and press "Approve / Seen" to confirm.
                        </span>
                      </div>
                      <button
                        id={`approve-receipt-btn-${order.id}`}
                        disabled={approvingOrderId === order.id}
                        onClick={() => handleApproveReceipt(order.id)}
                        className="py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold font-gaming rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
                      >
                        {approvingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Approve / Seen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Confirmed Notice */}
                  {isConfirmed && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-600/30 mb-3 text-[11px] text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Receipt approved & seen! Credentials exchange is active in the transaction chat.
                      </span>
                    </div>
                  )}

                  {/* Footer Action: Open Chat */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openOrderChat(order.chatId)}
                      className="py-2 px-3.5 rounded-xl bg-[#1a2135] hover:bg-[#252f4c] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                      <span>Open Transaction Chat</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal for viewing receipt image popup */}
        {selectedReceiptUrl && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedReceiptUrl(null)}
          >
            <div
              className="relative max-w-md w-full bg-[#121524] border border-[#2b3552] rounded-3xl p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1f263c] mb-3">
                <span className="text-xs font-bold text-white uppercase font-gaming">
                  Official Payment Receipt
                </span>
                <button
                  onClick={() => setSelectedReceiptUrl(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={selectedReceiptUrl}
                alt="Payment Receipt"
                className="w-full max-h-[70vh] object-contain rounded-xl border border-[#262f49] bg-black"
              />
              <p className="text-[11px] text-gray-400 text-center mt-2.5">
                Verify the sender, timestamp, and amount transferred before approving.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
