import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import {
  AdminStats,
  User,
  VerificationRequest,
  Report,
  Order,
  Listing,
} from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Tag,
  ShoppingBag,
  FileCheck,
  AlertTriangle,
  Search,
  Check,
  X,
  Lock,
  ArrowLeft,
  DollarSign,
  Flame,
  Trash2,
  Ban,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { currentUser, setIsAdminDashboardOpen, showToast, refreshListings } = useApp();

  // Admin security check
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="max-w-sm w-full bg-[#121524] border border-red-800/60 rounded-3xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/60 flex items-center justify-center mx-auto text-red-500">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-gaming text-white uppercase">
            Access Denied
          </h3>
          <p className="text-xs text-gray-400">
            This private administrator portal requires verified administrative authorization.
          </p>
          <button
            onClick={() => setIsAdminDashboardOpen(false)}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl font-gaming"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<"overview" | "verifications" | "users" | "listings" | "orders" | "reports">("overview");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [sRes, uRes, vRes, oRes, rRes, lRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminVerifications(),
        api.getAdminOrders(),
        api.getAdminReports(),
        api.getListings(),
      ]);
      setStats(sRes.stats);
      setAdminUsers(uRes.users);
      setVerifications(vRes.requests);
      setAllOrders(oRes.orders);
      setReports(rRes.reports);
      setAllListings(lRes.listings);
    } catch (err: any) {
      showToast(err.message || "Failed to load admin data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Verification Actions
  const handleVerificationAction = async (requestId: string, action: "approve" | "reject") => {
    try {
      await api.adminActionVerification(requestId, action);
      showToast(`Seller verification request [${action.toUpperCase()}D] successfully!`, "success");
      fetchAdminData();
      refreshListings();
    } catch (err: any) {
      showToast(err.message || "Failed to update verification", "error");
    }
  };

  // User Verification Toggle / Revoke
  const handleToggleUserVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await api.adminVerifyUser(userId, currentStatus ? "revoke" : "approve");
      showToast(currentStatus ? "Seller verification revoked" : "User verified as seller", "info");
      fetchAdminData();
      refreshListings();
    } catch (err: any) {
      showToast(err.message || "Action failed", "error");
    }
  };

  // Suspend User
  const handleToggleSuspend = async (userId: string) => {
    try {
      const res = await api.adminSuspendUser(userId);
      showToast(res.user.isSuspended ? "User account suspended" : "User account unsuspended", "info");
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || "Action failed", "error");
    }
  };

  // Remove Listing
  const handleRemoveListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to remove this listing?")) return;
    try {
      await api.deleteListing(listingId);
      showToast("Listing removed by administrator", "info");
      fetchAdminData();
      refreshListings();
    } catch (err: any) {
      showToast(err.message || "Failed to remove listing", "error");
    }
  };

  // Resolve Report
  const handleUpdateReport = async (reportId: string, status: string) => {
    try {
      await api.updateReportStatus(reportId, status);
      showToast(`Report marked as ${status}`, "success");
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || "Failed to update report", "error");
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!userSearch) return adminUsers;
    const q = userSearch.toLowerCase();
    return adminUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.freeFireUid?.includes(q)
    );
  }, [adminUsers, userSearch]);

  const pendingVerificationsCount = verifications.filter((v) => v.status === "pending").length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0c13] text-gray-200 overflow-y-auto">
      {/* Admin Top Navigation */}
      <div className="sticky top-0 z-30 bg-[#0f121e]/95 backdrop-blur-md border-b border-[#1f253a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminDashboardOpen(false)}
            className="p-1.5 rounded-lg bg-[#191e30] hover:bg-[#222a42] text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Marketplace</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                RAY SHOP Administration
              </span>
              <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/60 font-bold px-1.5 py-0.2 rounded font-gaming">
                ESCROW SECURE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Authenticated Admin: <strong className="text-white">@{currentUser.username}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2 rounded-xl bg-[#191e30] hover:bg-[#242c46] text-gray-300 hover:text-white transition-colors"
          title="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-red-500" : ""}`} />
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#1c2234]">
          {[
            { id: "overview", label: "Overview Metrics", icon: Flame },
            {
              id: "verifications",
              label: `Verifications (${pendingVerificationsCount})`,
              icon: FileCheck,
              highlight: pendingVerificationsCount > 0,
            },
            { id: "users", label: `Users (${adminUsers.length})`, icon: Users },
            { id: "listings", label: `Listings (${allListings.length})`, icon: Tag },
            { id: "orders", label: `Orders (${allOrders.length})`, icon: ShoppingBag },
            { id: "reports", label: `Reports (${reports.length})`, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-gaming transition-all whitespace-nowrap ${
                  isCurrent
                    ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "bg-[#131624] text-gray-400 hover:text-gray-200 border border-[#21273b]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.highlight && !isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && stats && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#21283c]">
                <span className="text-[11px] text-gray-400 block uppercase font-gaming">Total Users</span>
                <span className="text-2xl font-bold font-gaming text-white mt-1 block">
                  {stats.totalUsers}
                </span>
                <span className="text-[10px] text-gray-500">Registered platform buyers/sellers</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#21283c]">
                <span className="text-[11px] text-gray-400 block uppercase font-gaming">Verified Sellers</span>
                <span className="text-2xl font-bold font-gaming text-blue-400 mt-1 block flex items-center gap-1">
                  <ShieldCheck className="w-5 h-5" />
                  {stats.verifiedSellers}
                </span>
                <span className="text-[10px] text-gray-500">KYC approved account traders</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#21283c]">
                <span className="text-[11px] text-gray-400 block uppercase font-gaming">Active Listings</span>
                <span className="text-2xl font-bold font-gaming text-red-500 mt-1 block">
                  {stats.activeListings}
                </span>
                <span className="text-[10px] text-gray-500">Free Fire accounts available</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#21283c]">
                <span className="text-[11px] text-gray-400 block uppercase font-gaming">Escrow Volume</span>
                <span className="text-2xl font-bold font-gaming text-green-400 mt-1 block">
                  ₦{stats.totalVolume.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">Gross transaction escrow</span>
              </div>
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#14192b] border border-[#232b42] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-300 font-gaming">PENDING VERIFICATIONS</div>
                  <div className="text-xl font-bold text-amber-400 font-gaming mt-0.5">
                    {stats.pendingVerifications} requests
                  </div>
                </div>
                {stats.pendingVerifications > 0 && (
                  <button
                    onClick={() => setActiveTab("verifications")}
                    className="px-2.5 py-1 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/50 text-xs font-bold font-gaming"
                  >
                    Review
                  </button>
                )}
              </div>
              <div className="p-3.5 rounded-2xl bg-[#14192b] border border-[#232b42] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-300 font-gaming">ACTIVE ORDERS</div>
                  <div className="text-xl font-bold text-white font-gaming mt-0.5">
                    {stats.activeOrders} processing
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="px-2.5 py-1 rounded-lg bg-[#20273f] text-gray-300 hover:text-white text-xs font-medium"
                >
                  View
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#14192b] border border-[#232b42] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-300 font-gaming">DISPUTES / REPORTS</div>
                  <div className="text-xl font-bold text-red-400 font-gaming mt-0.5">
                    {stats.disputes} open disputes
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="px-2.5 py-1 rounded-lg bg-red-950/60 text-red-400 border border-red-800/40 text-xs font-bold font-gaming"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATION MANAGEMENT TAB */}
        {activeTab === "verifications" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Seller Verification Queue
            </h3>
            {verifications.length === 0 ? (
              <div className="text-center py-10 bg-[#121524] rounded-2xl border border-[#20263b] text-gray-400 text-xs">
                No verification requests submitted.
              </div>
            ) : (
              <div className="space-y-3">
                {verifications.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      req.status === "pending"
                        ? "bg-[#141829] border-amber-500/40 shadow-lg"
                        : "bg-[#101320] border-[#20263b]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white font-gaming">
                            @{req.username}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-gaming ${
                              req.status === "approved"
                                ? "bg-green-950 text-green-400 border border-green-800/50"
                                : req.status === "rejected"
                                ? "bg-red-950 text-red-400 border border-red-800/50"
                                : "bg-amber-950 text-amber-300 border border-amber-800/50 animate-pulse"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Email: {req.email} • Phone: {req.phone || "N/A"}
                        </p>
                        <p className="text-xs text-red-400 font-gaming mt-1">
                          Free Fire In-Game UID: <strong>{req.freeFireUid}</strong>
                        </p>
                      </div>

                      {/* Action buttons if pending */}
                      {req.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerificationAction(req.id, "approve")}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold font-gaming rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Seller
                          </button>
                          <button
                            onClick={() => handleVerificationAction(req.id, "reject")}
                            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/50 text-xs font-bold font-gaming rounded-xl transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Proof Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#0e101a] border border-[#1d2235] text-xs">
                      <div>
                        <span className="text-gray-400 block font-medium">Document Proof Type:</span>
                        <span className="text-gray-200 font-semibold">{req.idDocumentType}</span>
                        {req.proofUrl && (
                          <a
                            href={req.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 mt-1 text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" /> View Submitted Document
                          </a>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">Trading Background:</span>
                        <p className="text-gray-300 italic">{req.sellerExperience}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS MANAGEMENT TAB */}
        {activeTab === "users" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                User Directory ({filteredUsers.length})
              </h3>
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user, email, UID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#121524] border border-[#22283d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-2xl bg-[#121524] border border-[#21273c] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover border border-[#2a334d]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">
                          {u.username}
                        </span>
                        {u.isVerifiedSeller && (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" title="Verified Seller" />
                        )}
                        {u.isSuspended && (
                          <span className="text-[9px] font-bold bg-red-950 text-red-400 border border-red-800/50 px-1.5 py-0.2 rounded font-gaming">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">
                        {u.email} • Role: <strong className="text-gray-300">{u.role}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleUserVerification(u.id, u.isVerifiedSeller)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold font-gaming transition-colors ${
                        u.isVerifiedSeller
                          ? "bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/40"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {u.isVerifiedSeller ? "Revoke Verification" : "Verify Seller"}
                    </button>
                    <button
                      onClick={() => handleToggleSuspend(u.id)}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        u.isSuspended
                          ? "bg-amber-600/30 text-amber-300 border-amber-500/50"
                          : "bg-[#181d2e] text-gray-400 hover:text-red-400 border-[#272f47]"
                      }`}
                      title={u.isSuspended ? "Unsuspend account" : "Suspend account"}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTINGS MANAGEMENT TAB */}
        {activeTab === "listings" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Marketplace Listings Management ({allListings.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allListings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-3 rounded-2xl bg-[#121524] border border-[#21273c] flex gap-3 justify-between"
                >
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#29324c]"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.2 rounded font-gaming uppercase">
                          {listing.rank} • LVL {listing.level}
                        </span>
                        <span className="text-[10px] text-gray-400 capitalize">
                          {listing.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                        {listing.title}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Seller: @{listing.sellerUsername}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1d2335]">
                      <span className="font-bold text-sm font-gaming text-emerald-400">
                        ₦{listing.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRemoveListing(listing.id)}
                        className="px-2 py-1 text-[11px] bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg border border-red-800/40 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Fraudulent
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Escrow Orders & Disputes ({allOrders.length})
            </h3>
            {allOrders.length === 0 ? (
              <div className="text-center py-10 bg-[#121524] rounded-2xl border border-[#20263b] text-gray-400 text-xs">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {allOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl bg-[#121524] border border-[#21273c] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-gaming">
                          Order #{ord.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-gaming ${
                            ord.status === "Completed"
                              ? "bg-green-950 text-green-400 border border-green-800/50"
                              : ord.status === "Disputed"
                              ? "bg-red-950 text-red-400 border border-red-800/50"
                              : "bg-amber-950 text-amber-300 border border-amber-800/50"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <span className="font-bold font-gaming text-emerald-400 text-sm">
                        ₦{ord.totalAmount.toLocaleString()} (Escrow)
                      </span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <img
                        src={ord.listingImage}
                        alt={ord.listingTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-[#2b334a]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-white truncate">{ord.listingTitle}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Buyer: <strong className="text-gray-200">@{ord.buyerUsername}</strong> → Seller:{" "}
                          <strong className="text-gray-200">@{ord.sellerUsername}</strong>
                        </p>
                      </div>
                    </div>

                    {ord.disputeReason && (
                      <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/40 text-[11px] text-red-300">
                        Dispute Reason: "{ord.disputeReason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Safety & Fraud Reports ({reports.length})
            </h3>
            {reports.length === 0 ? (
              <div className="text-center py-10 bg-[#121524] rounded-2xl border border-[#20263b] text-gray-400 text-xs">
                No active moderation reports.
              </div>
            ) : (
              <div className="space-y-2.5">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-2xl bg-[#121524] border border-red-900/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40 font-gaming">
                          Target: {rep.targetType} ({rep.targetTitle || rep.targetId})
                        </span>
                        <span className="text-[10px] text-gray-400">
                          by @{rep.reporterUsername}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 capitalize">
                        {rep.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0e101a] border border-[#1f2438] space-y-1">
                      <span className="font-bold text-white block">Reason: {rep.reason}</span>
                      <p className="text-gray-300 text-[11px]">{rep.details}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateReport(rep.id, "dismissed")}
                        className="px-2.5 py-1 rounded-lg bg-[#181d2e] text-gray-300 text-[11px] hover:bg-[#20273d]"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleUpdateReport(rep.id, "resolved")}
                        className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
