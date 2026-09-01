import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  IndianRupee,
  Building2,
  TrendingUp,
  Receipt,
  QrCode,
  Plus,
  Search,
  Download,
  AlertCircle,
  LogOut,
  Sparkles,
  Percent,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Store,
  ChefHat,
  Smartphone,
  ArrowLeft,
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { Cafe, Order } from '../../types';
import { QRCodeGenerator } from './QRCodeGenerator';

export const SuperAdminDashboard: React.FC = () => {
  const {
    cafes,
    activeCafe,
    setActiveCafeId,
    addCafe,
    orders,
    ledgerSummary,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    setRole,
  } = useCafe();

  // Login credentials state
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [loginError, setLoginError] = useState<string>('');

  // Tab navigation inside Super Admin
  const [activeTab, setActiveTab] = useState<'ledger' | 'qr' | 'cafes'>('ledger');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [cafeFilter, setCafeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add Cafe Modal State
  const [isAddCafeOpen, setIsAddCafeOpen] = useState<boolean>(false);
  const [newCafeName, setNewCafeName] = useState<string>('');
  const [newCafeTagline, setNewCafeTagline] = useState<string>('');
  const [newCafeAddress, setNewCafeAddress] = useState<string>('');
  const [newCafePhone, setNewCafePhone] = useState<string>('');
  const [newCafeTablesCount, setNewCafeTablesCount] = useState<number>(8);
  const [newCafeCommission, setNewCafeCommission] = useState<number>(10.0);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(username, password);
    if (!success) {
      setLoginError('Invalid credentials! Use admin / admin123 for Super Admin.');
    } else {
      setLoginError('');
    }
  };

  // Filtered orders for live ledger
  const filteredLedgerOrders = useMemo(() => {
    return orders.filter((order) => {
      if (cafeFilter !== 'all' && order.cafeId !== cafeFilter) return false;
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.cafeName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, cafeFilter, statusFilter, ledgerSearch]);

  const handleCreateCafe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCafeName.trim()) return;

    const tables = Array.from({ length: newCafeTablesCount }, (_, i) => i + 1);
    const slug = newCafeName.toLowerCase().replace(/\s+/g, '-');

    addCafe({
      name: newCafeName.trim(),
      slug,
      tagline: newCafeTagline.trim() || 'Delicious Gourmet Food & Drinks',
      address: newCafeAddress.trim() || 'Main High Street, City Center',
      phone: newCafePhone.trim() || '+91 99888 77665',
      tables,
      currency: '₹',
      commissionRate: newCafeCommission / 100, // e.g. 10% -> 0.10
      logo: '☕',
      bannerImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
      openingHours: '09:00 AM - 11:00 PM',
    });

    setIsAddCafeOpen(false);
    setNewCafeName('');
    setNewCafeTagline('');
    setNewCafeAddress('');
    setNewCafePhone('');
  };

  const handleExportCSV = () => {
    const headers = ['Order Number,Cafe,Table,Customer,Subtotal,Tax,Total Amount,10% Commission,Status,Timestamp\n'];
    const rows = filteredLedgerOrders.map((o) =>
      `"${o.orderNumber}","${o.cafeName}",${o.tableNumber},"${o.customerName}",${o.subtotal},${o.tax},${o.totalAmount},${o.commissionAmount},"${o.status}","${o.createdAt}"`
    );
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `king-cafe-saas-ledger-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If not logged in, render protected login gate
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F7F3F0] text-[#3E2723]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-[#D7CCC8] p-8 rounded-3xl max-w-md w-full shadow-xl relative overflow-hidden"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#795548] text-white flex items-center justify-center mx-auto mb-3 shadow-xs text-2xl font-bold">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold font-['Outfit'] text-[#3E2723]">
              Super Admin SaaS Portal
            </h1>
            <p className="text-xs text-[#8D6E63] mt-1">
              Multi-Tenant Governance & 10% Commission Ledger
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5D4037] mb-1.5">
                Admin Username
              </label>
              <input
                id="input-admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] placeholder:text-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]/30 focus:border-[#795548]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5D4037] mb-1.5">
                Password
              </label>
              <input
                id="input-admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] placeholder:text-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]/30 focus:border-[#795548]"
              />
            </div>

            <div className="bg-[#FAF8F6] p-3 rounded-xl border border-[#D7CCC8] text-[11px] text-[#8D6E63] space-y-1">
              <div className="flex justify-between font-mono">
                <span>Demo User: <strong className="text-[#3E2723]">admin</strong></span>
                <span>Password: <strong className="text-[#3E2723]">admin123</strong></span>
              </div>
            </div>

            <button
              id="btn-login-admin"
              type="submit"
              className="w-full py-3 bg-[#795548] hover:bg-[#5D4037] text-white font-extrabold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Access Super Admin Dashboard</span>
            </button>

            <button
              type="button"
              id="btn-admin-return-customer"
              onClick={() => setRole('customer')}
              className="w-full py-2.5 bg-transparent hover:bg-[#FAF8F6] text-[#8D6E63] hover:text-[#3E2723] font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-transparent hover:border-[#D7CCC8]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Menu</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F3F0] text-[#3E2723] pb-16">
      {/* Top Admin Sub-Header */}
      <div className="bg-[#795548] text-white border-b border-[#5D4037] sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#795548] font-black flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">SaaS Platform Command Center</h1>
                <span className="bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] text-[10px] font-bold px-2 py-0.2 rounded-full">
                  10% PLATFORM FEE
                </span>
              </div>
              <p className="text-[11px] text-[#EFEBE9]">
                Multi-Tenant Governance, QR Infrastructure & Commission Revenue Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Super Admin Tabs */}
            <div className="flex bg-[#5D4037] p-1 rounded-xl border border-white/20">
              <button
                id="admin-tab-ledger"
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ledger'
                    ? 'bg-white text-[#5D4037] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Live Order Ledger</span>
              </button>

              <button
                id="admin-tab-qr"
                onClick={() => setActiveTab('qr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'qr'
                    ? 'bg-white text-[#5D4037] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Generate QR Codes</span>
              </button>

              <button
                id="admin-tab-cafes"
                onClick={() => setActiveTab('cafes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'cafes'
                    ? 'bg-white text-[#5D4037] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Manage Cafes ({cafes.length})</span>
              </button>
            </div>

            <button
              id="btn-logout-admin"
              onClick={logoutAdmin}
              title="Logout from Super Admin"
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/15"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* KPI Financial Overview Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Highlight: 10% Platform Commission Earnings */}
          <div className="bg-[#E8F5E9] border-2 border-[#81C784] p-5 rounded-2xl relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#1B5E20] mb-1">
              <span>My 10% Platform Commission</span>
              <Percent className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-[#1B5E20] font-mono tracking-tight">
              ₹{ledgerSummary.totalCommission.toFixed(2)}
            </div>
            <p className="text-[11px] text-[#2E7D32] font-medium mt-1">
              Automatic 10% calculated per order
            </p>
          </div>

          <div className="bg-white border border-[#D7CCC8] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#8D6E63] mb-1">
              <span>Total Cafe Revenue (GMV)</span>
              <IndianRupee className="w-4 h-4 text-[#795548]" />
            </div>
            <div className="text-2xl font-black text-[#3E2723] font-mono tracking-tight">
              ₹{ledgerSummary.totalRevenue.toFixed(2)}
            </div>
            <p className="text-[11px] text-[#8D6E63] mt-1">Gross merchandise volume</p>
          </div>

          <div className="bg-white border border-[#D7CCC8] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#8D6E63] mb-1">
              <span>Total Platform Orders</span>
              <Receipt className="w-4 h-4 text-[#5D4037]" />
            </div>
            <div className="text-2xl font-black text-[#795548] font-mono">
              {ledgerSummary.totalOrders}
            </div>
            <p className="text-[11px] text-[#8D6E63] mt-1">
              {ledgerSummary.paidOrdersCount} completed & paid
            </p>
          </div>

          <div className="bg-white border border-[#D7CCC8] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#8D6E63] mb-1">
              <span>Onboarded Cafe Tenants</span>
              <Building2 className="w-4 h-4 text-[#5D4037]" />
            </div>
            <div className="text-2xl font-black text-[#795548] font-mono">
              {cafes.length}
            </div>
            <p className="text-[11px] text-[#8D6E63] mt-1">Flagship: King Cafe</p>
          </div>
        </div>

        {/* TAB 1: Live Order Ledger */}
        {activeTab === 'ledger' && (
          <div className="bg-white border border-[#D7CCC8] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F1EDE9]">
              <div>
                <h2 className="text-lg font-black font-['Outfit'] text-[#3E2723]">
                  Live Order Ledger & 10% Commission Tracker
                </h2>
                <p className="text-xs text-[#8D6E63]">
                  Real-time transaction stream across all cafe tables with automatic 10% platform revenue share.
                </p>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  id="btn-export-ledger-csv"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-[#FAF8F6] hover:bg-[#EFEBE9] text-[#5D4037] text-xs font-bold rounded-xl border border-[#D7CCC8] transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A1887F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-ledger-search"
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search order #, customer, cafe..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] placeholder:text-[#A1887F] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                />
              </div>

              <div>
                <select
                  id="select-ledger-cafe"
                  value={cafeFilter}
                  onChange={(e) => setCafeFilter(e.target.value)}
                  className="w-full bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                >
                  <option value="all">All Cafe Tenants</option>
                  {cafes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  id="select-ledger-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                >
                  <option value="all">All Statuses</option>
                  <option value="order_sent">Order Sent (Pending)</option>
                  <option value="approved_preparing">In Kitchen (Cooking)</option>
                  <option value="delivered_served">Served at Table</option>
                  <option value="payment_confirmed">Payment Confirmed</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#D7CCC8] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F6] text-[#5D4037] font-bold border-b border-[#D7CCC8] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order ID & Time</th>
                    <th className="py-3 px-4">Cafe & Table</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-right">Order Total</th>
                    <th className="py-3 px-4 text-right text-[#1B5E20]">10% SaaS Cut</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EDE9] text-[#3E2723]">
                  {filteredLedgerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#8D6E63] text-xs">
                        No transactions found in ledger.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerOrders.map((order) => {
                      const isPaid = order.status === 'payment_confirmed';
                      const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={order.id} className="hover:bg-[#FAF8F6] transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#3E2723] block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#8D6E63]">{formattedTime}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#3E2723] block">
                              {order.cafeName}
                            </span>
                            <span className="text-[10px] bg-[#EFEBE9] border border-[#D7CCC8] px-1.5 py-0.5 rounded text-[#795548] font-bold">
                              Table #{order.tableNumber}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-medium text-[#3E2723]">
                            {order.customerName}
                          </td>

                          <td className="py-3 px-4 text-[#5D4037]">
                            {order.items.reduce((sum, i) => sum + i.quantity, 0)} items (
                            {order.items.map((i) => i.menuItem.name).join(', ').slice(0, 24)}...)
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-[#3E2723]">
                            ₹{order.totalAmount.toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-[#1B5E20] bg-[#E8F5E9]/50">
                            +₹{order.commissionAmount.toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                                order.status === 'order_sent'
                                  ? 'bg-[#EFEBE9] text-[#795548] border border-[#D7CCC8]'
                                  : order.status === 'approved_preparing'
                                  ? 'bg-[#FAF8F6] text-[#5D4037] border border-[#D7CCC8]'
                                  : order.status === 'delivered_served'
                                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                                  : 'bg-[#E8F5E9] text-[#1B5E20] border border-[#81C784]'
                              }`}
                            >
                              {order.status === 'order_sent' && 'Sent'}
                              {order.status === 'approved_preparing' && 'Cooking'}
                              {order.status === 'delivered_served' && 'Served'}
                              {order.status === 'payment_confirmed' && 'Paid ✅'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Generate Table QR Codes for King Cafe */}
        {activeTab === 'qr' && <QRCodeGenerator />}

        {/* TAB 3: Manage Cafe Tenants */}
        {activeTab === 'cafes' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#D7CCC8] rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F1EDE9]">
                <div>
                  <h2 className="text-xl font-bold font-['Outfit'] text-[#3E2723]">
                    Multi-Tenant Cafe Management
                  </h2>
                  <p className="text-xs text-[#8D6E63] mt-0.5">
                    Onboard new restaurants, manage tables, and monitor revenue share.
                  </p>
                </div>

                <button
                  id="btn-open-add-cafe"
                  onClick={() => setIsAddCafeOpen(true)}
                  className="px-4 py-2.5 bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Cafe</span>
                </button>
              </div>

              {/* Cafe Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cafes.map((cafe) => {
                  const cafeOrdersCount = orders.filter((o) => o.cafeId === cafe.id).length;
                  const cafeRevenue = orders
                    .filter((o) => o.cafeId === cafe.id && o.status !== 'cancelled')
                    .reduce((sum, o) => sum + o.totalAmount, 0);
                  const isCurrentActive = activeCafe.id === cafe.id;

                  return (
                    <div
                      key={cafe.id}
                      className={`bg-[#FAF8F6] rounded-2xl border p-5 flex flex-col justify-between ${
                        isCurrentActive ? 'border-[#795548] ring-2 ring-[#795548]/20' : 'border-[#D7CCC8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#795548] text-white font-black text-xl flex items-center justify-center shadow-xs">
                              {cafe.logo}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-bold text-[#3E2723]">{cafe.name}</h3>
                                {cafe.isDefault && (
                                  <span className="bg-[#EFEBE9] text-[#795548] text-[10px] px-1.5 py-0.2 rounded font-bold border border-[#D7CCC8]">
                                    Flagship
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#8D6E63]">{cafe.slug}</p>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] px-2 py-0.5 rounded-full">
                            {(cafe.commissionRate * 100).toFixed(0)}% SaaS Cut
                          </span>
                        </div>

                        <p className="text-xs text-[#5D4037] italic mb-3">"{cafe.tagline}"</p>

                        <div className="space-y-1.5 text-xs text-[#5D4037] mb-4 bg-white p-3 rounded-xl border border-[#D7CCC8]">
                          <div className="flex justify-between">
                            <span>Active Tables:</span>
                            <span className="text-[#3E2723] font-bold">{cafe.tables.length} Tables</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Orders:</span>
                            <span className="text-[#3E2723] font-bold">{cafeOrdersCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Revenue:</span>
                            <span className="text-[#795548] font-mono font-bold">
                              ₹{cafeRevenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#D7CCC8]">
                        <button
                          id={`btn-select-active-cafe-${cafe.id}`}
                          onClick={() => setActiveCafeId(cafe.id)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                            isCurrentActive
                              ? 'bg-[#795548] text-white font-black shadow-xs'
                              : 'bg-white text-[#5D4037] border border-[#D7CCC8] hover:bg-[#EFEBE9]'
                          }`}
                        >
                          {isCurrentActive ? 'Active Cafe Selected' : 'Switch Active Cafe'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Cafe Tenant Modal */}
      <AnimatePresence>
        {isAddCafeOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCafeOpen(false)}
              className="absolute inset-0 bg-[#3E2723]/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-[#D7CCC8] rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 text-[#3E2723] shadow-xl"
            >
              <h3 className="text-lg font-bold font-['Outfit'] mb-1 text-[#3E2723]">Onboard New Cafe Tenant</h3>
              <p className="text-xs text-[#8D6E63] mb-5">
                Register a new restaurant on the multi-tenant SaaS platform.
              </p>

              <form onSubmit={handleCreateCafe} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5D4037] mb-1">
                    Cafe Business Name
                  </label>
                  <input
                    id="input-new-cafe-name"
                    type="text"
                    required
                    value={newCafeName}
                    onChange={(e) => setNewCafeName(e.target.value)}
                    placeholder="e.g. Chai & Samosa Hub"
                    className="w-full px-3 py-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] focus:ring-2 focus:ring-[#795548]/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5D4037] mb-1">
                    Tagline / Description
                  </label>
                  <input
                    id="input-new-cafe-tagline"
                    type="text"
                    value={newCafeTagline}
                    onChange={(e) => setNewCafeTagline(e.target.value)}
                    placeholder="e.g. Authentic Artisan Teas & Snacks"
                    className="w-full px-3 py-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] focus:ring-2 focus:ring-[#795548]/30 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5D4037] mb-1">
                      Number of Tables
                    </label>
                    <input
                      id="input-new-cafe-tables"
                      type="number"
                      min={1}
                      max={50}
                      value={newCafeTablesCount}
                      onChange={(e) => setNewCafeTablesCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] focus:ring-2 focus:ring-[#795548]/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5D4037] mb-1">
                      Platform Fee (%)
                    </label>
                    <input
                      id="input-new-cafe-commission"
                      type="number"
                      step="0.1"
                      min={0}
                      max={10}
                      value={newCafeCommission}
                      onChange={(e) => setNewCafeCommission(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] focus:ring-2 focus:ring-[#795548]/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1EDE9]">
                  <button
                    type="button"
                    onClick={() => setIsAddCafeOpen(false)}
                    className="px-4 py-2 bg-[#FAF8F6] hover:bg-[#EFEBE9] text-[#5D4037] text-xs font-semibold rounded-xl border border-[#D7CCC8]"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-add-cafe"
                    type="submit"
                    className="px-5 py-2 bg-[#795548] hover:bg-[#5D4037] text-white text-xs font-extrabold rounded-xl shadow-xs"
                  >
                    Register Cafe
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
