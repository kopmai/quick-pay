import React, { useMemo } from 'react';
import { Order } from '@/data/orders';
import { cn } from '@/lib/utils';

interface DepartmentChartProps {
    orders: Order[];
}

export function DepartmentChart({ orders }: DepartmentChartProps) {
    const stats = useMemo(() => {
        const deptMap = new Map<string, number>();
        orders.forEach(o => {
            deptMap.set(o.department, (deptMap.get(o.department) || 0) + o.quantity);
        });

        // Convert to array and sort by quantity desc
        return Array.from(deptMap.entries())
            .map(([dept, qty]) => ({ dept, qty }))
            .sort((a, b) => b.qty - a.qty);
    }, [orders]);

    const maxQty = Math.max(...stats.map(s => s.qty), 1);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-6">ยอดสั่งซื้อแยกตามฝ่าย (Stack)</h3>
            <div className="space-y-4">
                {stats.map((stat, index) => {
                    const widthPercentage = (stat.qty / maxQty) * 100;

                    return (
                        <div key={stat.dept} className="flex items-center gap-4">
                            <div className="w-16 text-sm font-medium text-gray-500 text-right">{stat.dept}</div>
                            <div className="flex-1 h-8 bg-orange-50 rounded-full overflow-hidden relative group">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3 relative",
                                        index % 2 === 0 ? "bg-orange-500" : "bg-orange-400"
                                    )}
                                    style={{ width: `${widthPercentage}%` }}
                                >
                                    <span className="text-white text-xs font-bold">{stat.qty}</span>
                                </div>
                                {/* Tooltip-ish highlight */}
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
