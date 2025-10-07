'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

export default function AddGiftPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    recipientName: '',
    fromFamily: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('gifts').insert({
        user_id: user!.id,
        date: formData.date,
        amount: parseFloat(formData.amount),
        recipient_name: formData.recipientName,
        from_family: formData.fromFamily,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save gift');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (authLoading) {
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
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Add Gift
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Gift saved successfully!
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Date"
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

            <TextField
              fullWidth
              label="Amount"
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
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Recipient Name"
              value={formData.recipientName}
              onChange={(e) =>
                setFormData({ ...formData, recipientName: e.target.value })
              }
              required
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.fromFamily}
                  onChange={(e) =>
                    setFormData({ ...formData, fromFamily: e.target.checked })
                  }
                  color="secondary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.fromFamily ? 'Family Gift' : 'Personal Gift'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toggle to switch between personal and family gift
                  </Typography>
                </Box>
              }
              sx={{ mb: 4 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Cancel
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
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </AppLayout>
  );
}
