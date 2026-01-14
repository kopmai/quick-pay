'use server'

import { Order } from '@/data/orders';

// SAFE MODE: Database disabled temporarily to ensure deployment stability.
// Data will be handled client-side via LocalStorage.

export async function getOrdersState(): Promise<Order[] | null> {
    return null; // Always return null to force client-side load
}

export async function saveOrdersState(orders: Order[]) {
    // No-op
    return { success: true };
}

export async function getPromptPayConfig() {
    return null;
}

export async function savePromptPayConfig(number: string, type: string) {
    return { success: true };
}
