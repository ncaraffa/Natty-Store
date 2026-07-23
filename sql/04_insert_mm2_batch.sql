begin;
do $$
declare
  v_product_id uuid;
begin

-- Helper block repeated per item: skip (raise notice) if slug exists, else insert product+inventory.

  perform 1;

  -- 1 Cookieblade
  if not exists (select 1 from public.products where slug = 'cookieblade') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('cookieblade', 'Cookieblade', 'Godly Knife | Evento de Natal 2020 | Obtida através da Cookieblade Gamepass (1.699 Robux) durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 299, true, '/products/cookieblade.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 2 Saw
  if not exists (select 1 from public.products where slug = 'saw') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('saw', 'Saw', 'Godly Knife | Clássica (Knife Box 3) | Pode ser obtida abrindo a Knife Box 3 ou por trocas.', 'mm2', 249, true, '/products/saw.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 3 Chill
  if not exists (select 1 from public.products where slug = 'chill') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('chill', 'Chill', 'Godly Knife | Evento de Natal 2015 | Originalmente obtida por crafting durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 249, true, '/products/chill.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 4 Flames
  if not exists (select 1 from public.products where slug = 'flames') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('flames', 'Flames', 'Godly Knife | Clássica (Crafting) | Originalmente obtida pelo sistema de crafting. Atualmente disponível apenas por trocas.', 'mm2', 249, true, '/products/flames.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 5 Handsaw
  if not exists (select 1 from public.products where slug = 'handsaw') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('handsaw', 'Handsaw', 'Godly Knife | Evento de Halloween 2015 | Originalmente obtida por crafting durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 249, true, '/products/handsaw.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 6 Pumpking
  if not exists (select 1 from public.products where slug = 'pumpking') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('pumpking', 'Pumpking', 'Godly Knife | Evento de Halloween 2015 | Originalmente obtida por crafting durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 299, true, '/products/pumpking.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 7 Eggblade
  if not exists (select 1 from public.products where slug = 'eggblade') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('eggblade', 'Eggblade', 'Godly Knife | Páscoa 2020 | Obtida pela compra da Eggblade Gamepass durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 299, true, '/products/eggblade.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 8 Boneblade
  if not exists (select 1 from public.products where slug = 'boneblade') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('boneblade', 'Boneblade', 'Godly Knife | Evento de Halloween 2018 | Obtida por caixas do evento. Atualmente disponível apenas por trocas.', 'mm2', 299, true, '/products/boneblade.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 9 Snowflake
  if not exists (select 1 from public.products where slug = 'snowflake') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('snowflake', 'Snowflake', 'Godly Knife | Evento de Natal 2017 | Obtida por caixas do evento. Atualmente disponível apenas por trocas.', 'mm2', 349, true, '/products/snowflake.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 10 Ghostblade
  if not exists (select 1 from public.products where slug = 'ghostblade') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('ghostblade', 'Ghostblade', 'Godly Knife | Evento de Halloween 2019 | Obtida pela Ghostblade Gamepass durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 299, true, '/products/ghostblade.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 11 BattleAxe I
  if not exists (select 1 from public.products where slug = 'battleaxe-i') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('battleaxe-i', 'BattleAxe I', 'Godly Knife | Evento de Halloween 2017 | Obtida por caixas do evento. Atualmente disponível apenas por trocas.', 'mm2', 349, true, '/products/battleaxe-i.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 12 BattleAxe II
  if not exists (select 1 from public.products where slug = 'battleaxe-ii') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('battleaxe-ii', 'BattleAxe II', 'Godly Knife | Evento de Halloween 2018 | Obtida por crafting durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 349, true, '/products/battleaxe-ii.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 13 Icewing
  if not exists (select 1 from public.products where slug = 'icewing') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('icewing', 'Icewing', 'Ancient Knife | Evento de Natal 2018 | Obtida por meio do código promocional do evento. Atualmente disponível apenas por trocas.', 'mm2', 399, true, '/products/icewing.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 14 Pixel
  if not exists (select 1 from public.products where slug = 'pixel') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('pixel', 'Pixel', 'Godly Knife | Clássica (Crafting) | Originalmente obtida pelo sistema de crafting. Atualmente disponível apenas por trocas.', 'mm2', 499, true, '/products/pixel.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 15 Shark
  if not exists (select 1 from public.products where slug = 'shark') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('shark', 'Shark', 'Godly Gun | Clássica (Gun Box 2) | Obtida ao abrir a Gun Box 2 ou por trocas. Atualmente disponível apenas por trocas.', 'mm2', 399, true, '/products/shark.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 16 Darkbringer
  if not exists (select 1 from public.products where slug = 'darkbringer') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('darkbringer', 'Darkbringer', 'Godly Gun | Temporada 1 (2019) | Obtida pela Darkbringer Box durante a Season 1. Atualmente disponível apenas por trocas.', 'mm2', 550, true, '/products/darkbringer.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 17 Lightbringer
  if not exists (select 1 from public.products where slug = 'lightbringer') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('lightbringer', 'Lightbringer', 'Godly Gun | Temporada 1 (2019) | Obtida pela Lightbringer Box durante a Season 1. Atualmente disponível apenas por trocas.', 'mm2', 550, true, '/products/lightbringer.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 18 Batwing
  if not exists (select 1 from public.products where slug = 'batwing') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('batwing', 'Batwing', 'Ancient Knife | Evento de Halloween 2018 | Obtida pela Batwing Gamepass durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 950, true, '/products/batwing.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 19 Heartblade
  if not exists (select 1 from public.products where slug = 'heartblade') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('heartblade', 'Heartblade', 'Godly Knife | Valentine''s Day 2021 | Obtida pela Heartblade Gamepass durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 1050, true, '/products/heartblade.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 20 Heartwand
  if not exists (select 1 from public.products where slug = 'heartwand') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('heartwand', 'Heartwand', 'Godly Knife | Valentine''s Day 2023 | Obtida pela Heartblade/Heartwand Gamepass durante o evento. Atualmente disponível apenas por trocas.', 'mm2', 4000, true, '/products/heartwand.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 21 Set Virtual
  if not exists (select 1 from public.products where slug = 'set-virtual') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-virtual', 'Set Virtual', 'Godly Set | Evento de Natal 2015 | Obtido por caixas e crafting do evento. Atualmente disponível apenas por trocas.', 'mm2', 590, true, '/products/set-virtual.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 22 Set Slasher
  if not exists (select 1 from public.products where slug = 'set-slasher') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-slasher', 'Set Slasher', 'Godly Knife | Clássica (Knife Box 4) | Obtida ao abrir a Knife Box 4 ou por trocas. Atualmente disponível apenas por trocas.', 'mm2', 590, true, '/products/set-slasher.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 23 Set Iceflake
  if not exists (select 1 from public.products where slug = 'set-iceflake') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-iceflake', 'Set Iceflake', 'Godly Set | Evento de Natal 2020 | Obtido por caixas do evento. Atualmente disponível apenas por trocas.', 'mm2', 650, true, '/products/set-iceflake.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 24 Set Old Glory
  if not exists (select 1 from public.products where slug = 'set-old-glory') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-old-glory', 'Set Old Glory', 'Godly Knife | Evento do Dia da Independência 2018 | Obtida pela Old Glory Gamepass. Atualmente disponível apenas por trocas.', 'mm2', 650, true, '/products/set-old-glory.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 25 Set Seer
  if not exists (select 1 from public.products where slug = 'set-seer') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-seer', 'Set Seer', 'Godly Set | Clássica (Crafting) | Criado através do sistema de crafting. Atualmente disponível apenas por trocas. (sem a variante verde)', 'mm2', 699, true, '/products/set-seer.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 26 Set Icebreaker
  if not exists (select 1 from public.products where slug = 'set-icebreaker') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-icebreaker', 'Set Icebreaker', 'Ancient Knife | Evento de Natal 2020 | Obtido como recompensa máxima do evento. Atualmente disponível apenas por trocas.', 'mm2', 1750, true, '/products/set-icebreaker.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 27 Set Candy
  if not exists (select 1 from public.products where slug = 'set-candy') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-candy', 'Set Candy', 'Godly Set | Evento de Natal 2015 | Obtido durante o evento de Natal. Atualmente disponível apenas por trocas.', 'mm2', 1799, true, '/products/set-candy.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 28 Set Plasma
  if not exists (select 1 from public.products where slug = 'set-plasma') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('set-plasma', 'Set Plasma', 'Godly Set | Clássica (Gamepass) | Obtido através da Plasma Gamepass. Atualmente disponível apenas por trocas.', 'mm2', 650, true, '/products/set-plasma.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 29 Bat
  if not exists (select 1 from public.products where slug = 'bat') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('bat', 'Bat', 'Godly Knife | Evento de Halloween 2022 | Obtida durante o evento de Halloween 2022. Atualmente disponível apenas por trocas.', 'mm2', 1500, true, '/products/bat.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

  -- 30 Harvester
  if not exists (select 1 from public.products where slug = 'harvester') then
    insert into public.products (slug, name, description, category, price_cents, active, image_url)
    values ('harvester', 'Harvester', 'Ancient Gun | Evento de Halloween 2021 (Season 1) | Obtida como recompensa final do evento Halloween 2021. Atualmente disponível apenas por trocas.', 'mm2', 2450, true, '/products/harvester.jpg')
    returning id into v_product_id;
    insert into public.inventory (product_id, on_hand, reserved, public_status, sell_policy) values (v_product_id, 1, 0, 'limited', 'in_stock');
  end if;

end $$;
commit;
