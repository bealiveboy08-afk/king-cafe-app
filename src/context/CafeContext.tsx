import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Role,
  Cafe,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  PlatformLedgerSummary,
} from '../types';
import { INITIAL_CAFES, INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/initialData';
import { playNotificationSound } from '../utils/audio';
import {
  subscribeToOrders,
  subscribeToMenu,
  subscribeToCafes,
  seedInitialFirestoreData,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  updateMenuItemInFirestore,
  saveCafeToFirestore,
} from '../lib/firestoreService';

interface CustomerSession {
  name: string;
  tableNumber: number | null;
}

interface CafeContextType {
  // Navigation & Role
  role: Role;
  setRole: (role: Role) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Active Cafe & Multi-tenant data
  cafes: Cafe[];
  activeCafe: Cafe;
  setActiveCafeId: (id: string) => void;
  addCafe: (cafe: Omit<Cafe, 'id'>) => void;

  // Menu items
  menuItems: MenuItem[];
  toggleItemAvailability: (itemId: string) => void;
  updateMenuItemPrice: (itemId: string, newPrice: number) => void;

  // Customer State
  customerSession: CustomerSession;
  setCustomerSession: (session: CustomerSession) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Customer Active Order & Status
  customerActiveOrderId: string | null;
  setCustomerActiveOrderId: (orderId: string | null) => void;
  activeCustomerOrder: Order | null;
  submitOrder: (specialInstructions?: string) => Order | null;

  // Orders Management (Owner & Admin)
  orders: Order[];
  approveOrder: (orderId: string) => void;
  markDelivered: (orderId: string) => void;
  confirmPayment: (orderId: string, paymentMethod?: 'cash' | 'upi' | 'card' | 'counter') => void;
  cancelOrder: (orderId: string) => void;

  // Authentication State
  isOwnerLoggedIn: boolean;
  loginOwner: (user: string, pass: string) => boolean;
  logoutOwner: () => void;

  isAdminLoggedIn: boolean;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Analytics & Commission
  ledgerSummary: PlatformLedgerSummary;
  resetDemoData: () => void;
}

const CafeContext = createContext<CafeContextType | null>(null);

const STORAGE_KEYS = {
  CAFES: 'kingcafe_cafes_v2',
  MENU: 'kingcafe_menu_v2',
  ORDERS: 'kingcafe_orders_v2',
  CUSTOMER: 'kingcafe_customer_v2',
  ACTIVE_ORDER_ID: 'kingcafe_active_order_id_v2',
  OWNER_AUTH: 'kingcafe_owner_auth_v2',
  ADMIN_AUTH: 'kingcafe_admin_auth_v2',
  SOUND: 'kingcafe_sound_v2',
};

const detectRoleFromLocation = (): Role => {
  try {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view')?.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (
      path === '/owner' ||
      path.startsWith('/owner/') ||
      viewParam === 'owner' ||
      hash === '#/owner' ||
      hash === '#owner'
    ) {
      return 'owner';
    }
    if (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      path === '/superadmin' ||
      path.startsWith('/superadmin/') ||
      viewParam === 'admin' ||
      viewParam === 'superadmin' ||
      hash === '#/admin' ||
      hash === '#admin' ||
      hash === '#/superadmin' ||
      hash === '#superadmin'
    ) {
      return 'superadmin';
    }
    return 'customer';
  } catch {
    return 'customer';
  }
};

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync role state from pathname (/owner, /admin) or search query (?view=owner, ?view=admin)
  const [role, setRoleState] = useState<Role>(() => detectRoleFromLocation());

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [cafes, setCafes] = useState<Cafe[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAFES);
    return saved ? JSON.parse(saved) : INITIAL_CAFES;
  });

  const [activeCafeId, setActiveCafeId] = useState<string>('cafe-king-01');

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customerSession, setCustomerSessionState] = useState<CustomerSession>(() => {
    let tableNum: number | null = null;
    let name = '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      const nameParam = urlParams.get('name');
      if (tableParam) {
        const parsed = parseInt(tableParam, 10);
        if (!isNaN(parsed)) tableNum = parsed;
      }
      if (nameParam) name = nameParam;
    } catch {}

    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    const parsed = saved ? JSON.parse(saved) : { name: '', tableNumber: null };

    return {
      name: name || parsed.name || '',
      tableNumber: tableNum !== null ? tableNum : (parsed.tableNumber || 1),
    };
  });

  const [customerActiveOrderId, setCustomerActiveOrderIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER_ID) || null;
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OWNER_AUTH);
    return saved === 'true';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    return saved === 'true';
  });

  // Real-time Cloud Synchronization (Firestore) + Cross-device/tab support
  useEffect(() => {
    // Seed initial data if Firestore collections are empty
    seedInitialFirestoreData();

    // 1. Subscribe to real-time Orders across all devices and browsers
    const unsubscribeOrders = subscribeToOrders((liveOrders, isInitial) => {
      setOrders((prev) => {
        // Play notification if a new incoming order was added (not initial load)
        if (!isInitial) {
          const prevIds = new Set(prev.map((o) => o.id));
          const hasNew = liveOrders.some((o) => !prevIds.has(o.id) && o.status === 'order_sent');
          if (hasNew && soundEnabled) {
            playNotificationSound('new_order');
          }
        }
        return liveOrders;
      });

      // Update local storage backup
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(liveOrders));
      } catch {}
    });

    // 2. Subscribe to real-time Menu updates
    const unsubscribeMenu = subscribeToMenu((liveMenu) => {
      setMenuItems(liveMenu);
      try {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(liveMenu));
      } catch {}
    });

    // 3. Subscribe to real-time Cafe tenants
    const unsubscribeCafes = subscribeToCafes((liveCafes) => {
      setCafes(liveCafes);
      try {
        localStorage.setItem(STORAGE_KEYS.CAFES, JSON.stringify(liveCafes));
      } catch {}
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMenu();
      unsubscribeCafes();
    };
  }, [soundEnabled]);

  // Cross-tab & Multi-Window Synchronization (URL & Local)
  useEffect(() => {
    const handleLocationChange = () => {
      setRoleState(detectRoleFromLocation());
      // Also check if table is specified in URL query
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tableParam = urlParams.get('table');
        const nameParam = urlParams.get('name');
        if (tableParam) {
          const parsedTable = parseInt(tableParam, 10);
          if (!isNaN(parsedTable)) {
            setCustomerSessionState((prev) => ({
              name: nameParam || prev.name || '',
              tableNumber: parsedTable,
            }));
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // 1. Cross-Tab Storage Event Listener
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        try {
          const parsedOrders: Order[] = JSON.parse(e.newValue);
          if (Array.isArray(parsedOrders)) {
            setOrders(parsedOrders);
          }
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEYS.MENU && e.newValue) {
        try {
          const parsedMenu = JSON.parse(e.newValue);
          if (Array.isArray(parsedMenu)) setMenuItems(parsedMenu);
        } catch {}
      } else if (e.key === STORAGE_KEYS.CAFES && e.newValue) {
        try {
          const parsedCafes = JSON.parse(e.newValue);
          if (Array.isArray(parsedCafes)) setCafes(parsedCafes);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 2. Window Custom Event Listeners
    const handleCustomOrderSync = (e: Event) => {
      const customEvt = e as CustomEvent<Order[]>;
      if (customEvt.detail && Array.isArray(customEvt.detail)) {
        setOrders(customEvt.detail);
      }
    };

    const handleCustomNewOrder = (e: Event) => {
      const customEvt = e as CustomEvent<Order>;
      if (customEvt.detail) {
        if (soundEnabled) {
          playNotificationSound('new_order');
        }
      }
    };

    window.addEventListener('kingcafe:orders_sync', handleCustomOrderSync);
    window.addEventListener('kingcafe:new_order', handleCustomNewOrder);

    // 3. BroadcastChannel for modern browsers
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('king_cafe_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data.payload)) {
          setOrders(event.data.payload);
        } else if (event.data?.type === 'MENU_UPDATED') {
          setMenuItems(event.data.payload);
        } else if (event.data?.type === 'CAFES_UPDATED') {
          setCafes(event.data.payload);
        }
      };
    } catch {
      // BroadcastChannel not available in all sandbox environments
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('kingcafe:orders_sync', handleCustomOrderSync);
      window.removeEventListener('kingcafe:new_order', handleCustomNewOrder);
      channel?.close();
    };
  }, [soundEnabled]);

  // Save changes to cloud (Firestore), localStorage and broadcast across tabs & devices
  const persistOrders = useCallback((newOrders: Order[], newlyCreatedOrder?: Order) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
    } catch {
      // ignore
    }

    // Save to Firestore for cross-device real-time sync
    if (newlyCreatedOrder) {
      saveOrderToFirestore(newlyCreatedOrder);
    }

    // Dispatch custom window events for immediate local listeners
    try {
      window.dispatchEvent(new CustomEvent('kingcafe:orders_sync', { detail: newOrders }));
      if (newlyCreatedOrder) {
        window.dispatchEvent(new CustomEvent('kingcafe:new_order', { detail: newlyCreatedOrder }));
      }
    } catch {
      // ignore
    }

    // BroadcastChannel for local cross-tab communication
    try {
      const channel = new BroadcastChannel('king_cafe_sync');
      channel.postMessage({
        type: 'ORDERS_UPDATED',
        payload: newOrders,
        newOrder: newlyCreatedOrder,
      });
      setTimeout(() => {
        try {
          channel.close();
        } catch {}
      }, 500);
    } catch {
      // ignore
    }
  }, []);

  const persistMenu = useCallback((newMenu: MenuItem[]) => {
    setMenuItems(newMenu);
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(newMenu));
      const channel = new BroadcastChannel('king_cafe_sync');
      channel.postMessage({ type: 'MENU_UPDATED', payload: newMenu });
      channel.close();
    } catch {
      // ignore
    }
  }, []);

  const persistCafes = useCallback((newCafes: Cafe[]) => {
    setCafes(newCafes);
    try {
      localStorage.setItem(STORAGE_KEYS.CAFES, JSON.stringify(newCafes));
      const channel = new BroadcastChannel('king_cafe_sync');
      channel.postMessage({ type: 'CAFES_UPDATED', payload: newCafes });
      channel.close();
    } catch {
      // ignore
    }
  }, []);

  // Customer session persistence
  const setCustomerSession = useCallback((session: CustomerSession) => {
    setCustomerSessionState(session);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, []);

  const setCustomerActiveOrderId = useCallback((orderId: string | null) => {
    setCustomerActiveOrderIdState(orderId);
    try {
      if (orderId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER_ID, orderId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORDER_ID);
      }
    } catch {
      // ignore
    }
  }, []);

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
    // Update URL pathname / query cleanly
    try {
      const url = new URL(window.location.href);
      if (newRole === 'customer') {
        if (url.pathname === '/owner' || url.pathname === '/admin' || url.pathname === '/superadmin') {
          url.pathname = '/';
        }
        url.searchParams.delete('view');
      } else if (newRole === 'owner') {
        if (url.pathname === '/admin' || url.pathname === '/superadmin') {
          url.pathname = '/owner';
        } else if (url.pathname !== '/owner') {
          url.searchParams.set('view', 'owner');
        }
      } else if (newRole === 'superadmin') {
        if (url.pathname === '/owner') {
          url.pathname = '/admin';
        } else if (url.pathname !== '/admin') {
          url.searchParams.set('view', 'admin');
        }
      }
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, []);

  // Active Cafe object
  const activeCafe = useMemo(() => {
    return cafes.find((c) => c.id === activeCafeId) || cafes[0] || INITIAL_CAFES[0];
  }, [cafes, activeCafeId]);

  // Cart operations
  const addToCart = useCallback((item: MenuItem, quantity = 1, notes?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          customizationNotes: notes || updated[existingIndex].customizationNotes,
        };
        return updated;
      }
      return [...prev, { menuItem: item, quantity, customizationNotes: notes }];
    });
  }, []);

  const updateCartQuantity = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menuItem.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Submit Order from Customer Screen
  const submitOrder = useCallback(
    (specialInstructions?: string): Order | null => {
      // Determine table number from session or fallback to URL parameter
      let tableNum = customerSession.tableNumber;
      if (!tableNum) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const tParam = urlParams.get('table');
          if (tParam) {
            const parsed = parseInt(tParam, 10);
            if (!isNaN(parsed)) tableNum = parsed;
          }
        } catch {}
      }
      if (!tableNum) {
        tableNum = 1;
      }

      if (cart.length === 0) return null;

      const subtotal = cartTotal;
      const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
      const totalAmount = Math.round((subtotal + tax) * 100) / 100;
      const commissionRate = activeCafe?.commissionRate || 0.10;
      const commissionAmount = Math.round(totalAmount * commissionRate * 100) / 100;

      const now = new Date().toISOString();
      const orderNumber = `KC-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderNumber,
        cafeId: activeCafe?.id || 'cafe-king-01',
        cafeName: activeCafe?.name || 'King Cafe',
        tableNumber: tableNum,
        customerName: (customerSession.name || '').trim() || `Guest (Table ${tableNum})`,
        customerPhone: '',
        items: [...cart],
        subtotal,
        tax,
        totalAmount,
        commissionAmount,
        status: 'order_sent',
        statusTimestamps: {
          sent: now,
        },
        specialInstructions: specialInstructions ? specialInstructions.trim() : '',
        createdAt: now,
        updatedAt: now,
        estimatedMinutes: 15,
      };

      const updatedOrders = [newOrder, ...orders];
      persistOrders(updatedOrders, newOrder);
      setCustomerActiveOrderId(newOrder.id);
      clearCart();

      if (soundEnabled) {
        playNotificationSound('new_order');
      }

      return newOrder;
    },
    [
      cart,
      customerSession,
      cartTotal,
      activeCafe,
      orders,
      persistOrders,
      setCustomerActiveOrderId,
      clearCart,
      soundEnabled,
    ]
  );

  // Active Customer Order Tracker
  const activeCustomerOrder = useMemo(() => {
    if (!customerActiveOrderId) {
      // Find latest pending/active order for this table if any
      if (customerSession.tableNumber) {
        const tableOrder = orders.find(
          (o) =>
            o.tableNumber === customerSession.tableNumber &&
            o.cafeId === activeCafe.id &&
            o.status !== 'cancelled'
        );
        return tableOrder || null;
      }
      return null;
    }
    return orders.find((o) => o.id === customerActiveOrderId) || null;
  }, [customerActiveOrderId, orders, customerSession.tableNumber, activeCafe.id]);

  // King Cafe Owner Action Handlers
  const approveOrder = useCallback(
    (orderId: string) => {
      const now = new Date().toISOString();
      const existing = orders.find((o) => o.id === orderId);
      const updatedTimestamps = {
        sent: existing?.statusTimestamps.sent || now,
        ...existing?.statusTimestamps,
        approved: now,
      };

      const updated = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'approved_preparing' as OrderStatus,
            statusTimestamps: updatedTimestamps,
            updatedAt: now,
          };
        }
        return o;
      });
      persistOrders(updated);
      updateOrderStatusInFirestore(orderId, {
        status: 'approved_preparing',
        statusTimestamps: updatedTimestamps,
      });
      if (soundEnabled) {
        playNotificationSound('approved');
      }
    },
    [orders, persistOrders, soundEnabled]
  );

  const markDelivered = useCallback(
    (orderId: string) => {
      const now = new Date().toISOString();
      const existing = orders.find((o) => o.id === orderId);
      const updatedTimestamps = {
        sent: existing?.statusTimestamps.sent || now,
        ...existing?.statusTimestamps,
        delivered: now,
      };

      const updated = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'delivered_served' as OrderStatus,
            statusTimestamps: updatedTimestamps,
            updatedAt: now,
          };
        }
        return o;
      });
      persistOrders(updated);
      updateOrderStatusInFirestore(orderId, {
        status: 'delivered_served',
        statusTimestamps: updatedTimestamps,
      });
      if (soundEnabled) {
        playNotificationSound('delivered');
      }
    },
    [orders, persistOrders, soundEnabled]
  );

  const confirmPayment = useCallback(
    (orderId: string, paymentMethod: 'cash' | 'upi' | 'card' | 'counter' = 'counter') => {
      const now = new Date().toISOString();
      const existing = orders.find((o) => o.id === orderId);
      const updatedTimestamps = {
        sent: existing?.statusTimestamps.sent || now,
        ...existing?.statusTimestamps,
        paid: now,
      };

      const updated = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'payment_confirmed' as OrderStatus,
            paymentMethod,
            statusTimestamps: updatedTimestamps,
            updatedAt: now,
          };
        }
        return o;
      });
      persistOrders(updated);
      updateOrderStatusInFirestore(orderId, {
        status: 'payment_confirmed',
        paymentMethod,
        statusTimestamps: updatedTimestamps,
      });

      if (soundEnabled) {
        playNotificationSound('paid');
      }

      // Celebratory Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
        });
      } catch {
        // ignore
      }
    },
    [orders, persistOrders, soundEnabled]
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      const now = new Date().toISOString();
      const updated = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'cancelled' as OrderStatus,
            updatedAt: now,
          };
        }
        return o;
      });
      persistOrders(updated);
      updateOrderStatusInFirestore(orderId, {
        status: 'cancelled',
      });
    },
    [orders, persistOrders]
  );

  // Menu item modification
  const toggleItemAvailability = useCallback(
    (itemId: string) => {
      const targetItem = menuItems.find((item) => item.id === itemId);
      const newAvailability = targetItem ? !targetItem.isAvailable : false;
      const updated = menuItems.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      );
      persistMenu(updated);
      updateMenuItemInFirestore(itemId, { isAvailable: newAvailability });
    },
    [menuItems, persistMenu]
  );

  const updateMenuItemPrice = useCallback(
    (itemId: string, newPrice: number) => {
      const validPrice = Math.max(1, newPrice);
      const updated = menuItems.map((item) =>
        item.id === itemId ? { ...item, price: validPrice } : item
      );
      persistMenu(updated);
      updateMenuItemInFirestore(itemId, { price: validPrice });
    },
    [menuItems, persistMenu]
  );

  // Cafe management for Super Admin
  const addCafe = useCallback(
    (cafeData: Omit<Cafe, 'id'>) => {
      const newCafe: Cafe = {
        ...cafeData,
        id: `cafe-${Date.now()}`,
      };
      const updated = [...cafes, newCafe];
      persistCafes(updated);
      saveCafeToFirestore(newCafe);
    },
    [cafes, persistCafes]
  );

  // Authentication Handlers
  const loginOwner = useCallback((user: string, pass: string): boolean => {
    // Standard King Cafe owner credentials
    if ((user.trim().toLowerCase() === 'kingcafe' || user.trim().toLowerCase() === 'owner') && pass === 'king123') {
      setIsOwnerLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.OWNER_AUTH, 'true');
      return true;
    }
    return false;
  }, []);

  const logoutOwner = useCallback(() => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.OWNER_AUTH);
  }, []);

  const loginAdmin = useCallback((user: string, pass: string): boolean => {
    if ((user.trim().toLowerCase() === 'admin' || user.trim().toLowerCase() === 'superadmin') && pass === 'admin123') {
      setIsAdminLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }, []);

  // Super Admin Platform Ledger & Commission Calculation
  const ledgerSummary = useMemo<PlatformLedgerSummary>(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    // 1% Commission across all orders
    const totalCommission = validOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: validOrders.length,
      totalCommission: Math.round(totalCommission * 100) / 100,
      pendingOrdersCount: orders.filter((o) => o.status === 'order_sent').length,
      preparingOrdersCount: orders.filter((o) => o.status === 'approved_preparing').length,
      deliveredOrdersCount: orders.filter((o) => o.status === 'delivered_served').length,
      paidOrdersCount: orders.filter((o) => o.status === 'payment_confirmed').length,
    };
  }, [orders]);

  const resetDemoData = useCallback(() => {
    persistOrders(INITIAL_ORDERS);
    persistMenu(INITIAL_MENU_ITEMS);
    persistCafes(INITIAL_CAFES);
    setCustomerActiveOrderId(null);
    clearCart();
  }, [persistOrders, persistMenu, persistCafes, setCustomerActiveOrderId, clearCart]);

  return (
    <CafeContext.Provider
      value={{
        role,
        setRole,
        soundEnabled,
        setSoundEnabled,
        cafes,
        activeCafe,
        setActiveCafeId,
        addCafe,
        menuItems,
        toggleItemAvailability,
        updateMenuItemPrice,
        customerSession,
        setCustomerSession,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        customerActiveOrderId,
        setCustomerActiveOrderId,
        activeCustomerOrder,
        submitOrder,
        orders,
        approveOrder,
        markDelivered,
        confirmPayment,
        cancelOrder,
        isOwnerLoggedIn,
        loginOwner,
        logoutOwner,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        ledgerSummary,
        resetDemoData,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
