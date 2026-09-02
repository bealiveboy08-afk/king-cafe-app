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
        return {
          id: docSnap.id,
          orderNumber: data.orderNumber || docSnap.id,
          cafeId: data.cafeId || 'cafe-king-01',
          cafeName: data.cafeName || 'King Cafe & Bistro',
          tableNumber: Number(data.tableNumber) || 1,
          customerName: data.customerName || 'Guest',
          items: data.items || [],
          subtotal: Number(data.subtotal) || 0,
          tax: Number(data.tax) || 0,
          totalAmount: Number(data.totalAmount) || 0,
          commissionAmount: Number(data.commissionAmount) || 0,
          status: data.status || 'order_sent',
          paymentMethod: data.paymentMethod,
          statusTimestamps: data.statusTimestamps || { sent: data.createdAt },
          specialInstructions: data.specialInstructions,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          estimatedMinutes: data.estimatedMinutes,
        } as Order;
      });

      onOrdersUpdate(liveOrders, isInitial);
      isInitial = false;
    },
    (err) => {
      console.warn('Firestore orders subscription error:', err);
      if (onError) onError(err);
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

// Create or update order in Firestore
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(orderRef, order, { merge: true });
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
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
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
