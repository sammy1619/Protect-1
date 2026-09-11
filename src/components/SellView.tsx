import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import {
  ShieldCheck,
  Lock,
  PlusCircle,
  Flame,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Globe,
  Award,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AccountRank, AccountRegion, BindType } from "../types";

export const SellView: React.FC = () => {
  const {
    currentUser,
    setIsVerificationModalOpen,
    refreshListings,
    setActiveTab,
    showToast,
  } = useApp();

  const isVerified = currentUser?.isVerifiedSeller || currentUser?.role === "admin";
  const isPending = currentUser?.verificationStatus === "pending";

  // Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("72");
  const [rank, setRank] = useState<AccountRank>("Grandmaster");
  const [region, setRegion] = useState<AccountRegion>("North America");
  const [bindType, setBindType] = useState<BindType>("Google");
  const [evoGunsInput, setEvoGunsInput] = useState("AK47 Blue Flame Draco (Max Lv.7), MP40 Predatory Cobra (Lv.7)");
  const [exclusiveItemsInput, setExclusiveItemsInput] = useState("Red Criminal Bundle, Arctic Blue, Sakura Bundle");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80");
  const [isPublishing, setIsPublishing] = useState(false);

  // Preset sample image options for quick testing
  const sampleImages = [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
  ];

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !level) {
      showToast("Please fill in title, price, and level", "error");
      return;
    }

    setIsPublishing(true);
    try {
      const evoGuns = evoGunsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const exclusiveItems = exclusiveItemsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.createListing({
        title,
        price: Number(price),
        level: Number(level),
        rank,
        region,
        bindType,
        evoGuns,
        exclusiveItems,
        description: description || "Clean Free Fire account with verified login.",
        images: [imageUrl],
      });

      showToast("Account listing published to RAY SHOP!", "success");
      await refreshListings();
      setActiveTab("marketplace");
    } catch (err: any) {
      showToast(err.message || "Failed to publish listing", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  // UNVERIFIED SELLER SCREEN
  if (!isVerified) {
    return (
      <div className="py-6 px-3 max-w-md mx-auto space-y-5 text-center">
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-red-950/80 to-[#121524] border border-red-800/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(239,68,68,0.2)]">
          <Lock className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/50 text-red-400 text-xs font-bold font-gaming uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Seller Verification Required
          </div>
          <h2 className="text-xl font-bold font-gaming text-white">
            WANT TO SELL ON RAY SHOP?
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
            To prevent scams and maintain 100% genuine Free Fire account transactions, only verified merchants with identity validation can list accounts.
          </p>
        </div>

        {/* Verification Status Card */}
        {isPending ? (
          <div className="p-4 rounded-2xl bg-[#141828] border border-amber-500/40 text-left space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-gaming">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              VERIFICATION APPLICATION UNDER REVIEW
            </div>
            <p className="text-xs text-gray-300">
              Your seller verification request has been submitted to the admin team. Once approved, you will receive the Blue Verified Badge and instant listing publishing privileges.
            </p>
            <p className="text-[11px] text-gray-400 pt-1 border-t border-[#23293f]">
              Tip: In this environment, you can switch to the Admin persona using the top-right menu to approve your request instantly!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5 text-left text-xs">
              <div className="p-3 rounded-xl bg-[#121523] border border-[#20273a]">
                <div className="font-bold text-white flex items-center gap-1 font-gaming">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Verified Badge
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Boost buyer trust and sell accounts 4x faster.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#121523] border border-[#20273a]">
                <div className="font-bold text-white flex items-center gap-1 font-gaming">
                  <Flame className="w-3.5 h-3.5 text-red-500" /> Instant Listings
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Publish unlimited Free Fire accounts with live chat.
                </div>
              </div>
            </div>

            <button
              id="apply-verification-btn"
              onClick={() => setIsVerificationModalOpen(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white text-xs font-bold font-gaming rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              Apply for Seller Verification
            </button>
          </div>
        )}
      </div>
    );
  }

  // VERIFIED SELLER LISTING FORM
  return (
    <div className="space-y-4 pb-12 max-w-lg mx-auto">
      {/* Seller Header */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#131726] to-[#0f121e] border border-red-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-gaming shadow-sm">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Create Account Listing
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-blue-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Seller: @{currentUser?.username}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmitListing} className="space-y-3.5">
        {/* Title */}
        <div>
          <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
            Listing Title *
          </label>
          <input
            id="listing-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grandmaster Lv.78 | 7 Evo Guns Max | Sakura & Hip Hop Bundles"
            className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Price & Level Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
              Price (₦ NGN) *
            </label>
            <input
              id="listing-price-input"
              type="number"
              required
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 40000"
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
              Account Level *
            </label>
            <input
              id="listing-level-input"
              type="number"
              required
              min="1"
              max="100"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="e.g. 75"
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Rank & Region Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
              Competitive Rank *
            </label>
            <select
              id="listing-rank-select"
              value={rank}
              onChange={(e) => setRank(e.target.value as AccountRank)}
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="Grandmaster">Grandmaster</option>
              <option value="Master">Master</option>
              <option value="Heroic">Heroic</option>
              <option value="Diamond">Diamond</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
              Region / Server *
            </label>
            <select
              id="listing-region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value as AccountRegion)}
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="North America">North America</option>
              <option value="Brazil">Brazil</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Europe">Europe</option>
              <option value="Singapore">Singapore</option>
              <option value="India">India</option>
              <option value="Middle East">Middle East</option>
              <option value="Latin America">Latin America</option>
            </select>
          </div>
        </div>

        {/* Bind Type */}
        <div>
          <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
            Login Bind Type *
          </label>
          <select
            id="listing-bind-select"
            value={bindType}
            onChange={(e) => setBindType(e.target.value as BindType)}
            className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="Google">Google (Clean Transfer)</option>
            <option value="Facebook">Facebook (Ready to link phone/email)</option>
            <option value="VK">VK Account</option>
            <option value="Twitter">Twitter / X</option>
            <option value="Clean (Unbound)">Clean (Unbound Guest)</option>
          </select>
        </div>

        {/* Evo Guns Input */}
        <div>
          <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
            Max Evo Guns (comma separated)
          </label>
          <input
            id="listing-evo-input"
            type="text"
            value={evoGunsInput}
            onChange={(e) => setEvoGunsInput(e.target.value)}
            placeholder="AK47 Draco Lv.7, MP40 Cobra Lv.7, M1014 Green Flame"
            className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Exclusive Items / Skins Input */}
        <div>
          <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
            Exclusive Skins & Bundles (comma separated)
          </label>
          <input
            id="listing-skins-input"
            type="text"
            value={exclusiveItemsInput}
            onChange={(e) => setExclusiveItemsInput(e.target.value)}
            placeholder="Red Criminal Bundle, Sakura Bundle, Arctic Blue, Titan SCAR"
            className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Screenshot Image Upload / URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block">
            Account Screenshot
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL or choose file below"
              className="flex-1 bg-[#111422] border border-[#23283b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <label className="px-3 py-2 bg-[#181d2e] hover:bg-[#20273e] text-gray-300 rounded-xl border border-[#2a324b] text-xs font-medium cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-red-400" />
              Upload
              <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
            </label>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2">
            {sampleImages.map((sUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImageUrl(sUrl)}
                className={`w-14 h-10 rounded-lg overflow-hidden border transition-all ${
                  imageUrl === sUrl ? "border-red-500 ring-2 ring-red-500/40" : "border-gray-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={sUrl} alt="Sample" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
            Account Description
          </label>
          <textarea
            id="listing-desc-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail the inventory, badges, win rates, and handover instructions..."
            className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          id="publish-listing-btn"
          type="submit"
          disabled={isPublishing}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold font-gaming rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Listing...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" />
              <span>Publish Account Listing</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
