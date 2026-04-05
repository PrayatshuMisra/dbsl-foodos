-- ==========================================
-- Supabase SQL Data Seeder for FoodOS
-- ==========================================
-- This script completely RESETS the database and 
-- creates 10 dummy customers, 10 owners, 10 unique restaurants, 
-- menu items, delivery partners, and coupons.
-- 
-- Credentials generated:
-- CUSTOMERS: user1@foodos.com to user10@foodos.com
-- OWNERS:    owner1@foodos.com to owner10@foodos.com
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
  v_cat_id INT;
  v_order_id INT;
  v_item_id INT;
  v_item_price NUMERIC;
  v_qty INT;
  v_subtotal NUMERIC;
  v_date TIMESTAMPTZ;
  v_hour INT;
BEGIN

  -- ==========================================
  -- 1. CLEANUP OLD DATA (SAFE WIPE)
  -- ==========================================
  DELETE FROM auth.users WHERE email LIKE '%@foodos.com';
  DELETE FROM public.restaurants;
  DELETE FROM public.delivery_partners;
  DELETE FROM public.coupons;

  -- ==========================================
  -- 2. CREATE 10 CUSTOMERS
  -- ==========================================
  FOR i IN 1..10 LOOP
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token,
      phone_change_token, email_change_token_current, reauthentication_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', 'user' || i || '@foodos.com',
      crypt('Password123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('name', 'Customer ' || i, 'phone_number', '90000000' || LPAD(i::text, 2, '0')),
      now(), now(),
      '', '', '', '', '', '', ''
    );
    v_customer_uids := v_customer_uids || v_uid;
  END LOOP;

  -- ==========================================
  -- 3. CREATE 10 RESTAURANT OWNERS
  -- ==========================================
  FOR i IN 1..10 LOOP
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token,
      phone_change_token, email_change_token_current, reauthentication_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', 'owner' || i || '@foodos.com',
      crypt('Password123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('name', 'Owner ' || i),
      now(), now(),
      '', '', '', '', '', '', ''
    );
    v_owner_uids := v_owner_uids || v_uid;
  END LOOP;

  -- ==========================================
  -- 4. CREATE 10 UNIQUE RESTAURANTS
  -- ==========================================
  INSERT INTO public.restaurants (restaurant_name, location, contact_number, cuisine_type, opening_time, closing_time, rating, image_url) VALUES 
  ('Spice Hub', 'Manipal', '9876543201', 'Indian', '09:00 AM', '11:00 PM', 4.5, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'),
  ('Pizza Corner', 'Udupi', '9871234567', 'Italian', '10:00 AM', '12:00 AM', 4.2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'),
  ('Burger Point', 'Mangalore', '8765432190', 'American', '11:00 AM', '11:00 PM', 4.0, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
  ('Sushi Master', 'Bangalore', '9123456789', 'Japanese', '12:00 PM', '10:00 PM', 4.7, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800'),
  ('Taco Haven', 'Udupi', '9012345678', 'Mexican', '10:00 AM', '11:00 PM', 4.3, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800'),
  ('Dragon Wok', 'Manipal', '9988776655', 'Chinese', '11:00 AM', '10:30 PM', 4.1, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800'),
  ('Sweet Tooth', 'Mangalore', '8877665544', 'Desserts', '09:00 AM', '11:00 PM', 4.9, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800'),
  ('BBQ Nation', 'Bangalore', '7766554433', 'BBQ', '12:00 PM', '11:30 PM', 4.4, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),
  ('Green Bowl', 'Manipal', '9877778888', 'Healthy', '08:00 AM', '10:00 PM', 4.8, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'),
  ('Bake My Day', 'Udupi', '8899001122', 'Bakery', '07:00 AM', '09:00 PM', 4.6, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800');

  v_restaurant_ids := ARRAY(SELECT restaurant_id FROM public.restaurants ORDER BY restaurant_id);

  -- Link EACH Owner to their specific restaurant
  FOR i IN 1..10 LOOP
    INSERT INTO public.restaurant_owners (owner_id, owner_name, email, phone_number, restaurant_id) VALUES 
    (v_owner_uids[i], 'Owner ' || i, 'owner' || i || '@foodos.com', '900000000' || (i-1), v_restaurant_ids[i]);
  END LOOP;

  -- ==========================================
  -- 5. UNIQUE MENUS FOR EACH RESTAURANT
  -- ==========================================

  -- 1. Spice Hub (Indian)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[1], 'North Indian') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[1], v_cat_id, 'Butter Chicken', 'Tender chicken in rich makhani gravy', 350.00, true, 'https://images.unsplash.com/photo-1603894584110-39433ff9841f?w=500'),
  (v_restaurant_ids[1], v_cat_id, 'Paneer Tikka', 'Clay-oven roasted paneer cubes', 280.00, true, 'https://images.unsplash.com/photo-1567184109411-47a7a3928551?w=500');

  -- 2. Pizza Corner (Italian)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[2], 'Wood Fired Pizza') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[2], v_cat_id, 'Pepperoni Feast', 'Classic italian pepperoni and mozzarella', 499.00, true, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500'),
  (v_restaurant_ids[2], v_cat_id, 'Garden Veggie', 'Fresh peppers, onions, and mushrooms', 399.00, true, 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500');

  -- 3. Burger Point (American)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[3], 'Gourmet Burgers') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[3], v_cat_id, 'Double Cheese Monster', 'Two patties with triple cheese', 249.00, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'),
  (v_restaurant_ids[3], v_cat_id, 'Peri Peri Fries', 'Spicy seasoned golden fries', 129.00, true, 'https://images.unsplash.com/photo-1573082801974-cf3010d28455?w=500');

  -- 4. Sushi Master (Japanese)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[4], 'Traditional Sushi') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[4], v_cat_id, 'California Roll', 'Crab, avocado, and cucumber', 450.00, true, 'https://images.unsplash.com/photo-1559466273-d95e72debaf8?w=500'),
  (v_restaurant_ids[4], v_cat_id, 'Salmon Sashimi', 'Fresh premium salmon slices', 600.00, true, 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500');

  -- 5. Taco Haven (Mexican)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[5], 'Cantina Specials') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[5], v_cat_id, 'Beef Barbacoa Tacos', 'Slow cooked beef in soft shells', 350.00, true, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500'),
  (v_restaurant_ids[5], v_cat_id, 'Loaded Nachos', 'With salsa, guac and cheese', 280.00, true, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500');

  -- 6. Dragon Wok (Chinese)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[6], 'Indo-Chinese') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[6], v_cat_id, 'Schezwan Noodles', 'Spicy stir fried noodles', 220.00, true, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500'),
  (v_restaurant_ids[6], v_cat_id, 'Veg Manchurian', 'Golden balls in savory gravy', 200.00, true, 'https://images.unsplash.com/photo-1637806930600-37fa8892069d?w=500');

  -- 7. Sweet Tooth (Dessert)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[7], 'Gourmet Treats') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[7], v_cat_id, 'Blueberry Cheesecake', 'Creamy baked cheesecake', 180.00, true, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500'),
  (v_restaurant_ids[7], v_cat_id, 'Choco Lava Cake', 'With a molten center', 150.00, true, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500');

  -- 8. BBQ Nation (Grill)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[8], 'From the Pit') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[8], v_cat_id, 'Smoked Lamb Chops', 'Charred to perfection', 550.00, true, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'),
  (v_restaurant_ids[8], v_cat_id, 'Grilled Pineapple', 'Cinnamon spiced and grilled', 200.00, true, 'https://images.unsplash.com/photo-1621506821199-a906ff82cf3c?w=500');

  -- 9. Green Bowl (Healthy)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[9], 'Wellness Bowls') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[9], v_cat_id, 'Quinoa Avocado Bowl', 'With roasted chickpeas', 320.00, true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'),
  (v_restaurant_ids[9], v_cat_id, 'Green Detox Smoothie', 'Kale, apple and ginger', 180.00, true, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500');

  -- 10. Bake My Day (Bakery)
  INSERT INTO public.menu_categories (restaurant_id, category_name) VALUES (v_restaurant_ids[10], 'Morning Pastries') RETURNING category_id INTO v_cat_id;
  INSERT INTO public.menu_items (restaurant_id, category_id, item_name, description, price, availability_status, image_url) VALUES 
  (v_restaurant_ids[10], v_cat_id, 'Butter Croissant', 'Flaky and buttery french treat', 120.00, true, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'),
  (v_restaurant_ids[10], v_cat_id, 'Dark Chocolate Tart', 'Rich 70% dark cocoa tart', 160.00, true, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500');

  -- ==========================================
  -- 6. DELIVERY PARTNERS & COUPONS
  -- ==========================================
  INSERT INTO public.delivery_partners (name, phone_number, vehicle_type, availability_status) VALUES
  ('Ramesh', '9898989898', 'Bike', true),
  ('Suresh', '9797979797', 'Scooter', true),
  ('Mukesh', '9696969696', 'Bike', true);

  INSERT INTO public.coupons (coupon_code, discount_type, discount_value, expiry_date, minimum_order_value) VALUES
  ('WELCOME50', 'PERCENTAGE', 50.00, now() + interval '30 days', 200.00),
  ('FLAT100', 'FLAT', 100.00, now() + interval '10 days', 500.00);

  -- ==========================================
  -- 7. GENERATE 150+ REALISTIC HISTORICAL ORDERS
  -- ==========================================
  FOR i IN 1..10 LOOP -- For each restaurant
    FOR j IN 1..15 LOOP -- Create 15 orders
      -- 1. Pick a random customer
      v_uid := v_customer_uids[floor(random() * 10 + 1)];
      
      -- 2. Pick a random date in the last 30 days with peak logic
      v_hour := CASE 
        WHEN random() < 0.4 THEN floor(random() * 3 + 12)::int -- Lunch (12, 13, 14)
        WHEN random() < 0.8 THEN floor(random() * 4 + 19)::int -- Dinner (19, 20, 21, 22)
        ELSE floor(random() * 24)::int -- Random hour
      END;
      v_date := now() - (random() * interval '30 days') + (v_hour * interval '1 hour') + (floor(random() * 60) * interval '1 minute');
      
      -- 3. Insert order header
      INSERT INTO public.orders (customer_id, restaurant_id, total_amount, order_status, order_date, delivery_address)
      VALUES (v_uid, v_restaurant_ids[i], 0, 
             CASE WHEN random() < 0.85 THEN 'Completed' ELSE 'Cancelled' END,
             v_date, 'Sample Delivery Address ' || j)
      RETURNING order_id INTO v_order_id;
      
      -- 4. Add 1-3 random items from this restaurant
      v_subtotal := 0;
      FOR k IN 1..floor(random() * 2 + 1) LOOP
        SELECT item_id, price INTO v_item_id, v_item_price 
        FROM public.menu_items 
        WHERE restaurant_id = v_restaurant_ids[i] 
        ORDER BY random() LIMIT 1;
        
        v_qty := floor(random() * 2 + 1);
        INSERT INTO public.order_details (order_id, item_id, quantity, subtotal)
        VALUES (v_order_id, v_item_id, v_qty, v_item_price * v_qty);
        
        v_subtotal := v_subtotal + (v_item_price * v_qty);
      END LOOP;
      
      -- 5. Update final order total
      UPDATE public.orders SET total_amount = v_subtotal WHERE order_id = v_order_id;
    END LOOP;
  END LOOP;

END $$;
