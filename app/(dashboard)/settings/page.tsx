"use client";

import { useState, useEffect } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Store,
  CreditCard,
  Bell,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface StoreSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  enableCash: boolean;
  enableQris: boolean;
  enableCard: boolean;
  updatedAt: string;
}

const PREFERENCES_STORAGE_KEY = "notaloka_preferences";

const defaultPreferences = {
  language: "en",
  currency: "IDR",
  enableNotifications: true,
  enableSound: true,
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "store" | "payment" | "preferences"
  >("store");

  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    name: "Notaloka POS",
    address: "",
    phone: "",
    email: "",
    taxRate: "10",
  });

  // Payment method toggles state
  const [paymentSettings, setPaymentSettings] = useState({
    enableCash: true,
    enableQris: true,
    enableCard: true,
  });

  // Preferences state — stored in localStorage (device-local UI preferences)
  const [preferences, setPreferences] = useState(defaultPreferences);

  // --- Fetch store settings from backend ---
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => apiClient.get<StoreSettings>("/api/v1/settings"),
  });

  // Populate form state when API data arrives
  useEffect(() => {
    if (settingsData) {
      setStoreSettings({
        name: settingsData.name,
        address: settingsData.address,
        phone: settingsData.phone,
        email: settingsData.email || session?.user?.email || "",
        taxRate: String(settingsData.taxRate),
      });
      setPaymentSettings({
        enableCash: settingsData.enableCash,
        enableQris: settingsData.enableQris,
        enableCard: settingsData.enableCard,
      });
    }
  }, [settingsData, session?.user?.email]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
    } catch {
      // Ignore parse errors — fall back to defaults
    }
  }, []);

  // --- Handlers ---
  const handleSaveStore = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch("/api/v1/settings", {
        name: storeSettings.name,
        address: storeSettings.address,
        phone: storeSettings.phone,
        email: storeSettings.email,
        taxRate: parseFloat(storeSettings.taxRate) || 0,
      });
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast.success("Store settings saved successfully");
    } catch {
      toast.error("Failed to save store settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch("/api/v1/settings", {
        enableCash: paymentSettings.enableCash,
        enableQris: paymentSettings.enableQris,
        enableCard: paymentSettings.enableCard,
      });
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast.success("Payment settings saved successfully");
    } catch {
      toast.error("Failed to save payment settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences),
      );
      toast.success("Preferences saved successfully");
    } catch {
      toast.error("Failed to save preferences");
    }
  };

  // --- Sub-components ---
  const TabButton = ({
    id,
    label,
    icon: Icon,
  }: {
    id: typeof activeTab;
    label: string;
    icon: React.ElementType;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all" +
        (activeTab === id
          ? " bg-brand text-white"
          : " text-slate-500 hover:text-slate-900 dark:hover:text-white")
      }
    >
      <Icon className="size-4" />
      {label}
    </button>
  );

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 peer-checked:bg-brand rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
    </label>
  );

  // --- Loading / Error states ---
  if (isLoadingSettings) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <AlertCircle className="size-8 text-rose-500" />
        <p className="text-slate-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your store configuration and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5">
        <TabButton id="store" label="Store" icon={Store} />
        <TabButton id="payment" label="Payment" icon={CreditCard} />
        <TabButton id="preferences" label="Preferences" icon={Bell} />
      </div>

      {/* Store Settings */}
      {activeTab === "store" && (
        <div className="space-y-6">
          <BentoCard className="p-6">
            <h2 className="font-bold text-lg mb-4">Store Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeSettings.name}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={storeSettings.email}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={storeSettings.address}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      address: e.target.value,
                    })
                  }
                  placeholder="Enter store address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={storeSettings.phone}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  value={storeSettings.taxRate}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      taxRate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveStore} isLoading={isSaving}>
                <Save className="size-4" />
                Save Changes
              </Button>
            </div>
          </BentoCard>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          {/* Midtrans Info Banner */}
          <BentoCard className="p-6">
            <h2 className="font-bold text-lg mb-4">Midtrans Configuration</h2>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <p className="font-bold mb-1">
                  Managed via Environment Variables
                </p>
                <p>
                  For security reasons, Midtrans API keys (Server Key, Client
                  Key, and Production mode) must be configured in your{" "}
                  <code className="font-mono bg-amber-500/10 px-1 rounded">
                    .env
                  </code>{" "}
                  file and are not editable here.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Payment Method Toggles */}
          <BentoCard className="p-6">
            <h2 className="font-bold text-lg mb-1">Payment Methods</h2>
            <p className="text-sm text-slate-500 mb-6">
              Enable or disable which payment methods appear at checkout.
            </p>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <span className="text-xs font-bold">CASH</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Cash Payment</p>
                    <p className="text-xs text-slate-500">
                      Accept cash payments at checkout
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={paymentSettings.enableCash}
                  onChange={(checked) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      enableCash: checked,
                    })
                  }
                />
              </div>

              <div className="border-t border-slate-100 dark:border-white/5" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="text-xs font-bold">QRIS</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">QRIS Payment</p>
                    <p className="text-xs text-slate-500">
                      Accept QRIS scan payments via Midtrans
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={paymentSettings.enableQris}
                  onChange={(checked) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      enableQris: checked,
                    })
                  }
                />
              </div>

              <div className="border-t border-slate-100 dark:border-white/5" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                    <span className="text-xs font-bold">VA</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Card / Virtual Account</p>
                    <p className="text-xs text-slate-500">
                      Accept credit card and virtual account payments
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={paymentSettings.enableCard}
                  onChange={(checked) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      enableCard: checked,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePayment} isLoading={isSaving}>
                <Save className="size-4" />
                Save Changes
              </Button>
            </div>
          </BentoCard>
        </div>
      )}

      {/* Preferences */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <BentoCard className="p-6">
            <h2 className="font-bold text-lg mb-1">Display</h2>
            <p className="text-sm text-slate-500 mb-6">
              Adjust language and currency display settings.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) =>
                    setPreferences({ ...preferences, language: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={(e) =>
                    setPreferences({ ...preferences, currency: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <option value="IDR">IDR - Indonesian Rupiah</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePreferences}>
                <Save className="size-4" />
                Save Changes
              </Button>
            </div>
          </BentoCard>

          <BentoCard className="p-6">
            <h2 className="font-bold text-lg mb-1">Notifications</h2>
            <p className="text-sm text-slate-500 mb-6">
              Control in-app alerts and audio feedback.
            </p>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Enable Notifications</p>
                  <p className="text-xs text-slate-500">
                    Receive browser notifications for important events
                  </p>
                </div>
                <Toggle
                  checked={preferences.enableNotifications}
                  onChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      enableNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="border-t border-slate-100 dark:border-white/5" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Sound Effects</p>
                  <p className="text-xs text-slate-500">
                    Play sounds for transactions and alerts
                  </p>
                </div>
                <Toggle
                  checked={preferences.enableSound}
                  onChange={(checked) =>
                    setPreferences({ ...preferences, enableSound: checked })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePreferences}>
                <Save className="size-4" />
                Save Changes
              </Button>
            </div>
          </BentoCard>
        </div>
      )}
    </div>
  );
}
