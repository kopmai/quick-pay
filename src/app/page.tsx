"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_ORDERS, Order } from '@/data/orders';
import { DashboardStats } from '@/components/DashboardStats';
import { OrderList } from '@/components/OrderList';
import { DepartmentChart } from '@/components/DepartmentChart';
import { PaymentModal } from '@/components/PaymentModal';
import { RefreshCcw, LogOut, Wallet, MoreVertical, Trash2, Coins, Check, QrCode, X, CheckSquare, Zap } from 'lucide-react';

import { getOrdersState, saveOrdersState, getPromptPayConfig, savePromptPayConfig } from './actions';

export default function Home() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      if (typeof window === 'undefined') return;

      const serverOrders = await getOrdersState();
      const serverConfig = await getPromptPayConfig();
      const localOrders = localStorage.getItem('quick-pay-orders');
      const localPhone = localStorage.getItem('quick-pay-number');
      const localType = localStorage.getItem('quick-pay-type');

      if (serverOrders && serverOrders.length > 0) {
        setOrders(serverOrders);
      } else if (localOrders) {
        try {
          setOrders(JSON.parse(localOrders));
        } catch (e) { }
      }

      if (serverConfig?.number) {
        setPromptPayNumber(serverConfig.number);
        if (serverConfig.type) setPromptPayType(serverConfig.type as any);
      } else {
        if (localPhone) setPromptPayNumber(localPhone);
        if (localType) setPromptPayType(localType as any);
      }

      setHasLoaded(true);
    };

    loadData();
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [promptPayType, setPromptPayType] = useState<'phone' | 'id_card' | 'other'>('phone');
  const [promptPayNumber, setPromptPayNumber] = useState('0812345678');

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persistence
  React.useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('quick-pay-orders', JSON.stringify(orders));
    saveOrdersState(orders);
  }, [orders, hasLoaded]);

  React.useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('quick-pay-number', promptPayNumber);
    localStorage.setItem('quick-pay-type', promptPayType);
    savePromptPayConfig(promptPayNumber, promptPayType);
  }, [promptPayNumber, promptPayType, hasLoaded]);

  const [selectedDept, setSelectedDept] = useState('ทั้งหมด');

  // Logic to get unique departments
  const departments = useMemo(() => {
    const deptMap = new Map<string, number>();
    orders.forEach(o => {
      if (!deptMap.has(o.department)) deptMap.set(o.department, 0);
      if (o.status === 'pending') {
        deptMap.set(o.department, deptMap.get(o.department)! + 1);
      }
    });
    const sortedDepts = Array.from(deptMap.keys()).sort();
    const deptObjects = sortedDepts.map(name => ({
      name,
      unpaidCount: deptMap.get(name) || 0
    }));
    const totalUnpaid = orders.filter(o => o.status === 'pending').length;
    return [{ name: 'ทั้งหมด', unpaidCount: totalUnpaid }, ...deptObjects];
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (selectedDept === 'ทั้งหมด' || selectedDept === 'All') return orders;
    return orders.filter(o => o.department === selectedDept);
  }, [orders, selectedDept]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.status === 'paid').length;
    const paidRevenue = orders.filter(o => o.status === 'paid').reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const paidBottles = orders.filter(o => o.status === 'paid').reduce((acc, curr) => acc + curr.quantity, 0);
    const totalBottles = orders.reduce((acc, curr) => acc + curr.quantity, 0);
    return { totalOrders, paidOrders, paidRevenue, totalRevenue, paidBottles, totalBottles };
  }, [orders]);

  // Selection Logic
  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedOrderIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedOrderIds(newSet);
  };

  const handleSelectAll = (shouldSelect: boolean) => {
    if (shouldSelect) {
      // Select all PENDING in current filter
      const newSet = new Set(selectedOrderIds);
      filteredOrders.forEach(o => {
        if (o.status === 'pending') newSet.add(o.id);
      });
      setSelectedOrderIds(newSet);
    } else {
      // Deselect all in current filter
      const newSet = new Set(selectedOrderIds);
      filteredOrders.forEach(o => {
        if (newSet.has(o.id)) newSet.delete(o.id);
      });
      setSelectedOrderIds(newSet);
    }
  };

  const isAllSelected = useMemo(() => {
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) return false;
    return pendingOrders.every(o => selectedOrderIds.has(o.id));
  }, [filteredOrders, selectedOrderIds]);

  const bulkSelectionTotal = useMemo(() => {
    return orders
      .filter(o => selectedOrderIds.has(o.id))
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }, [orders, selectedOrderIds]);

  const handlePayClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (selectedOrder) {
      if (selectedOrder.id === 'bulk-pay') {
        // Confirm Bulk Payment
        setOrders(prev => prev.map(o =>
          selectedOrderIds.has(o.id) ? { ...o, status: 'paid' } : o
        ));
        setSelectedOrderIds(new Set()); // Clear selection
      } else {
        // Confirm Single Payment
        setOrders(prev => prev.map(o =>
          o.id === selectedOrder.id ? { ...o, status: 'paid' } : o
        ));
      }
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    if (currentStatus === 'paid') {
      if (!confirm('⚠️ ยืนยันการย้อนสถานะ?\n\nคุณกำลังจะเปลี่ยนสถานะจาก "จ่ายแล้ว" กลับเป็น "รอชำระ"')) {
        return;
      }
    }

    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status: o.status === 'paid' ? 'pending' : 'paid' } : o
    ));
    if (selectedOrderIds.has(id)) handleToggleSelect(id);
  };

  const handleReset = () => {
    if (confirm('⚠️ เตือน: คุณต้องการล้างสถานะ "จ่ายแล้ว" ทั้งหมดใช่ไหม?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!')) {
      setOrders(INITIAL_ORDERS);
      setSelectedOrderIds(new Set());
    }
  };

  const handleBulkPay = () => {
    if (selectedOrderIds.size === 0) return;

    const total = bulkSelectionTotal;
    const count = selectedOrderIds.size;

    handlePayClick({
      id: 'bulk-pay',
      orderNumber: 0,
      customerName: `รวมยอด ${count} รายการ`,
      department: 'Selected',
      quantity: 0,
      totalPrice: total,
      status: 'pending',
      createdAt: ''
    });
  };

  return (
    <main className="min-h-screen bg-[#FFF8F0] pb-24 font-sans relative">
      {/* Search/Header Bar */}
      <nav className="bg-white border-b border-orange-100 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">

          {/* BRANDING: ZAP ICON + TEXT */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg shadow-orange-200">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-800 hidden min-[370px]:block">Quick Pay</span>
          </div>

          {/* PromptPay Input */}
          <div className="flex-1 max-w-sm pl-2 border-l border-gray-100 ml-2">
            {!isEditingSettings ? (
              <div
                onClick={() => setIsEditingSettings(true)}
                className="cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-gray-200 group bg-white/50"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-orange-500 tracking-wider">
                    {promptPayType === 'phone' ? 'เบอร์มือถือ' : promptPayType === 'id_card' ? 'เลขบัตร ปชช.' : 'E-Wallet'}
                  </span>
                  <Coins size={10} className="text-orange-300" />
                </div>
                <div className="text-lg font-mono text-gray-800 font-bold tracking-tight leading-none">
                  {promptPayNumber}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 leading-none w-full bg-white p-2 rounded-xl shadow-lg border border-orange-100 absolute left-4 right-4 top-2 max-w-sm md:relative md:top-auto md:left-auto md:right-auto md:shadow-none md:border-none md:p-0 md:bg-transparent z-50">
                <div className="flex flex-col gap-2">
                  <select
                    value={promptPayType}
                    onChange={(e) => setPromptPayType(e.target.value as any)}
                    className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none w-full font-bold text-gray-600"
                  >
                    <option value="phone">เบอร์โทรศัพท์มือถือ</option>
                    <option value="id_card">เลขบัตรประชาชน</option>
                    <option value="other">E-Wallet / อื่นๆ</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-lg font-mono text-gray-800 outline-none focus:border-orange-500 shadow-inner"
                      value={promptPayNumber}
                      onChange={(e) => setPromptPayNumber(e.target.value)}
                      placeholder="กรอกเบอร์..."
                    />
                    <button
                      onClick={() => setIsEditingSettings(false)}
                      className="bg-orange-500 text-white px-4 rounded-lg font-bold shadow-md hover:bg-orange-600 active:scale-95 transition-all"
                    >
                      <Check size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors active:scale-95"
          >
            <MoreVertical size={24} />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                  เมนูเพิ่มเติม
                </div>
                <button
                  onClick={() => {
                    handleReset();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
                >
                  <Trash2 size={18} />
                  ล้างข้อมูลทั้งหมด (Reset)
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 max-w-lg md:max-w-2xl lg:max-w-4xl">
        <DashboardStats stats={stats} />

        <OrderList
          filteredOrders={filteredOrders}
          onPayClick={handlePayClick}
          onToggleStatus={handleToggleStatus}
          departments={departments}
          selectedDept={selectedDept}
          onSelectDept={setSelectedDept}
          selectedOrderIds={selectedOrderIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
        />

        {/* Spacer */}
        <div className="h-12" />
      </div>

      {/* Floating Bulk Pay Bar */}
      {selectedOrderIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-5 duration-300">
          <div className="container mx-auto max-w-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedOrderIds(new Set())}
                className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">เลือก ({selectedOrderIds.size}) รายการ</div>
                <div className="text-2xl font-black text-orange-600 leading-none">฿{bulkSelectionTotal.toLocaleString()}</div>
              </div>
            </div>
            <button
              onClick={handleBulkPay}
              className="flex-1 bg-orange-600 text-white rounded-xl py-3 px-6 font-bold shadow-lg shadow-orange-300 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
            >
              <QrCode size={24} />
              <span>จ่ายรวม (QR)</span>
            </button>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPayment}
        amount={selectedOrder?.id === 'bulk-pay' ? selectedOrder.totalPrice : (selectedOrder?.totalPrice || 0)}
        customerName={selectedOrder?.customerName || ''}
        targetId={promptPayNumber}
      />
    </main>
  );
}
