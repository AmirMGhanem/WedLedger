-- ============================================
-- Fix Invalid Currency Data in Gifts Table
-- ============================================
-- Run this in Supabase SQL Editor to fix any
-- gifts with invalid currency codes
-- ============================================

-- 1. View current invalid currencies
SELECT id, to_whom, amount, currency, date 
FROM public.gifts 
WHERE currency IS NULL 
   OR LENGTH(currency) != 3 
   OR currency !~ '^[A-Z]{3}$'
ORDER BY date DESC;

-- 2. Update invalid/missing currencies to USD
UPDATE public.gifts 
SET currency = 'USD'
WHERE currency IS NULL 
   OR LENGTH(currency) != 3 
   OR currency !~ '^[A-Z]{3}$';

-- 3. Verify the fix
SELECT id, to_whom, amount, currency, date 
FROM public.gifts 
ORDER BY date DESC
LIMIT 10;

-- ============================================
-- Optional: Delete test/invalid gifts
-- ============================================
-- Uncomment the line below to delete all gifts with invalid data
-- DELETE FROM public.gifts WHERE currency IS NULL OR LENGTH(currency) != 3;

-- ============================================
-- Success! All currency codes should now be valid
-- ============================================

