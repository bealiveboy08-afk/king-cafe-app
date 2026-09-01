import React from 'react';
import {
  ChefHat,
  ShieldCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';

export const HeaderNav: React.FC = () => {
  const {
    role,
    setRole,
    soundEnabled,
    setSoundEnabled,
    activeCafe,
    customerSession,
    resetDemoData,
    isOwnerLoggedIn,
    logoutOwner,
    isAdminLoggedIn,
    logoutAdmin,
  } = useCafe();

  const handleExitToCustomer = () => {
    if (role === 'owner') {
      logoutOwner();
    } else if (role === 'superadmin') {
      logoutAdmin();
    }
    setRole('customer');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D7CCC8] text-[#3E2723] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* View-Specific Brand Header */}
          {role === 'customer' && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#795548] flex items-center justify-center shadow-xs text-white font-black text-xl font-['Outfit']">
                K
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-[#3E2723] font-['Outfit']">
                    {activeCafe.name}
                  </span>
                  {customerSession.tableNumber && (
                    <span className="inline-flex items-center gap-1 bg-[#EFEBE9] text-[#795548] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#D7CCC8]">
                      <MapPin className="w-3 h-3 text-[#795548]" />
                      Table #{customerSession.tableNumber}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8D6E63]">
                  {activeCafe.tagline || 'Self-Order Digital Menu'}
                </p>
              </div>
            </div>
          )}

          {role === 'owner' && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#5D4037] flex items-center justify-center shadow-xs text-white font-black text-xl">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-[#3E2723] font-['Outfit']">
                    {activeCafe.name} — Kitchen & Orders
                  </span>
                  <span className="bg-[#FAF8F6] text-[#5D4037] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D7CCC8]">
                    Owner Portal
                  </span>
                </div>
                <p className="text-[11px] text-[#8D6E63] hidden sm:block">
                  Live Kitchen Dispatch & Menu Management
                </p>
              </div>
            </div>
          )}

          {role === 'superadmin' && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#3E2723] flex items-center justify-center shadow-xs text-white font-black text-xl">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-[#3E2723] font-['Outfit']">
                    SaaS Command Center
                  </span>
                  <span className="bg-[#E8F5E9] text-[#1B5E20] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                    10% Platform Fee
                  </span>
                </div>
                <p className="text-[11px] text-[#8D6E63] hidden sm:block">
                  Multi-Tenant Platform & 10% Commission Ledger
                </p>
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {role !== 'customer' && (
              <button
                id="btn-return-customer-menu"
                onClick={handleExitToCustomer}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F6] hover:bg-[#EFEBE9] text-[#5D4037] text-xs font-bold border border-[#D7CCC8] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit to Customer Menu</span>
                <span className="sm:hidden">Menu</span>
              </button>
            )}

            {role === 'owner' && isOwnerLoggedIn && (
              <button
                id="btn-logout-owner-header"
                onClick={logoutOwner}
                title="Logout Owner"
                className="p-2 rounded-xl bg-[#FAF8F6] hover:bg-red-50 text-[#8D6E63] hover:text-red-700 transition-colors border border-[#D7CCC8]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {role === 'superadmin' && isAdminLoggedIn && (
              <button
                id="btn-logout-admin-header"
                onClick={logoutAdmin}
                title="Logout Admin"
                className="p-2 rounded-xl bg-[#FAF8F6] hover:bg-red-50 text-[#8D6E63] hover:text-red-700 transition-colors border border-[#D7CCC8]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-toggle-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Audio Alerts' : 'Enable Audio Alerts'}
              className="p-2 rounded-xl bg-[#FAF8F6] hover:bg-[#EFEBE9] text-[#5D4037] hover:text-[#3E2723] transition-colors text-xs flex items-center gap-1 border border-[#D7CCC8]"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#795548]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#A1887F]" />
              )}
            </button>

            {role === 'customer' && (
              <button
                id="btn-reset-demo"
                onClick={() => {
                  if (window.confirm('Reset all demo orders and data back to default?')) {
                    resetDemoData();
                  }
                }}
                title="Reset Demo Data"
                className="p-2 rounded-xl bg-[#FAF8F6] hover:bg-[#EFEBE9] text-[#8D6E63] hover:text-[#3E2723] transition-colors hidden sm:flex items-center gap-1.5 text-xs border border-[#D7CCC8]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
