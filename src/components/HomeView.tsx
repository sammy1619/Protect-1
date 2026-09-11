import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { ListingCard } from "./ListingCard";
import { Search, Flame, ShieldCheck, Sparkles, Filter, ArrowRight, Zap, RefreshCw } from "lucide-react";

export const HomeView: React.FC = () => {
  const { listings, setActiveTab, setSelectedListing, refreshListings, unlockAdminWithPin, showToast } = useApp();
  const [filterTag, setFilterTag] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [homeSearch, setHomeSearch] = useState("");

  const handleHomeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeSearch.trim()) {
      setActiveTab("marketplace");
      return;
    }

    if (homeSearch.trim().toUpperCase() === "RAYADMIN999") {
      setHomeSearch("");
      showToast("Accessing Master Admin Terminal...", "info");
      await unlockAdminWithPin("RAYADMIN999");
      return;
    }

    setActiveTab("marketplace");
  };

  const handleHomeSearchChange = async (val: string) => {
    setHomeSearch(val);
    if (val.trim().toUpperCase() === "RAYADMIN999") {
      setHomeSearch("");
      showToast("Accessing Master Admin Terminal...", "info");
      await unlockAdminWithPin("RAYADMIN999");
    }
  };

  const featuredListings = useMemo(() => {
    return listings.filter((l) => l.featured && l.status === "active").slice(0, 3);
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (filterTag === "all") return listings.slice(0, 8);
    if (filterTag === "grandmaster")
      return listings.filter((l) => l.rank.toLowerCase() === "grandmaster");
    if (filterTag === "evo")
      return listings.filter((l) => l.evoGuns && l.evoGuns.length >= 3);
    if (filterTag === "budget")
      return listings.filter((l) => l.price <= 50000);
    return listings;
  }, [listings, filterTag]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshListings();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Hero Banner with Escrow & Free Fire Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b0d12] via-[#121522] to-[#0c0e15] border border-red-900/40 p-4 shadow-xl">
        {/* Background glow graphics */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-800/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/70 border border-red-800/40 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-red-400" />
              Verified Accounts Only
            </span>
            <button
              onClick={handleManualRefresh}
              className="text-gray-400 hover:text-white p-1 transition-colors"
              title="Refresh listings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
            </button>
          </div>

          <h2 className="text-xl font-bold font-gaming text-white tracking-wide leading-tight">
            BUY & SELL <span className="text-red-500">FREE FIRE</span> ACCOUNTS
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-[90%] leading-relaxed">
            Direct peer-to-peer marketplace with guaranteed escrow safety. Only verified sellers can list.
          </p>

          {/* Escrow trust highlights */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-bold text-white font-gaming">100% ESCROW</div>
              <div className="text-[9px] text-gray-400">Payment Protected</div>
            </div>
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-bold text-blue-400 font-gaming flex items-center justify-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </div>
              <div className="text-[9px] text-gray-400">KYC Checked Sellers</div>
            </div>
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-bold text-green-400 font-gaming">INSTANT</div>
              <div className="text-[9px] text-gray-400">Live Chat Handover</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search Shortcut Bar */}
      <form
        onSubmit={handleHomeSearch}
        className="flex items-center justify-between p-1.5 pl-3 rounded-xl bg-[#131622] border border-[#22283b] focus-within:border-red-500/80 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-1">
          <Search className="w-4 h-4 text-red-500 shrink-0" />
          <input
            id="home-search-input"
            type="text"
            value={homeSearch}
            onChange={(e) => handleHomeSearchChange(e.target.value)}
            placeholder="Search accounts or skins..."
            className="bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none w-full"
          />
        </div>
        <button
          type="submit"
          className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 hover:bg-red-900/60 px-2.5 py-1.5 rounded-lg border border-red-800/40 transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Featured Accounts Carousel / Spotlight */}
      {featuredListings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                Featured Elite Accounts
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("marketplace")}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-gaming"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featuredListings.map((item) => (
              <ListingCard key={item.id} listing={item} featured={true} />
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterTag("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === "all"
              ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "bg-[#141724] text-gray-300 border border-[#23283a] hover:bg-[#1b2032]"
          }`}
        >
          All Listings ({listings.length})
        </button>
        <button
          onClick={() => setFilterTag("grandmaster")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === "grandmaster"
              ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "bg-[#141724] text-gray-300 border border-[#23283a] hover:bg-[#1b2032]"
          }`}
        >
          🏆 Grandmaster
        </button>
        <button
          onClick={() => setFilterTag("evo")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === "evo"
              ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "bg-[#141724] text-gray-300 border border-[#23283a] hover:bg-[#1b2032]"
          }`}
        >
          🔥 Max Evo Guns
        </button>
        <button
          onClick={() => setFilterTag("budget")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === "budget"
              ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "bg-[#141724] text-gray-300 border border-[#23283a] hover:bg-[#1b2032]"
          }`}
        >
          💎 Under ₦50,000
        </button>
      </div>

      {/* Latest Listings Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Marketplace Feed
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">
            {filteredListings.length} accounts available
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-10 bg-[#111420] rounded-2xl border border-[#202538] p-6">
            <Flame className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-300">No accounts in this category</p>
            <p className="text-xs text-gray-500 mt-1">Try selecting another filter or browse all listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
