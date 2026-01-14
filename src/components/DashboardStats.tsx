import React from 'react';
import { ShoppingBag, Users, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    color: 'orange' | 'green' | 'blue';
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
    const colorStyles = {
        orange: 'bg-orange-50 text-orange-600',
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
    };

    return (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between h-full min-h-[100px]">
            <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 font-bold text-base truncate mr-1">{title}</p>
                <div className={cn("p-1.5 rounded-lg shrink-0 scale-90 origin-top-right", colorStyles[color])}>
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
                </div>
            </div>
            <div>
                <div className="font-black text-gray-800 leading-none tracking-tight">{value}</div>
            </div>
        </div>
    );
};

interface DashboardStatsProps {
    stats: {
        totalOrders: number;
        paidOrders: number;
        totalBottles: number;
        paidBottles: number;
        totalRevenue: number;
        paidRevenue: number;
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-2 mb-5">
            <StatCard
                title="ออเดอร์"
                value={
                    <div className="flex items-baseline gap-1">
                        <span className="text-orange-600 text-3xl md:text-4xl">{stats.paidOrders}</span>
                        <span className="text-gray-300 text-base font-normal">/</span>
                        <span className="text-gray-400 text-base font-bold">{stats.totalOrders}</span>
                    </div>
                }
                icon={<Users />}
                color="orange"
            />
            <StatCard
                title="รายได้"
                value={
                    <div className="flex flex-col">
                        <div className="flex items-baseline">
                            <span className="text-green-600 text-2xl md:text-3xl">฿{stats.paidRevenue.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-400 text-xs font-bold leading-none mt-1 truncate">
                            /{stats.totalRevenue.toLocaleString()}
                        </div>
                    </div>
                }
                icon={<Coins />}
                color="green"
            />
            <StatCard
                title="จัดส่ง"
                value={
                    <div className="flex items-baseline gap-1">
                        <span className="text-blue-600 text-3xl md:text-4xl">{stats.paidBottles}</span>
                        <span className="text-gray-300 text-base font-normal">/</span>
                        <span className="text-gray-400 text-base font-bold">{stats.totalBottles}</span>
                    </div>
                }
                icon={<ShoppingBag />}
                color="blue"
            />
        </div>
    );
}
