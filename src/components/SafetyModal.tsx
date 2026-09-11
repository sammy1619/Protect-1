import React from "react";
import { useApp } from "../context/AppContext";
import { X, ShieldCheck, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

export const SafetyModal: React.FC = () => {
  const { isSafetyModalOpen, setIsSafetyModalOpen } = useApp();

  if (!isSafetyModalOpen) return null;

  return (
    <div
      id="safety-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsSafetyModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-[#0f121e] border border-[#23293e] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#121524] border-b border-[#21273c]">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              RAY Escrow Safety Guide
            </h3>
          </div>
          <button
            onClick={() => setIsSafetyModalOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-gray-300 leading-relaxed">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold font-gaming text-xs">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              Never Trade Outside RAY SHOP
            </div>
            <p className="text-[11px] text-gray-400 pl-7">
              Scammers often ask to move conversations to WhatsApp, Discord, or Instagram to avoid escrow holding. Never release payments or accept codes outside RAY SHOP chat.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold font-gaming text-xs">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              Immediate Bind & Security Transfer
            </div>
            <p className="text-[11px] text-gray-400 pl-7">
              Upon receiving credentials in the secure chat:
              <br />• Log into the account (Google or Facebook)
              <br />• Add your own 2-Factor Authentication
              <br />• Update the recovery phone number and email
              <br />• Remove all other logged-in sessions in Google/Facebook account settings
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold font-gaming text-xs">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              Verify Free Fire In-Game UID
            </div>
            <p className="text-[11px] text-gray-400 pl-7">
              Check in the Free Fire lobby that the UID, Evo Guns, Level, and Badges match the listing details. Only tap <strong>"Confirm & Release Escrow"</strong> once you are 100% satisfied.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold font-gaming text-xs">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center font-bold text-[10px]">
                4
              </span>
              Dispute Protection
            </div>
            <p className="text-[11px] text-gray-400 pl-7">
              If the seller provides invalid credentials or refuses to cooperate, simply tap <strong>"Dispute"</strong> in the chat. Escrow funds will remain locked until a RAY SHOP administrator reviews the handover.
            </p>
          </div>

          <button
            onClick={() => setIsSafetyModalOpen(false)}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-gaming rounded-xl transition-colors shadow-md mt-2"
          >
            I Understand Safe Trading
          </button>
        </div>
      </div>
    </div>
  );
};
