/**
 * SMS Service
 * Handles sending SMS messages via sms4free.co.il API
 */

interface SendSMSOptions {
    recipient: string;
    message: string;
}

interface SMSResponse {
    success: boolean;
    recipients?: number;
    error?: string;
}

/**
 * Sends an SMS message to the specified recipient
 * @param options - SMS sending options
 * @returns Promise with SMS response
 */
export async function sendSMS({ recipient, message }: SendSMSOptions): Promise<SMSResponse> {
    const apiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;
    const phoneNumber = process.env.SMS_PHONE_NUMBER;
    const password = process.env.SMS_PASS;
    const sender = process.env.SMS_SENDER || 'WedLedger';

    // Validate required environment variables
    if (!apiUrl || !apiKey || !phoneNumber || !password) {
        const missingVars = [];
        if (!apiUrl) missingVars.push('SMS_API_URL');
        if (!apiKey) missingVars.push('SMS_API_KEY');
        if (!phoneNumber) missingVars.push('SMS_PHONE_NUMBER');
        if (!password) missingVars.push('SMS_PASS');

        throw new Error(
            `Missing required SMS environment variables: ${missingVars.join(', ')}`
        );
    }

    // Clean phone number - remove spaces, dashes, and ensure proper format
    const cleanRecipient = recipient.replace(/[\s-]/g, '');

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key: apiKey,
                user: phoneNumber,
                sender: sender,
                pass: password,
                recipient: cleanRecipient,
                msg: message,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SMS API error: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();

        // The API returns a number indicating how many recipients the message was sent to
        const recipientsCount = parseInt(responseText.trim(), 10);

        if (isNaN(recipientsCount)) {
            // If response is not a number, it might be an error message
            throw new Error(`Unexpected SMS API response: ${responseText}`);
        }

        return {
            success: true,
            recipients: recipientsCount,
        };
    } catch (error: any) {
        console.error('SMS sending error:', error);
        return {
            success: false,
            error: error.message || 'Failed to send SMS',
        };
    }
}

/**
 * Sends an OTP code via SMS
 * @param phoneNumber - Recipient phone number
 * @param otpCode - 6-digit OTP code
 * @returns Promise with SMS response
 */
export async function sendOTP(phoneNumber: string, otpCode: string): Promise<SMSResponse> {
    const message = `Your WedLedger verification code is: ${otpCode}. This code will expire in 10 minutes.`;

    return sendSMS({
        recipient: phoneNumber,
        message: message,
    });
}

