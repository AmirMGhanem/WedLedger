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
  Autocomplete,
  InputAdornment,
  Paper,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { supabase, Gift, FamilyMember, EventType, GiftType } from '@/lib/supabase';
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
  const { user, loading: authLoading, sharedContext, clearSharedContext } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [childUser, setChildUser] = useState<{ firstname?: string; lastname?: string } | null>(null);
  
  // Filter, sort, and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [filterGiftType, setFilterGiftType] = useState<string>('all');
  const [filterFamilyMember, setFilterFamilyMember] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
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
    direction: 'given' as 'given' | 'received',
    eventType: '',
    giftType: '',
    notes: '',
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
  }, [user, sharedContext, searchQuery, filterDirection, filterEventType, filterGiftType, filterFamilyMember, sortBy]);

  const loadData = async () => {
    if (!user) return;
    
    // Use shared context user_id if viewing shared ledger
    const targetUserId = sharedContext?.childUserId || user.id;
    
    try {
      // If in shared context, fetch child user info
      if (sharedContext) {
        const { data: childUserData } = await supabase
          .from('users')
          .select('firstname, lastname')
          .eq('id', sharedContext.childUserId)
          .single();
        
        if (childUserData) {
          setChildUser(childUserData);
        }
      }
      // Build gifts query with filters
      let giftsQuery = supabase
        .from('gifts')
        .select('*')
        .eq('user_id', targetUserId);

      // Apply direction filter
      if (filterDirection !== 'all') {
        giftsQuery = giftsQuery.eq('direction', filterDirection);
      }

      // Apply event type filter
      if (filterEventType !== 'all') {
        giftsQuery = giftsQuery.eq('event_type', filterEventType);
      }

      // Apply gift type filter
      if (filterGiftType !== 'all') {
        giftsQuery = giftsQuery.eq('gift_type', filterGiftType);
      }

      // Apply family member filter
      if (filterFamilyMember !== 'all') {
        giftsQuery = giftsQuery.eq('from', filterFamilyMember);
      }

      // Apply search filter (searches in to_whom and notes)
      if (searchQuery.trim()) {
        giftsQuery = giftsQuery.or(`to_whom.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'date_desc':
          giftsQuery = giftsQuery.order('date', { ascending: false });
          break;
        case 'date_asc':
          giftsQuery = giftsQuery.order('date', { ascending: true });
          break;
        case 'amount_desc':
          giftsQuery = giftsQuery.order('amount', { ascending: false });
          break;
        case 'amount_asc':
          giftsQuery = giftsQuery.order('amount', { ascending: true });
          break;
        case 'recipient':
          giftsQuery = giftsQuery.order('to_whom', { ascending: true });
          break;
        default:
          giftsQuery = giftsQuery.order('date', { ascending: false });
      }

      // Load all data for the target user (shared context or logged-in user)
      const [giftsResult, familyResult, eventResult, giftTypeResult] = await Promise.all([
        giftsQuery,
        supabase
          .from('family_members')
          .select('*')
          .eq('user_id', targetUserId),
        supabase
          .from('event_types')
          .select('*')
          .eq('user_id', targetUserId)
          .order('name', { ascending: true }),
        supabase
          .from('gift_types')
          .select('*')
          .eq('user_id', targetUserId)
          .order('name', { ascending: true }),
      ]);

      if (giftsResult.error) throw giftsResult.error;
      if (familyResult.error) throw familyResult.error;
      if (eventResult.error) throw eventResult.error;
      if (giftTypeResult.error) throw giftTypeResult.error;

      setGifts(giftsResult.data || []);
      setFamilyMembers(familyResult.data || []);
      setEventTypes(eventResult.data || []);
      setGiftTypes(giftTypeResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDirection('all');
    setFilterEventType('all');
    setFilterGiftType('all');
    setFilterFamilyMember('all');
    setSortBy('date_desc');
  };

  const hasActiveFilters = searchQuery || filterDirection !== 'all' || filterEventType !== 'all' || 
                          filterGiftType !== 'all' || filterFamilyMember !== 'all' || sortBy !== 'date_desc';

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
    
    // Check permission
    if (sharedContext && sharedContext.permission === 'read') {
      alert('You only have read permission for this ledger');
      return;
    }
    
    setSelectedGift(gift);
    setEditFormData({
      date: gift.date,
      amount: gift.amount.toString(),
      currency: gift.currency,
      recipientName: gift.to_whom,
      giftFrom: gift.from,
      direction: gift.direction || 'given',
      eventType: gift.event_type || '',
      giftType: gift.gift_type || '',
      notes: gift.notes || '',
    });
    setEditOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, giftId: string) => {
    e.stopPropagation();
    
    // Check permission
    if (sharedContext && sharedContext.permission === 'read') {
      alert('You only have read permission for this ledger');
      return;
    }
    
    if (!confirm(t('giftDetails.deleteConfirm'))) {
      return;
    }

    try {
      const targetUserId = sharedContext?.childUserId || user!.id;
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftId)
        .eq('user_id', targetUserId);

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

      const targetUserId = sharedContext?.childUserId || user!.id;
      
      // Check permission for updates
      if (sharedContext && sharedContext.permission === 'read') {
        setEditError('You only have read permission for this ledger');
        return;
      }

      // Save new event type if it doesn't exist (only if not in shared context)
      if (!sharedContext && editFormData.eventType && !eventTypes.find(et => et.name === editFormData.eventType)) {
        await supabase.from('event_types').insert({
          user_id: targetUserId,
          name: editFormData.eventType,
        });
      }

      // Save new gift type if it doesn't exist (only if not in shared context)
      if (!sharedContext && editFormData.giftType && !giftTypes.find(gt => gt.name === editFormData.giftType)) {
        await supabase.from('gift_types').insert({
          user_id: targetUserId,
          name: editFormData.giftType,
        });
      }

      const { error } = await supabase
        .from('gifts')
        .update({
          date: editFormData.date,
          amount: parseFloat(editFormData.amount),
          currency: editFormData.currency,
          to_whom: editFormData.recipientName,
          from: editFormData.giftFrom,
          direction: editFormData.direction,
          event_type: editFormData.eventType || null,
          gift_type: editFormData.giftType || null,
          notes: editFormData.notes || null,
        })
        .eq('id', selectedGift.id)
        .eq('user_id', targetUserId);

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
        {/* Shared Context Banner */}
        {sharedContext && (
          <Alert
            severity="info"
            onClose={clearSharedContext}
            sx={{
              mb: 3,
              borderRadius: 1,
              '& .MuiAlert-message': {
                flex: 1,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Viewing shared ledger: {sharedContext.childPhone}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Permission: {sharedContext.permission === 'read' ? 'Read Only' : 'Read & Write'}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={clearSharedContext}
                sx={{ textTransform: 'none', ml: 2 }}
              >
                View My Ledger
              </Button>
            </Box>
          </Alert>
        )}
        
        {/* Search Bar */}
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <TextField
            fullWidth
            placeholder={t('dashboard.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Paper>

        {/* Filters and Sort */}
        <Paper
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {/* Filter Header - Always Visible */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.02)',
              },
            }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <FilterListIcon color="action" />
            <Typography variant="subtitle2" fontWeight={600}>
              {t('dashboard.filterBy')} & {t('dashboard.sortBy')}
            </Typography>
            {hasActiveFilters && (
              <Chip
                label={Object.values({
                  search: searchQuery ? 1 : 0,
                  direction: filterDirection !== 'all' ? 1 : 0,
                  event: filterEventType !== 'all' ? 1 : 0,
                  gift: filterGiftType !== 'all' ? 1 : 0,
                  family: filterFamilyMember !== 'all' ? 1 : 0,
                  sort: sortBy !== 'date_desc' ? 1 : 0,
                }).reduce((a, b) => a + b, 0)}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              {hasActiveFilters && (
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {t('dashboard.clearFilters')}
                </Button>
              )}
              <IconButton size="small">
                {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Collapsible Filter Content */}
          <Collapse in={filtersExpanded}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 1.5, sm: 2 },
                  mb: 2,
                }}
              >
                {/* Direction Filter */}
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                  <InputLabel>{t('gift.direction')}</InputLabel>
                  <Select
                    value={filterDirection}
                    label={t('gift.direction')}
                    onChange={(e) => setFilterDirection(e.target.value)}
                  >
                    <MenuItem value="all">{t('dashboard.allDirections')}</MenuItem>
                    <MenuItem value="given">{t('gift.given')}</MenuItem>
                    <MenuItem value="received">{t('gift.received')}</MenuItem>
                  </Select>
                </FormControl>

                {/* Event Type Filter */}
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                  <InputLabel>{t('gift.eventType')}</InputLabel>
                  <Select
                    value={filterEventType}
                    label={t('gift.eventType')}
                    onChange={(e) => setFilterEventType(e.target.value)}
                  >
                    <MenuItem value="all">{t('dashboard.allEventTypes')}</MenuItem>
                    {eventTypes.map((et) => (
                      <MenuItem key={et.id} value={et.name}>
                        {et.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Gift Type Filter */}
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                  <InputLabel>{t('gift.giftType')}</InputLabel>
                  <Select
                    value={filterGiftType}
                    label={t('gift.giftType')}
                    onChange={(e) => setFilterGiftType(e.target.value)}
                  >
                    <MenuItem value="all">{t('dashboard.allGiftTypes')}</MenuItem>
                    {giftTypes.map((gt) => (
                      <MenuItem key={gt.id} value={gt.name}>
                        {gt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Family Member Filter */}
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                  <InputLabel>{t('addGift.giftFrom')}</InputLabel>
                  <Select
                    value={filterFamilyMember}
                    label={t('addGift.giftFrom')}
                    onChange={(e) => setFilterFamilyMember(e.target.value)}
                  >
                    <MenuItem value="all">{t('dashboard.allFamilyMembers')}</MenuItem>
                    {familyMembers.map((fm) => (
                      <MenuItem key={fm.id} value={fm.id}>
                        {fm.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Sort By */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SortIcon color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  {t('dashboard.sortBy')}
                </Typography>
              </Box>

              <FormControl size="small" fullWidth>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="date_desc">{t('dashboard.sortDateDesc')}</MenuItem>
                  <MenuItem value="date_asc">{t('dashboard.sortDateAsc')}</MenuItem>
                  <MenuItem value="amount_desc">{t('dashboard.sortAmountDesc')}</MenuItem>
                  <MenuItem value="amount_asc">{t('dashboard.sortAmountAsc')}</MenuItem>
                  <MenuItem value="recipient">{t('dashboard.sortRecipient')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Collapse>
        </Paper>

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

                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {formatDate(gift.date)}
                      </Typography>
                      {gift.direction && (
                        <Chip
                          label={gift.direction === 'given' ? t('gift.given') : t('gift.received')}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            backgroundColor: gift.direction === 'given' ? 'rgba(76,175,80,0.1)' : 'rgba(33,150,243,0.1)',
                            color: gift.direction === 'given' ? '#4caf50' : '#2196f3',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    
                    {(gift.event_type || gift.gift_type) && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75 }}>
                        {gift.event_type && (
                          <Chip
                            label={gift.event_type}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              borderColor: 'rgba(0,0,0,0.15)',
                            }}
                          />
                        )}
                        {gift.gift_type && (
                          <Chip
                            label={gift.gift_type}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              borderColor: 'rgba(0,0,0,0.15)',
                            }}
                          />
                        )}
                      </Box>
                    )}

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
                      {!(sharedContext && sharedContext.permission === 'read') && (
                        <>
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
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}

        {!(sharedContext && sharedContext.permission === 'read') && (
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
        )}

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

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('gift.direction')}
                </Typography>
                <Chip
                  label={selectedGift.direction === 'given' ? t('gift.given') : t('gift.received')}
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: selectedGift.direction === 'given' ? 'rgba(76,175,80,0.15)' : 'rgba(33,150,243,0.15)',
                    color: selectedGift.direction === 'given' ? '#4caf50' : '#2196f3',
                    fontWeight: 600,
                  }}
                />

                {selectedGift.event_type && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('gift.eventType')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedGift.event_type}
                    </Typography>
                  </>
                )}

                {selectedGift.gift_type && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('gift.giftType')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedGift.gift_type}
                    </Typography>
                  </>
                )}

                {selectedGift.notes && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('gift.notes')}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 2,
                        whiteSpace: 'pre-wrap',
                        bgcolor: 'background.default',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.08)',
                      }}
                    >
                      {selectedGift.notes}
                    </Typography>
                  </>
                )}
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

              {/* Direction Toggle */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                  {t('gift.direction')}
                </Typography>
                <ToggleButtonGroup
                  value={editFormData.direction}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      setEditFormData({ ...editFormData, direction: newValue });
                    }
                  }}
                  fullWidth
                  sx={{
                    '& .MuiToggleButton-root': {
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="given">
                    <CallMadeIcon sx={{ mr: 1, fontSize: 20 }} />
                    {t('gift.given')}
                  </ToggleButton>
                  <ToggleButton value="received">
                    <CallReceivedIcon sx={{ mr: 1, fontSize: 20 }} />
                    {t('gift.received')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Event Type */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                  {t('gift.eventType')}
                </Typography>
                {sharedContext ? (
                  // In shared context: only allow selecting from existing options
                  eventTypes.length > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>{t('gift.eventType')}</InputLabel>
                      <Select
                        value={editFormData.eventType}
                        label={t('gift.eventType')}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, eventType: e.target.value });
                        }}
                      >
                        {eventTypes.map((et) => (
                          <MenuItem key={et.id} value={et.name}>
                            {et.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Alert severity="info">
                      {t('gift.noEventTypes').replace('{name}', childUser?.firstname || sharedContext.childPhone)}
                    </Alert>
                  )
                ) : (
                  // Not in shared context: allow free text
                  <Autocomplete
                    freeSolo
                    options={eventTypes.map(et => et.name)}
                    value={editFormData.eventType}
                    onChange={(e, newValue) => {
                      setEditFormData({ ...editFormData, eventType: newValue || '' });
                    }}
                    onInputChange={(e, newValue) => {
                      setEditFormData({ ...editFormData, eventType: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder={t('gift.eventTypePlaceholder')} />
                    )}
                  />
                )}
              </Box>

              {/* Gift Type */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                  {t('gift.giftType')}
                </Typography>
                {sharedContext ? (
                  // In shared context: only allow selecting from existing options
                  giftTypes.length > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>{t('gift.giftType')}</InputLabel>
                      <Select
                        value={editFormData.giftType}
                        label={t('gift.giftType')}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, giftType: e.target.value });
                        }}
                      >
                        {giftTypes.map((gt) => (
                          <MenuItem key={gt.id} value={gt.name}>
                            {gt.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Alert severity="info">
                      {t('gift.noGiftTypes').replace('{name}', childUser?.firstname || sharedContext.childPhone)}
                    </Alert>
                  )
                ) : (
                  // Not in shared context: allow free text
                  <Autocomplete
                    freeSolo
                    options={giftTypes.map(gt => gt.name)}
                    value={editFormData.giftType}
                    onChange={(e, newValue) => {
                      setEditFormData({ ...editFormData, giftType: newValue || '' });
                    }}
                    onInputChange={(e, newValue) => {
                      setEditFormData({ ...editFormData, giftType: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder={t('gift.giftTypePlaceholder')} />
                    )}
                  />
                )}
              </Box>

              {/* Notes */}
              <TextField
                fullWidth
                label={t('gift.notes')}
                placeholder={t('gift.notesPlaceholder')}
                value={editFormData.notes}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, notes: e.target.value })
                }
                multiline
                rows={3}
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
