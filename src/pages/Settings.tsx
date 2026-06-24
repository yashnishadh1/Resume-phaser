import { useState, useEffect } from "react";
import { User, Lock, Bell, Users, CreditCard, Shield, Smartphone, Mail, Plus, MoreVertical, CheckCircle2 } from "lucide-react";
import apiClient from "@/api/client";

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Form State
  const [firstName, setFirstName] = useState(() => localStorage.getItem('userFirstName') || "");
  const [lastName, setLastName] = useState(() => localStorage.getItem('userLastName') || "");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch real user data from API on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get("/auth/me");
        const user = response.data;
        setEmail(user.email || "");
        if (user.full_name) {
          const parts = user.full_name.split(" ");
          const fn = parts[0] || "";
          const ln = parts.slice(1).join(" ") || "";
          setFirstName(fn);
          setLastName(ln);
          localStorage.setItem('userFirstName', fn);
          localStorage.setItem('userLastName', ln);
        }
      } catch (err) {
        // Fallback to localStorage values if API fails
        console.error("Failed to fetch user profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchUser();
  }, []);

  const handleSaveChanges = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      window.dispatchEvent(new Event('profileUpdated'));
      
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2 tracking-tight">Settings</h1>
        <p className="text-zinc-500">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-1 shrink-0">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#10b981]/10 text-[#10b981]' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </aside>

        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-display font-bold text-zinc-900 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </div>
                  <button className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm">
                    Change Avatar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={isLoadingProfile ? "Loading..." : email}
                        readOnly
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed shadow-sm" 
                      />
                      {isLoadingProfile && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-zinc-300 border-t-[#10b981] animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">Email cannot be changed here.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Role</label>
                    <input type="text" defaultValue="Admin" disabled className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-500 opacity-70 cursor-not-allowed shadow-sm" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end items-center gap-4">
                  {saveSuccess && (
                    <span className="text-sm font-medium text-[#10b981] flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={16} /> Profile updated successfully
                    </span>
                  )}
                  <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-[#10b981] to-[#3b82f6] hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-display font-bold text-zinc-900 mb-6">Password Settings</h2>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] shadow-sm" />
                  </div>
                  <button className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors mt-2 shadow-sm">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-display font-bold text-zinc-900 mb-6">Two-Factor Authentication (2FA)</h2>
                <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg bg-zinc-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">Authenticator App</h3>
                      <p className="text-sm text-zinc-500">Use an app like Google Authenticator or Authy to secure your account.</p>
                    </div>
                  </div>
                  <button className="bg-white border border-zinc-200 text-zinc-900 font-medium px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-display font-bold text-zinc-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { title: "New Candidate Matches", desc: "Get notified when a high-scoring candidate is parsed." },
                      { title: "Weekly Digest", desc: "A summary of your hiring activities and stats." },
                      { title: "System Updates", desc: "Important updates regarding the Resume.ai platform." }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start justify-between p-4 border border-zinc-100 rounded-lg hover:border-zinc-200 transition-colors">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-zinc-900">{item.title}</p>
                            <p className="text-sm text-zinc-500">{item.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Push Notifications</h3>
                  <div className="flex items-start justify-between p-4 border border-zinc-100 rounded-lg hover:border-zinc-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-zinc-900">Desktop Push Notifications</p>
                        <p className="text-sm text-zinc-500">Receive real-time alerts in your browser.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold text-zinc-900">Team Members</h2>
                <button className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm">
                  <Plus size={16} />
                  Invite Member
                </button>
              </div>

              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-zinc-600">Member</th>
                      <th className="px-6 py-3 font-semibold text-zinc-600">Role</th>
                      <th className="px-6 py-3 font-semibold text-zinc-600">Status</th>
                      <th className="px-6 py-3 font-semibold text-zinc-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {[
                      { name: 'Jane Doe', email: 'jane.doe@company.com', role: 'Admin', status: 'Active', initials: 'JD', color: 'from-[#10b981] to-[#3b82f6]' },
                      { name: 'John Smith', email: 'john.smith@company.com', role: 'Recruiter', status: 'Active', initials: 'JS', color: 'from-purple-500 to-indigo-500' },
                      { name: 'Emily Chen', email: 'emily.c@company.com', role: 'Recruiter', status: 'Pending', initials: 'EC', color: 'from-orange-400 to-red-500' }
                    ].map((member, i) => (
                      <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xs`}>
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900">{member.name}</p>
                              <p className="text-xs text-zinc-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">{member.role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${member.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-display font-bold text-zinc-900 mb-6">Current Plan</h2>
                <div className="flex flex-col md:flex-row items-center justify-between p-6 border border-[#10b981]/30 bg-green-50/50 rounded-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#10b981]/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-zinc-900">Pro Plan</h3>
                      <span className="bg-[#10b981] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    </div>
                    <p className="text-zinc-600">You are currently on the Pro plan, billed $49/month.</p>
                  </div>
                  <div className="mt-4 md:mt-0 relative z-10 flex gap-3">
                    <button className="bg-white border border-zinc-200 text-zinc-900 font-medium px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm">
                      Cancel Plan
                    </button>
                    <button className="bg-gradient-to-r from-[#10b981] to-[#3b82f6] hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all">
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-display font-bold text-zinc-900">Payment Method</h2>
                  <button className="text-sm font-medium text-[#10b981] hover:text-[#059669]">Add New Card</button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center font-bold text-zinc-800 text-xs italic">
                      VISA
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">Visa ending in 4242</p>
                      <p className="text-sm text-zinc-500">Expires 12/2028</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="text-zinc-500 hover:text-zinc-900 font-medium text-sm">Edit</button>
                    <button className="text-red-500 hover:text-red-600 font-medium text-sm">Remove</button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-display font-bold text-zinc-900 mb-6">Billing History</h2>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-zinc-600">Date</th>
                        <th className="px-6 py-3 font-semibold text-zinc-600">Amount</th>
                        <th className="px-6 py-3 font-semibold text-zinc-600">Status</th>
                        <th className="px-6 py-3 font-semibold text-zinc-600 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {[
                        { date: 'Jun 1, 2026', amount: '$49.00', status: 'Paid' },
                        { date: 'May 1, 2026', amount: '$49.00', status: 'Paid' },
                        { date: 'Apr 1, 2026', amount: '$49.00', status: 'Paid' }
                      ].map((invoice, i) => (
                        <tr key={i} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 text-zinc-900">{invoice.date}</td>
                          <td className="px-6 py-4 text-zinc-900 font-medium">{invoice.amount}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#10b981] hover:underline font-medium">Download</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
