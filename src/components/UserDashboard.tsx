"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_ORDERS, Order } from '@/data/orders';
import { DashboardStats } from '@/components/DashboardStats';
import { UserOrderList } from '@/components/UserOrderList';
import { UserPaymentModal } from '@/components/UserPaymentModal';
import { Zap } from 'lucide-react';
import { getOrdersState, uploadSlip, saveOrdersState } from '@/app/actions';

export default function UserDashboard() {
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [selectedDept, setSelectedDept] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promptPayNumber, setPromptPayNumber] = useState('0812345678');

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            if (typeof window === 'undefined') return;

            const serverOrders = await getOrdersState();
            const localPhone = localStorage.getItem('quick-pay-number');

            if (serverOrders && serverOrders.length > 0) {
                setOrders(serverOrders);
            }
            if (localPhone) {
                setPromptPayNumber(localPhone);
            }
            setHasLoaded(true);
        };
        loadData();
    }, []);

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
        let result = orders;

        // Filter by Dept
        if (selectedDept !== 'ทั้งหมด') {
            result = result.filter(o => o.department === selectedDept);
        }

        // Filter by Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(o => o.customerName.toLowerCase().includes(lower));
        }

        return result;
    }, [orders, selectedDept, searchTerm]);

    const handlePayClick = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleConfirmPayment = async (file: File) => {
        if (!selectedOrder) return;

        // 1. Upload to Blob
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadSlip(formData);
            if (result.success && result.url) {
                // 2. Update Order Status
                const updatedOrders = orders.map(o =>
                    o.id === selectedOrder.id ? { ...o, status: 'waiting_for_verification' as const, slipUrl: result.url } : o
                );
                setOrders(updatedOrders);
                await saveOrdersState(updatedOrders);
                alert('แจ้งชำระเงินเรียบร้อย! กรุณารอตรวจสอบ');
            } else {
                alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
            }
        } catch (e) {
            console.error(e);
            alert('Upload Failed');
        }
    };

    return (
        <main className="min-h-screen bg-[#FFF8F0] pb-24 font-sans relative">
            <nav className="bg-white border-b border-orange-100 sticky top-0 z-30 px-4 py-3 shadow-sm/50 backdrop-blur-md bg-white/90">
                <div className="flex items-center justify-center relative">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg shadow-orange-200">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-800 leading-none">Quick Pay</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-4 max-w-lg md:max-w-2xl lg:max-w-4xl space-y-4">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="ค้นหาชื่อลูกค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg outline-none focus:border-orange-500 shadow-sm"
                />

                <UserOrderList
                    filteredOrders={filteredOrders}
                    onPayClick={handlePayClick}
                    departments={departments}
                    selectedDept={selectedDept}
                    onSelectDept={setSelectedDept}
                />
            </div>

            <UserPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPayment}
                amount={selectedOrder?.totalPrice || 0}
                customerName={selectedOrder?.customerName || ''}
                targetId={promptPayNumber}
            />
        </main>
    )
}
