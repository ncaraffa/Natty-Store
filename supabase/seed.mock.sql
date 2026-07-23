-- MOCK EXPLÍCITO para desenvolvimento local. NÃO contém catálogo ou preços reais.
-- Execute somente depois de schema.sql, em ambiente descartável.
insert into public.products (id,slug,name,description,category,price_cents,active)
values
 ('00000000-0000-4000-8000-000000000001','mock-item-mm2','[MOCK] Item MM2','Dado fictício de desenvolvimento.','mm2',100,true),
 ('00000000-0000-4000-8000-000000000002','mock-item-ftf','[MOCK] Item FTF','Dado fictício de desenvolvimento.','ftf',100,true),
 ('00000000-0000-4000-8000-000000000003','mock-item-preorder','[MOCK] Item preorder','Dado fictício de desenvolvimento.','adopt-me',100,true),
 ('00000000-0000-4000-8000-000000000004','mock-item-backorder','[MOCK] Item backorder','Dado fictício de desenvolvimento.','adopt-me',100,true)
on conflict (id) do nothing;

insert into public.inventory(product_id,on_hand,reserved,public_status,sell_policy)
values
 ('00000000-0000-4000-8000-000000000001',5,0,'available','in_stock'),
 ('00000000-0000-4000-8000-000000000002',2,0,'limited','in_stock'),
 ('00000000-0000-4000-8000-000000000003',0,0,'preorder','preorder'),
 ('00000000-0000-4000-8000-000000000004',0,0,'backorder','backorder')
on conflict (product_id) do nothing;
