import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ChefHat,
  Lock,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  Bell,
  Search,
  Check,
  X,
  CreditCard,
  LogOut,
  Sparkles,
  Phone,
  Calendar,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderStatus } from '../../types';

export const OwnerPanel: React.FC = () => {
  const {
    activeCafe,
    orders,
    approveOrder,
    markDelivered,
    confirmPayment,
    cancelOrder,
    isOwnerLoggedIn,
    loginOwner,
    logoutOwner,
    menuItems,
    toggleItemAvailability,
    soundEnabled,
    setRole,
  } = useCafe();

  // Login form state
  const [username, setUsername] = useState<string>('kingcafe');
  const [password, setPassword] = useState<string>('king123');
  const [loginError, setLoginError] = useState<string>('');

  // Dashboard filter & tabs
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'orders' | 'menu'>('orders');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginOwner(username, password);
    if (!success) {
      setLoginError('Invalid credentials! Use kingcafe / king123 for King Cafe Owner.');
    } else {
      setLoginError('');
    }
  };

  // Status normalizer helper to handle variations like 'Order Sent', 'order_sent', etc.
  const normalizeStatus = (rawStatus: string): OrderStatus => {
    const s = String(rawStatus || '').toLowerCase().trim();
    if (s.includes('sent') || s.includes('pending') || s === 'order sent') return 'order_sent';
    if (s.includes('prepar') || s.includes('cook') || s.includes('approv')) return 'approved_preparing';
    if (s.includes('deliver') || s.includes('serv')) return 'delivered_served';
    if (s.includes('paid') || s.includes('settl') || s.includes('confirm')) return 'payment_confirmed';
    if (s.includes('cancel')) return 'cancelled';
    return 'order_sent';
  };

  // Filter orders for King Cafe (ensuring no valid dine-in order is missed)
  const cafeOrders = useMemo(() => {
    return orders.filter(
      (o) => !o.cafeId || o.cafeId === activeCafe.id || o.cafeId === 'cafe-king-01' || o.cafeId === 'king-cafe'
    );
  }, [orders, activeCafe.id]);

  const filteredOrders = useMemo(() => {
    return cafeOrders.filter((order) => {
      const status = normalizeStatus(order.status);
      if (selectedStatusTab === 'pending' && status !== 'order_sent') return false;
      if (selectedStatusTab === 'preparing' && status !== 'approved_preparing') return false;
      if (selectedStatusTab === 'delivered' && status !== 'delivered_served') return false;
      if (selectedStatusTab === 'paid' && status !== 'payment_confirmed') return false;
      if (tableFilter !== 'all' && order.tableNumber.toString() !== tableFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = (order.orderNumber || '').toLowerCase().includes(query);
        const matchesCustomer = (order.customerName || '').toLowerCase().includes(query);
        return matchesNumber || matchesCustomer;
      }
      return true;
    });
  }, [cafeOrders, selectedStatusTab, tableFilter, searchQuery]);

  // Statistics
  const pendingCount = cafeOrders.filter((o) => normalizeStatus(o.status) === 'order_sent').length;
  const preparingCount = cafeOrders.filter((o) => normalizeStatus(o.status) === 'approved_preparing').length;
  const servedCount = cafeOrders.filter((o) => normalizeStatus(o.status) === 'delivered_served').length;
  const paidOrders = cafeOrders.filter((o) => normalizeStatus(o.status) === 'payment_confirmed');
  const totalRevenueToday = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Time elapsed calculator helper
  const getTimeElapsed = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  // If not logged in, render protected login gate
  if (!isOwnerLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F7F3F0] text-[#3E2723]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-[#D7CCC8] p-8 rounded-3xl max-w-md w-full shadow-xl relative overflow-hidden"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#795548] text-white flex items-center justify-center mx-auto mb-3 shadow-xs text-2xl font-bold">
              K
            </div>
            <h1 className="text-xl font-extrabold font-['Outfit'] text-[#3E2723]">
              King Cafe Owner Portal
            </h1>
            <p className="text-xs text-[#8D6E63] mt-1">
              Protected Kitchen & Order Management Panel
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5D4037] mb-1.5">
                Owner Username
              </label>
              <input
                id="input-owner-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kingcafe"
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] placeholder:text-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]/30 focus:border-[#795548]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5D4037] mb-1.5">
                Password
              </label>
              <input
                id="input-owner-password"
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
                <span>Demo User: <strong className="text-[#3E2723]">kingcafe</strong></span>
                <span>Password: <strong className="text-[#3E2723]">king123</strong></span>
              </div>
            </div>

            <button
              id="btn-login-owner"
              type="submit"
              className="w-full py-3 bg-[#795548] hover:bg-[#5D4037] text-white font-extrabold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock King Cafe Dashboard</span>
            </button>

            <button
              type="button"
              id="btn-owner-return-customer"
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

  // Logged-in Owner Dashboard
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F3F0] text-[#3E2723] pb-16">
      {/* Top Owner Header */}
      <div className="bg-[#8D6E63] text-white border-b border-[#795548] sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#795548] font-black flex items-center justify-center text-base shadow-xs">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">King Cafe Kitchen & Counter</h1>
                <span className="bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] text-[10px] font-bold px-2 py-0.2 rounded-full">
                  LIVE SYNC ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-[#EFEBE9]">
                12 Active Dine-in Tables • Real-Time Order Dispatcher
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Orders vs Menu Toggle */}
            <div className="flex bg-[#795548] p-1 rounded-xl border border-white/20">
              <button
                id="btn-view-orders-tab"
                onClick={() => setActiveView('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'orders'
                    ? 'bg-white text-[#795548] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Table Orders ({cafeOrders.length})
              </button>
              <button
                id="btn-view-menu-tab"
                onClick={() => setActiveView('menu')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'menu'
                    ? 'bg-white text-[#795548] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Menu & Stock
              </button>
            </div>

            <button
              id="btn-logout-owner"
              onClick={logoutOwner}
              title="Logout from Owner Portal"
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/15"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#D7CCC8] p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-1">
              <span>Pending Action</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-[#3E2723] font-mono">
              {pendingCount}
            </div>
            <p className="text-[10px] text-red-700 font-semibold mt-1">
              Requires instant chef approval
            </p>
          </div>

          <div className="bg-white border border-[#D7CCC8] p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-1">
              <span>Cooking in Kitchen</span>
              <ChefHat className="w-4 h-4 text-[#8D6E63]" />
            </div>
            <div className="text-2xl font-black text-[#795548] font-mono">
              {preparingCount}
            </div>
            <p className="text-[10px] text-[#8D6E63] mt-1">Active on the stove/oven</p>
          </div>

          <div className="bg-white border border-[#D7CCC8] p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-1">
              <span>Served / Dining</span>
              <UtensilsCrossed className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="text-2xl font-black text-[#2E7D32] font-mono">
              {servedCount}
            </div>
            <p className="text-[10px] text-[#8D6E63] mt-1">Awaiting bill payment</p>
          </div>

          <div className="bg-white border border-[#D7CCC8] p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-1">
              <span>Settled Revenue</span>
              <IndianRupee className="w-4 h-4 text-[#795548]" />
            </div>
            <div className="text-2xl font-black text-[#3E2723] font-mono">
              ₹{totalRevenueToday.toFixed(0)}
            </div>
            <p className="text-[10px] text-[#8D6E63] mt-1">{paidOrders.length} orders completed</p>
          </div>
        </div>

        {/* View Mode: Menu Stock Management */}
        {activeView === 'menu' ? (
          <div className="bg-white border border-[#D7CCC8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1EDE9]">
              <div>
                <h2 className="text-base font-bold text-[#3E2723]">Digital Menu & Stock Controller</h2>
                <p className="text-xs text-[#8D6E63]">
                  Toggle items In-Stock / Sold-Out instantly for customers scanning the QR.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems
                .filter((item) => item.cafeId === activeCafe.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                      item.isAvailable
                        ? 'bg-[#FAF8F6] border-[#D7CCC8]'
                        : 'bg-[#FAF8F6]/40 border-red-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#D7CCC8]"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-[#3E2723]">{item.name}</h3>
                        <p className="text-[11px] text-[#795548] font-mono">
                          ₹{item.price} • {item.category}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`btn-toggle-stock-${item.id}`}
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        item.isAvailable
                          ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] hover:bg-[#C8E6C9]'
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Sold Out'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* View Mode: Live Table Orders Board */
          <div className="space-y-4">
            {/* Filter Tabs and Table Selection */}
            <div className="bg-white border border-[#D7CCC8] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { id: 'all', label: 'All Orders', count: cafeOrders.length },
                  { id: 'pending', label: '1. Pending Approval 🚨', count: pendingCount },
                  { id: 'preparing', label: '2. In Kitchen 🍳', count: preparingCount },
                  { id: 'delivered', label: '3. Served 🍽️', count: servedCount },
                  { id: 'paid', label: '4. Paid & Closed ✅', count: paidOrders.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    id={`owner-tab-${tab.id}`}
                    onClick={() => setSelectedStatusTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedStatusTab === tab.id
                        ? 'bg-[#795548] text-white font-extrabold shadow-xs'
                        : 'bg-[#FAF8F6] text-[#5D4037] hover:bg-[#EFEBE9] border border-[#D7CCC8]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 opacity-80">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Table Selector Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-[#8D6E63] whitespace-nowrap">Filter Table:</span>
                <select
                  id="select-table-filter"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl px-3 py-1.5 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                >
                  <option value="all">All Tables (1-12)</option>
                  {activeCafe.tables.map((t) => (
                    <option key={t} value={t.toString()}>
                      Table #{t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders Cards Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-[#D7CCC8] rounded-2xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
                <ChefHat className="w-10 h-10 text-[#A1887F] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#3E2723]">No Orders Matching Filter</h3>
                <p className="text-xs text-[#8D6E63] mt-1">
                  When customers place orders from their table QR codes, they will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrders.map((order) => {
                  const status = normalizeStatus(order.status);
                  const isPending = status === 'order_sent';
                  const isPreparing = status === 'approved_preparing';
                  const isDelivered = status === 'delivered_served';
                  const isPaid = status === 'payment_confirmed';

                  return (
                    <motion.div
                      key={order.id}
                      id={`owner-order-card-${order.id}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xs transition-all ${
                        isPending
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : isPreparing
                          ? 'border-[#795548] ring-2 ring-[#795548]/20'
                          : isDelivered
                          ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20'
                          : 'border-[#D7CCC8] opacity-80'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="p-4 bg-[#FAF8F6] border-b border-[#D7CCC8] flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-1 bg-[#795548] text-white font-black text-xs rounded-lg shadow-xs">
                              TABLE #{order.tableNumber}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#5D4037]">
                              {order.orderNumber}
                            </span>
                          </div>
                          <p className="text-xs text-[#3E2723] font-semibold">
                            {order.customerName}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-medium text-[#8D6E63] block">
                            {getTimeElapsed(order.createdAt)}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                              isPending
                                ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                                : isPreparing
                                ? 'bg-[#EFEBE9] text-[#795548] border border-[#D7CCC8]'
                                : isDelivered
                                ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                                : 'bg-[#FAF8F6] text-[#8D6E63] border border-[#D7CCC8]'
                            }`}
                          >
                            {isPending && 'NEW • NEEDS APPROVAL'}
                            {isPreparing && 'CHEF COOKING'}
                            {isDelivered && 'SERVED AT TABLE'}
                            {isPaid && 'PAID & SETTLED'}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-4 flex-1 divide-y divide-[#F1EDE9] text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#EFEBE9] text-[#795548] font-extrabold flex items-center justify-center text-[11px]">
                                {item.quantity}×
                              </span>
                              <span className="font-semibold text-[#3E2723]">
                                {item.menuItem.name}
                              </span>
                            </div>
                            <span className="text-[#5D4037] font-mono">
                              ₹{item.menuItem.price * item.quantity}
                            </span>
                          </div>
                        ))}

                        {/* Cooking instruction note if provided */}
                        {order.specialInstructions && (
                          <div className="mt-2 pt-2 text-[11px] text-[#795548] bg-[#FAF8F6] p-2 rounded-lg border border-[#D7CCC8]">
                            <strong>Note:</strong> {order.specialInstructions}
                          </div>
                        )}
                      </div>

                      {/* Financial Total */}
                      <div className="px-4 py-2 bg-[#FAF8F6] border-t border-[#D7CCC8] flex items-center justify-between text-xs">
                        <span className="text-[#8D6E63]">Total Bill (inc. Tax)</span>
                        <span className="text-sm font-extrabold text-[#795548] font-mono">
                          ₹{order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Action Buttons Section */}
                      <div className="p-3 bg-[#FAF8F6] border-t border-[#D7CCC8] space-y-2">
                        {/* Step 1 Action: Approve Order */}
                        {isPending && (
                          <button
                            id={`btn-approve-order-${order.id}`}
                            onClick={() => approveOrder(order.id)}
                            className="w-full py-2.5 bg-[#8D6E63] hover:bg-[#795548] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                          >
                            <ChefHat className="w-4 h-4" />
                            <span>Approve Order (Send to Kitchen)</span>
                          </button>
                        )}

                        {/* Step 2 Action: Mark Delivered */}
                        {isPreparing && (
                          <button
                            id={`btn-deliver-order-${order.id}`}
                            onClick={() => markDelivered(order.id)}
                            className="w-full py-2.5 bg-[#5D4037] hover:bg-[#3E2723] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                            <span>Mark Delivered to Table #{order.tableNumber}</span>
                          </button>
                        )}

                        {/* Step 3 Action: Big Green Payment Confirmed Button */}
                        {(isDelivered || isPreparing || isPending) && (
                          <button
                            id={`btn-confirm-payment-${order.id}`}
                            onClick={() => confirmPayment(order.id, 'counter')}
                            className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Payment Confirmed (₹{order.totalAmount.toFixed(2)})</span>
                          </button>
                        )}

                        {isPaid && (
                          <div className="py-2 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl text-center text-xs font-bold text-[#1B5E20] flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>Paid via {order.paymentMethod || 'Counter'}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
