import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { isAxiosError } from "axios";
import { Lock, UserRound } from "lucide-react";
import apiClient from "@/api/client";
import { useToast } from "@/components/ToastProvider";
import { usePageMetadata } from "@/lib/seo";

type SettingsTab = "profile" | "security";

function messageFromError(error: unknown, fallback: string) {
  const detail = isAxiosError(error) ? (error.response?.data as { detail?: unknown } | undefined)?.detail : undefined;
  return typeof detail === "string" ? detail : fallback;
}

export default function Settings() {
  const location = useLocation();
  const toast = useToast();
  const requestedTab = new URLSearchParams(location.search).get("tab");
  const [activeTab, setActiveTab] = useState<SettingsTab>(requestedTab === "security" ? "security" : "profile");
  const [firstName, setFirstName] = useState(() => localStorage.getItem("userFirstName") || "");
  const [lastName, setLastName] = useState(() => localStorage.getItem("userLastName") || "");
  const [savedName, setSavedName] = useState("");
  const [email, setEmail] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  usePageMetadata({ title: "Settings | HireLens", description: "Manage your HireLens account profile and password in a private workspace.", path: "/dashboard/settings", noIndex: true });

  useEffect(() => {
    let active = true;
    apiClient.get("/auth/me").then(({ data }) => {
      if (!active) return;
      setEmail(data.email || "");
      const name = (data.full_name || "").trim();
      const parts = name.split(/\s+/).filter(Boolean);
      const first = parts.shift() || "";
      const last = parts.join(" ");
      setFirstName(first);
      setLastName(last);
      setSavedName(name);
      localStorage.setItem("userFirstName", first);
      localStorage.setItem("userLastName", last);
    }).catch((error: unknown) => {
      if (active) setProfileError(messageFromError(error, "Could not load your profile. Please try again."));
    }).finally(() => {
      if (active) setIsLoadingProfile(false);
    });
    return () => { active = false; };
  }, []);

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      setProfileError("Enter your first or last name before saving.");
      return;
    }
    setIsSavingProfile(true);
    setProfileError("");
    try {
      const { data } = await apiClient.patch("/auth/me", { full_name: fullName });
      const parts = (data.full_name || fullName).trim().split(/\s+/).filter(Boolean);
      const first = parts.shift() || "";
      const last = parts.join(" ");
      setFirstName(first);
      setLastName(last);
      setSavedName(data.full_name || fullName);
      localStorage.setItem("userFirstName", first);
      localStorage.setItem("userLastName", last);
      window.dispatchEvent(new Event("profileUpdated"));
      toast("Profile updated successfully.", "success");
    } catch (error: unknown) {
      setProfileError(messageFromError(error, "Could not save your profile. Please try again."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const resetProfile = () => {
    const parts = savedName.trim().split(/\s+/).filter(Boolean);
    setFirstName(parts.shift() || "");
    setLastName(parts.join(" "));
    setProfileError("");
  };

  const resetPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiClient.post("/auth/password", { current_password: currentPassword, new_password: newPassword });
      resetPassword();
      toast("Password changed. Please sign in again on your other devices.", "success");
    } catch (error: unknown) {
      setPasswordError(messageFromError(error, "Could not update your password. Please try again."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const inputClass = "min-h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <header>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-100">Settings</h1>
        <p className="text-slate-400">Manage your account profile and password.</p>
      </header>

      <div className="flex flex-col gap-6 md:flex-row">
        <nav aria-label="Settings sections" className="flex gap-2 md:w-56 md:flex-col">
          <button type="button" aria-pressed={activeTab === "profile"} onClick={() => setActiveTab("profile")} className={`flex min-h-11 flex-1 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors md:flex-none ${activeTab === "profile" ? "bg-indigo-500/15 text-indigo-200" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}>
            <UserRound size={18} aria-hidden="true" /> Profile
          </button>
          <button type="button" aria-pressed={activeTab === "security"} onClick={() => setActiveTab("security")} className={`flex min-h-11 flex-1 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors md:flex-none ${activeTab === "security" ? "bg-indigo-500/15 text-indigo-200" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}>
            <Lock size={18} aria-hidden="true" /> Security
          </button>
        </nav>

        <div className="min-w-0 flex-1">
          {activeTab === "profile" ? (
            <form onSubmit={handleSaveProfile} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
              <div>
                <h2 className="text-xl font-semibold text-white">Profile information</h2>
                <p className="mt-1 text-sm text-slate-400">Your name is shown in your HireLens workspace.</p>
              </div>
              {isLoadingProfile ? <p role="status" className="text-sm text-slate-400">Loading profile…</p> : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="profile-first-name" className="text-sm font-medium text-slate-200">First name</label>
                      <input id="profile-first-name" className={inputClass} value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profile-last-name" className="text-sm font-medium text-slate-200">Last name</label>
                      <input id="profile-last-name" className={inputClass} value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" maxLength={100} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label htmlFor="profile-email" className="text-sm font-medium text-slate-200">Email address</label>
                      <input id="profile-email" className={`${inputClass} cursor-not-allowed opacity-75`} value={email} readOnly autoComplete="email" />
                      <p className="text-xs text-slate-500">Email changes are not supported in this version.</p>
                    </div>
                  </div>
                  {profileError && <p role="alert" className="text-sm text-rose-300">{profileError}</p>}
                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
                    <button type="button" onClick={resetProfile} disabled={isSavingProfile || `${firstName} ${lastName}`.trim() === savedName} className="min-h-11 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={isSavingProfile || isLoadingProfile} className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">{isSavingProfile ? "Saving…" : "Save changes"}</button>
                  </div>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
              <div>
                <h2 className="text-xl font-semibold text-white">Change password</h2>
                <p className="mt-1 text-sm text-slate-400">Use a unique password with at least eight characters, including uppercase, lowercase, a number, and a symbol.</p>
              </div>
              <div className="max-w-xl space-y-4">
                <div className="space-y-2">
                  <label htmlFor="current-password" className="text-sm font-medium text-slate-200">Current password</label>
                  <input id="current-password" type="password" className={inputClass} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required maxLength={256} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-slate-200">New password</label>
                  <input id="new-password" type="password" className={inputClass} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required minLength={8} maxLength={256} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-slate-200">Confirm new password</label>
                  <input id="confirm-password" type="password" className={inputClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} maxLength={256} />
                </div>
              </div>
              {passwordError && <p role="alert" className="text-sm text-rose-300">{passwordError}</p>}
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
                <button type="button" onClick={resetPassword} disabled={isChangingPassword} className="min-h-11 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isChangingPassword} className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">{isChangingPassword ? "Updating…" : "Update password"}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
