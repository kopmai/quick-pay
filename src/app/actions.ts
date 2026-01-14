'use server'

import { kv } from '@vercel/kv';
import { Order, INITIAL_ORDERS } from '@/data/orders';

export async function getOrdersState(): Promise<Order[] | null> {
    try {
        const orders = await kv.get<Order[]>('orders');
        return orders;
    } catch (error) {
        console.error('KV Error:', error);
        return null;
    }
}

export async function saveOrdersState(orders: Order[]) {
    try {
        await kv.set('orders', orders);
        return { success: true };
    } catch (error) {
        console.error('KV Save Error:', error);
        return { success: false, error };
    }
}

export async function getPromptPayConfig() {
    try {
        const number = await kv.get<string>('config:number');
        const type = await kv.get<string>('config:type');
        return { number, type };
    } catch (error) {
        return null;
    }
}

export async function savePromptPayConfig(number: string, type: string) {
    try {
        await kv.set('config:number', number);
        await kv.set('config:type', type);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
