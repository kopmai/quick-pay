const generatePayload = require('promptpay-qr');

const cases = [
    { type: 'Phone', val: '0812345678' },
    { type: 'ID Card', val: '1234567890123' },
    { type: 'Bank Acc/Random 10 digit', val: '1234567890' },
];

cases.forEach(c => {
    try {
        const payload = generatePayload(c.val, { amount: 100 });
        console.log(`[${c.type}] Value: ${c.val} -> Payload: ${payload.substring(0, 20)}...`);
    } catch (e) {
        console.log(`[${c.type}] Value: ${c.val} -> Error: ${e.message}`);
    }
});
