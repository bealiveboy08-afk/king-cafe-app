import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Sparkles,
  Leaf,
  Flame,
  ChefHat,
  X,
  ArrowRight,
  Receipt,
  User,
  TableProperties,
  Check,
  Percent,
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { Category, MenuItem } from '../../types';
import { LiveOrderStatus } from './LiveOrderStatus';

export const CustomerView: React.FC = () => {
  const {
    activeCafe,
    menuItems,
    customerSession,
    setCustomerSession,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemCount,
    activeCustomerOrder,
    submitOrder,
    setCustomerActiveOrderId,
  } = useCafe();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [showStatusScreen, setShowStatusScreen] = useState<boolean>(false);

  // Table Setup Modal state if customer hasn't selected a table yet
  const [tempName, setTempName] = useState<string>(customerSession.name || '');
  const [tempTable, setTempTable] = useState<number | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('table');
      if (t) {
        const parsed = parseInt(t, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {}
    return customerSession.tableNumber || 1;
  });
  const [isSettingUpTable, setIsSettingUpTable] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('table')) return false;
    } catch {}
    return !customerSession.tableNumber;
  });

  // Auto-sync table number from URL query like ?table=1 or ?table=2
  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      const nameParam = urlParams.get('name');
      if (tableParam) {
        const parsedTable = parseInt(tableParam, 10);
        if (!isNaN(parsedTable)) {
          setTempTable(parsedTable);
          if (nameParam) setTempName(nameParam);
          setCustomerSession({
            name: nameParam || customerSession.name || `Guest (Table ${parsedTable})`,
            tableNumber: parsedTable,
          });
          setIsSettingUpTable(false);
        }
      }
    } catch {
      // ignore
    }
  }, [customerSession.name, setCustomerSession]);

  const categories: ('All' | Category)[] = ['All', 'Pizza', 'Burger', 'Beverages'];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.cafeId !== activeCafe.id) return false;
      if (!item.isAvailable) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (vegOnly && !item.isVeg) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTags;
      }
      return true;
    });
  }, [menuItems, activeCafe.id, selectedCategory, vegOnly, searchQuery]);

  const handleSaveCustomerInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenTable = tempTable || 1;
    setCustomerSession({
      name: tempName.trim() || `Guest (Table ${chosenTable})`,
      tableNumber: chosenTable,
    });
    setIsSettingUpTable(false);
  };

  const handleCheckout = () => {
    let tableNum = customerSession.tableNumber;
    if (!tableNum) {
      try {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('table');
        if (t) {
          const parsed = parseInt(t, 10);
          if (!isNaN(parsed)) tableNum = parsed;
        }
      } catch {}
    }
    if (!tableNum) {
      tableNum = 1;
      setCustomerSession({
        name: customerSession.name || 'Guest (Table 1)',
        tableNumber: 1,
      });
    }

    const order = submitOrder(specialInstructions);
    if (order) {
      setIsCartOpen(false);
      setShowStatusScreen(true);
      setSpecialInstructions('');
    }
  };

  // If viewing active live order status
  if (showStatusScreen && activeCustomerOrder) {
    return (
      <LiveOrderStatus
        order={activeCustomerOrder}
        onBackToMenu={() => setShowStatusScreen(false)}
        onOrderMore={() => setShowStatusScreen(false)}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F3F0] text-[#3E2723] pb-28">
      {/* Hero Welcome Banner */}
      <div className="relative bg-[#795548] text-white overflow-hidden border-b border-[#5D4037]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                  {activeCafe.tagline}
                </span>
                <span className="text-xs text-[#EFEBE9] hidden sm:inline">
                  • {activeCafe.openingHours}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
                Welcome to {activeCafe.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#EFEBE9]">
                Order directly from your table via QR • Fast Kitchen Preparation
              </p>
            </div>

            {/* Customer Session Pill & Active Order Banner */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-edit-table-info"
                onClick={() => setIsSettingUpTable(true)}
                className="flex items-center gap-2 bg-[#5D4037] hover:bg-[#4E342E] text-white px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold shadow-xs transition-all"
              >
                <TableProperties className="w-3.5 h-3.5 text-[#FFB74D]" />
                <span>
                  {customerSession.tableNumber
                    ? `Table #${customerSession.tableNumber} • ${customerSession.name || 'Guest'}`
                    : 'Select Your Table'}
                </span>
                <span className="text-[10px] bg-[#FFB74D] text-[#3E2723] font-bold px-1.5 py-0.5 rounded">
                  Edit
                </span>
              </button>

              {activeCustomerOrder && (
                <button
                  id="btn-view-live-order-status"
                  onClick={() => setShowStatusScreen(true)}
                  className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Track Live Order ({activeCustomerOrder.orderNumber})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-2xl p-4 border border-[#D7CCC8] shadow-xs mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8D6E63] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-menu-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas, burgers, drinks..."
                className="w-full pl-9 pr-4 py-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] placeholder:text-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#795548]/30 focus:border-[#795548]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#3E2723]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Veg Only Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                id="toggle-veg-filter"
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  vegOnly
                    ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9] ring-2 ring-[#4CAF50]/20 font-bold'
                    : 'bg-[#FAF8F6] text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                <span>Veg Only</span>
                {vegOnly && <Check className="w-3 h-3 text-[#1B5E20]" />}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const count = menuItems.filter(
                (i) => i.cafeId === activeCafe.id && (cat === 'All' || i.category === cat)
              ).length;

              const getCategoryEmoji = (category: string) => {
                switch (category) {
                  case 'Pizza':
                    return '🍕';
                  case 'Burger':
                    return '🍔';
                  case 'Beverages':
                    return '🥤';
                  default:
                    return '✨';
                }
              };

              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  id={`cat-btn-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#795548] text-white shadow-xs'
                      : 'bg-[#FAF8F6] text-[#5D4037] hover:bg-[#EFEBE9] border border-[#D7CCC8]/60'
                  }`}
                >
                  <span>{getCategoryEmoji(cat)}</span>
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white font-extrabold' : 'bg-[#EFEBE9] text-[#8D6E63]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#D7CCC8] max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-[#EFEBE9] text-[#795548] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#3E2723] mb-1">No Menu Items Found</h2>
            <p className="text-xs text-[#8D6E63] mb-4">
              Try clearing your search query or toggling filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setVegOnly(false);
              }}
              className="text-xs font-bold text-white bg-[#795548] hover:bg-[#5D4037] px-3.5 py-2 rounded-xl border border-[#5D4037]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const inCart = cart.find((ci) => ci.menuItem.id === item.id);

              return (
                <div
                  key={item.id}
                  id={`menu-card-${item.id}`}
                  className="bg-white rounded-2xl border border-[#D7CCC8] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    {/* Item Image Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#EFEBE9]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Veg / Non-Veg Marker */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs border border-[#D7CCC8] flex items-center gap-1.5">
                        <div
                          className={`w-3 h-3 border-2 flex items-center justify-center ${
                            item.isVeg ? 'border-[#2E7D32]' : 'border-red-700'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-[#2E7D32]' : 'bg-red-700'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#3E2723] pr-1">
                          {item.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </div>

                      {/* Prep Time & Rating Tags */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                        <span className="bg-[#3E2723]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-[#FFB74D]" />
                          {item.preparationTimeMinutes} min
                        </span>
                        <span className="bg-[#8D6E63] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          ★ {item.rating}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h2 className="text-base font-bold text-[#3E2723] leading-snug">
                          {item.name}
                        </h2>
                        <span className="text-base font-extrabold text-[#795548] whitespace-nowrap font-mono">
                          ₹{item.price}
                        </span>
                      </div>

                      <p className="text-xs text-[#8D6E63] line-clamp-2 mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium px-2 py-0.5 bg-[#FAF8F6] text-[#5D4037] border border-[#D7CCC8]/60 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  <div className="p-4 pt-0 border-t border-[#F1EDE9] mt-2">
                    {inCart ? (
                      <div className="flex items-center justify-between bg-[#FAF8F6] rounded-xl p-1 border border-[#D7CCC8]">
                        <button
                          id={`btn-cart-dec-${item.id}`}
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-white text-[#3E2723] flex items-center justify-center shadow-xs hover:bg-[#EFEBE9] transition-colors font-bold border border-[#D7CCC8]/60"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-[#3E2723] px-2">
                          {inCart.quantity} in Cart
                        </span>
                        <button
                          id={`btn-cart-inc-${item.id}`}
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-[#8D6E63] hover:bg-[#795548] text-white flex items-center justify-center shadow-xs transition-colors font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-add-item-${item.id}`}
                        onClick={() => addToCart(item, 1)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Order</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && !isCartOpen && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-30"
        >
          <button
            id="btn-open-cart-floating"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#3E2723] text-white p-4 rounded-2xl shadow-xl border border-[#2D1B19] flex items-center justify-between hover:bg-[#2D1B19] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8D6E63] text-white flex items-center justify-center font-extrabold text-sm shadow-xs border border-white/20">
                {cartItemCount}
              </div>
              <div className="text-left">
                <p className="text-xs text-[#D7CCC8]">
                  Table #{customerSession.tableNumber || 4} Order
                </p>
                <p className="text-sm font-bold text-white">
                  ₹{cartTotal.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-[#D7CCC8]">+ 5% GST</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#FFB74D] text-xs font-bold">
              <span>Review & Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Slide-over Cart Drawer Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-[#3E2723]/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#D7CCC8] flex items-center justify-between bg-[#F7F3F0]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#795548]" />
                  <h2 className="text-base font-bold text-[#3E2723]">
                    Table #{customerSession.tableNumber || 4} Cart
                  </h2>
                  <span className="text-xs bg-[#EFEBE9] text-[#795548] border border-[#D7CCC8] font-bold px-2 py-0.5 rounded-full">
                    {cartItemCount} items
                  </span>
                </div>
                <button
                  id="btn-close-cart"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#EFEBE9]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="p-4 flex-1 overflow-y-auto divide-y divide-[#F1EDE9]">
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#D7CCC8]"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-[#3E2723]">{item.menuItem.name}</h3>
                        <p className="text-xs text-[#795548] font-semibold">
                          ₹{item.menuItem.price * item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-lg p-1">
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                        className="w-6 h-6 rounded bg-white text-[#3E2723] flex items-center justify-center text-xs font-bold shadow-xs hover:bg-[#EFEBE9]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#3E2723] px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                        className="w-6 h-6 rounded bg-[#8D6E63] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:bg-[#795548]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Cooking Instructions note */}
                <div className="pt-4">
                  <label className="block text-xs font-semibold text-[#5D4037] mb-1">
                    Special Cooking Instructions (Optional):
                  </label>
                  <textarea
                    id="input-cooking-instructions"
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Less spicy, extra napkins..."
                    className="w-full p-2.5 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] placeholder:text-[#A1887F] focus:ring-2 focus:ring-[#795548]/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cart Footer */}
              <div className="p-4 border-t border-[#D7CCC8] bg-[#F7F3F0] space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#5D4037]">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#5D4037]">
                    <span>GST (5%)</span>
                    <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#3E2723] pt-2 border-t border-[#D7CCC8]">
                    <span>Total Bill</span>
                    <span className="text-[#795548] font-black font-mono">
                      ₹{(cartTotal * 1.05).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-submit-order-now"
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#795548] hover:bg-[#5D4037] text-white font-extrabold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Submit Order to King Cafe Kitchen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Table Setup Modal (If opening fresh QR or changing table) */}
      <AnimatePresence>
        {isSettingUpTable && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#3E2723]/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl border border-[#D7CCC8] p-6 max-w-md w-full z-10"
            >
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#795548] text-white flex items-center justify-center mx-auto mb-2 text-2xl font-black">
                  K
                </div>
                <h3 className="text-lg font-bold text-[#3E2723]">Welcome to King Cafe!</h3>
                <p className="text-xs text-[#8D6E63]">
                  Please confirm your Table Number to begin ordering.
                </p>
              </div>

              <form onSubmit={handleSaveCustomerInfo} className="space-y-4">
                {/* Table Number Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#5D4037] mb-2">
                    Select Your Table Number:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {activeCafe.tables.map((tNum) => (
                      <button
                        type="button"
                        key={tNum}
                        id={`btn-select-table-${tNum}`}
                        onClick={() => setTempTable(tNum)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          tempTable === tNum
                            ? 'bg-[#795548] text-white border-[#5D4037] shadow-xs'
                            : 'bg-[#FAF8F6] text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                        }`}
                      >
                        Table {tNum}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-[#5D4037] mb-1">
                    Your Name (Optional):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8D6E63] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-customer-name"
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="e.g. Rahul, Sneha..."
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF8F6] border border-[#D7CCC8] rounded-xl text-xs text-[#3E2723] focus:ring-2 focus:ring-[#795548]/30 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-confirm-table"
                  type="submit"
                  disabled={!tempTable}
                  className="w-full py-3 bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>Start Ordering at Table #{tempTable || 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
