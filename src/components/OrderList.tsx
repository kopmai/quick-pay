import React, { useRef } from 'react';
import { Order } from '@/data/orders';
import { QrCode, CheckCircle2, Circle, Users, Undo2, Check, Square, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderListProps {
    departments: { name: string; unpaidCount: number }[];
    selectedDept: string;
    onSelectDept: (dept: string) => void;
    filteredOrders: Order[];
    onPayClick: (order: Order) => void;
    onToggleStatus: (id: string, currentStatus: string) => void;
    selectedOrderIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onSelectAll: (select: boolean) => void;
    isAllSelected: boolean;
}

export function OrderList({
    filteredOrders,
    onPayClick,
    onToggleStatus,
    departments,
    selectedDept,
    onSelectDept,
    selectedOrderIds,
    onToggleSelect,
    onSelectAll,
    isAllSelected
}: OrderListProps) {

    const scrollRef = useRef<HTMLDivElement>(null);

    // Count pending orders to see if select all is relevant
    const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;

    return (
        <div className="space-y-4">
            {/* Modern Department Filter */}
            <div className="sticky top-[68px] z-20 bg-[#FFF8F0]/95 backdrop-blur-md -mx-4 px-4 py-2 overflow-x-auto no-scrollbar border-b border-orange-50/50">
                <div className="flex items-center gap-1.5 min-w-max p-1.5 bg-white rounded-xl border border-gray-100 shadow-sm" ref={scrollRef}>
                    {departments.map(dept => {
                        const isAll = dept.name === 'ทั้งหมด';
                        const isSelected = selectedDept === dept.name;
                        const isComplete = !isAll && dept.unpaidCount === 0;

                        return (
                            <button
                                key={dept.name}
                                onClick={() => onSelectDept(dept.name)}
                                className={cn(
                                    "relative px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ease-out flex items-center gap-2",
                                    isSelected
                                        ? (isComplete && !isAll ? "bg-green-500 text-white shadow-md shadow-green-200 scale-105" : "bg-orange-500 text-white shadow-md shadow-orange-200 scale-105")
                                        : "bg-transparent text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                <span>{dept.name}</span>
                                {!isAll && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] min-w-[20px] text-center font-black",
                                        isSelected
                                            ? "bg-white/20 text-white"
                                            : (isComplete ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600")
                                    )}>
                                        {isComplete ? <Check size={12} strokeWidth={3} /> : dept.unpaidCount}
                                    </span>
                                )}
                                {isAll && <span className="bg-white/20 px-1.5 rounded text-[10px] font-black">{dept.unpaidCount}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Select All Header */}
            {pendingCount > 0 && (
                <div className="flex items-center gap-2 px-1 mb-2 animate-in fade-in transition-all">
                    <button
                        onClick={() => onSelectAll(!isAllSelected)}
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 shadow-sm/50"
                    >
                        {isAllSelected ? (
                            <CheckSquare size={20} className="text-orange-500" />
                        ) : (
                            <Square size={20} className="text-gray-300" />
                        )}
                        <span className="text-sm font-bold">เลือกทั้งหมด ({pendingCount})</span>
                    </button>
                </div>
            )}

            <div className="space-y-3 pb-8">
                {/* Mobile Card View */}
                {filteredOrders.map((order) => {
                    const isSelected = selectedOrderIds.has(order.id);
                    return (
                        <div key={order.id} className={cn(
                            "bg-white rounded-2xl p-4 shadow-sm border animate-in fade-in transition-all relative overflow-hidden flex gap-3",
                            isSelected ? "border-orange-400 bg-orange-50/50 ring-1 ring-orange-400" : (order.status === 'paid' ? "border-green-200 bg-green-50/20" : "border-orange-100")
                        )}>
                            {/* Selection Checkbox Area */}
                            {order.status !== 'paid' && (
                                <div
                                    className="flex items-start pt-1 cursor-pointer"
                                    onClick={() => onToggleSelect(order.id)}
                                >
                                    {isSelected ? (
                                        <div className="bg-orange-500 text-white rounded-lg p-1 shadow-sm transition-all hover:scale-110 active:scale-95">
                                            <CheckSquare size={24} />
                                        </div>
                                    ) : (
                                        <div className="text-gray-300 hover:text-orange-400 transition-colors active:scale-95">
                                            <Square size={24} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 flex flex-col gap-3">
                                {/* Header Info - RIGHT ALIGNED QTY */}
                                <div className="flex justify-between items-start">
                                    {/* Left Side: Badge + Name + Dept */}
                                    <div className="flex items-center gap-2 overflow-hidden pt-1">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500 shrink-0">
                                            {order.orderNumber}
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-xl leading-none truncate">{order.customerName}</h4>
                                        {selectedDept === 'ทั้งหมด' && (
                                            <span className="text-lg font-bold text-gray-400 truncate">({order.department})</span>
                                        )}
                                    </div>

                                    {/* Right Side: Price + Qty (Orange) */}
                                    <div className="text-right shrink-0 ml-2">
                                        <div className={cn(
                                            "font-black text-2xl leading-none mb-1",
                                            order.status === 'paid' ? "text-green-600" : "text-orange-600"
                                        )}>
                                            ฿{order.totalPrice}
                                        </div>
                                        <div className="text-lg font-bold text-orange-500 leading-none">
                                            {order.quantity} ขวด
                                        </div>
                                    </div>
                                </div>

                                {/* Big Buttons Row */}
                                <div className="flex items-stretch gap-2.5 mt-1">
                                    {order.status === 'paid' ? (
                                        <button
                                            onClick={() => onToggleStatus(order.id, 'paid')}
                                            className="flex-1 bg-green-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            <CheckCircle2 size={24} className="text-white" />
                                            <span className="text-lg">จ่ายแล้ว</span>
                                        </button>
                                    ) : (
                                        <>
                                            {/* Create QR Button */}
                                            <button
                                                onClick={() => onPayClick(order)}
                                                className="flex-1 bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-50 rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                                            >
                                                <QrCode size={24} />
                                                <span className="text-lg">QR</span>
                                            </button>

                                            {/* Toggle Status Button */}
                                            <button
                                                onClick={() => onToggleStatus(order.id, 'pending')}
                                                className="flex-1 bg-orange-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all"
                                            >
                                                <Circle size={24} />
                                                <span className="text-lg">ยืนยัน</span>
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'paid' && (
                                        <button
                                            onClick={() => onToggleStatus(order.id, 'paid')}
                                            className="w-14 bg-white border border-gray-200 text-gray-400 rounded-xl flex items-center justify-center hover:text-red-500 hover:border-red-200 active:scale-95 transition-all"
                                            title="ยกเลิกสถานะ"
                                        >
                                            <Undo2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredOrders.length === 0 && (
                    <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <Users className="mx-auto text-gray-300 mb-3" size={32} />
                        <p className="text-gray-400 text-sm font-medium">ไม่พบรายการในหมวดนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
}
