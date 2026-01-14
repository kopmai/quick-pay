'use server';

import dbConnect from '@/lib/db';
import Order, { IOrder } from '@/models/Order';
import Config from '@/models/Config';
import { INITIAL_ORDERS } from '@/data/orders';

export async function getOrdersState(): Promise<IOrder[] | null> {
    try {
        const conn = await dbConnect();
        if (!conn) return null;

        let orders = await Order.find({}).sort({ orderNumber: 1 }).lean();

        // Seeding logic: If DB is empty, populate with INITIAL_ORDERS
        if (orders.length === 0) {
            console.log('Seeding database with INITIAL_ORDERS...');
            await Order.insertMany(INITIAL_ORDERS);
            orders = await Order.find({}).sort({ orderNumber: 1 }).lean();
        }

        // Convert _id and other Mongoose types to plain objects if needed
        // lean() usually handles this, but we need to ensure the return type matches IOrder
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error('Database Error (getOrders):', error);
        return null;
    }
}

export async function saveOrdersState(orders: IOrder[]) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: 'No binding' };

        // Strategy: Full sync. 
        // Since the frontend sends the *entire* state, we match that.

        // 1. Prepare bulk operations
        const bulkOps = orders.map(order => ({
            updateOne: {
                filter: { id: order.id },
                update: { $set: order },
                upsert: true
            }
        }));

        // 2. Execute
        await Order.bulkWrite(bulkOps);

        return { success: true };
    } catch (error) {
        console.error('Database Save Error:', error);
        return { success: false, error };
    }
}

export async function getPromptPayConfig(): Promise<{ number: string; type: string } | null> {
    try {
        const conn = await dbConnect();
        if (!conn) return null;

        const config = await Config.findOne({ key: 'promptpay_config' }).lean();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (config?.value as any) || null;
    } catch (error) {
        console.error('Config Error:', error);
        return null;
    }
}

export async function savePromptPayConfig(number: string, type: string) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: 'No binding' };

        await Config.findOneAndUpdate(
            { key: 'promptpay_config' },
            { key: 'promptpay_config', value: { number, type } },
            { upsert: true, new: true }
        );

        return { success: true };
    } catch (error) {
        console.error('Config Save Error:', error);
        return { success: false, error };
    }
}
