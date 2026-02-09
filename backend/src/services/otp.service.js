const otpStore = new Map();

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const saveOtp = (phone, code, ttlMs = 5 * 60 * 1000) => {
    const expiresAt = Date.now() + ttlMs;
    otpStore.set(phone, { code, expiresAt });
    return { code, expiresAt };
};

const verifyOtp = (phone, code) => {
    const record = otpStore.get(phone);
    if (!record) return { ok: false, reason: 'OTP_NOT_FOUND' };
    if (Date.now() > record.expiresAt) {
        otpStore.delete(phone);
        return { ok: false, reason: 'OTP_EXPIRED' };
    }
    if (record.code !== code) return { ok: false, reason: 'OTP_INVALID' };
    otpStore.delete(phone);
    return { ok: true };
};

module.exports = {
    generateCode,
    saveOtp,
    verifyOtp
};
