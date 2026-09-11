import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { ListingCard } from "./ListingCard";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  Flame,
  Globe,
  Award,
} from "lucide-react";
import { AccountRank, AccountRegion } from "../types";

export const MarketplaceView: React.FC = () => {
  const { listings, refreshListings, unlockAdminWithPin, showToast } = useApp();

  const [search, setSearch] = useState("");
  const [selectedRank, setSelectedRank] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minLevel, setMinLevel] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Trigger admin access if user searches RAYADMIN999
  const handleSearchChange = async (val: string) => {
    setSearch(val);
    const cleaned = val.trim().toUpperCase();
    if (cleaned === "RAYADMIN999") {
      setSearch("");
      showToast("Accessing Master Admin Terminal...", "info");
      await unlockAdminWithPin("RAYADMIN999");
    }
  };

  const ranks: AccountRank[] = [
    "Grandmaster",
    "Master",
    "Heroic",
    "Diamond",
    "Platinum",
    "Gold",
  ];

  const regions: AccountRegion[] = [
    "North America",
    "Brazil",
    "Indonesia",
    "Europe",
    "Singapore",
    "India",
    "Middle East",
    "Latin America",
  ];

  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        // Search
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = listing.title.toLowerCase().includes(q);
          const matchDesc = listing.description.toLowerCase().includes(q);
          const matchSeller = listing.sellerUsername.toLowerCase().includes(q);
          const matchEvo = listing.evoGuns?.some((g) => g.toLowerCase().includes(q));
          const matchItem = listing.exclusiveItems?.some((i) => i.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchSeller && !matchEvo && !matchItem) {
            return false;
          }
        }

        // Rank
        if (selectedRank !== "all" && listing.rank.toLowerCase() !== selectedRank.toLowerCase()) {
          return false;
        }

        // Region
        if (selectedRegion !== "all" && listing.region.toLowerCase() !== selectedRegion.toLowerCase()) {
          return false;
        }

        // Min Price
        if (minPrice && listing.price < Number(minPrice)) {
          return false;
        }

        // Max Price
        if (maxPrice && listing.price > Number(maxPrice)) {
          return false;
        }

        // Min Level
        if (minLevel > 1 && listing.level < minLevel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "level-desc") return b.level - a.level;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, search, selectedRank, selectedRegion, minPrice, maxPrice, minLevel, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setSelectedRank("all");
    setSelectedRegion("all");
    setMinPrice("");
    setMaxPrice("");
    setMinLevel(1);
    setSortBy("latest");
  };

  const activeFiltersCount = [
    selectedRank !== "all",
    selectedRegion !== "all",
    Boolean(minPrice),
    Boolean(maxPrice),
    minLevel > 1,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-gaming text-white uppercase tracking-wider">
            Marketplace
          </h2>
          <p className="text-[11px] text-gray-400">
            Browse verified Free Fire accounts for sale
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="open-filters-btn"
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeFiltersCount > 0
                ? "bg-red-600/20 text-red-400 border-red-500/50"
                : "bg-[#141825] text-gray-300 border-[#252b3e] hover:bg-[#1b2032]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search & Sort Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="marketplace-search-input"
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim().toUpperCase() === "RAYADMIN999") {
                handleSearchChange(search);
              }
            }}
            placeholder="Search level, weapons, skins, seller..."
            className="w-full bg-[#111420] border border-[#21273a] focus:border-red-500 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111420] border border-[#21273a] text-gray-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-red-500 appearance-none pr-7 font-medium"
          >
            <option value="latest">Latest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="level-desc">Highest Level</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {isFilterDrawerOpen && (
        <div className="bg-[#121524] border border-[#262c42] rounded-2xl p-3.5 space-y-3.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-[#20263a] pb-2">
            <span className="text-xs font-bold text-white uppercase font-gaming tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-red-400" />
              Filter Options
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            )}
          </div>

          {/* Region Selector */}
          <div>
            <label className="text-[11px] text-gray-400 font-medium block mb-1.5">
              Region / Server
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedRegion("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedRegion === "all"
                    ? "bg-red-600 text-white"
                    : "bg-[#181d2e] text-gray-300 border border-[#272f47] hover:bg-[#20273d]"
                }`}
              >
                All Regions
              </button>
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    selectedRegion === reg
                      ? "bg-red-600 text-white"
                      : "bg-[#181d2e] text-gray-300 border border-[#272f47] hover:bg-[#20273d]"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Rank Selector */}
          <div>
            <label className="text-[11px] text-gray-400 font-medium block mb-1.5">
              Competitive Rank
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedRank("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedRank === "all"
                    ? "bg-red-600 text-white"
                    : "bg-[#181d2e] text-gray-300 border border-[#272f47] hover:bg-[#20273d]"
                }`}
              >
                All Ranks
              </button>
              {ranks.map((rnk) => (
                <button
                  key={rnk}
                  onClick={() => setSelectedRank(rnk)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    selectedRank === rnk
                      ? "bg-red-600 text-white"
                      : "bg-[#181d2e] text-gray-300 border border-[#272f47] hover:bg-[#20273d]"
                  }`}
                >
                  {rnk}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range & Min Level */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#1f2538]">
            <div>
              <label className="text-[11px] text-gray-400 font-medium block mb-1">
                Price Range (₦ NGN)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-[#181d2e] border border-[#272f47] rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <span className="text-gray-500 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-[#181d2e] border border-[#272f47] rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-gray-400 font-medium">
                  Min Account Level
                </label>
                <span className="text-[11px] font-bold text-red-400 font-gaming">
                  Lv. {minLevel}+
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="85"
                value={minLevel}
                onChange={(e) => setMinLevel(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors font-gaming"
            >
              Apply ({filteredListings.length} results)
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-gray-400">
        <span>
          Showing <strong className="text-white">{filteredListings.length}</strong> accounts
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-[11px] text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-900/40">
            {activeFiltersCount} filters applied
          </span>
        )}
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-[#10131e] rounded-2xl border border-[#1f2538] p-6 space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center mx-auto text-red-400">
            <Flame className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">No accounts match your criteria</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Try loosening your price, region, or rank filters to discover more Free Fire account listings.
          </p>
          <button
            onClick={resetFilters}
            className="px-3.5 py-1.5 bg-[#1a2030] hover:bg-[#232a40] text-gray-200 text-xs font-medium rounded-xl border border-[#2b334c] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};
