import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, MenuItem, Cafe } from '../types';
import { INITIAL_CAFES, INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/initialData';

const ORDERS_COLLECTION = 'orders';
const MENU_COLLECTION = 'menuItems';
const CAFES_COLLECTION = 'cafes';

// Real-time Firestore Subscriptions
export function subscribeToOrders(
  onOrdersUpdate: (orders: Order[], isInitial: boolean) => void,
  onError?: (err: Error) => void
) {
  let isInitial = true;
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const liveOrders: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const rawStatus = String(data.status || 'order_sent').toLowerCase().trim();
        let normalizedStatus: Order['status'] = 'order_sent';
        if (rawStatus.includes('sent') || rawStatus.includes('pending') || rawStatus === 'order sent') {
          normalizedStatus = 'order_sent';
        } else if (rawStatus.includes('prepar') || rawStatus.includes('cook') || rawStatus.includes('approv')) {
          normalizedStatus = 'approved_preparing';
        } else if (rawStatus.includes('deliver') || rawStatus.includes('serv')) {
          normalizedStatus = 'delivered_served';
        } else if (rawStatus.includes('paid') || rawStatus.includes('settl') || rawStatus.includes('confirm')) {
          normalizedStatus = 'payment_confirmed';
        } else if (rawStatus.includes('cancel')) {
          normalizedStatus = 'cancelled';
        }

        const grossTotal = Number(data.totalAmount) || 0;
        const saasCommission =
          typeof data.saasCommission === 'number'
            ? data.saasCommission
            : typeof data.commissionAmount === 'number'
            ? data.commissionAmount
            : Math.round(grossTotal * 0.10 * 100) / 100;

        const genCode = data.generatedVerificationCode || data.generatedCode || '';
        const custCode = data.customerEnteredCode || data.staffVerificationCode || '';

        return {
          id: docSnap.id,
          orderNumber: data.orderNumber || `KC-${docSnap.id.slice(-4)}`,
          cafeId: data.cafeId || 'cafe-king-01',
          cafeName: data.cafeName || 'King Cafe',
          tableNumber: Number(data.tableNumber) || 1,
          customerName: data.customerName || `Guest (Table ${Number(data.tableNumber) || 1})`,
          customerPhone: data.customerPhone || '',
          items: data.items || [],
          subtotal: Number(data.subtotal) || 0,
          tax: Number(data.tax) || 0,
          totalAmount: grossTotal,
          commissionAmount: saasCommission,
          saasCommission: saasCommission,
          generatedVerificationCode: genCode,
          customerEnteredCode: custCode,
          staffVerificationCode: custCode,
          verificationStatus: data.verificationStatus || (custCode ? 'code_submitted' : 'pending_code'),
          status: normalizedStatus,
          paymentMethod: data.paymentMethod || 'counter',
          statusTimestamps: data.statusTimestamps || { sent: data.createdAt || new Date().toISOString() },
          specialInstructions: data.specialInstructions || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          estimatedMinutes: Number(data.estimatedMinutes) || 15,
        } as Order;
      });

      onOrdersUpdate(liveOrders, isInitial);
      isInitial = false;
    },
    (err) => {
      console.warn('Firestore orders subscription error:', err);
      // Fallback subscription without orderBy in case index or field is missing
      const fallbackUnsub = onSnapshot(
        collection(db, ORDERS_COLLECTION),
        (snap) => {
          const fallbackOrders: Order[] = snap.docs.map((docSnap) => {
            const data = docSnap.data();
            const gross = Number(data.totalAmount) || 0;
            const saasComm =
              typeof data.saasCommission === 'number'
                ? data.saasCommission
                : typeof data.commissionAmount === 'number'
                ? data.commissionAmount
                : Math.round(gross * 0.10 * 100) / 100;
            const genCode = data.generatedVerificationCode || data.generatedCode || '';
            const custCode = data.customerEnteredCode || data.staffVerificationCode || '';
            return {
              id: docSnap.id,
              orderNumber: data.orderNumber || `KC-${docSnap.id.slice(-4)}`,
              cafeId: data.cafeId || 'cafe-king-01',
              cafeName: data.cafeName || 'King Cafe',
              tableNumber: Number(data.tableNumber) || 1,
              customerName: data.customerName || `Guest (Table ${Number(data.tableNumber) || 1})`,
              items: data.items || [],
              subtotal: Number(data.subtotal) || 0,
              tax: Number(data.tax) || 0,
              totalAmount: gross,
              commissionAmount: saasComm,
              saasCommission: saasComm,
              generatedVerificationCode: genCode,
              customerEnteredCode: custCode,
              staffVerificationCode: custCode,
              verificationStatus: data.verificationStatus || (custCode ? 'code_submitted' : 'pending_code'),
              status: (data.status === 'Order Sent' ? 'order_sent' : data.status) || 'order_sent',
              paymentMethod: data.paymentMethod || 'counter',
              statusTimestamps: data.statusTimestamps || { sent: data.createdAt || new Date().toISOString() },
              specialInstructions: data.specialInstructions || '',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            } as Order;
          }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onOrdersUpdate(fallbackOrders, isInitial);
        }
      );
      if (onError) onError(err);
      return fallbackUnsub;
    }
  );

  return unsubscribe;
}

// Subscribe to menu items
export function subscribeToMenu(
  onMenuUpdate: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) {
  const unsubscribe = onSnapshot(
    collection(db, MENU_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) return;
      const liveMenu: MenuItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MenuItem[];
      onMenuUpdate(liveMenu);
    },
    (err) => {
      console.warn('Firestore menu subscription error:', err);
      if (onError) onError(err);
    }
  );
  return unsubscribe;
}

// Subscribe to cafes
export function subscribeToCafes(
  onCafesUpdate: (cafes: Cafe[]) => void,
  onError?: (err: Error) => void
) {
  const unsubscribe = onSnapshot(
    collection(db, CAFES_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) return;
      const liveCafes: Cafe[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Cafe[];
      onCafesUpdate(liveCafes);
    },
    (err) => {
      console.warn('Firestore cafes subscription error:', err);
      if (onError) onError(err);
    }
  );
  return unsubscribe;
}

// Seed initial collections to Firestore if empty
export async function seedInitialFirestoreData() {
  try {
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    if (ordersSnap.empty) {
      const batch = writeBatch(db);
      INITIAL_ORDERS.forEach((ord) => {
        const ref = doc(db, ORDERS_COLLECTION, ord.id);
        batch.set(ref, ord);
      });
      await batch.commit();
    }

    const menuSnap = await getDocs(collection(db, MENU_COLLECTION));
    if (menuSnap.empty) {
      const batch = writeBatch(db);
      INITIAL_MENU_ITEMS.forEach((item) => {
        const ref = doc(db, MENU_COLLECTION, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    const cafesSnap = await getDocs(collection(db, CAFES_COLLECTION));
    if (cafesSnap.empty) {
      const batch = writeBatch(db);
      INITIAL_CAFES.forEach((cafe) => {
        const ref = doc(db, CAFES_COLLECTION, cafe.id);
        batch.set(ref, cafe);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore seeding notice:', err);
  }
}

// Helper to sanitize payload for Firestore (removes undefined fields which crash Firestore setDoc)
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Create or update order in Firestore
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    const grossTotal = Number(order.totalAmount) || 0;
    const saasCommission =
      typeof order.saasCommission === 'number'
        ? order.saasCommission
        : typeof order.commissionAmount === 'number'
        ? order.commissionAmount
        : Math.round(grossTotal * 0.10 * 100) / 100;

    const cleanPayload = sanitizeForFirestore({
      ...order,
      totalAmount: grossTotal,
      saasCommission,
      commissionAmount: saasCommission,
      status: order.status || 'order_sent',
    });
    await setDoc(orderRef, cleanPayload, { merge: true });
  } catch (err) {
    console.error('Failed to save order to Firestore:', err);
  }
}

// Update single order status in Firestore
export async function updateOrderStatusInFirestore(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const cleanUpdates = sanitizeForFirestore({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(orderRef, cleanUpdates);
  } catch (err) {
    console.error('Failed to update order in Firestore:', err);
  }
}

// Update menu item availability or price
export async function updateMenuItemInFirestore(
  itemId: string,
  updates: Partial<MenuItem>
): Promise<void> {
  try {
    const itemRef = doc(db, MENU_COLLECTION, itemId);
    await updateDoc(itemRef, updates);
  } catch (err) {
    console.error('Failed to update menu item in Firestore:', err);
  }
}

// Add new cafe tenant to Firestore
export async function saveCafeToFirestore(cafe: Cafe): Promise<void> {
  try {
    const cafeRef = doc(db, CAFES_COLLECTION, cafe.id);
    await setDoc(cafeRef, cafe, { merge: true });
  } catch (err) {
    console.error('Failed to save cafe to Firestore:', err);
  }
}
