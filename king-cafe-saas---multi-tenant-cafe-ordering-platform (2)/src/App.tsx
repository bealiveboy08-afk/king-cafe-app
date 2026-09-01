import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { HeaderNav } from './components/common/HeaderNav';
import { CustomerView } from './components/customer/CustomerView';
import { OwnerPanel } from './components/owner/OwnerPanel';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';

const MainScreenContent: React.FC = () => {
  const { role } = useCafe();

  return (
    <div className="min-h-screen bg-[#F7F3F0] text-[#3E2723] flex flex-col font-sans">
      <HeaderNav />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {role === 'customer' && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CustomerView />
            </motion.div>
          )}

          {role === 'owner' && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <OwnerPanel />
            </motion.div>
          )}

          {role === 'superadmin' && (
            <motion.div
              key="superadmin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SuperAdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <MainScreenContent />
    </CafeProvider>
  );
}
