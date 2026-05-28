import { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings } from "../services/authService";
import { toast } from "react-toastify";
import { applyUiSettings } from "../utils/uiSettings";
import { useAuth } from "../hooks/useAuth";
import GlassPage from "../components/GlassPage";
import { FaSlidersH, FaPalette, FaRunning, FaGlasses, FaBell, FaUserCircle } from "react-icons/fa";

const defaultSettings = {
  theme: "system",
  reduceMotion: false,
  glassmorphism: true,
  emailNotifications: true,
  publicProfile: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const { updateSettingsState } = useAuth();

  useEffect(() => {
    getUserSettings().then((data) => {
      const merged = { ...defaultSettings, ...data };
      setSettings(merged);
      applyUiSettings(merged);
    }).catch(() => null);
  }, []);

  useEffect(() => {
    applyUiSettings(settings);
  }, [settings]);

  const save = async () => {
    try {
      const updated = await updateUserSettings(settings);
      setSettings((p) => ({ ...p, ...updated }));
      localStorage.setItem("ui_settings", JSON.stringify(updated));
      applyUiSettings(updated);
      
      // Sync auth context user state
      if (updateSettingsState) {
        updateSettingsState(updated);
      }
      
      toast.success("Settings applied and saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const toggle = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));

  return (
    <GlassPage>
      <div className="mx-auto max-w-3xl px-4 py-10">
        
        {/* Header */}
        <div className="glass-animate mb-8 flex items-center gap-3">
          <FaSlidersH className="text-3xl text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold font-display text-white">System Settings</h1>
            <p className="text-sm text-slate-300">Customize your reading environment and visual features.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-animate glass-card-premium rounded-2xl p-6 space-y-6">
          
          {/* Theme setting */}
          <div className="border-b border-white/5 pb-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <FaPalette className="text-violet-400" />
                Color Theme
              </span>
              <p className="text-xs text-slate-400 mb-3">Adjust how BookHub appears on your display.</p>
              <select
                value={settings.theme}
                onChange={(e) => setSettings((p) => ({ ...p, theme: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none"
              >
                <option value="system" className="bg-slate-900 text-white">System Default</option>
                <option value="light" className="bg-slate-900 text-white">Light Mode</option>
                <option value="dark" className="bg-slate-900 text-white">Dark Mode</option>
              </select>
            </label>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FaGlasses className="text-violet-400" />
              Interface Preferences
            </span>
            <p className="text-xs text-slate-400 mb-3">Toggle custom engine features for visual clarity and accessibility.</p>
            
            {[
              ["reduceMotion", "Reduce Motion", "Disables background parallax drifts and page staggers.", <FaRunning />],
              ["glassmorphism", "Enable Glassmorphism", "Renders beautiful frosted translucent backdrops and glows.", <FaGlasses />],
              ["emailNotifications", "Email Notifications", "Get updates on new chapters and community replies.", <FaBell />],
              ["publicProfile", "Public Profile", "Allows other readers to view your reading favorites.", <FaUserCircle />],
            ].map(([key, label, desc, icon]) => (
              <div 
                key={key} 
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] p-4 transition hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 mt-1 shrink-0">{icon}</span>
                  <div>
                    <h4 className="text-sm font-medium text-white">{label}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
                
                {/* Premium Switch Switcher */}
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none shrink-0 ${
                    settings[key] ? "bg-violet-600" : "bg-white/10 border border-white/10"
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                    settings[key] ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button 
              onClick={save} 
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm transition duration-300 hover:scale-[1.02] shadow-lg shadow-violet-900/10"
            >
              Apply Changes
            </button>
          </div>

        </div>

      </div>
    </GlassPage>
  );
}
