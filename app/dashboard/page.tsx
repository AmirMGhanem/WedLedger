'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Fab,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { supabase, Gift, FamilyMember } from '@/lib/supabase';
import { format } from 'date-fns';
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
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    date: '',
    amount: '',
    currency: 'USD',
    recipientName: '',
    giftFrom: '',
  });
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load both gifts and family members for the logged-in user
      const [giftsResult, familyResult] = await Promise.all([
        supabase
          .from('gifts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    // Validate currency code - must be 3 letters
    const validCurrency = currency && currency.length === 3 && /^[A-Z]{3}$/.test(currency) 
      ? currency 
      : 'USD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: validCurrency,
      }).format(amount);
    } catch (error) {
      // Fallback if currency is still invalid
      return `${validCurrency} ${amount.toFixed(2)}`;
    }
  };

  const getFamilyMember = (familyMemberId: string) => {
    return familyMembers.find(m => m.id === familyMemberId);
  };

  const getFamilyMemberName = (familyMemberId: string) => {
    const member = getFamilyMember(familyMemberId);
    return member?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const handleCardClick = (gift: Gift) => {
    setSelectedGift(gift);
    setPreviewOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, gift: Gift) => {
    e.stopPropagation();
    setSelectedGift(gift);
    setEditFormData({
      date: gift.date,
      amount: gift.amount.toString(),
      currency: gift.currency,
      recipientName: gift.to_whom,
      giftFrom: gift.from,
    });
    setEditOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, giftId: string) => {
    e.stopPropagation();
    
    if (!confirm(t('giftDetails.deleteConfirm'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftId)
        .eq('user_id', user!.id); // Ensure user owns this gift

      if (error) throw error;
      
      // Reload gifts
      loadData();
    } catch (error) {
      console.error('Error deleting gift:', error);
      alert(t('giftDetails.errorDelete'));
    }
  };

  const handleEditSave = async () => {
    if (!selectedGift) return;
    
    setEditError('');

    try {
      if (!editFormData.giftFrom) {
        setEditError(t('addGift.errorSelectMember'));
        return;
      }

      const { error } = await supabase
        .from('gifts')
        .update({
          date: editFormData.date,
          amount: parseFloat(editFormData.amount),
          currency: editFormData.currency,
          to_whom: editFormData.recipientName,
          from: editFormData.giftFrom,
        })
        .eq('id', selectedGift.id)
        .eq('user_id', user!.id); // Ensure user owns this gift

      if (error) throw error;

      setEditOpen(false);
      loadData();
    } catch (err: any) {
      setEditError(err.message || t('giftDetails.errorUpdate'));
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedGift(null);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedGift(null);
    setEditError('');
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
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {gifts.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('dashboard.noGifts')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.addFirstGift')}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 1.5, sm: 2, md: 3 },
              '& > *': {
                flex: {
                  xs: '1 1 100%',
                  sm: '1 1 calc(50% - 8px)',
                  md: '1 1 calc(33.333% - 16px)',
                },
                minWidth: {
                  xs: '100%',
                  sm: 'calc(50% - 8px)',
                  md: 'calc(33.333% - 16px)',
                },
              },
            }}
          >
            {gifts.map((gift) => (
              <Card
                key={gift.id}
                onClick={() => handleCardClick(gift)}
                  sx={{
                    borderRadius: { xs: 1.5, sm: 2 },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(233,30,99,0.15)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 1.5, sm: 2.5 },
                      '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: { xs: 0.75, sm: 1.5 },
                      }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        component="div" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1.2,
                        }}
                      >
                        {gift.to_whom}
                      </Typography>
                      {gift.from && (() => {
                        const member = getFamilyMember(gift.from);
                        return (
                          <Chip
                            label={member?.name || 'Unknown'}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              height: { xs: 20, sm: 22 },
                              backgroundColor: member?.color || '#e91e63',
                              color: '#fff',
                            }}
                          />
                        );
                      })()}
                    </Box>

                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.5rem' },
                        mb: { xs: 0.25, sm: 0.5 },
                        lineHeight: 1.2,
                      }}
                    >
                      {formatCurrency(gift.amount, gift.currency)}
                    </Typography>

                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      {formatDate(gift.date)}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: { xs: 0.25, sm: 0.5 },
                        mt: { xs: 1, sm: 1.5 },
                        pt: { xs: 1, sm: 1.5 },
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditClick(e, gift)}
                        sx={{
                          color: 'primary.main',
                          p: { xs: 0.5, sm: 0.75 },
                          '&:hover': {
                            backgroundColor: 'rgba(233,30,99,0.08)',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteClick(e, gift.id)}
                        sx={{
                          color: 'error.main',
                          p: { xs: 0.5, sm: 0.75 },
                          '&:hover': {
                            backgroundColor: 'rgba(244,67,54,0.08)',
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                      </IconButton>
                    </Box>
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
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            boxShadow: '0 4px 16px rgba(233,30,99,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(233,30,99,0.4)',
            },
          }}
          onClick={() => router.push('/add-gift')}
        >
          <AddIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
        </Fab>

        {/* Preview Modal */}
        <Dialog 
          open={previewOpen} 
          onClose={handleClosePreview} 
          maxWidth="xs" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            {t('giftDetails.title')}
          </DialogTitle>
          <DialogContent>
            {selectedGift && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('giftDetails.recipient')}
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedGift.to_whom}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('giftDetails.from')}
                </Typography>
                {(() => {
                  const member = getFamilyMember(selectedGift.from);
                  return (
                    <Chip
                      label={member?.name || 'Unknown'}
                      sx={{
                        mb: 2,
                        backgroundColor: member?.color || '#e91e63',
                        color: '#fff',
                      }}
                    />
                  );
                })()}

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('giftDetails.amount')}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
                  {formatCurrency(selectedGift.amount, selectedGift.currency)}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('giftDetails.date')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(selectedGift.date)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button 
              onClick={handleClosePreview}
              sx={{ borderRadius: 2 }}
            >
              {t('common.close')}
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setPreviewOpen(false);
                if (selectedGift) {
                  handleEditClick({} as React.MouseEvent, selectedGift);
                }
              }}
              sx={{ borderRadius: 2 }}
            >
              {t('common.edit')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <Dialog 
          open={editOpen} 
          onClose={handleCloseEdit} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            {t('giftDetails.editGift')}
          </DialogTitle>
          <DialogContent>
            {editError && (
              <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                {editError}
              </Alert>
            )}

            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label={t('addGift.date')}
                type="date"
                value={editFormData.date}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, date: e.target.value })
                }
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label={t('addGift.amount')}
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, amount: e.target.value })
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
                    value={editFormData.currency}
                    label={t('addGift.currency')}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, currency: e.target.value })
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
                value={editFormData.recipientName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, recipientName: e.target.value })
                }
                required
              />

              <Box>
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

                <ToggleButtonGroup
                  value={editFormData.giftFrom}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      setEditFormData({ ...editFormData, giftFrom: newValue });
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
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button 
              onClick={handleCloseEdit}
              sx={{ borderRadius: 2 }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleEditSave}
              sx={{ borderRadius: 2 }}
            >
              {t('giftDetails.saveChanges')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
}
