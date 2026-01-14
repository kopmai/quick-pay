import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConfig {
    key: string; // 'promptpay_config'
    value: {
        number: string;
        type: string;
    };
}

export interface IConfigDocument extends IConfig, Document { }

const ConfigSchema = new Schema<IConfigDocument>({
    key: { type: String, required: true, unique: true },
    value: {
        number: { type: String, required: true },
        type: { type: String, required: true }
    }
});

const Config: Model<IConfigDocument> = mongoose.models.Config || mongoose.model<IConfigDocument>('Config', ConfigSchema);

export default Config;
