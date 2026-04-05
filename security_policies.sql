/* 
  SECURITY POLICIES FOR FOODOS 
  Run this script in your Supabase SQL Editor to enable Row Level Security (RLS)
  and ensure owners can ONLY see their own data.
  
  This script is idempotent (can be run multiple times).
*/

-- 1. Enable RLS on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. RESTAURANTS POLICIES (Publicly Viewable)
DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.restaurants;
CREATE POLICY "Anyone can view restaurants" 
ON public.restaurants 
FOR SELECT 
TO authenticated, anon 
USING (true);

-- 3. RESTAURANT OWNERS POLICIES
DROP POLICY IF EXISTS "Owners can view own profile" ON public.restaurant_owners;
CREATE POLICY "Owners can view own profile" 
ON public.restaurant_owners 
FOR SELECT 
USING (auth.uid() = owner_id);

-- 4. CUSTOMERS POLICIES
DROP POLICY IF EXISTS "Users can view own customer profile" ON public.customers;
CREATE POLICY "Users can view own customer profile" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Owners can view their customers profile" ON public.customers;
CREATE POLICY "Owners can view their customers profile" 
ON public.customers 
FOR SELECT 
USING (
  customer_id IN (
    SELECT customer_id FROM public.orders 
    WHERE restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_owners WHERE owner_id = auth.uid()
    )
  )
);

-- 5. ORDERS POLICIES
DROP POLICY IF EXISTS "Owners can view their restaurant orders" ON public.orders;
CREATE POLICY "Owners can view their restaurant orders" 
ON public.orders 
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_owners WHERE owner_id = auth.uid()
  )
);

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

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can insert orders" ON public.orders;
CREATE POLICY "Customers can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- 6. MENU ITEMS POLICIES
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items" 
ON public.menu_items 
FOR SELECT 
TO authenticated, anon 
USING (true);

DROP POLICY IF EXISTS "Owners can manage own menu items" ON public.menu_items;
CREATE POLICY "Owners can manage own menu items" 
ON public.menu_items 
FOR ALL 
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_owners WHERE owner_id = auth.uid()
  )
);

-- 7. MENU CATEGORIES POLICIES
DROP POLICY IF EXISTS "Anyone can view categories" ON public.menu_categories;
CREATE POLICY "Anyone can view categories" 
ON public.menu_categories 
FOR SELECT 
TO authenticated, anon 
USING (true);

DROP POLICY IF EXISTS "Owners can manage own categories" ON public.menu_categories;
CREATE POLICY "Owners can manage own categories" 
ON public.menu_categories 
FOR ALL 
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM public.restaurant_owners WHERE owner_id = auth.uid()
  )
);

-- 8. ORDER DETAILS POLICIES
DROP POLICY IF EXISTS "Owners can view order details" ON public.order_details;
CREATE POLICY "Owners can view order details" 
ON public.order_details 
FOR SELECT 
USING (
  order_id IN (
    SELECT order_id FROM public.orders 
    WHERE restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_owners WHERE owner_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Customers can view own order details" ON public.order_details;
CREATE POLICY "Customers can view own order details" 
ON public.order_details 
FOR SELECT 
USING (
  order_id IN (
    SELECT order_id FROM public.orders WHERE customer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers can insert order details" ON public.order_details;
CREATE POLICY "Customers can insert order details" 
ON public.order_details 
FOR INSERT 
WITH CHECK (
  order_id IN (
    SELECT order_id FROM public.orders WHERE customer_id = auth.uid()
  )
);

-- 9. DELIVERY PARTNERS POLICIES
DROP POLICY IF EXISTS "Anyone can view delivery partners" ON public.delivery_partners;
CREATE POLICY "Anyone can view delivery partners" 
ON public.delivery_partners 
FOR SELECT 
TO authenticated, anon 
USING (true);

-- 10. COUPONS POLICIES
DROP POLICY IF EXISTS "Anyone can view coupons" ON public.coupons;
CREATE POLICY "Anyone can view coupons" 
ON public.coupons 
FOR SELECT 
TO authenticated, anon 
USING (true);
