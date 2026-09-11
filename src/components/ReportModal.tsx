import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import { X, Flag, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";

export const ReportModal: React.FC = () => {
  const { reportTarget, closeReportModal, showToast } = useApp();

  const [reason, setReason] = useState("Suspected fraudulent listing / Fake stats");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitReport({
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        targetTitle: reportTarget.title,
        reason,
        details,
      });
      showToast("Report submitted to RAY SHOP security moderation.", "success");
      closeReportModal();
    } catch (err: any) {
      showToast(err.message || "Failed to submit report", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeReportModal}
    >
      <div
        className="relative w-full max-w-sm bg-[#0f121e] border border-red-900/50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#131625] border-b border-[#21273c]">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold font-gaming text-white uppercase tracking-wider">
              Report Activity
            </h3>
          </div>
          <button
            onClick={closeReportModal}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-gray-300">
            Reporting: <strong className="text-white">{reportTarget.title || reportTarget.id}</strong>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
              Reason for report
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#111422] border border-[#23283b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="Suspected fraudulent listing / Fake stats">
                Suspected fraudulent listing / Fake stats
              </option>
              <option value="Already bound or recovered account">
                Already bound or recovered account
              </option>
              <option value="Attempting off-platform payment (Scam risk)">
                Attempting off-platform payment (Scam risk)
              </option>
              <option value="Abusive language or impersonation">
                Abusive language or impersonation
              </option>
              <option value="Other marketplace policy violation">
                Other marketplace policy violation
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 uppercase font-gaming tracking-wider block mb-1">
              Additional Details & Evidence
            </label>
            <textarea
              rows={3}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what happened or provide proof..."
              className="w-full bg-[#111422] border border-[#23283b] focus:border-red-500 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeReportModal}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold font-gaming rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
