'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
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
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const { signInWithOtp, verifyOtp, updateProfile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithOtp(phone);
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
      const result = await verifyOtp(phone, otp);
      if (result.needsRegistration) {
        setStep('register');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('login.errorInvalidOtp'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstname.trim() || !lastname.trim() || !birthdate) {
      setError(t('register.errorRequired'));
      return;
    }

    setLoading(true);

    try {
      await updateProfile(firstname.trim(), lastname.trim(), birthdate);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('register.errorSave'));
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
        background: '#fafafa',
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                mb: 3,
              }}
            >
              <Image
                src="/logo.png"
                alt="WedLedger Logo"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: '#111827',
                textAlign: 'center',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
                letterSpacing: '-0.025em',
              }}
            >
              {t('app.name')}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            gutterBottom
            sx={{ 
              mb: 4,
              textAlign: 'center',
              color: '#6b7280',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 400,
            }}
          >
            {t('login.title')}
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1,
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                '& .MuiAlert-icon': {
                  color: '#dc2626',
                },
              }}
            >
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
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: '1px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
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
                  py: 1.5,
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  borderRadius: 1,
                  backgroundColor: '#667eea',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                    boxShadow: 'none',
                  },
                  '&:disabled': {
                    backgroundColor: '#e5e7eb',
                    color: '#9ca3af',
                  },
                }}
              >
                {loading ? t('login.sending') : t('login.sendOtp')}
              </Button>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleVerifyOtp}>
              <TextField
                fullWidth
                label={t('login.phoneLabel')}
                value={phone}
                disabled
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#f9fafb',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                  },
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
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: '1px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
                autoFocus
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric',
                }}
                helperText={t('login.otpHelper')}
              />

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
                    py: 1.5,
                    borderRadius: 1,
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb',
                    },
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
                    py: 1.5,
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    borderRadius: 1,
                    backgroundColor: '#667eea',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#5568d3',
                      boxShadow: 'none',
                    },
                    '&:disabled': {
                      backgroundColor: '#e5e7eb',
                      color: '#9ca3af',
                    },
                  }}
                >
                  {loading ? t('login.verifying') : t('login.verify')}
                </Button>
              </Box>
            </form>
          ) : step === 'register' ? (
            <form onSubmit={handleCompleteRegistration}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  textAlign: 'center',
                  color: '#111827',
                }}
              >
                {t('register.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                {t('register.subtitle')}
              </Typography>

              <TextField
                fullWidth
                label={t('register.firstname')}
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: '1px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
                autoFocus
              />

              <TextField
                fullWidth
                label={t('register.lastname')}
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: '1px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              <TextField
                fullWidth
                label={t('register.birthdate')}
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: '1px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  borderRadius: 1,
                  backgroundColor: '#667eea',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                    boxShadow: 'none',
                  },
                  '&:disabled': {
                    backgroundColor: '#e5e7eb',
                    color: '#9ca3af',
                  },
                }}
              >
                {loading ? t('register.saving') : t('register.complete')}
              </Button>
            </form>
          ) : null}

        </Paper>
      </Container>
    </Box>
  );
}
