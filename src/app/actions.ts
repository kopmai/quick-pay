'use server';

import { Order } from '@/data/orders';

// Stubbed actions for Safe Mode (Client-Side only)
// These do essentially nothing server-side, forcing the client to use localStorage.

export async function getOrdersState(): Promise<Order[] | null> {
    return null;
}

export async function saveOrdersState(orders: Order[]) {
    return { success: true };
}

export async function getPromptPayConfig() {
    return null;
}

export async function savePromptPayConfig(number: string, type: string) {
    return { success: true };
}
