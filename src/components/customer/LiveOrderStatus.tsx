import React, { useState, useRef, useEffect } from 'react';
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
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Check,
  Camera,
  Copy,
  Download,
  Share2,
  RefreshCw,
  CreditCard,
  User,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useCafe } from '../../context/CafeContext';

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
  const { submitOrderVerificationCode, setCustomerActiveOrderId, activeCafe } = useCafe();

  // Verification PIN state
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState<string>('');
  const [isEditingPin, setIsEditingPin] = useState<boolean>(false);
  const [copiedBill, setCopiedBill] = useState<boolean>(false);
  const [showBillModal, setShowBillModal] = useState<boolean>(false);

  const digitRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-fill existing customer entered code if available
  useEffect(() => {
    const existingCode = order.customerEnteredCode || order.staffVerificationCode || '';
    if (existingCode && existingCode.length === 4) {
      setDigits(existingCode.split(''));
    }
  }, [order.customerEnteredCode, order.staffVerificationCode]);

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
  const isAwaitingVerification =
    order.status === 'order_sent' && order.verificationStatus !== 'verified';
  const isDelivered = order.status === 'delivered_served';
  const isPaid = order.status === 'payment_confirmed';

  // Digit Input Handlers
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean && val.length > 0) return;

    const char = clean.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setPinError('');

    if (char && index < 3) {
      digitRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCodeSubmit();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    if (pasted.length === 4) {
      digitRefs[3].current?.focus();
    } else {
      digitRefs[Math.min(3, pasted.length)].current?.focus();
    }
  };

  const handleCodeSubmit = () => {
    const code = digits.join('').trim();
    if (code.length < 4) {
      setPinError('Please enter the complete 4-digit code provided by staff.');
      return;
    }
    setPinError('');
    submitOrderVerificationCode(order.id, code);
    setIsEditingPin(false);
  };

  // Copy text bill summary
  const handleCopyBill = () => {
    const itemsText = order.items
      .map((i) => `• ${i.menuItem.name} x ${i.quantity} = ₹${i.menuItem.price * i.quantity}`)
      .join('\n');
    const billText = `==============================\n👑 ${order.cafeName} - Tax Invoice / Bill\n==============================\nOrder #${order.orderNumber}\nTable: #${order.tableNumber}\nCustomer: ${order.customerName}\nDate: ${new Date(order.createdAt).toLocaleString()}\n------------------------------\nITEMS:\n${itemsText}\n------------------------------\nSubtotal: ₹${order.subtotal.toFixed(2)}\nGST (5%): ₹${order.tax.toFixed(2)}\nGRAND TOTAL: ₹${order.totalAmount.toFixed(2)}\nStatus: ${order.status === 'payment_confirmed' ? 'PAID & CONFIRMED' : 'DELIVERED & PENDING PAYMENT'}\n==============================`;

    navigator.clipboard?.writeText(billText);
    setCopiedBill(true);
    setTimeout(() => setCopiedBill(false), 2500);
  };

  const handleTriggerScreenshotOrPrint = () => {
    setShowBillModal(true);
  };

  const handleStartNewOrder = () => {
    setCustomerActiveOrderId(null);
    onBackToMenu();
  };

  // Status visual configs
  const statusConfig = {
    order_sent: {
      step: 1,
      title: 'Order Sent & Awaiting Staff',
      hindiPhrase: isAwaitingVerification
        ? 'Staff Verification Code Darj Karein'
        : 'Aapka Order Kitchen Mein Bhej Diya Gaya Hai',
      description: isAwaitingVerification
        ? 'Staff will give a 4-digit code at Table #' + order.tableNumber + '. Enter it below to begin cooking.'
        : 'The kitchen at King Cafe has received your order and will start cooking soon.',
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
      hindiPhrase: 'Payment Confirmed! Shukriya 🙏',
      description: 'Thank you for dining at King Cafe! Your bill has been settled and verified.',
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
      name: 'Order Placed',
      sub: 'Staff Verification',
      icon: Send,
    },
    {
      id: 2,
      name: 'Khana aa raha hai...',
      sub: 'Approved & Cooking',
      icon: ChefHat,
    },
    {
      id: 3,
      name: 'Abhi maze se khao!',
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
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-5">
        {!isDelivered ? (
          <button
            id="btn-back-to-menu"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5D4037] hover:text-[#3E2723] bg-white border border-[#D7CCC8] px-3 py-1.5 rounded-lg shadow-xs hover:bg-[#EFEBE9] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Menu / Add Items</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1B5E20] bg-[#E8F5E9] border border-[#C8E6C9] px-3 py-1.5 rounded-lg">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Dining Active • Table #{order.tableNumber}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFEBE9] text-[#795548] border border-[#D7CCC8]">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
            Live Cloud Sync
          </span>
        </div>
      </div>

      {/* 4-Digit Staff Verification Code Input Card (Prominently displayed when pending) */}
      {isAwaitingVerification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-gradient-to-br from-[#FFF8E1] via-[#FFFDE7] to-white rounded-2xl border-2 border-[#FFE082] shadow-md p-5 sm:p-6"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFB300]/20 border border-[#FFB300]/40 flex items-center justify-center flex-shrink-0 text-[#B78103]">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#3E2723] tracking-tight">
                  Staff Verification Required
                </h2>
                <span className="text-[11px] font-bold bg-[#FFE082] text-[#5D4037] px-2.5 py-0.5 rounded-full">
                  Step 1 of 4
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#5D4037] mt-1 font-medium">
                Our waiter or server will provide a <strong>4-digit code</strong> to Table #{order.tableNumber}. Enter the code below to authorize your order.
              </p>

              {/* Input Boxes */}
              <div className="mt-4">
                <div className="flex items-center gap-2.5 sm:gap-3 max-w-xs">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={digitRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={handleDigitPaste}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black font-mono bg-white border-2 border-[#D7CCC8] focus:border-[#795548] focus:ring-2 focus:ring-[#795548]/30 rounded-xl text-[#3E2723] outline-none shadow-xs transition-all"
                      placeholder="•"
                    />
                  ))}

                  <button
                    id="btn-submit-pin"
                    onClick={handleCodeSubmit}
                    className="px-4 h-14 sm:h-16 bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit</span>
                  </button>
                </div>

                {pinError && (
                  <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pinError}
                  </p>
                )}

                {/* Submitted status indicator */}
                {order.customerEnteredCode && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>
                        Code <strong>[{order.customerEnteredCode}]</strong> submitted! Waiting for kitchen to accept...
                      </span>
                    </div>
                  </div>
                )}

                {order.verificationStatus === 'declined' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800 font-bold">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Code was declined by kitchen. Please verify code with staff and re-enter.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Live Status Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-[#D7CCC8] shadow-xs overflow-hidden mb-6"
      >
        {/* Banner with dynamic gradient */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${currentConfig.color} text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-white/95">
                  <MapPin className="w-3 h-3 text-[#FFB74D]" />
                  Table #{order.tableNumber} • {order.customerName}
                </div>

                {order.verificationStatus === 'verified' || order.status !== 'order_sent' ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-600/90 text-white px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/40 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Code Verified</span>
                  </div>
                ) : order.customerEnteredCode ? (
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/90 text-amber-950 px-3 py-1 rounded-full text-xs font-bold border border-amber-300">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Code: [{order.customerEnteredCode}] Submitted</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/80 text-amber-950 px-3 py-1 rounded-full text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Awaiting Staff Code</span>
                  </div>
                )}
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
              <span>Served at Table: <strong>{formatTime(order.statusTimestamps.delivered)}</strong></span>
            </div>
          )}

          {order.statusTimestamps.paid && (
            <div className="flex items-center gap-2 text-[#1B5E20] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Payment Confirmed: <strong>{formatTime(order.statusTimestamps.paid)}</strong></span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Post-Serving Locked Bill Banner */}
      {isDelivered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Dining Complete • Bill Settlement Pending
              </h3>
              <p className="text-xs text-amber-800">
                Please keep this screen open. Your server/cashier will settle your bill at Table #{order.tableNumber}.
              </p>
            </div>
          </div>

          <button
            id="btn-save-bill-top"
            onClick={handleTriggerScreenshotOrPrint}
            className="w-full sm:w-auto px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Screenshot / Save Bill</span>
          </button>
        </motion.div>
      )}

      {/* Payment Confirmed Banner with New Order Action */}
      {isPaid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#E8F5E9] border-2 border-[#81C784] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1B5E20]">
                Payment Confirmed & Settled!
              </h3>
              <p className="text-xs text-[#2E7D32] font-medium">
                Thank you for visiting King Cafe. We hope you enjoyed your meal!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleTriggerScreenshotOrPrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-[#1B5E20] border border-[#C8E6C9] font-bold text-xs rounded-xl shadow-2xs hover:bg-[#F1F8E9] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Receipt</span>
            </button>
            <button
              id="btn-start-new-order"
              onClick={handleStartNewOrder}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Start New Order</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Official Tax Invoice & Detailed Bill Summary */}
      <div id="cafe-bill-printable" className="bg-white rounded-2xl border border-[#D7CCC8] shadow-sm p-6 sm:p-8 mb-6 relative">
        {/* Paid Stamp watermark if paid */}
        {isPaid && (
          <div className="absolute top-6 right-6 border-4 border-[#2E7D32] text-[#2E7D32] font-black font-mono tracking-widest text-lg sm:text-xl px-4 py-1.5 rounded-lg rotate-12 opacity-80 pointer-events-none select-none">
            PAID & SETTLED
          </div>
        )}

        {/* Cafe Header */}
        <div className="text-center pb-5 border-b border-[#D7CCC8]/60 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEBE9] border border-[#D7CCC8] flex items-center justify-center text-2xl mx-auto mb-2 shadow-2xs">
            👑
          </div>
          <h2 className="text-xl font-black text-[#3E2723] tracking-tight">{order.cafeName}</h2>
          <p className="text-xs text-[#8D6E63] mt-0.5">Plot 42, Connaught Place, New Delhi • GSTIN: 07AAAAA0000A1Z5</p>
          <p className="text-xs text-[#8D6E63]">FSSAI Lic. No: 10019011006542 • Phone: +91 98765 43210</p>
        </div>

        {/* Bill Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pb-4 border-b border-[#F1EDE9] mb-4">
          <div className="bg-[#FAF8F6] p-2.5 rounded-xl border border-[#D7CCC8]/50">
            <span className="text-[#8D6E63] text-[10px] uppercase font-bold block">Order Number</span>
            <span className="font-mono font-black text-[#3E2723] text-sm">{order.orderNumber}</span>
          </div>

          <div className="bg-[#FAF8F6] p-2.5 rounded-xl border border-[#D7CCC8]/50">
            <span className="text-[#8D6E63] text-[10px] uppercase font-bold block">Table Number</span>
            <span className="font-black text-[#795548] text-sm">Table #{order.tableNumber}</span>
          </div>

          <div className="bg-[#FAF8F6] p-2.5 rounded-xl border border-[#D7CCC8]/50">
            <span className="text-[#8D6E63] text-[10px] uppercase font-bold block">Customer Name</span>
            <span className="font-bold text-[#3E2723] text-sm truncate block">{order.customerName}</span>
          </div>

          <div className="bg-[#FAF8F6] p-2.5 rounded-xl border border-[#D7CCC8]/50">
            <span className="text-[#8D6E63] text-[10px] uppercase font-bold block">Date & Time</span>
            <span className="font-medium text-[#5D4037] text-xs">{new Date(order.createdAt).toLocaleDateString()} {formatTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Ordered items breakdown */}
        <div className="divide-y divide-[#F1EDE9]">
          <div className="py-2 flex items-center justify-between text-[11px] font-bold uppercase text-[#8D6E63]">
            <span>Item Description</span>
            <div className="flex items-center gap-8">
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Amount</span>
            </div>
          </div>

          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-10 h-10 rounded-lg object-cover border border-[#D7CCC8] flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.menuItem.isVeg ? 'bg-[#2E7D32]' : 'bg-red-700'
                      }`}
                    />
                    <h3 className="font-bold text-[#3E2723]">{item.menuItem.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#8D6E63]">
                    ₹{item.menuItem.price} per portion
                  </p>
                  {item.customizationNotes && (
                    <p className="text-[10px] text-[#795548] italic">
                      Note: {item.customizationNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8 font-mono">
                <span className="w-12 text-center font-bold text-[#5D4037] bg-[#FAF8F6] py-1 rounded">
                  {item.quantity}
                </span>
                <span className="w-16 text-right font-extrabold text-[#3E2723]">
                  ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions note */}
        {order.specialInstructions && (
          <div className="mt-4 p-3 rounded-xl bg-[#FAF8F6] border border-[#D7CCC8] text-xs text-[#5D4037]">
            <span className="font-bold">Customer Notes: </span>
            {order.specialInstructions}
          </div>
        )}

        {/* Price Calculations */}
        <div className="mt-6 pt-4 border-t border-[#D7CCC8] space-y-2 text-xs">
          <div className="flex justify-between text-[#8D6E63]">
            <span>Item Subtotal</span>
            <span className="font-mono">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#8D6E63]">
            <span>CGST (2.5%) + SGST (2.5%)</span>
            <span className="font-mono">₹{order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-[#3E2723] pt-3 border-t-2 border-[#D7CCC8]">
            <span>Grand Total Payable</span>
            <span className="text-[#795548] font-mono">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Bill Actions */}
        <div className="mt-6 pt-5 border-t border-[#F1EDE9] flex flex-wrap items-center justify-between gap-3">
          <button
            id="btn-take-screenshot"
            onClick={handleTriggerScreenshotOrPrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Take Screenshot / Save Bill</span>
          </button>

          <button
            onClick={handleCopyBill}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF8F6] text-[#5D4037] border border-[#D7CCC8] font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            {copiedBill ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Bill Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text Bill</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bill Save / Screenshot Modal Tip */}
      <AnimatePresence>
        {showBillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#D7CCC8] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F1EDE9]">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#795548]" />
                  <h3 className="font-extrabold text-base text-[#3E2723]">Save / Screenshot Bill</h3>
                </div>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF8F6] text-[#8D6E63] hover:text-[#3E2723] flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#5D4037]">
                <div className="p-3.5 bg-[#FAF8F6] rounded-2xl border border-[#D7CCC8] space-y-2">
                  <div className="flex justify-between font-bold text-[#3E2723]">
                    <span>Order #{order.orderNumber}</span>
                    <span>Table #{order.tableNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer: {order.customerName}</span>
                    <span className="font-mono font-bold text-[#795548]">Total: ₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#5D4037]">
                  <p className="font-semibold text-[#3E2723]">💡 Tips to save this bill:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#8D6E63]">
                    <li>Press your phone&apos;s <strong>Power + Volume Down</strong> button to take an instant screenshot.</li>
                    <li>Click <strong>Copy Full Bill</strong> below to paste it into WhatsApp or notes.</li>
                    <li>Click <strong>Print / Save PDF</strong> to save directly to your device.</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="py-2.5 bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>

                <button
                  onClick={handleCopyBill}
                  className="py-2.5 bg-white border border-[#D7CCC8] text-[#5D4037] hover:bg-[#FAF8F6] font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedBill ? 'Copied!' : 'Copy Bill'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Footer */}
      {!isDelivered && !isPaid && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <button
            onClick={onOrderMore}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#795548] hover:bg-[#5D4037] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add More Dishes to Table #{order.tableNumber}</span>
          </button>

          <div className="text-xs text-[#8D6E63] text-center sm:text-right">
            Need assistance? Wave to your server or speak at the counter.
          </div>
        </div>
      )}
    </div>
  );
};
