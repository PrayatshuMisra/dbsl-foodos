-- ==========================================
-- Supabase SQL Data Seeder for FoodOS
-- ==========================================
-- This script creates 10 dummy customers, 3 owners, 
-- 10 restaurants, categories, menu items, delivery partners
-- and a few coupons.
-- 
-- Credentials generated:
-- CUSTOMERS: user1@foodos.com to user10@foodos.com
-- OWNERS:    owner1@foodos.com to owner3@foodos.com
-- ALL PASSWORDS: Password123!
-- ==========================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE
  v_uid UUID;
  v_owner_uids UUID[] := ARRAY[]::UUID[];
  v_customer_uids UUID[] := ARRAY[]::UUID[];
  v_restaurant_ids INT[] := ARRAY[]::INT[];
  v_category_ids INT[] := ARRAY[]::INT[];
BEGIN

  -- 1. Create 10 Customers in auth.users
  FOR i IN 1..10 LOOP
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', 'user' || i || '@foodos.com',
      crypt('Password123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('name', 'Customer ' || i),
      now(), now()
    );
    v_customer_uids := v_customer_uids || v_uid;
    -- Note: the trigger "on_auth_user_created" from the schema will auto-insert into public.customers!
  END LOOP;

  -- 2. Create 3 Restaurant Owners in auth.users
  FOR i IN 1..3 LOOP
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', 'owner' || i || '@foodos.com',
      crypt('Password123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('name', 'Owner ' || i),
      now(), now()
    );
    v_owner_uids := v_owner_uids || v_uid;
  END LOOP;

  -- 3. Create 10 Restaurants
  INSERT INTO public.restaurants (restaurant_name, location, contact_number, cuisine_type, opening_time, closing_time, rating, image_url) VALUES 
  ('Spice Hub', 'Manipal', '9876543210', 'Indian', '09:00 AM', '11:00 PM', 4.5, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'),
  ('Pizza Corner', 'Udupi', '9871234567', 'Italian', '10:00 AM', '12:00 AM', 4.2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500'),
  ('Burger Point', 'Mangalore', '8765432190', 'American', '11:00 AM', '11:00 PM', 4.0, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'),
  ('Green Bowl', 'Manipal', '9877778888', 'Vegan', '08:00 AM', '10:00 PM', 4.8, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'),
  ('Sushi Master', 'Bangalore', '9123456789', 'Japanese', '12:00 PM', '10:00 PM', 4.7, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500'),
  ('Taco Haven', 'Udupi', '9012345678', 'Mexican', '10:00 AM', '11:00 PM', 4.3, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500'),
  ('Dragon Wok', 'Manipal', '9988776655', 'Chinese', '11:00 AM', '10:30 PM', 4.1, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500'),
  ('Sweet Tooth', 'Mangalore', '8877665544', 'Desserts', '09:00 AM', '11:00 PM', 4.9, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500'),
  ('BBQ Nation', 'Bangalore', '7766554433', 'BBQ', '12:00 PM', '11:30 PM', 4.4, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500'),
  ('Bake My Day', 'Udupi', '8899001122', 'Bakery', '07:00 AM', '09:00 PM', 4.6, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500')
  RETURNING restaurant_id INTO v_restaurant_ids[1]; -- Just hacky way to populate if array returns correctly, but we'll re-query

  -- Store all 10 restaurant IDs
  v_restaurant_ids := ARRAY(SELECT restaurant_id FROM public.restaurants ORDER BY restaurant_id);

  -- Link Owners to some restaurants
  INSERT INTO public.restaurant_owners (owner_id, owner_name, email, phone_number, restaurant_id) VALUES 
  (v_owner_uids[1], 'Owner 1', 'owner1@foodos.com', '9000000001', v_restaurant_ids[1]),
  (v_owner_uids[2], 'Owner 2', 'owner2@foodos.com', '9000000002', v_restaurant_ids[2]),
  (v_owner_uids[3], 'Owner 3', 'owner3@foodos.com', '9000000003', v_restaurant_ids[3]);

  -- 4. Create Menu Categories for each restaurant
  FOR i IN 1..10 LOOP
    INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES 
    (v_restaurant_ids[i], 'Appetizers'),
    (v_restaurant_ids[i], 'Main Course'),
    (v_restaurant_ids[i], 'Beverages');
  END LOOP;

  -- Select the new category ids
  v_category_ids := ARRAY(SELECT category_id FROM public.menu_categories);

  -- 5. Create Menu Items for each restaurant
  FOR i IN 1..10 LOOP
    INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
    (v_restaurant_ids[i], (SELECT category_id FROM public.menu_categories WHERE restaurant_id = v_restaurant_ids[i] AND category_name = 'Appetizers'), 'Spring Rolls', 'Crispy and delicious', 150.00, true, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
    (v_restaurant_ids[i], (SELECT category_id FROM public.menu_categories WHERE restaurant_id = v_restaurant_ids[i] AND category_name = 'Appetizers'), 'Garlic Bread', 'Cheesy garlic bread', 120.00, true, 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500'),
    (v_restaurant_ids[i], (SELECT category_id FROM public.menu_categories WHERE restaurant_id = v_restaurant_ids[i] AND category_name = 'Main Course'), 'Paneer Butter Masala', 'Rich curried paneer', 250.00, true, 'https://images.unsplash.com/photo-1631515243349-e0cb4c113364?w=500'),
    (v_restaurant_ids[i], (SELECT category_id FROM public.menu_categories WHERE restaurant_id = v_restaurant_ids[i] AND category_name = 'Main Course'), 'Chicken Biryani', 'Aromatic spiced rice', 300.00, true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'),
    (v_restaurant_ids[i], (SELECT category_id FROM public.menu_categories WHERE restaurant_id = v_restaurant_ids[i] AND category_name = 'Beverages'), 'Mango Lassi', 'Sweet yoghurt drink', 80.00, true, 'https://images.unsplash.com/photo-1546889564-5e6fb434c2ab?w=500'),
    (v_restaurant_ids[i], (SELECT category_id FROM public.menu_categories WHERE restaurant_id = v_restaurant_ids[i] AND category_name = 'Beverages'), 'Cold Coffee', 'Creamy iced coffee', 100.00, true, 'https://images.unsplash.com/photo-1461023058943-0708e52edb51?w=500');
  END LOOP;

  -- 6. Create Delivery Partners
  INSERT INTO public.delivery_partners (name, phone_number, vehicle_type, availability_status) VALUES
  ('Ramesh', '9898989898', 'Bike', true),
  ('Suresh', '9797979797', 'Scooter', true),
  ('Mukesh', '9696969696', 'Bike', true);

  -- 7. Add Some Coupons
  INSERT INTO public.coupons (coupon_code, discount_type, discount_value, expiry_date, minimum_order_value) VALUES
  ('WELCOME50', 'PERCENTAGE', 50.00, now() + interval '30 days', 200.00),
  ('FLAT100', 'FLAT', 100.00, now() + interval '10 days', 500.00);

END $$;
