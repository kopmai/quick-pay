"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';
import { generatePromptPayPayload } from '@/lib/promptpay';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    customerName: string;
    targetId: string;
    onConfirm: () => void;
}

export function PaymentModal({ isOpen, onClose, amount, customerName, targetId, onConfirm }: PaymentModalProps) {
    const [payload, setPayload] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && targetId) {
            try {
                const qrPayload = generatePromptPayPayload(targetId, amount);
                setPayload(qrPayload);
            } catch (e) {
                console.error("QR Generation failed", e);
                setPayload('');
            }
        }
    }, [isOpen, targetId, amount]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(targetId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-orange-500 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">สแกนจ่ายเงิน</h3>
                    <button onClick={onClose} className="p-1 hover:bg-orange-600 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-sm mb-1">ยอดชำระของ</p>
                        <h2 className="text-2xl font-bold text-gray-800">{customerName}</h2>
                        <div className="mt-2 text-3xl font-extrabold text-orange-600">฿{amount.toLocaleString()}</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-6 flex items-center justify-center min-h-[220px]">
                        {payload ? (
                            <QRCodeCanvas
                                value={payload}
                                size={200}
                                level={"L"}
                                includeMargin={true}
                            />
                        ) : (
                            <div className="text-center text-red-400 text-sm">
                                <p>ไม่สามารถสร้าง QR Code ได้</p>
                                <p>กรุณาตรวจสอบเบอร์/เลขบัตร</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full bg-gray-50 rounded-lg p-3 mb-6 flex items-center justify-between">
                        <div className="text-sm overflow-hidden">
                            <p className="text-gray-500 truncate">PromptPay ID</p>
                            <p className="font-mono font-medium text-gray-800 text-lg truncate">{targetId}</p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy ID"
                        >
                            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        ยืนยันการชำระเงิน
                    </button>
                </div>
            </div>
        </div>
    );
}
