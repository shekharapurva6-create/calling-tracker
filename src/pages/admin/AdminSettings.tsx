import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { dataStore } from '../../services/storage/dataStore';
import {
  Building2,
  Target,
  Globe,
  Phone,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Bell,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { showToast } from '../../components/common/Toast';

export const AdminSettings: React.FC = () => {
  const currentSettings = dataStore.getSettings();
  const [companyName, setCompanyName] = useState(currentSettings.companyName || 'NexGenAi');
  const [defaultDailyTarget, setDefaultDailyTarget] = useState(currentSettings.defaultDailyTarget || 15);
  const [timezone, setTimezone] = useState(currentSettings.timezone || 'Asia/Kolkata');
  const [telephonyProvider, setTelephonyProvider] = useState<'MOCK' | 'PRODUCTION'>(
    currentSettings.telephonyProvider || 'MOCK'
  );

  // Notification settings state
  const notifSettings = currentSettings.notificationSettings || {
    emailEnabled: true,
    whatsappEnabled: true,
    inAppEnabled: true,
  };
  const [emailEnabled, setEmailEnabled] = useState(notifSettings.emailEnabled ?? true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(notifSettings.whatsappEnabled ?? true);
  const [inAppEnabled, setInAppEnabled] = useState(notifSettings.inAppEnabled ?? true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      dataStore.updateSettings({
        companyName: companyName.trim() || 'NexGenAi',
        defaultDailyTarget: Number(defaultDailyTarget) || 15,
        timezone,
        telephonyProvider,
        notificationSettings: {
          emailEnabled,
          whatsappEnabled,
          inAppEnabled,
          emailProvider: 'RESEND',
          whatsappProvider: 'META_CLOUD_API',
        },
      });
      setIsSaving(false);
      showToast('Settings saved successfully', 'success');
    }, 300);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all leads, calls, and performance to initial demo state?')) {
      dataStore.resetToDemoData();
      showToast('Demo data re-seeded successfully', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E9E5]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172017] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#6B756D] mt-0.5">
          Configure company branding, daily call targets, and telephony provider
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Company Info */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E9E5]">
            <Building2 className="w-5 h-5 text-[#0BAA45]" />
            <h3 className="text-base font-bold text-[#172017]">Company Profile</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
              Company Name <span className="text-[#E53935]">*</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="nexgen-input"
            />
            <p className="text-[11px] text-[#6B756D] mt-1 font-medium">
              Exact brand name: <strong className="text-[#0BAA45]">NexGenAi</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                Default Daily Call Target <span className="text-[#E53935]">*</span>
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min={1}
                  max={200}
                  required
                  value={defaultDailyTarget}
                  onChange={(e) => setDefaultDailyTarget(Number(e.target.value))}
                  className="nexgen-input pl-10"
                />
              </div>
              <p className="text-[11px] text-[#6B756D] mt-1">
                Default quota for new telecallers (calls per day).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
                System Timezone
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3.5" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="nexgen-input pl-10"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (GMT +0:00)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E9E5]">
            <Bell className="w-5 h-5 text-[#0BAA45]" />
            <div>
              <h3 className="text-base font-bold text-[#172017]">Lead Assignment Notification Settings</h3>
              <p className="text-xs text-[#6B756D]">
                Configure automated delivery channels when leads are assigned to workers
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9E5] bg-[#F7F8F6]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#172017]">Email Notifications</div>
                  <div className="text-xs text-[#6B756D]">
                    Sends single or consolidated lead assignment emails to worker's registered email address.
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0BAA45]"></div>
                <span className="ml-2 text-xs font-bold text-[#172017]">
                  {emailEnabled ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>

            {/* WhatsApp Notifications Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9E5] bg-[#F7F8F6]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#172017]">WhatsApp Notifications</div>
                  <div className="text-xs text-[#6B756D]">
                    Sends official WhatsApp Cloud API templates/messages to worker's validated phone number (+91).
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0BAA45]"></div>
                <span className="ml-2 text-xs font-bold text-[#172017]">
                  {whatsappEnabled ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>

            {/* In-App Notifications Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9E5] bg-[#F7F8F6]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E9F9EF] text-[#0BAA45] flex items-center justify-center mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#172017]">In-App Portal Notifications</div>
                  <div className="text-xs text-[#6B756D]">
                    Displays notification bell badge & real-time popup alerts on worker dashboard.
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inAppEnabled}
                  onChange={(e) => setInAppEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0BAA45]"></div>
                <span className="ml-2 text-xs font-bold text-[#172017]">
                  {inAppEnabled ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Telephony Configuration */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E9E5]">
            <Phone className="w-5 h-5 text-[#0BAA45]" />
            <h3 className="text-base font-bold text-[#172017]">Telephony Integration</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172017] uppercase tracking-wider mb-1.5">
              Active Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  telephonyProvider === 'MOCK'
                    ? 'border-[#16C763] bg-[#E9F9EF]/50 ring-2 ring-[#0BAA45]/30 font-bold'
                    : 'border-[#E5E9E5] bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="telephonyProvider"
                  value="MOCK"
                  checked={telephonyProvider === 'MOCK'}
                  onChange={() => setTelephonyProvider('MOCK')}
                  className="mt-1 text-[#0BAA45] focus:ring-[#0BAA45]"
                />
                <div>
                  <div className="text-sm font-bold text-[#172017]">Mock Telephony Engine</div>
                  <p className="text-xs text-[#6B756D] font-normal mt-0.5">
                    Realistic built-in telecom state progression with timer & call logs.
                  </p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  telephonyProvider === 'PRODUCTION'
                    ? 'border-[#16C763] bg-[#E9F9EF]/50 ring-2 ring-[#0BAA45]/30 font-bold'
                    : 'border-[#E5E9E5] bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="telephonyProvider"
                  value="PRODUCTION"
                  checked={telephonyProvider === 'PRODUCTION'}
                  onChange={() => setTelephonyProvider('PRODUCTION')}
                  className="mt-1 text-[#0BAA45] focus:ring-[#0BAA45]"
                />
                <div>
                  <div className="text-sm font-bold text-[#172017]">Production VoIP / Telecom</div>
                  <p className="text-xs text-[#6B756D] font-normal mt-0.5">
                    Connects via Twilio, Exotel, or Plivo outbound gateway.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            loadingText="SAVING..."
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            SAVE SETTINGS
          </Button>
        </div>
      </form>

      {/* Demo Reset Card */}
      <Card className="p-5 sm:p-6 border-[#E5E9E5] bg-[#F7F8F6]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#172017]">Reset Demo Data</h4>
            <p className="text-xs text-[#6B756D] mt-0.5">
              Restore initial company business leads, telecaller quotas, and sample call records.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDemoData}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset to Initial Demo
          </Button>
        </div>
      </Card>
    </div>
  );
};
