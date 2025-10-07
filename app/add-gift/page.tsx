'use client';

import { useState, useEffect } from 'react';
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
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { supabase, FamilyMember } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
];

export default function AddGiftPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'USD',
    recipientName: '',
    giftFrom: '', // family member ID
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadFamilyMembers();
    }
  }, [user]);

  const loadFamilyMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate family member is selected
      if (!formData.giftFrom) {
        setError(t('addGift.errorSelectMember'));
        setLoading(false);
        return;
      }

      const giftData = {
        user_id: user!.id,
        date: formData.date,
        amount: parseFloat(formData.amount),
        to_whom: formData.recipientName,
        from: formData.giftFrom, // Store family member ID
        currency: formData.currency,
      };

      console.log('💾 Saving gift:', giftData);
      
      const { error: insertError } = await supabase.from('gifts').insert(giftData);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || t('addGift.errorSave'));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (authLoading || loadingMembers) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ 
              fontWeight: 700,
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            {t('addGift.title')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('addGift.success')}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('addGift.date')}
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              sx={{ mb: 3 }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label={t('addGift.amount')}
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
                sx={{ flex: 1 }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>{t('addGift.currency')}</InputLabel>
                <Select
                  value={formData.currency}
                  label={t('addGift.currency')}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label={t('addGift.recipient')}
              value={formData.recipientName}
              onChange={(e) =>
                setFormData({ ...formData, recipientName: e.target.value })
              }
              required
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1.5, 
                  fontWeight: 600,
                  color: 'text.secondary'
                }}
              >
                {t('addGift.giftFrom')} {t('addGift.required')}
              </Typography>
              
              {familyMembers.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {t('addGift.noFamily')}
                </Alert>
              ) : (
                <ToggleButtonGroup
                  value={formData.giftFrom}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      setFormData({ ...formData, giftFrom: newValue });
                    }
                  }}
                  fullWidth
                  sx={{
                    flexWrap: 'wrap',
                    '& .MuiToggleButton-root': {
                      py: 1.5,
                      flex: {
                        xs: '1 1 100%',
                        sm: '1 1 calc(50% - 4px)',
                      },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    },
                  }}
                >
                  {familyMembers.map((member) => (
                    <ToggleButton
                      key={member.id}
                      value={member.id}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: member.color || '#e91e63',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: member.color || '#e91e63',
                            filter: 'brightness(0.9)',
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: member.color || '#e91e63',
                          mr: 1,
                        }}
                      />
                      {member.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                }}
              >
                {t('common.cancel')}
              </Button>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(233,30,99,0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(233,30,99,0.35)',
                  },
                }}
              >
                {loading ? t('addGift.saving') : t('common.save')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </AppLayout>
  );
}
