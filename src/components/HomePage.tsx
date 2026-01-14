"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_ORDERS, Order } from '@/data/orders';
import { DashboardStats } from '@/components/DashboardStats';
import { OrderList } from '@/components/OrderList';
import { PaymentModal } from '@/components/PaymentModal';
import { MoreVertical, Trash2, Coins, Check, QrCode, X, Zap } from 'lucide-react';
import { getOrdersState, saveOrdersState, getPromptPayConfig, savePromptPayConfig } from '@/app/actions';

export default function HomePage() {
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Selection State
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

    const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            if (typeof window === 'undefined') return;

            const serverOrders = await getOrdersState();
            const serverConfig = await getPromptPayConfig();

            // Check DB Connection
            if (serverOrders !== null) {
                setDbStatus('connected');
                // Priority: Server Data > Local Data
                if (serverOrders.length > 0) {
                    setOrders(serverOrders);
                } else {
                    // If Server is empty but Local has data => Sync Local to Server
                    const localOrders = localStorage.getItem('quick-pay-orders');
                    if (localOrders) {
                        try {
                            const parsed = JSON.parse(localOrders);
                            if (parsed.length > 0) {
                                setOrders(parsed);
                                saveOrdersState(parsed); // Push to server
                            }
                        } catch (e) { }
                    }
                }
            } else {
                setDbStatus('disconnected');
                // Fallback to Local
                const localOrders = localStorage.getItem('quick-pay-orders');
                if (localOrders) {
                    try { setOrders(JSON.parse(localOrders)); } catch (e) { }
                }
            }

            // Config Logic
            const localPhone = localStorage.getItem('quick-pay-number');
            const localType = localStorage.getItem('quick-pay-type');

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

    // ... (rest of state)

    // ...

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
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-gray-800 hidden min-[370px]:block leading-none">Quick Pay</span>
                            <div className="flex items-center gap-1 mt-1">
                                <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500 animate-pulse' : dbStatus === 'disconnected' ? 'bg-red-500' : 'bg-gray-400'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${dbStatus === 'connected' ? 'text-green-600' : dbStatus === 'disconnected' ? 'text-red-500' : 'text-gray-400'}`}>
                                    {dbStatus === 'connected' ? 'Online' : dbStatus === 'disconnected' ? 'Offline' : 'Connecting...'}
                                </span>
                            </div>
                        </div>
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
