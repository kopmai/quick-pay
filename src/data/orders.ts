export type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  department: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'waiting_for_verification' | 'paid';
  slipUrl?: string;
  createdAt: string;
};

const calculatePrice = (qty: number) => {
  const setsOfThree = Math.floor(qty / 3);
  const remainder = qty % 3;
  return (setsOfThree * 100) + (remainder * 35);
};

export const INITIAL_ORDERS: Order[] = [
  { orderNumber: 1, customerName: 'แอม', department: 'บง.', quantity: 6 },
  { orderNumber: 2, customerName: 'พี่แจง', department: 'บอ.', quantity: 3 },
  { orderNumber: 3, customerName: 'นับหนึ่ง', department: 'บอ.', quantity: 6 },
  { orderNumber: 4, customerName: 'Netty', department: 'อก.', quantity: 3 },
  { orderNumber: 5, customerName: 'จอย', department: 'อก.', quantity: 3 },
  { orderNumber: 6, customerName: 'พี่อารีย์', department: 'อก.', quantity: 3 },
  { orderNumber: 7, customerName: 'ตูน', department: 'บง.', quantity: 3 },
  { orderNumber: 8, customerName: 'แอม', department: 'ประชาสัมพันธ์', quantity: 3 },
  { orderNumber: 9, customerName: 'พี่หน่อย', department: 'อก.', quantity: 3 },
  { orderNumber: 10, customerName: 'ฟ้า', department: 'บอ.', quantity: 3 },
  { orderNumber: 11, customerName: 'พี่ขวัญ', department: 'บม.', quantity: 6 },
  { orderNumber: 12, customerName: 'พี่อุ้ม', department: 'บม.', quantity: 3 },
  { orderNumber: 13, customerName: 'พี่นา', department: 'บอ.', quantity: 3 },
  { orderNumber: 14, customerName: 'พี่เอ๋', department: 'บอ.', quantity: 6 },
  { orderNumber: 15, customerName: 'ลูกหนู', department: 'อก.', quantity: 3 },
  { orderNumber: 16, customerName: 'พี่กระต่าย คนสวย', department: 'บอ.', quantity: 3 },
  { orderNumber: 17, customerName: 'พี่นาง', department: 'สค.', quantity: 3 },
  { orderNumber: 18, customerName: 'จี', department: 'บง.', quantity: 3 },
  { orderNumber: 19, customerName: 'พี่หญิง', department: 'ทศ.', quantity: 3 },
  { orderNumber: 20, customerName: 'พี่โอ๋ค่ะ', department: 'ทศ.', quantity: 3 },
  { orderNumber: 21, customerName: 'ระ', department: 'ทศ.', quantity: 6 },
  { orderNumber: 22, customerName: 'ป๊อป', department: 'ทศ.', quantity: 12 },
  { orderNumber: 23, customerName: 'อุ๋ย', department: 'บอ.', quantity: 9 },
  { orderNumber: 24, customerName: 'ผอ นิเวศน์', department: 'ทศ.', quantity: 20 },
  { orderNumber: 25, customerName: 'มุก', department: 'ทศ.', quantity: 6 },
  { orderNumber: 26, customerName: 'พี่สาว', department: 'ตพ.', quantity: 3 },
  { orderNumber: 27, customerName: 'แยม', department: 'บม.', quantity: 3 },
  { orderNumber: 28, customerName: 'พัชชา', department: 'บอ.', quantity: 3 },
  { orderNumber: 29, customerName: 'แก้ม', department: 'กม.', quantity: 9 },
  { orderNumber: 30, customerName: 'โอ๊ต', department: 'ยส.', quantity: 3 },
  { orderNumber: 31, customerName: 'พี่จิ๋ม', department: 'ตส.', quantity: 3 },
  { orderNumber: 32, customerName: 'อุ้ย', department: 'อพ.', quantity: 3 },
  { orderNumber: 33, customerName: 'พี่โอ๋ให้รองปี', department: 'ทศ.', quantity: 3 },
  { orderNumber: 34, customerName: 'พี่พลอย', department: 'ตส.', quantity: 3 },
  { orderNumber: 35, customerName: 'พี่ปี (คนสวย)', department: 'อก.', quantity: 3 },
  { orderNumber: 36, customerName: 'พี่นุ้ย', department: 'อก.', quantity: 3 },
].map((order, index) => ({
  ...order,
  id: index.toString(),
  totalPrice: calculatePrice(order.quantity),
  status: 'pending' as const,
  createdAt: new Date().toISOString(),
}));
