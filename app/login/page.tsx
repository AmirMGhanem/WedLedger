'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithOtp, verifyOtp } = useAuth();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithOtp(phone);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. For demo purposes, use any phone number and OTP "123456".');
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(phone, otp);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. This is a demo - OTP verification may not work without proper setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e91e63 0%, #673ab7 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#e91e63',
              textAlign: 'center',
              mb: 3,
            }}
          >
            WedLedger
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
          >
            Sign in to WedLedger
          </Typography>

          {error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                disabled
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Enter OTP"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoFocus
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </Box>
            </form>
          )}

          <Typography
            variant="caption"
            sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'text.secondary' }}
          >
            Demo Mode: OTP authentication is mocked for demonstration
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
