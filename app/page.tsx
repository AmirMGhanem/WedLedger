'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  CardGiftcard as CardGiftcardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Share as ShareIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  VerifiedUser as ShieldCheckIcon,
} from '@mui/icons-material';

export default function Home() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <CardGiftcardIcon sx={{ fontSize: 24 }} />,
      title: t('home.features.trackGifts.title'),
      description: t('home.features.trackGifts.description'),
      color: '#667eea',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 24 }} />,
      title: t('home.features.familyManagement.title'),
      description: t('home.features.familyManagement.description'),
      color: '#8b5cf6',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 24 }} />,
      title: t('home.features.analytics.title'),
      description: t('home.features.analytics.description'),
      color: '#10b981',
    },
  ];

  const stats = [
    {
      icon: <PeopleIcon sx={{ fontSize: 24 }} />,
      label: t('home.stats.users'),
      value: '2.5k+',
      color: '#667eea',
    },
    {
      icon: <CardGiftcardIcon sx={{ fontSize: 24 }} />,
      label: t('home.stats.gifts'),
      value: '50k+',
      color: '#8b5cf6',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 24 }} />,
      label: t('home.stats.families'),
      value: '1.2k+',
      color: '#f59e0b',
    },
    {
      icon: <ShieldCheckIcon sx={{ fontSize: 24 }} />,
      label: t('home.stats.rating'),
      value: '4.9/5',
      color: '#10b981',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#cfddea',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          zIndex: 0,
        }}
      />

      {/* Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            py: 2,
            maxWidth: '1280px',
            mx: 'auto',
            width: '100%',
            px: { xs: 2, sm: 3, md: 6 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                borderRadius: '50%',
                background: 'linear-gradient(to bottom right, #111827, #374151)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CardGiftcardIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: '#ffffff' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#0f0f0f',
                fontSize: { xs: '1rem', sm: '1.125rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {t('app.name')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            sx={{
              backgroundColor: '#ffffff',
              color: '#0f0f0f',
              textTransform: 'none',
              fontWeight: 500,
              px: { xs: 3, sm: 4 },
              py: 1,
              borderRadius: '9999px',
              boxShadow: '0 2.8px 2.2px rgba(0, 0, 0, 0.034), 0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06), 0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086), 0 100px 80px rgba(0, 0, 0, 0.12)',
              '&:hover': {
                backgroundColor: '#f9fafb',
                boxShadow: '0 2.8px 2.2px rgba(0, 0, 0, 0.034), 0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06), 0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086), 0 100px 80px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            {t('home.login')}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section with Glassmorphism */}
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 6 }, pb: 10 }}>
          <Box
            sx={{
              mt: { xs: 4, md: 6 },
              mb: { xs: 8, md: 12 },
              borderRadius: { xs: '24px', md: '32px' },
              p: { xs: 4, sm: 6, md: 8, lg: 12 },
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
              {/* Left Column - Content */}
              <Box>
                {/* Social Proof Badge */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: '#f1f2f3',
                    borderRadius: '9999px',
                    px: 2,
                    py: 1,
                    mb: 4,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: -1 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: '2px solid #ffffff',
                          bgcolor: '#667eea',
                          ml: i > 1 ? -1 : 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {String.fromCharCode(64 + i)}
                      </Box>
                    ))}
                  </Box>
                  <Typography
                    sx={{
                      ml: 2,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#0f0f0f',
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      2.5k
                    </Box>{' '}
                    {t('home.socialProof').replace('{count}', '2.5k')}
                  </Typography>
                </Box>

                {/* Main Heading */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2rem', sm: '3rem', md: '4rem', lg: '4.5rem' },
                    fontWeight: 500,
                    color: '#0f0f0f',
                    mb: 2,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {t('home.hero.title')}
                </Typography>

                {/* Subtitle */}
                <Typography
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    color: '#4b5563',
                    mb: 4,
                    lineHeight: 1.6,
                    maxWidth: '600px',
                  }}
                >
                  {t('home.hero.subtitle')}
                </Typography>

                {/* CTA Buttons */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 6 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/login')}
                    startIcon={<CardGiftcardIcon />}
                    endIcon={
                      <Box
                        component="svg"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </Box>
                    }
                    sx={{
                      backgroundColor: '#0f0f0f',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 4,
                      py: 1.5,
                      borderRadius: '9999px',
                      boxShadow: '0 2.8px 2.2px rgba(0, 0, 0, 0.034), 0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06), 0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086), 0 100px 80px rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        backgroundColor: '#1f1f1f',
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('home.hero.getStarted')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PeopleIcon />}
                    sx={{
                      borderColor: '#e5e7eb',
                      color: '#0f0f0f',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 4,
                      py: 1.5,
                      borderRadius: '9999px',
                      bgcolor: '#ffffff',
                      '&:hover': {
                        borderColor: '#d1d5db',
                        bgcolor: '#f9fafb',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('home.features.familyManagement.title')}
                  </Button>
                </Box>

                {/* Rating & Badges */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', color: '#fbbf24' }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarIcon key={i} sx={{ fontSize: 16, fill: 'currentColor' }} />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f0f0f' }}>
                      4.9/5 {t('home.stats.rating')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#667eea' }}>
                    <ShieldCheckIcon sx={{ fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f0f0f' }}>
                      Secure & Private
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Right Column - Visual */}
              <Box>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    height: { xs: '300px', sm: '400px', md: '450px' },
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: 'center',
                        color: '#ffffff',
                        p: 4,
                      }}
                    >
                      <CardGiftcardIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('app.name')}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {t('home.hero.subtitle')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Floating Stats Card */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -16,
                      right: { xs: '50%', sm: 16 },
                      transform: { xs: 'translateX(50%)', sm: 'none' },
                      bgcolor: '#ffffff',
                      borderRadius: '16px',
                      p: 2,
                      boxShadow: '0 2.8px 2.2px rgba(0, 0, 0, 0.034), 0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06), 0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086), 0 100px 80px rgba(0, 0, 0, 0.12)',
                      border: '1px solid #f3f4f6',
                      minWidth: '200px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#d1fae5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
                        <TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f0f0f' }}>
                          Gift Tracking
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          +247% organization
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mt: 8 }}>
              {stats.map((stat, index) => (
                <Box key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '16px',
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(to bottom right, ${alpha(stat.color, 0.1)}, #ffffff)`,
                      border: `1px solid ${alpha(stat.color, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 10px 25px ${alpha(stat.color, 0.2)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: alpha(stat.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 0.5 }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f0f0f' }}>
                      {stat.value}
                    </Typography>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 6 }, py: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                fontWeight: 600,
                color: '#0f0f0f',
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              {t('home.features.title')}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: '#6b7280',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              {t('home.features.subtitle')}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {features.map((feature, index) => (
              <Box key={index}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    p: 3,
                    bgcolor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#ffffff',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: alpha(feature.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#0f0f0f',
                      mb: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>

        {/* Pricing Section */}
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 6 }, py: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                fontWeight: 600,
                color: '#0f0f0f',
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              {t('home.pricing.title')}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: '#6b7280',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              {t('home.pricing.subtitle')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              elevation={0}
              sx={{
                maxWidth: '500px',
                width: '100%',
                borderRadius: '24px',
                border: '2px solid #667eea',
                bgcolor: '#ffffff',
                position: 'relative',
                overflow: 'visible',
                boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.1), 0 10px 10px -5px rgba(102, 126, 234, 0.04)',
              }}
            >
              {/* Free Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -16,
                  right: { xs: '50%', sm: 24 },
                  transform: { xs: 'translateX(50%)', sm: 'none' },
                  bgcolor: '#10b981',
                  color: '#ffffff',
                  px: 2,
                  py: 0.5,
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {t('home.pricing.forever')}
              </Box>

              <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: '#0f0f0f',
                    mb: 1,
                    textAlign: 'center',
                    fontSize: { xs: '1.5rem', sm: '1.875rem' },
                  }}
                >
                  {t('home.pricing.free.title')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 3 }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      color: '#667eea',
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                    }}
                  >
                    {t('home.pricing.free.price')}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: '#6b7280',
                    textAlign: 'center',
                    mb: 4,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  {t('home.pricing.free.description')}
                </Typography>

                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    mb: 4,
                    '& li': {
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 2,
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      color: '#374151',
                      '&:before': {
                        content: '"✓"',
                        color: '#10b981',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        mr: 1.5,
                        mt: 0.25,
                      },
                    },
                  }}
                >
                  <li>{t('home.pricing.free.feature1')}</li>
                  <li>{t('home.pricing.free.feature2')}</li>
                  <li>{t('home.pricing.free.feature3')}</li>
                  <li>{t('home.pricing.free.feature4')}</li>
                  <li>{t('home.pricing.free.feature5')}</li>
                  <li>{t('home.pricing.free.feature6')}</li>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    bgcolor: '#0f0f0f',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      bgcolor: '#1f1f1f',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  {t('home.pricing.free.cta')}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Container>

        {/* CTA Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            px: { xs: 2, sm: 3, md: 6 },
            bgcolor: '#0f0f0f',
            color: '#ffffff',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', maxWidth: '700px', mx: 'auto' }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                  fontWeight: 600,
                  color: '#ffffff',
                  mb: 2,
                  letterSpacing: '-0.02em',
                }}
              >
                {t('home.cta.title')}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                {t('home.cta.subtitle')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#0f0f0f',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  '&:hover': {
                    bgcolor: '#f9fafb',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                {t('home.cta.button')}
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 4,
            px: { xs: 2, sm: 3, md: 6 },
            bgcolor: 'transparent',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              sx={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem',
              }}
            >
              © {new Date().getFullYear()} {t('app.name')}
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
