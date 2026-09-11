import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAMING_PRESETS = [
  {
    name: "Cyber Linx (GM)",
    url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80",
    tag: "Grandmaster",
  },
  {
    name: "Neon Samurai",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80",
    tag: "Mythic",
  },
  {
    name: "Shadow Ronin",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80",
    tag: "Evo Max",
  },
  {
    name: "DJ Alok Vibe",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    tag: "Pro Seller",
  },
  {
    name: "Kelly Swift",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    tag: "Speedster",
  },
  {
    name: "Bushido Hayato",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    tag: "Warrior",
  },
  {
    name: "Chrono Timekeeper",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    tag: "Shield",
  },
  {
    name: "Cyber Mercenary",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80",
    tag: "Tactical",
  },
];

export const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfilePicture, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"library" | "presets" | "url">("library");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(currentUser?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  // Process and compress image file to standard avatar format
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose a valid image file (PNG, JPG, WebP)", "error");
      return;
    }

    // Max 10MB check
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be smaller than 10MB", "error");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsUploading(false);
        return;
      }

      // Optimize and resize via canvas for instant, snappy loading
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 450;
        let width = img.width;
        let height = img.height;

        // Crop/scale to square center
        const size = Math.min(width, height);
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        const targetDim = Math.min(size, MAX_DIM);
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetDim, targetDim);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setSelectedAvatarUrl(compressedDataUrl);
          setFileDetails({
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`,
          });
          showToast("Photo loaded from your library! Click Save to apply.", "info");
        } else {
          setSelectedAvatarUrl(result);
        }
        setIsUploading(false);
      };

      img.onerror = () => {
        setSelectedAvatarUrl(result);
        setIsUploading(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      showToast("Failed to read image file", "error");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setSelectedAvatarUrl(customUrlInput.trim());
    setFileDetails(null);
    showToast("Avatar preview loaded from URL", "info");
  };

  const handleSave = async () => {
    if (!selectedAvatarUrl) return;
    if (selectedAvatarUrl === currentUser.avatar) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await updateProfilePicture(selectedAvatarUrl);
      onClose();
    } catch (err: any) {
      // Error handled by updateProfilePicture toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="change-avatar-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0f121e] border border-[#262c42] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f253a] bg-[#121524]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
                Change Profile Picture
              </h3>
              <p className="text-[10px] text-gray-400">Upload from library or select an avatar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1b2032] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="p-4 bg-[#0a0d16] border-b border-[#1b2135] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedAvatarUrl || currentUser.avatar}
                alt="Avatar preview"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-red-500/60 shadow-lg bg-[#141827]"
              />
              {currentUser.isVerifiedSeller && (
                <span className="absolute -bottom-1 -right-1 bg-[#0c0e15] rounded-full p-0.5" title="Verified">
                  <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-500/20" />
                </span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-gaming">
                <span>{currentUser.username}</span>
                <span className="text-[10px] text-emerald-400 font-sans font-normal">(Preview)</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {fileDetails ? (
                  <span className="text-emerald-300 font-medium">
                    📁 {fileDetails.name} ({fileDetails.size})
                  </span>
                ) : (
                  "New photo will appear across chats and listings"
                )}
              </p>
            </div>
          </div>

          {selectedAvatarUrl !== currentUser.avatar && (
            <button
              onClick={() => {
                setSelectedAvatarUrl(currentUser.avatar);
                setFileDetails(null);
              }}
              className="text-[10px] text-gray-400 hover:text-gray-200 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#151928] border border-[#222a42]"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Tab Selector */}
        <div className="p-2 bg-[#0c0f1b] border-b border-[#1b2135] flex items-center gap-1.5 text-xs font-gaming">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "library"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#141827]"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Upload from Library</span>
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "presets"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#141827]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gaming Avatars</span>
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "url"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#141827]"
            }`}
          >
            <span>URL</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0d101d]">
          {/* TAB 1: Library Upload (Device Photos / Gallery) */}
          {activeTab === "library" && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group ${
                  dragActive
                    ? "border-red-500 bg-red-950/20 scale-[0.99]"
                    : "border-[#27314d] hover:border-red-500/60 bg-[#121625] hover:bg-[#151a2d]"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/30 to-amber-600/30 border border-red-500/40 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform shadow-md">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div className="text-xs font-bold text-white font-gaming">
                  {isUploading ? "Optimizing image..." : "Choose from Library or Camera Roll"}
                </div>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                  Tap to browse photos on your phone or PC, or drag & drop an image here
                </p>

                <div className="mt-3.5 inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-gaming shadow-md transition-colors">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Browse Device Library</span>
                </div>

                <span className="text-[9px] text-gray-500 mt-2">
                  Supports PNG, JPG, JPEG, WebP • Max 10MB
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Free Fire Gaming Presets */}
          {activeTab === "presets" && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 mb-2 font-medium">
                Select from iconic Free Fire warrior and streamer styles:
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {GAMING_PRESETS.map((preset, idx) => {
                  const isSelected = selectedAvatarUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedAvatarUrl(preset.url);
                        setFileDetails(null);
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 p-1 transition-all flex flex-col items-center ${
                        isSelected
                          ? "border-red-500 bg-red-950/40 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                          : "border-[#21293f] bg-[#111422] hover:border-gray-500"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-14 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[9px] font-bold text-gray-300 mt-1 truncate max-w-full">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 shadow-md">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Custom URL */}
          {activeTab === "url" && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">
                  Paste Direct Image URL
                </label>
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!customUrlInput.trim()}
                className="w-full py-2 px-3 rounded-xl bg-[#1b2135] hover:bg-[#252f4c] text-white text-xs font-bold font-gaming transition-colors disabled:opacity-40"
              >
                Preview Image URL
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#121524] border-t border-[#1f253a] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="py-2 px-4 rounded-xl bg-[#171c2c] hover:bg-[#20273d] text-gray-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-profile-picture-btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading || !selectedAvatarUrl}
            className="py-2 px-5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold font-gaming transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Picture...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Profile Picture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
