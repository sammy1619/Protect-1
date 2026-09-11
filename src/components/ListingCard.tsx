import React from "react";
import { Listing } from "../types";
import { ShieldCheck, Flame, Eye, Swords, Shield, Globe } from "lucide-react";
import { useApp } from "../context/AppContext";

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, featured = false }) => {
  const { setSelectedListing, setIsPurchaseModalOpen } = useApp();

  const getRankBadgeColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "grandmaster":
        return "bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-400";
      case "master":
        return "bg-gradient-to-r from-purple-700 to-red-600 text-white border-purple-400";
      case "heroic":
        return "bg-red-600 text-white border-red-400";
      case "diamond":
        return "bg-cyan-600 text-white border-cyan-300";
      case "platinum":
        return "bg-teal-700 text-teal-100 border-teal-400";
      default:
        return "bg-amber-700 text-amber-100 border-amber-400";
    }
  };

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedListing(listing);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedListing(listing);
    setIsPurchaseModalOpen(true);
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      onClick={handleOpenDetail}
      className={`group relative bg-[#111420] border border-[#22273b] hover:border-red-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(239,68,68,0.12)] flex flex-col ${
        featured ? "border-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.08)]" : ""
      }`}
    >
      {/* Account Image Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0d0f17]">
        <img
          src={listing.images[0] || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111420] via-transparent to-black/40" />

        {/* Level Tag (Top Left) */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-gray-200 border border-white/10 font-gaming">
            LVL {listing.level}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border shadow-sm ${getRankBadgeColor(
              listing.rank
            )}`}
          >
            {listing.rank}
          </span>
        </div>

        {/* Region & Sold Status (Top Right) */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {listing.status === "sold" ? (
            <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
              SOLD
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] text-gray-300 border border-white/10 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 text-gray-400" />
              {listing.region}
            </span>
          )}
        </div>

        {/* Evo Guns Count Pill */}
        {listing.evoGuns && listing.evoGuns.length > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/80 backdrop-blur-md border border-red-700/60 text-red-400 text-[10px] font-bold font-gaming">
            <Flame className="w-3 h-3 text-red-500 animate-pulse" />
            <span>{listing.evoGuns.length} EVO GUNS</span>
          </div>
        )}

        {/* View Count */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-gray-400 text-[9px]">
          <Eye className="w-2.5 h-2.5" />
          <span>{listing.viewsCount || 1}</span>
        </div>
      </div>

      {/* Account Info Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-semibold text-xs text-gray-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
            {listing.title}
          </h3>

          {/* Key tags (Evo highlights & items) */}
          <div className="flex flex-wrap gap-1 mt-2">
            {listing.evoGuns?.[0] && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1c2234] text-gray-300 border border-[#2b334c] truncate max-w-[130px]">
                ⚡ {listing.evoGuns[0]}
              </span>
            )}
            {listing.exclusiveItems?.[0] && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#241c2c] text-purple-300 border border-[#442c55] truncate max-w-[130px]">
                👑 {listing.exclusiveItems[0]}
              </span>
            )}
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#131b26] text-blue-300 border border-[#20314a]">
              🔒 {listing.bindType}
            </span>
          </div>
        </div>

        {/* Seller Info & Price Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#1e2335] flex items-center justify-between gap-2">
          {/* Seller */}
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={listing.sellerAvatar}
              alt={listing.sellerUsername}
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#2c344d]"
            />
            <div className="flex items-center gap-1 truncate">
              <span className="text-[11px] font-medium text-gray-300 truncate">
                {listing.sellerUsername}
              </span>
              {listing.sellerIsVerified && (
                <ShieldCheck
                  className="w-3.5 h-3.5 text-blue-400 shrink-0"
                  title="Verified Seller"
                />
              )}
            </div>
          </div>

          {/* Price & Buy CTA */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="text-right">
              <div className="text-sm sm:text-base font-bold font-gaming text-emerald-400 leading-none">
                ₦{listing.price.toLocaleString()}
              </div>
              <span className="text-[8px] text-gray-400 uppercase tracking-tighter">
                Escrow
              </span>
            </div>

            {listing.status === "active" && (
              <button
                onClick={handleQuickBuy}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[11px] font-bold rounded-lg transition-colors font-gaming shadow-sm"
              >
                Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
