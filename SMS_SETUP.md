# SMS OTP Setup Guide

This guide explains how to configure SMS functionality for OTP (One-Time Password) sending and verification.

## Environment Variables

Add the following environment variables to your `.env` or `.env.local` file:

```env
# Application Configuration
BASEURL=https://wedledger.vercel.app
MODE=PRODUCTION

# SMS Configuration (sms4free.co.il)
SMS_API_URL=https://api.sms4free.co.il/ApiSMS/v2/SendSMS
SMS_API_KEY=your_sms_api_key
SMS_PHONE_NUMBER=your_phone_number
SMS_PASS=your_sms_password
SMS_SENDER=WedLedger
```

### Application Variables

- **BASEURL**: The base URL of your application (e.g., `https://wedledger.vercel.app` for production, `http://localhost:3000` for development)
- **MODE**: Set to `DEBUG` to print SMS to console instead of sending, or `PRODUCTION` to send actual SMS

### Required Variables

- **SMS_API_URL**: The SMS API endpoint URL (default: `https://api.sms4free.co.il/ApiSMS/v2/SendSMS`)
- **SMS_API_KEY**: Your API key from sms4free.co.il
- **SMS_PHONE_NUMBER**: Your registered phone number with the SMS service
- **SMS_PASS**: Your password for the SMS service
- **SMS_SENDER**: The sender name displayed in SMS (default: "WedLedger")

## Next.js Configuration

**Important**: The current `next.config.js` has `output: 'export'` which creates a static export. API routes require a server-side Next.js application.

To enable API routes, you have two options:

### Option 1: Remove Static Export (Recommended for Production)

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out: output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
```

### Option 2: Use Serverless Functions

If you need to keep static export, deploy API routes as serverless functions on platforms like Vercel, Netlify, or AWS Lambda.

## How It Works

1. **Sending OTP**: When a user requests an OTP, the system:
   - Generates a 6-digit random OTP code
   - Stores it in the database (users table)
   - Sends it via SMS using the sms4free.co.il API

2. **Verifying OTP**: When a user submits an OTP:
   - The system checks if the OTP matches the stored code
   - If valid, clears the OTP and creates a user session
   - Returns user data including family members and gifts count

## API Endpoints

### POST `/api/otp/send`

Sends an OTP code to the provided phone number.

**Request Body:**
```json
{
  "phone": "0512345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "recipients": 1
}
```

### POST `/api/otp/verify`

Verifies an OTP code for the provided phone number.

**Request Body:**
```json
{
  "phone": "0512345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "user": {
    "id": "user-id",
    "phone": "0512345678",
    "familyCount": 0,
    "giftsCount": 0
  }
}
```

## Testing

### Debug Mode

Set `MODE=DEBUG` in your `.env` file to test SMS functionality without actually sending messages. In debug mode, SMS messages will be printed to the console instead.

### Production Mode

1. Make sure all environment variables are set (including `BASEURL` and `MODE=PRODUCTION`)
2. Start the development server: `npm run dev`
3. Navigate to the login page
4. Enter a phone number and request an OTP
5. Check the phone for the SMS with the OTP code
6. Enter the OTP code to verify

## Troubleshooting

### SMS Not Sending

- Verify all environment variables are set correctly
- Check that your SMS API credentials are valid
- Ensure phone numbers are in the correct format (no spaces or dashes)
- Check server logs for error messages

### API Routes Not Working

- Ensure `output: 'export'` is removed from `next.config.js` if using standard Next.js
- Verify the API routes are accessible at `/api/otp/send` and `/api/otp/verify`
- Check that the Next.js server is running (not just static files)

### OTP Verification Failing

- Ensure OTP codes are entered exactly as received (case-sensitive)
- Check that OTP hasn't expired (currently no expiration, but can be added)
- Verify the phone number format matches what was used to send the OTP

## Security Considerations

- OTP codes are cleared from the database after successful verification
- Consider adding OTP expiration (e.g., 10 minutes)
- Rate limiting should be implemented to prevent abuse
- Phone numbers should be validated before sending SMS

