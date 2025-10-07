'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Fab,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { supabase, Gift } from '@/lib/supabase';
import { format } from 'date-fns';
import AppLayout from '@/components/AppLayout';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadGifts();
    }
  }, [user]);

  const loadGifts = async () => {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (error) {
      console.error('Error loading gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  if (authLoading || loading) {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {gifts.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No gifts tracked yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tap the + button to add your first gift
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {gifts.map((gift) => (
              <Card
                key={gift.id}
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {gift.recipient_name}
                      </Typography>
                      {gift.from_family && (
                        <Chip
                          label="Family"
                          size="small"
                          color="secondary"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                      {!gift.from_family && (
                        <Chip
                          label="Personal"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="h5"
                      color="primary"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      {formatCurrency(gift.amount)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {formatDate(gift.date)}
                    </Typography>
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}

        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
          }}
          onClick={() => router.push('/add-gift')}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Container>
    </AppLayout>
  );
}
