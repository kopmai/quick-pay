'use server'

import { createClient } from '@vercel/kv';
import { Order, INITIAL_ORDERS } from '@/data/orders';

const kv = (() => {
    try {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            // Validate URL protocol for @vercel/kv specifically
            if (process.env.KV_REST_API_URL.startsWith('redis://')) {
                console.warn('Vercel KV: internal Redis URL detected, skipping HTTP client init.');
                return null;
            }
            return createClient({
                url: process.env.KV_REST_API_URL,
                token: process.env.KV_REST_API_TOKEN,
            });
        }
    } catch (e) {
        console.error('Failed to initialize KV client:', e);
    }
    return null;
})();

export async function getOrdersState(): Promise<Order[] | null> {
    try {
        if (!kv) return null;
        const orders = await kv.get<Order[]>('orders');
        return orders;
    } catch (error) {
        console.error('KV Error:', error);
        return null;
    }
}

export async function saveOrdersState(orders: Order[]) {
    try {
        if (!kv) return { success: false, error: 'KV not configured' };
        await kv.set('orders', orders);
        return { success: true };
    } catch (error) {
        console.error('KV Save Error:', error);
        return { success: false, error };
    }
}

export async function getPromptPayConfig() {
    try {
        if (!kv) return null;
        const number = await kv.get<string>('config:number');
        const type = await kv.get<string>('config:type');
        return { number, type };
    } catch (error) {
        return null;
    }
}

export async function savePromptPayConfig(number: string, type: string) {
    try {
        if (!kv) return { success: false, error: 'KV not configured' };
        await kv.set('config:number', number);
        await kv.set('config:type', type);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
