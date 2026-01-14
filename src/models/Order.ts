import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder {
    id: string;
    orderNumber: number;
    customerName: string;
    department: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'paid';
    createdAt: string;
}

export interface IOrderDocument extends IOrder, Document { }

const OrderSchema = new Schema<IOrderDocument>({
    id: { type: String, required: true, unique: true },
    orderNumber: { type: Number, required: true },
    customerName: { type: String, required: true },
    department: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, required: true, enum: ['pending', 'paid'], default: 'pending' },
    createdAt: { type: String, required: true }
}, {
    timestamps: true // Adds internal createdAt/updatedAt (useful for DB admin), distinct from strict 'createdAt' field
});

const Order: Model<IOrderDocument> = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
