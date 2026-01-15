import React, { useRef } from 'react';
import { Order } from '@/data/orders';
import { QrCode, Check, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserOrderListProps {
    departments: { name: string; unpaidCount: number }[];
    selectedDept: string;
    onSelectDept: (dept: string) => void;
    filteredOrders: Order[];
    onPayClick: (order: Order) => void;
}

export function UserOrderList({
    filteredOrders,
    onPayClick,
    departments,
    selectedDept,
    onSelectDept
}: UserOrderListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="space-y-4">
            {/* Department Filter */}
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
                                {isAll && dept.unpaidCount > 0 && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] min-w-[20px] text-center font-black",
                                        isSelected ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                                    )}>
                                        {dept.unpaidCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3 pb-8">
                {filteredOrders.map((order) => {
                    const isPaid = order.status === 'paid';
                    const isVerifying = order.status === 'waiting_for_verification';

                    return (
                        <div key={order.id} className={cn(
                            "bg-white rounded-2xl p-4 shadow-sm border animate-in fade-in transition-all relative overflow-hidden flex flex-col gap-3",
                            isPaid ? "border-green-200 bg-green-50/20" : isVerifying ? "border-yellow-200 bg-yellow-50/20" : "border-orange-100"
                        )}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 overflow-hidden pt-1">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500 shrink-0">
                                        {order.orderNumber}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-gray-800 text-xl leading-none truncate">{order.customerName}</h4>
                                        <span className="text-sm font-bold text-gray-400">({order.department})</span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0 ml-2">
                                    <div className={cn(
                                        "font-black text-2xl leading-none mb-1",
                                        isPaid ? "text-green-600" : isVerifying ? "text-yellow-600" : "text-orange-600"
                                    )}>
                                        ฿{order.totalPrice}
                                    </div>
                                    <div className="text-lg font-bold text-orange-500 leading-none">
                                        {order.quantity} ขวด
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons / Status Badges */}
                            <div>
                                {isPaid ? (
                                    <div className="w-full bg-green-500 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2">
                                        <CheckCircle2 size={20} />
                                        <span>จ่ายแล้ว</span>
                                    </div>
                                ) : isVerifying ? (
                                    <div className="w-full bg-yellow-400 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 shadow-sm">
                                        <Clock size={20} />
                                        <span>รอตรวจสอบ</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onPayClick(order)}
                                        className="w-full bg-orange-600 text-white hover:bg-orange-700 rounded-xl py-3 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-200"
                                    >
                                        <QrCode size={20} />
                                        <span>สแกนจ่าย / แจ้งโอน</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
