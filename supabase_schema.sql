-- Supabase PostgreSQL Schema for FoodOS

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table (linked to auth.users)
CREATE TABLE public.customers (
    customer_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    address VARCHAR(255),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: We create a trigger to automatically add a customer row when an auth.user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (customer_id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'User'), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Restaurants Table
CREATE TABLE public.restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    contact_number VARCHAR(15),
    cuisine_type VARCHAR(50),
    opening_time VARCHAR(20),
    closing_time VARCHAR(20),
    rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
    image_url TEXT
);

-- 3. Restaurant Owners
CREATE TABLE public.restaurant_owners (
    owner_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id) ON DELETE SET NULL
);

-- 4. Menu Categories
CREATE TABLE public.menu_categories (
    category_id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL
);

-- 5. Menu Items
CREATE TABLE public.menu_items (
    item_id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES public.menu_categories(category_id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    availability_status BOOLEAN DEFAULT true,
    image_url TEXT
);

-- 6. Orders
CREATE TABLE public.orders (
    order_id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(customer_id) ON DELETE SET NULL,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id) ON DELETE SET NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    order_status VARCHAR(30) DEFAULT 'Pending',
    delivery_address VARCHAR(255)
);

-- 7. Order Details
CREATE TABLE public.order_details (
    order_detail_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(order_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES public.menu_items(item_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- 8. Payments
CREATE TABLE public.payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(order_id) ON DELETE CASCADE,
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'Completed',
    amount_paid NUMERIC(10,2) NOT NULL CHECK (amount_paid >= 0),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Delivery Partners
CREATE TABLE public.delivery_partners (
    partner_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    vehicle_type VARCHAR(50),
    availability_status BOOLEAN DEFAULT true
);

-- 10. Deliveries
CREATE TABLE public.deliveries (
    delivery_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(order_id) ON DELETE CASCADE,
    partner_id INTEGER REFERENCES public.delivery_partners(partner_id) ON DELETE SET NULL,
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(30) DEFAULT 'Assigned'
);

-- 11. Reviews
CREATE TABLE public.reviews (
    review_id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(customer_id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. Coupons
CREATE TABLE public.coupons (
    coupon_id SERIAL PRIMARY KEY,
    coupon_code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(30), -- 'PERCENTAGE' or 'FLAT'
    discount_value NUMERIC(10,2) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    minimum_order_value NUMERIC(10,2) DEFAULT 0
);

-- ==========================================
-- RPC Stored Procedure: place_order
-- This function atomically inserts Order, Order_Details, and Payment.
-- Accept JSON payload for items.
-- ==========================================
CREATE OR REPLACE FUNCTION public.place_order(
    p_customer_id UUID,
    p_restaurant_id INTEGER,
    p_total_amount NUMERIC(10,2),
    p_delivery_address VARCHAR,
    p_payment_method VARCHAR,
    p_items JSONB -- Example: [{"item_id": 1, "quantity": 2, "subtotal": 50.00}, ...]
) RETURNS INTEGER AS $$
DECLARE
    v_order_id INTEGER;
    v_item JSONB;
BEGIN
    -- 1. Insert into Orders
    INSERT INTO public.orders (customer_id, restaurant_id, total_amount, order_status, delivery_address)
    VALUES (p_customer_id, p_restaurant_id, p_total_amount, 'Confirmed', p_delivery_address)
    RETURNING order_id INTO v_order_id;
    
    -- 2. Loop through JSONB items and insert into Order_Details
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_details (order_id, item_id, quantity, subtotal)
        VALUES (
            v_order_id, 
            (v_item->>'item_id')::INTEGER, 
            (v_item->>'quantity')::INTEGER, 
            (v_item->>'subtotal')::NUMERIC
        );
    END LOOP;
    
    -- 3. Insert into Payments
    INSERT INTO public.payments (order_id, payment_method, payment_status, amount_paid)
    VALUES (v_order_id, p_payment_method, 'Completed', p_total_amount);
    
    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Make everything accessible to anon and authenticated (RLS effectively off for this demo)
-- Since RLS is disabled by default in Supabase (unless enabled), tables are publicly readable/writable 
-- using the anon key. This serves well for the local demo.
