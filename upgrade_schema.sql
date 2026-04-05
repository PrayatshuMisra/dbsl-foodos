-- Phase 1 Upgrades for FoodOS

-- 1. Add tracking columns to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_prep_time INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP WITH TIME ZONE;

-- 2. Add special instructions per item
ALTER TABLE public.order_details 
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- 3. Extend reviews for item-level ratings
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS item_id INTEGER REFERENCES public.menu_items(item_id) ON DELETE CASCADE;

-- 4. Extend coupons for restaurant-specific offers
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE;

-- 5. New table: Customer Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(customer_id) ON DELETE CASCADE,
    address_label VARCHAR(50) NOT NULL, -- Home, Work, etc.
    address_text VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. New table: Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    favorite_id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(customer_id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES public.menu_items(item_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    -- Ensure either restaurant or item is favorited, not both or neither (optional constraint)
    CONSTRAINT check_favorite_type CHECK (
        (restaurant_id IS NOT NULL AND item_id IS NULL) OR 
        (restaurant_id IS NULL AND item_id IS NOT NULL)
    )
);

-- 7. Update place_order RPC to handle special instructions
CREATE OR REPLACE FUNCTION public.place_order(
    p_customer_id UUID,
    p_restaurant_id INTEGER,
    p_total_amount NUMERIC(10,2),
    p_delivery_address VARCHAR,
    p_payment_method VARCHAR,
    p_items JSONB -- [{"item_id": 1, "quantity": 2, "subtotal": 50.00, "instructions": "extra spicy"}, ...]
) RETURNS INTEGER AS $$
DECLARE
    v_order_id INTEGER;
    v_item JSONB;
BEGIN
    -- 1. Insert into Orders
    INSERT INTO public.orders (customer_id, restaurant_id, total_amount, order_status, delivery_address)
    VALUES (p_customer_id, p_restaurant_id, p_total_amount, 'Pending', p_delivery_address)
    RETURNING order_id INTO v_order_id;
    
    -- 2. Loop through JSONB items and insert into Order_Details
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_details (order_id, item_id, quantity, subtotal, special_instructions)
        VALUES (
            v_order_id, 
            (v_item->>'item_id')::INTEGER, 
            (v_item->>'quantity')::INTEGER, 
            (v_item->>'subtotal')::NUMERIC,
            (v_item->>'instructions')::TEXT
        );
    END LOOP;
    
    -- 3. Insert into Payments
    INSERT INTO public.payments (order_id, payment_method, payment_status, amount_paid)
    VALUES (v_order_id, p_payment_method, 'Completed', p_total_amount);
    
    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;
