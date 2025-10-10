'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { supabase, Gift, FamilyMember } from '@/lib/supabase';
import { format, parseISO, startOfMonth } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { GrMoney } from "react-icons/gr";

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
      fetchExchangeRates();
    }
  }, [user]);

  const fetchExchangeRates = async () => {
    try {
      // Fetch latest exchange rates from Frankfurter API with ILS as base
      const response = await fetch('https://api.frankfurter.dev/v1/latest?base=ILS');
      const data = await response.json();
      
      // Convert rates to ILS (invert the rates since we have ILS as base)
      const ratesToILS: { [key: string]: number } = { ILS: 1 };
      
      Object.keys(data.rates).forEach(currency => {
        // Since base is ILS, data.rates[currency] tells us how much currency we get for 1 ILS
        // To convert TO ILS, we need to invert: 1 / rate
        ratesToILS[currency] = 1 / data.rates[currency];
      });
      
      setExchangeRates(ratesToILS);
      console.log('📊 Exchange rates loaded:', ratesToILS);
    } catch (error) {
      console.error('❌ Error fetching exchange rates:', error);
      setErrorMessage(t('analytics.exchangeRateError'));
      setShowError(true);
      // Set empty rates - will skip conversion
      setExchangeRates({});
    }
  };

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [giftsResult, familyResult] = await Promise.all([
        supabase
          .from('gifts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true }),
        supabase
          .from('family_members')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (giftsResult.error) throw giftsResult.error;
      if (familyResult.error) throw familyResult.error;

      setGifts(giftsResult.data || []);
      setFamilyMembers(familyResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert currency to ILS using fetched rates
  const convertToILS = (amount: number, currency: string): number => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return 0; // Return 0 if rates not loaded - will be filtered out
    }
    const rate = exchangeRates[currency] || exchangeRates['USD'] || 1;
    return amount * rate;
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!gifts.length || Object.keys(exchangeRates).length === 0) return null;

    // Total gifts and amounts by currency
    const totalGifts = gifts.length;
    const amountsByCurrency: { [key: string]: number } = {};
    
    gifts.forEach(gift => {
      const currency = gift.currency || 'USD';
      amountsByCurrency[currency] = (amountsByCurrency[currency] || 0) + gift.amount;
    });

    // Breakdown by family member
    const byFamilyMember: { [key: string]: { count: number; amount: number; color: string } } = {};
    
    gifts.forEach(gift => {
      const member = familyMembers.find(m => m.id === gift.from);
      const memberName = member?.name || 'Unknown';
      const memberColor = member?.color || '#e91e63';
      
      if (!byFamilyMember[memberName]) {
        byFamilyMember[memberName] = { count: 0, amount: 0, color: memberColor };
      }
      byFamilyMember[memberName].count++;
      byFamilyMember[memberName].amount += gift.amount;
    });

    // Pie chart data
    const pieData = Object.entries(byFamilyMember).map(([name, data]) => ({
      name,
      value: data.count,
      color: data.color,
    }));

    // Recipients analysis
    const recipientCounts: { [key: string]: number } = {};
    gifts.forEach(gift => {
      recipientCounts[gift.to_whom] = (recipientCounts[gift.to_whom] || 0) + 1;
    });

    const multipleGiftRecipients = Object.entries(recipientCounts)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    const topRecipients = Object.entries(recipientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Timeline data - gifts by month
    const giftsByMonth: { [key: string]: number } = {};
    gifts.forEach(gift => {
      const monthKey = format(startOfMonth(parseISO(gift.date)), 'MMM yyyy');
      giftsByMonth[monthKey] = (giftsByMonth[monthKey] || 0) + 1;
    });

    const timelineData = Object.entries(giftsByMonth).map(([month, count]) => ({
      month,
      gifts: count,
    }));

    // Average gift amount (converted to ILS)
    const totalAmountInILS = gifts.reduce((sum, gift) => {
      return sum + convertToILS(gift.amount, gift.currency || 'USD');
    }, 0);
    // Only calculate average if we have valid exchange rates
    const avgAmount = totalAmountInILS > 0 ? totalAmountInILS / totalGifts : 0;

    return {
      totalGifts,
      amountsByCurrency,
      byFamilyMember,
      pieData,
      multipleGiftRecipients,
      topRecipients,
      timelineData,
      avgAmount,
      totalRecipients: Object.keys(recipientCounts).length,
    };
  }, [gifts, familyMembers, exchangeRates]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const validCurrency = currency && currency.length === 3 && /^[A-Z]{3}$/.test(currency) 
      ? currency 
      : 'USD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: validCurrency,
      }).format(amount);
    } catch (error) {
      return `${validCurrency} ${amount.toFixed(2)}`;
    }
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

  if (!analytics) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
            {t('analytics.title')}
          </Typography>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('analytics.noData')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('analytics.addGifts')}
            </Typography>
          </Paper>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: { xs: 2.5, sm: 4 },
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          {t('analytics.title')}
        </Typography>

        {/* Summary Cards */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 4,
            '& > *': {
              flex: {
                xs: '1 1 100%',
                sm: '1 1 calc(50% - 12px)',
                md: '1 1 calc(25% - 18px)',
              },
              minWidth: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(25% - 18px)',
              },
            },
          }}
        >
          <Card 
            elevation={0}
            sx={{
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <CardGiftcardIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 1.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                  {analytics.totalGifts}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {t('analytics.totalGifts')}
              </Typography>
            </CardContent>
          </Card>

          <Card 
            elevation={0}
            sx={{
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                {/* <PaidIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'success.main', mr: 1.5 }} /> */}
                <GrMoney size={32} color="success.main" />
                <Box>
                  {Object.entries(analytics.amountsByCurrency).map(([currency, amount]) => (
                    <Typography key={currency} variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' }, mr: 1.5 }}>
                      {formatCurrency(amount, currency) }
                    </Typography>
                  ))}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {t('analytics.totalAmount')}
              </Typography>
            </CardContent>
          </Card>

          <Card 
            elevation={0}
            sx={{
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PeopleIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'secondary.main', mr: 1.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                  {analytics.totalRecipients}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {t('analytics.totalRecipients')}
              </Typography>
            </CardContent>
          </Card>

          <Card 
            elevation={0}
            sx={{
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'warning.main', mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  {analytics.avgAmount > 0 ? formatCurrency(analytics.avgAmount, 'ILS') : 'N/A'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {t('analytics.avgGift')} {analytics.avgAmount > 0 ? '(₪)' : ''}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Charts Row */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 4,
            '& > *': {
              flex: {
                xs: '1 1 100%',
                md: '1 1 calc(50% - 12px)',
              },
              minWidth: {
                xs: '100%',
                md: 'calc(50% - 12px)',
              },
            },
          }}
        >
          {/* Pie Chart - By Family Member */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {t('analytics.byMember')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>

          {/* Bar Chart - Amount by Family Member */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {t('analytics.amountByMember')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analytics.byFamilyMember).map(([name, data]) => ({
                name,
                amount: data.amount,
                fill: data.color,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8">
                  {Object.entries(analytics.byFamilyMember).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(analytics.byFamilyMember)[index].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Timeline Chart */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 4 },
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            {t('analytics.overTime')}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gifts" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Breakdown Tables */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            '& > *': {
              flex: {
                xs: '1 1 100%',
                md: '1 1 calc(50% - 12px)',
              },
              minWidth: {
                xs: '100%',
                md: 'calc(50% - 12px)',
              },
            },
          }}
        >
          {/* Top Recipients */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {t('analytics.topRecipients')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
              {analytics.topRecipients.map(([name, count]) => (
                <Box
                  key={name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{name}</Typography>
                  <Chip 
                    label={`${count} ${t('analytics.gifts')}`}
                    color="primary"
                    size="small"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Recipients with Multiple Gifts */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {t('analytics.multipleGifts')} ({analytics.multipleGiftRecipients.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
              {analytics.multipleGiftRecipients.slice(0, 5).map(([name, count]) => (
                <Box
                  key={name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{name}</Typography>
                  <Chip 
                    label={`${count} ${t('analytics.gifts')}`}
                    color="secondary"
                    size="small"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Error Snackbar */}
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

