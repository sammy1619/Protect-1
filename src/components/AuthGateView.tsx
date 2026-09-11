import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import {
  Flame,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Gamepad2,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const AuthGateView: React.FC = () => {
  const { refreshUser, showToast, unlockAdminWithPin } = useApp();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [freeFireUid, setFreeFireUid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Secret Admin Terminal states
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [secretPin, setSecretPin] = useState("");
  const [secretError, setSecretError] = useState("");
  const [isVerifyingSecret, setIsVerifyingSecret] = useState(false);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Secret Logo Multi-tap trigger
  const handleLogoTap = () => {
    setSecretTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsSecretModalOpen(true);
        setSecretTapCount(0);
        if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
        return 0;
      }
      return next;
    });

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      setSecretTapCount(0);
    }, 2500);
  };

  // Keyboard shortcut Ctrl+Shift+A or Cmd+Shift+A for secret terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsSecretModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("Please enter your desired username");
      return;
    }
    if (username.trim().length < 3) {
      setErrorMessage("Username must be at least 3 characters");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter a secure password");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.registerUser({
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        freeFireUid: freeFireUid.trim(),
        password,
      });
      showToast(`Welcome to RAY SHOP, ${username}!`, "success");
      await refreshUser();
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginIdentifier.trim()) {
      setErrorMessage("Please enter your username or email");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      await api.loginUser(loginIdentifier.trim(), password);
      showToast("Signed in successfully!", "success");
      await refreshUser();
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please verify.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecretUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecretError("");

    if (!secretPin.trim()) {
      setSecretError("Enter security override code");
      return;
    }

    setIsVerifyingSecret(true);
    const success = await unlockAdminWithPin(secretPin.trim());
    setIsVerifyingSecret(false);

    if (success) {
      setIsSecretModalOpen(false);
      setSecretPin("");
    } else {
      setSecretError("Security Override Denied: Invalid Master PIN");
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

      {/* Secret Trigger Area: RAY SHOP Brand Header */}
      <div className="w-full max-w-md mx-auto text-center mb-6 relative z-10">
        <div
          id="auth-brand-secret-trigger"
          onClick={handleLogoTap}
          className="inline-flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
          title="RAY SHOP"
        >
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.6)] mb-3 border border-red-400/40 group-hover:scale-105 transition-all">
            <Flame className="w-9 h-9 text-white" />
            <span className="absolute -bottom-1 -right-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/80 text-red-400 border border-red-500/60 font-gaming">
              FF MAX
            </span>
          </div>

          <h1 className="text-2xl font-black font-gaming tracking-wider text-white">
            RAY <span className="text-red-500">SHOP</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">
            Verified Free Fire Account Escrow Marketplace
          </p>
        </div>

        {/* Security / Escrow Guarantee Pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131724] border border-[#232a3f] text-[11px] text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Protected by RAY 2-Way Escrow Protocol</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md mx-auto bg-[#0d101a] border border-[#20273c] rounded-3xl p-6 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#151928] rounded-2xl border border-[#273049] mb-5">
          <button
            id="tab-mode-signup"
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage("");
            }}
            className={`py-2.5 text-xs font-bold font-gaming uppercase tracking-wider rounded-xl transition-all ${
              mode === "signup"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
          <button
            id="tab-mode-login"
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
            className={`py-2.5 text-xs font-bold font-gaming uppercase tracking-wider rounded-xl transition-all ${
              mode === "login"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SIGN UP FORM */}
        {mode === "signup" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Desired Username */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Desired Gamer Tag / Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-username-input"
                  type="text"
                  required
                  placeholder="e.g. ThunderStrike_99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-gaming"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Your custom marketplace display name (choose any name you want)
              </p>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone Number / WhatsApp */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Phone Number (WhatsApp) <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-phone-input"
                  type="tel"
                  placeholder="+234 812 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Free Fire UID */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Free Fire UID <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Gamepad2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-uid-input"
                  type="text"
                  placeholder="e.g. 7031684177"
                  value={freeFireUid}
                  onChange={(e) => setFreeFireUid(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-gaming"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Encrypted Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-confirm-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-bold text-xs font-gaming uppercase tracking-wider rounded-xl shadow-[0_0_16px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Enter Market</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* LOG IN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username or Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Username, Email or Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-identifier-input"
                  type="text"
                  required
                  placeholder="Enter username or email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 font-gaming">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141826] border border-[#27314a] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-bold text-xs font-gaming uppercase tracking-wider rounded-xl shadow-[0_0_16px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In To Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-[#1c2236] text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>All transactions held in Escrow until buyer confirms account handover</span>
        </div>
      </div>

      {/* SECRET MASTER ADMIN TERMINAL MODAL */}
      {isSecretModalOpen && (
        <div
          id="secret-admin-terminal-overlay"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsSecretModalOpen(false)}
        >
          <div
            id="secret-admin-terminal-modal"
            className="w-full max-w-sm bg-[#0e111a] border-2 border-red-600/80 rounded-3xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.5)] text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto mb-3 text-red-400 shadow-lg">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-base font-black font-gaming text-white uppercase tracking-wider">
              Terminal Security Override
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Authorised administrative override access only.
            </p>

            {secretError && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-[11px] text-red-300 font-mono">
                {secretError}
              </div>
            )}

            <form onSubmit={handleSecretUnlock} className="mt-4 space-y-3">
              <input
                id="secret-admin-pin-input"
                type="password"
                autoFocus
                placeholder="Enter Override PIN"
                value={secretPin}
                onChange={(e) => setSecretPin(e.target.value)}
                className="w-full bg-[#161a29] border border-[#2e3752] rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-widest text-red-400 focus:outline-none focus:border-red-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSecretModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#1b2033] hover:bg-[#252b45] text-gray-300 font-gaming text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="secret-admin-pin-submit"
                  type="submit"
                  disabled={isVerifyingSecret}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-bold font-gaming text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {isVerifyingSecret ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Unlock</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
