import generatePayload from 'promptpay-qr';

export const generatePromptPayPayload = (target: string, amount: number) => {
    // Sanitize target: remove non-numeric characters
    const sanitizedTarget = target.replace(/[^0-9]/g, '');
    return generatePayload(sanitizedTarget, { amount });
};
