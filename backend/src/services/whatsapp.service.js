const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';
        this.token = process.env.WHATSAPP_API_TOKEN || process.env.FONNTE_TOKEN;
        this.enabled = process.env.WHATSAPP_ENABLED === 'true';
    }

    async sendMessage(phone, message) {
        if (!this.enabled) {
            console.log('[WhatsApp] Disabled, skipping send');
            return { success: false, reason: 'disabled' };
        }

        try {
            // Format phone number (remove +, spaces, dashes)
            const formattedPhone = phone.replace(/[^0-9]/g, '');

            const response = await axios.post(this.apiUrl, {
                target: formattedPhone,
                message: message,
                countryCode: '62' // Indonesia
            }, {
                headers: {
                    'Authorization': this.token
                }
            });

            console.log('[WhatsApp] Message sent to', formattedPhone);
            return { success: true, data: response.data };

        } catch (error) {
            console.error('[WhatsApp] Send failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendWithLink(phone, message, linkUrl, linkText = 'Buka Link') {
        const fullMessage = `${message}\n\n${linkText}: ${linkUrl}`;
        return this.sendMessage(phone, fullMessage);
    }
}

module.exports = new WhatsAppService();
