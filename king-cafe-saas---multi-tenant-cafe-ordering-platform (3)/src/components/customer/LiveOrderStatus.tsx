import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  ChefHat,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Receipt,
  ArrowLeft,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface LiveOrderStatusProps {
  order: Order;
  onBackToMenu: () => void;
  onOrderMore: () => void;
}

export const LiveOrderStatus: React.FC<LiveOrderStatusProps> = ({
  order,
  onBackToMenu,
  onOrderMore,
}) => {
  const getStepNumber = (status: OrderStatus): number => {
    switch (status) {
      case 'order_sent':
        return 1;
      case 'approved_preparing':
        return 2;
      case 'delivered_served':
        return 3;
      case 'payment_confirmed':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStepNumber(order.status);

  // Status-specific headline, Hindi subtitle and styling
  const statusConfig = {
    order_sent: {
      step: 1,
      title: 'Order Sent to Kitchen',
      hindiPhrase: 'Aapka Order Kitchen Mein Bhej Diya Gaya Hai',
      description: 'The kitchen at King Cafe has received your order and is reviewing it right now.',
      icon: Send,
      color: 'from-[#8D6E63] to-[#795548]',
      bgColor: 'bg-[#FAF8F6] border-[#D7CCC8] text-[#3E2723]',
      badgeClass: 'bg-[#EFEBE9] text-[#795548] border-[#D7CCC8]',
      animation: 'animate-pulse',
    },
    approved_preparing: {
      step: 2,
      title: 'Order Approved & Cooking',
      hindiPhrase: 'Khana aa raha hai, sabra rakhiye...',
      description: 'Our head chef has fired up the ovens and is preparing your fresh meal with love!',
      icon: ChefHat,
      color: 'from-[#795548] to-[#5D4037]',
      bgColor: 'bg-[#FAF8F6] border-[#D7CCC8] text-[#3E2723]',
      badgeClass: 'bg-[#FAF8F6] text-[#5D4037] border-[#D7CCC8]',
      animation: 'animate-bounce',
    },
    delivered_served: {
      step: 3,
      title: 'Served at Your Table',
      hindiPhrase: 'Abhi maze se khao aur pio!',
      description: 'Your hot and delicious dishes have been served at Table #' + order.tableNumber + '. Enjoy your meal!',
      icon: UtensilsCrossed,
      color: 'from-[#2E7D32] to-[#388E3C]',
      bgColor: 'bg-[#E8F5E9] border-[#C8E6C9] text-[#1B5E20]',
      badgeClass: 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
      animation: 'animate-pulse',
    },
    payment_confirmed: {
      step: 4,
      title: 'Payment Confirmed & Settled',
      hindiPhrase: 'Payment Confirmed!',
      description: 'Thank you for dining at King Cafe! Your bill has been paid and confirmed by the owner.',
      icon: CheckCircle2,
      color: 'from-[#1B5E20] to-[#2E7D32]',
      bgColor: 'bg-[#E8F5E9] border-[#81C784] text-[#1B5E20]',
      badgeClass: 'bg-[#E8F5E9] text-[#1B5E20] border-[#81C784]',
      animation: '',
    },
    cancelled: {
      step: 0,
      title: 'Order Cancelled',
      hindiPhrase: 'Order Cancel Kar Diya Gaya Hai',
      description: 'This order was cancelled. Please speak with the cafe staff if you need assistance.',
      icon: Info,
      color: 'from-[#8D6E63] to-[#5D4037]',
      bgColor: 'bg-[#FAF8F6] border-[#D7CCC8] text-[#3E2723]',
      badgeClass: 'bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8]',
      animation: '',
    },
  };

  const currentConfig = statusConfig[order.status] || statusConfig.order_sent;
  const StatusIcon = currentConfig.icon;

  const steps = [
    {
      id: 1,
      name: 'Order Sent',
      sub: 'Sent to Kitchen',
      icon: Send,
    },
    {
      id: 2,
      name: 'Khana aa raha hai, sabra rakhiye...',
      sub: 'Approved & Cooking',
      icon: ChefHat,
    },
    {
      id: 3,
      name: 'Abhi maze se khao aur pio!',
      sub: 'Served at Table',
      icon: UtensilsCrossed,
    },
    {
      id: 4,
      name: 'Payment Confirmed',
      sub: 'Bill Settled',
      icon: CheckCircle2,
    },
  ];

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5D4037] hover:text-[#3E2723] bg-white border border-[#D7CCC8] px-3 py-1.5 rounded-lg shadow-xs hover:bg-[#EFEBE9] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Menu
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFEBE9] text-[#795548] border border-[#D7CCC8]">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
            Live Status Tracker
          </span>
        </div>
      </div>

      {/* Hero Live Status Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-[#D7CCC8] shadow-xs overflow-hidden mb-6"
      >
        {/* Banner with dynamic glowing gradient */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${currentConfig.color} text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-white/90 mb-3">
                <MapPin className="w-3 h-3 text-[#FFB74D]" />
                Table #{order.tableNumber} • {order.customerName}
              </div>

              {/* Exact Hindi Status Highlight */}
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight mb-2 leading-tight">
                {currentConfig.hindiPhrase}
              </h1>

              <p className="text-sm text-white/90 font-medium max-w-lg">
                {currentConfig.description}
              </p>
            </div>

            <div className="flex-shrink-0 self-start sm:self-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-inner">
                <StatusIcon className={`w-9 h-9 sm:w-11 sm:h-11 text-white ${currentConfig.animation}`} />
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Interactive Progress Bar */}
        <div className="p-6 sm:p-8 bg-[#FAF8F6] border-b border-[#D7CCC8]">
          <div className="relative">
            {/* Horizontal Track Bar */}
            <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-[#D7CCC8] -z-0">
              <div
                className="h-full bg-gradient-to-r from-[#795548] to-[#2E7D32] transition-all duration-700 ease-out"
                style={{
                  width: `${((Math.max(1, currentStep) - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
              {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-3 sm:p-2 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-white shadow-xs border border-[#795548] ring-2 ring-[#795548]/20'
                        : isCompleted
                        ? 'bg-white/80 border border-[#C8E6C9] text-[#3E2723]'
                        : 'opacity-60 bg-transparent'
                    }`}
                  >
                    {/* Step Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#2E7D32] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#795548] text-white ring-4 ring-[#EFEBE9] shadow-xs font-extrabold'
                          : 'bg-[#EFEBE9] text-[#8D6E63]'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 sm:flex-initial">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isCurrent
                            ? 'text-[#3E2723] font-extrabold'
                            : isCompleted
                            ? 'text-[#1B5E20]'
                            : 'text-[#8D6E63]'
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="text-[11px] text-[#8D6E63]">{step.sub}</p>
                    </div>

                    {isCurrent && (
                      <span className="sm:hidden ml-auto text-[10px] font-bold px-2 py-0.5 bg-[#EFEBE9] text-[#795548] rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Status Timestamps Bar */}
        <div className="px-6 py-4 bg-white flex flex-wrap items-center justify-between gap-4 text-xs text-[#5D4037]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#795548]" />
            <span>Order Placed: <strong>{formatTime(order.statusTimestamps.sent)}</strong></span>
          </div>

          {order.statusTimestamps.approved && (
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-[#8D6E63]" />
              <span>Kitchen Approved: <strong>{formatTime(order.statusTimestamps.approved)}</strong></span>
            </div>
          )}

          {order.statusTimestamps.delivered && (
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#2E7D32]" />
              <span>Served at: <strong>{formatTime(order.statusTimestamps.delivered)}</strong></span>
            </div>
          )}

          {order.statusTimestamps.paid && (
            <div className="flex items-center gap-2 text-[#1B5E20] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Paid & Closed: <strong>{formatTime(order.statusTimestamps.paid)}</strong></span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Order Summary & Receipt Card */}
      <div className="bg-white rounded-2xl border border-[#D7CCC8] shadow-xs p-6 mb-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F1EDE9] mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#5D4037]" />
            <h2 className="text-base font-bold text-[#3E2723]">Order Summary ({order.orderNumber})</h2>
          </div>
          <span className="text-xs font-mono bg-[#FAF8F6] border border-[#D7CCC8] px-2.5 py-1 rounded-md text-[#5D4037] font-semibold">
            {order.cafeName}
          </span>
        </div>

        {/* Ordered items breakdown */}
        <div className="divide-y divide-[#F1EDE9]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#D7CCC8]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.menuItem.isVeg ? 'bg-[#2E7D32]' : 'bg-red-700'
                      }`}
                    />
                    <h3 className="text-sm font-semibold text-[#3E2723]">{item.menuItem.name}</h3>
                  </div>
                  <p className="text-xs text-[#8D6E63]">
                    ₹{item.menuItem.price} × {item.quantity}
                  </p>
                  {item.customizationNotes && (
                    <p className="text-[11px] text-[#795548] italic mt-0.5">
                      Note: {item.customizationNotes}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-[#3E2723]">
                ₹{item.menuItem.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Special instructions if any */}
        {order.specialInstructions && (
          <div className="mt-4 p-3 rounded-lg bg-[#FAF8F6] border border-[#D7CCC8] text-xs text-[#5D4037]">
            <span className="font-semibold">Cooking Instructions: </span>
            {order.specialInstructions}
          </div>
        )}

        {/* Price Calculations */}
        <div className="mt-6 pt-4 border-t border-[#F1EDE9] space-y-2 text-xs">
          <div className="flex justify-between text-[#8D6E63]">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#8D6E63]">
            <span>GST & Service (5%)</span>
            <span>₹{order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-[#3E2723] pt-2 border-t border-[#D7CCC8]">
            <span>Total Payable Amount</span>
            <span className="text-[#795548]">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <button
          onClick={onOrderMore}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-sm shadow-xs transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Add More Items to Table #{order.tableNumber}
        </button>

        <div className="text-xs text-[#8D6E63] text-center sm:text-right">
          Need assistance? Wave to your server or speak at the counter.
        </div>
      </div>
    </div>
  );
};
