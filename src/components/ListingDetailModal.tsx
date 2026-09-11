import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  ShieldCheck,
  Flame,
  MessageSquare,
  ShoppingBag,
  ShieldAlert,
  Flag,
  Globe,
  Lock,
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export const ListingDetailModal: React.FC = () => {
  const {
    selectedListing,
    setSelectedListing,
    setIsPurchaseModalOpen,
    openChatWithSeller,
    openReportModal,
    currentUser,
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedListing) return null;

  const images = selectedListing.images && selectedListing.images.length > 0
    ? selectedListing.images
    : ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"];

  const handleBuy = () => {
    setIsPurchaseModalOpen(true);
  };

  const handleChat = () => {
    openChatWithSeller(selectedListing.sellerId, selectedListing.id);
    setSelectedListing(null);
  };

  const handleReport = () => {
    openReportModal({
      type: "listing",
      id: selectedListing.id,
      title: selectedListing.title,
    });
  };

  const isOwnListing = currentUser?.id === selectedListing.sellerId;

  return (
    <div
      id="listing-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSelectedListing(null)}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0f121d] border border-[#23283b] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0f121d]/95 backdrop-blur-md border-b border-[#1c2234]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-gaming uppercase tracking-wider text-red-500 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
              {selectedListing.rank}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              LVL {selectedListing.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReport}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-[#181d2c] transition-colors"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedListing(null)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#181d2c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Screenshot Gallery */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-[#20263b] group">
            <img
              src={images[activeImageIndex]}
              alt={selectedListing.title}
              className="w-full h-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeImageIndex === idx ? "bg-red-500 w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                {selectedListing.title}
              </h1>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold font-gaming text-emerald-400">
                  ₦{selectedListing.price.toLocaleString()}
                </div>
                <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider block">
                  🛡️ Escrow Protected
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Listed on {new Date(selectedListing.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Seller Profile Card */}
          <div className="p-3 rounded-2xl bg-[#141827] border border-[#242b40] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedListing.sellerAvatar}
                alt={selectedListing.sellerUsername}
                className="w-10 h-10 rounded-full object-cover border-2 border-red-500/30"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">
                    {selectedListing.sellerUsername}
                  </span>
                  {selectedListing.sellerIsVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-800/50">
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                      Verified Seller
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                  <span>⭐ {selectedListing.sellerRating || 4.9} rating</span>
                  <span>•</span>
                  <span>{selectedListing.sellerSales || 40}+ successful sales</span>
                </div>
              </div>
            </div>

            {!isOwnListing && (
              <button
                onClick={handleChat}
                className="px-3 py-1.5 bg-[#1f253a] hover:bg-[#28314d] text-gray-200 text-xs font-semibold rounded-xl border border-[#303a55] transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                Chat
              </button>
            )}
          </div>

          {/* Account Statistics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-[#121523] border border-[#1f2538] text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Level</span>
              <span className="text-base font-bold font-gaming text-white">
                Lv. {selectedListing.level}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#121523] border border-[#1f2538] text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Rank</span>
              <span className="text-sm font-bold font-gaming text-red-400 truncate block">
                {selectedListing.rank}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#121523] border border-[#1f2538] text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Region</span>
              <span className="text-xs font-bold text-gray-200 truncate block mt-0.5">
                {selectedListing.region}
              </span>
            </div>
          </div>

          {/* Bind Type Warning / Details */}
          <div className="p-2.5 rounded-xl bg-[#131924] border border-[#212f45] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-300">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Login Account Bind:</span>
            </div>
            <span className="font-bold text-white bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800/40">
              {selectedListing.bindType}
            </span>
          </div>

          {/* Evo Guns List */}
          {selectedListing.evoGuns && selectedListing.evoGuns.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold font-gaming text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                Max Evo Weapons ({selectedListing.evoGuns.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedListing.evoGuns.map((gun, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 font-medium"
                  >
                    🔥 {gun}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Exclusive Items & Bundles */}
          {selectedListing.exclusiveItems && selectedListing.exclusiveItems.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold font-gaming text-white uppercase tracking-wider">
                👑 Rare Outfits & Bundles
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedListing.exclusiveItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-300 font-medium"
                  >
                    ✨ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Account Description */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Seller Description
            </span>
            <div className="p-3 rounded-xl bg-[#111422] border border-[#1f253b] text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {selectedListing.description}
            </div>
          </div>

          {/* Escrow Safety Advisory Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/40 to-black border border-red-800/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-400">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>RAY SHOP Escrow Protection Guarantee</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              When you click Purchase, your payment is held safely by RAY SHOP Escrow. The seller does not receive money until you confirm login credentials and secure the Free Fire account.
            </p>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="sticky bottom-0 z-20 p-3 bg-[#0d0f17]/95 backdrop-blur-md border-t border-[#1c2234] flex items-center gap-2">
          {!isOwnListing ? (
            <>
              <button
                onClick={handleChat}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#171b2b] hover:bg-[#20263c] text-white text-xs font-bold border border-[#2b334e] transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-red-400" />
                Chat with Seller
              </button>
              {selectedListing.status === "active" ? (
                <button
                  onClick={handleBuy}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold font-gaming transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buy Now (₦{selectedListing.price.toLocaleString()})
                </button>
              ) : (
                <div className="flex-1 py-2.5 px-3 rounded-xl bg-gray-800 text-gray-400 text-xs font-bold text-center uppercase tracking-wider">
                  Account Sold
                </div>
              )}
            </>
          ) : (
            <div className="w-full text-center py-2 text-xs text-gray-400 bg-[#141827] rounded-xl border border-[#22293f]">
              This is your published account listing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
