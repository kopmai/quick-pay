"use client";

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Upload, Check, Loader2 } from 'lucide-react';
import { generatePromptPayPayload } from '@/lib/promptpay';

interface UserPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    customerName: string;
    targetId: string;
    onConfirm: (file: File) => void;
}

export function UserPaymentModal({ isOpen, onClose, amount, customerName, targetId, onConfirm }: UserPaymentModalProps) {
    const [payload, setPayload] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && targetId) {
            try {
                const qrPayload = generatePromptPayPayload(targetId, amount);
                setPayload(qrPayload);
            } catch (e) {
                setPayload('');
            }
        }
        // Reset file on open
        if (isOpen) {
            setFile(null);
            setIsUploading(false);
        }
    }, [isOpen, targetId, amount]);

    if (!isOpen) return null;

    const handleSaveQR = async () => {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (!canvas) return;

        try {
            // Convert to Blob
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Canvas to Blob failed');

            // 1. Try Web Share API (Works best on iOS/Android for saving to Photos)
            if (navigator.share) {
                const file = new File([blob], `QR-${customerName}.png`, { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'QR Code Payment',
                            text: `QR PromptPay for ${customerName}`
                        });
                        return; // Success, exit
                    } catch (shareError) {
                        // User might have cancelled share, ignore
                        if ((shareError as Error).name !== 'AbortError') console.error(shareError);
                        // If not abort, fall through to download
                    }
                }
            }

            // 2. Fallback: Classic Download (Desktop / Non-sharing browsers)
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QR-${customerName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);

        } catch (e) {
            console.error('Save QR Failed:', e);
            // 3. Last Resort: Open in new tab (User has to long-press)
            const url = canvas.toDataURL('image/png');
            const newTab = window.open();
            if (newTab) {
                newTab.document.body.innerHTML = `<img src="${url}" style="width:100%;height:auto;"> <p style="text-align:center;font-family:sans-serif;margin-top:20px;">กดค้างที่รูปเพื่อบันทึก (Long press to save)</p>`;
            } else {
                location.href = url; // Redirect if popup blocked
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setIsUploading(true);
        await onConfirm(file);
        setIsUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-orange-500 p-4 flex justify-between items-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                    <h3 className="font-bold text-lg relative z-10">สแกนจ่ายเงิน</h3>
                    <button onClick={onClose} className="p-1 hover:bg-orange-600 rounded-full transition-colors relative z-10">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800">{customerName}</h2>
                        <div className="text-4xl font-black text-orange-600 mt-1">฿{amount.toLocaleString()}</div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-orange-100" ref={canvasRef}>
                        {payload ? (
                            <QRCodeCanvas
                                value={payload}
                                size={180}
                                level={"L"}
                                includeMargin={true}
                            />
                        ) : (
                            <div className="w-[180px] h-[180px] bg-gray-100 flex items-center justify-center text-gray-400">Loading...</div>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3">
                        <button
                            onClick={handleSaveQR}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download size={18} />
                            Save QR
                        </button>
                        <label className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors relative overflow-hidden">
                            <Upload size={18} />
                            <span>{file ? 'เปลี่ยนรูป' : 'แนบสลิป'}</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </label>
                    </div>

                    {file && (
                        <div className="w-full text-center">
                            <p className="text-xs text-green-600 font-bold mb-2">Attached: {file.name}</p>
                            <button
                                onClick={handleSubmit}
                                disabled={isUploading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {isUploading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                                <span>ยืนยันการโอนเงิน</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
