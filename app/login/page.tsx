'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [generatedOtp, setGeneratedOtp] = useState('');
  const { signInWithOtp, verifyOtp } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const otpCode = await signInWithOtp(phone);
      setGeneratedOtp(otpCode);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || t('login.errorSendOtp'));
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
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
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
              mb: 1.5,
              fontSize: { xs: '1.75rem', sm: '2rem' },
            }}
          >
            {t('app.name')}
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ 
              mb: { xs: 2.5, sm: 3 },
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {t('login.title')}
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
                label={t('login.phoneLabel')}
                placeholder={t('login.phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                sx={{ 
                  mb: { xs: 2.5, sm: 3 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(233,30,99,0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(233,30,99,0.4)',
                  },
                }}
              >
                {loading ? t('login.sending') : t('login.sendOtp')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <TextField
                fullWidth
                label={t('login.phoneLabel')}
                value={phone}
                disabled
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                fullWidth
                label={t('login.otpLabel')}
                placeholder={t('login.otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                autoFocus
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric',
                }}
                helperText={t('login.otpHelper')}
              />

              {generatedOtp && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: { xs: 2.5, sm: 3 },
                    borderRadius: 2,
                    bgcolor: 'rgba(233,30,99,0.08)',
                    border: '1px solid rgba(233,30,99,0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Testing OTP:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'primary.main',
                        letterSpacing: 3,
                        fontFamily: 'monospace',
                      }}
                    >
                      {generatedOtp}
                    </Typography>
                  </Box>
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 } }}>
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
                    py: { xs: 1.25, sm: 1.5 },
                    borderRadius: 2,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                  }}
                >
                  {t('common.back')}
                </Button>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: '0 4px 16px rgba(233,30,99,0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(233,30,99,0.4)',
                    },
                  }}
                >
                  {loading ? t('login.verifying') : t('login.verify')}
                </Button>
              </Box>
            </form>
          )}

          <Typography
            variant="caption"
            sx={{ 
              mt: { xs: 2.5, sm: 3 },
              display: 'block',
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            {t('login.demoMode')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
