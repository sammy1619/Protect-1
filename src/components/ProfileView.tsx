import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import { ChangeAvatarModal } from "./ChangeAvatarModal";
import {
  User as UserIcon,
  ShieldCheck,
  Flame,
  ShoppingBag,
  Tag,
  ShieldAlert,
  Settings,
  LogOut,
  ExternalLink,
  Lock,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Award,
  Trash2,
  Camera,
} from "lucide-react";

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    orders,
    listings,
    setActiveTab,
    setActiveChatId,
    setIsVerificationModalOpen,
    setIsAdminDashboardOpen,
    setIsSafetyModalOpen,
    refreshListings,
    showToast,
    logout,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"purchases" | "listings" | "verification">("purchases");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  if (!currentUser) return null;

  const myPurchases = orders.filter((o) => o.buyerId === currentUser.id);
  const mySales = orders.filter((o) => o.sellerId === currentUser.id);
  const myListings = listings.filter((l) => l.sellerId === currentUser.id);

  const handleDeleteListing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.deleteListing(id);
      showToast("Listing deleted", "info");
      refreshListings();
    } catch (err: any) {
      showToast(err.message || "Failed to delete listing", "error");
    }
  };

  return (
    <div className="space-y-4 pb-14 max-w-lg mx-auto">
      {/* Profile Header Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-[#161a2b] to-[#10131e] border border-[#242b40] shadow-xl space-y-3">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Camera Overlay & Click Trigger */}
          <div
            className="relative group cursor-pointer"
            onClick={() => setIsAvatarModalOpen(true)}
            title="Click to change profile picture"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500/40 shadow-md group-hover:brightness-75 transition-all"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white drop-shadow" />
              <span className="text-[8px] font-bold text-white font-gaming mt-0.5">EDIT</span>
            </div>
            {/* Quick Badge Button */}
            <button
              type="button"
              id="avatar-camera-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsAvatarModalOpen(true);
              }}
              title="Change Profile Picture"
              className="absolute -bottom-1 -left-1 p-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-lg shadow-md border border-[#121524] transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            {currentUser.isVerifiedSeller && (
              <span className="absolute -bottom-1 -right-1 bg-[#0c0e15] rounded-full p-0.5" title="Verified Seller">
                <ShieldCheck className="w-5 h-5 text-blue-400 fill-blue-500/20" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white truncate">
                {currentUser.username}
              </h2>
              {currentUser.isVerifiedSeller ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Merchant
                </span>
              ) : currentUser.verificationStatus === "pending" ? (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  Verification Pending
                </span>
              ) : (
                <span className="text-[10px] font-medium text-gray-400 bg-[#1e2335] px-2 py-0.5 rounded-full border border-[#2d354e]">
                  Buyer Account
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {currentUser.email} • Member since {new Date(currentUser.createdAt).toLocaleDateString()}
            </p>

            {currentUser.freeFireUid && (
              <p className="text-[11px] text-gray-300 mt-1 font-gaming">
                Free Fire UID: <span className="text-red-400 font-bold">{currentUser.freeFireUid}</span>
              </p>
            )}

            {/* Direct Change Profile Picture Button */}
            <div className="mt-2">
              <button
                type="button"
                id="change-profile-pic-btn"
                onClick={() => setIsAvatarModalOpen(true)}
                className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-[#1c2235] hover:bg-red-950/40 text-gray-300 hover:text-red-300 border border-[#2c354e] hover:border-red-500/50 text-[11px] font-medium font-gaming transition-all active:scale-95"
              >
                <Camera className="w-3 h-3 text-red-400" />
                <span>Change Profile Picture</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Stats Ticker */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1f2538] text-center text-xs">
          <div className="p-2 rounded-xl bg-[#121522] border border-[#1e2335]">
            <span className="text-[10px] text-gray-400 block uppercase">Role</span>
            <span className="font-bold text-red-400 font-gaming uppercase">
              {currentUser.role}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#121522] border border-[#1e2335]">
            <span className="text-[10px] text-gray-400 block uppercase">Completed Sales</span>
            <span className="font-bold text-white font-gaming">
              {currentUser.totalSales}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#121522] border border-[#1e2335]">
            <span className="text-[10px] text-gray-400 block uppercase">Trust Score</span>
            <span className="font-bold text-green-400 font-gaming">
              ⭐ {currentUser.rating || 5.0}
            </span>
          </div>
        </div>

        {/* Private Administrator Access Button (Protected) */}
        {currentUser.role === "admin" && (
          <button
            id="open-admin-dashboard-btn"
            onClick={() => setIsAdminDashboardOpen(true)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold font-gaming rounded-xl shadow-lg flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>PRIVATE ADMINISTRATOR DASHBOARD</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sub navigation Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-[#121522] border border-[#20263b] gap-1">
        <button
          onClick={() => setActiveSubTab("purchases")}
          className={`flex-1 py-2 text-xs font-bold font-gaming rounded-xl transition-all ${
            activeSubTab === "purchases"
              ? "bg-red-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          My Purchases ({myPurchases.length})
        </button>
        <button
          onClick={() => setActiveSubTab("listings")}
          className={`flex-1 py-2 text-xs font-bold font-gaming rounded-xl transition-all ${
            activeSubTab === "listings"
              ? "bg-red-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          My Listings ({myListings.length})
        </button>
        <button
          onClick={() => setActiveSubTab("verification")}
          className={`flex-1 py-2 text-xs font-bold font-gaming rounded-xl transition-all ${
            activeSubTab === "verification"
              ? "bg-red-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Verification
        </button>
      </div>

      {/* Purchases Tab */}
      {activeSubTab === "purchases" && (
        <div className="space-y-2.5">
          {myPurchases.length === 0 ? (
            <div className="text-center py-10 bg-[#111422] rounded-2xl border border-[#1f253a] p-6 space-y-2">
              <ShoppingBag className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-xs font-semibold text-gray-300">No account purchases yet</p>
              <button
                onClick={() => setActiveTab("marketplace")}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl font-gaming"
              >
                Browse Free Fire Marketplace
              </button>
            </div>
          ) : (
            myPurchases.map((ord) => (
              <div
                key={ord.id}
                id={`order-card-${ord.id}`}
                className="p-3.5 rounded-2xl bg-[#121524] border border-[#22283d] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white font-gaming">
                    <span>Order #{ord.id}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-gaming ${
                      ord.status === "Completed"
                        ? "bg-green-950 text-green-400 border border-green-700/50"
                        : ord.status === "Disputed"
                        ? "bg-red-950 text-red-400 border border-red-700/50"
                        : "bg-amber-950 text-amber-300 border border-amber-700/50"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <img
                    src={ord.listingImage}
                    alt={ord.listingTitle}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2b334d]"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-gray-200 line-clamp-1">
                      {ord.listingTitle}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Seller: @{ord.sellerUsername} • {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                    <span className="text-xs font-bold font-gaming text-emerald-400">
                      ₦{ord.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e2439] flex justify-end">
                  <button
                    onClick={() => {
                      setActiveChatId(ord.chatId);
                      setActiveTab("messages");
                    }}
                    className="px-3 py-1.5 bg-[#1a2034] hover:bg-[#232b45] text-gray-200 text-xs font-medium rounded-xl border border-[#2b3552] transition-colors flex items-center gap-1.5"
                  >
                    Open Handover Chat
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Listings Tab */}
      {activeSubTab === "listings" && (
        <div className="space-y-2.5">
          {myListings.length === 0 ? (
            <div className="text-center py-10 bg-[#111422] rounded-2xl border border-[#1f253a] p-6 space-y-2">
              <Tag className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-xs font-semibold text-gray-300">No listings published</p>
              {currentUser.isVerifiedSeller ? (
                <button
                  onClick={() => setActiveTab("sell")}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl font-gaming"
                >
                  Create New Listing
                </button>
              ) : (
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl font-gaming"
                >
                  Get Verified to Sell
                </button>
              )}
            </div>
          ) : (
            myListings.map((listing) => (
              <div
                key={listing.id}
                className="p-3 rounded-2xl bg-[#121524] border border-[#22283d] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#2a324d]"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white line-clamp-1">
                      {listing.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span className="font-bold text-emerald-400 font-gaming">₦{listing.price.toLocaleString()}</span>
                      <span>•</span>
                      <span className="capitalize">{listing.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleDeleteListing(listing.id, e)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-[#1f2539] transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Verification Tab */}
      {activeSubTab === "verification" && (
        <div className="p-4 rounded-3xl bg-[#121524] border border-[#22283b] space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Seller Verification Status
            </h3>
          </div>

          {currentUser.isVerifiedSeller ? (
            <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold font-gaming">
                <ShieldCheck className="w-4 h-4" />
                VERIFIED MERCHANT BADGE ACTIVE
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                Your account is verified. You can publish Free Fire account listings on the marketplace anytime and receive direct escrow orders.
              </p>
            </div>
          ) : currentUser.verificationStatus === "pending" ? (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold font-gaming">
                APPLICATION UNDER REVIEW
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                Your government ID and Free Fire UID proof are currently being reviewed by our administration team.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                Want to sell Free Fire accounts? Complete our fast seller verification by providing your Free Fire UID and identification proof.
              </p>
              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold font-gaming rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                Submit Verification Request
              </button>
            </div>
          )}

          {/* Safety Notice */}
          <div className="pt-3 border-t border-[#1f2538] flex items-center justify-between text-gray-400">
            <span>Learn how we secure marketplace trades</span>
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="text-red-400 hover:text-red-300 font-semibold text-xs"
            >
              Read Safety Guide
            </button>
          </div>
        </div>
      )}

      {/* Account Session & Sign Out */}
      <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#22283b] flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white font-gaming">Account Session</p>
          <p className="text-[10px] text-gray-400">Signed in as {currentUser.username}</p>
        </div>
        <button
          id="profile-signout-btn"
          onClick={logout}
          className="px-3.5 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-gaming text-xs flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Change Profile Picture Modal */}
      <ChangeAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
