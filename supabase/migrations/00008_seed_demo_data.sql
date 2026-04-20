-- Seed demo data for the restaurant showcase
DO $$
DECLARE
    v_restaurant_id UUID;
    v_cat_burgers UUID := uuid_generate_v4();
    v_cat_soups UUID := uuid_generate_v4();
    v_cat_drinks UUID := uuid_generate_v4();
    v_cat_desserts UUID := uuid_generate_v4();
BEGIN
    -- Check if demo restaurant exists
    SELECT id INTO v_restaurant_id FROM restaurants WHERE slug = 'demo-rest';

    -- If it doesn't exist, create it
    IF v_restaurant_id IS NULL THEN
        INSERT INTO restaurants (name, slug, primary_color) 
        VALUES ('Demo Restaurant', 'demo-rest', '#D4AF37')
        RETURNING id INTO v_restaurant_id;
        
        -- Also add table 1
        INSERT INTO tables (restaurant_id, table_number) VALUES (v_restaurant_id, '1');
    END IF;

    -- Clear existing data for demo-rest to avoid duplicates when running multiple times
    DELETE FROM categories WHERE restaurant_id = v_restaurant_id;

    -- Insert Categories
    INSERT INTO categories (id, restaurant_id, name, sort_order) VALUES
    (v_cat_burgers, v_restaurant_id, 'Бургеры', 1),
    (v_cat_soups, v_restaurant_id, 'Супы', 2),
    (v_cat_drinks, v_restaurant_id, 'Напитки', 3),
    (v_cat_desserts, v_restaurant_id, 'Десерты', 4);

    -- Insert Dishes (burgers)
    INSERT INTO dishes (restaurant_id, category_id, name, description, price, image_url, is_popular) VALUES
    (v_restaurant_id, v_cat_burgers, 'Чизбургер Классик', 'Котлета из мраморной говядины, сыр чеддер, свежие овощи и фирменный соус', 45, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', true),
    (v_restaurant_id, v_cat_burgers, 'Дабл Трабл', 'Двойная говяжья котлета, бекон, луковый джем, сырный соус', 65, 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', false),
    (v_restaurant_id, v_cat_burgers, 'Чикенбургер', 'Хрустящее куриное филе, салат айсберг, помидоры, соус цезарь', 40, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop', false);

    -- Insert Dishes (soups)
    INSERT INTO dishes (restaurant_id, category_id, name, description, price, image_url, is_popular) VALUES
    (v_restaurant_id, v_cat_soups, 'Борщ с говядиной', 'Домашний наваристый борщ со сметаной и пампушками', 35, 'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=600&auto=format&fit=crop', true),
    (v_restaurant_id, v_cat_soups, 'Крем-суп грибной', 'Нежный сливочный суп из трюфелей и белых грибов с гренками', 45, 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop', false);

    -- Insert Dishes (drinks)
    INSERT INTO dishes (restaurant_id, category_id, name, description, price, image_url, is_popular) VALUES
    (v_restaurant_id, v_cat_drinks, 'Лимонад Манго-Маракуйя', 'Освежающий авторский лимонад', 25, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop', true),
    (v_restaurant_id, v_cat_drinks, 'Капучино', 'Зерна 100% арабика, густая молочная пенка', 15, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop', false);

    -- Insert Dishes (desserts)
    INSERT INTO dishes (restaurant_id, category_id, name, description, price, image_url, is_popular) VALUES
    (v_restaurant_id, v_cat_desserts, 'Чизкейк Нью-Йорк', 'Классический чизкейк со свежими ягодами', 30, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=600&auto=format&fit=crop', true),
    (v_restaurant_id, v_cat_desserts, 'Шоколадный Фондан', 'Горячий кекс с жидким центром и шариком мороженого', 35, 'https://images.unsplash.com/photo-1551024506-0cb4a1cb48dd?q=80&w=600&auto=format&fit=crop', false);

END $$;
