/* 
  DATABASE UPGRADE FOR REAL-TIME TRACKING
  Run this in your Supabase SQL Editor to add the required tracking columns.
*/

-- 1. Add dispatched_at column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ;

-- 2. Update existing Delivered orders to have a dispatched_at for data consistency (optional)
UPDATE public.orders SET dispatched_at = order_date WHERE order_status = 'Delivered' AND dispatched_at IS NULL;

-- 3. Update RLS policies to allow updating this field
DROP POLICY IF EXISTS "Owners can update their restaurant orders" ON public.orders;
CREATE POLICY "Owners can update their restaurant orders" 
ON public.orders 
FOR UPDATE 
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_owners WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_owners WHERE owner_id = auth.uid()
  )
);
