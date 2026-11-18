-- ÉTAPE 6 : vérification (lecture seule, sans risque). Lance chaque bloc ou tout d'un coup.

-- 1) Tables présentes et sécurité (RLS) activée : toutes les lignes doivent afficher true
select c.relname as table_name, c.relrowsecurity as rls_active
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and c.relname in ('products','requests','admins','profiles','sales','activity_log')
order by 1;

-- 2) Données : produits = 66 (ou plus), admins >= 1
select (select count(*) from public.products)                          as produits,
       (select count(*) from public.products where status = 'publie')  as publies,
       (select count(*) from public.profiles where role = 'admin')     as admins;

-- 3) Fonctions attendues : 8 lignes
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in ('is_admin','is_aal2','is_role','my_role','assign_role','list_team','log_event','owns_product_file')
order by 1;

-- 4) Règles de sécurité par table
select tablename, count(*) as nb_regles
from pg_policies where schemaname = 'public' group by tablename order by 1;

-- 5) Droits de l'API : products doit être lisible par anon (true)
select has_table_privilege('anon', 'public.products', 'select')          as anon_lit_products,
       has_table_privilege('authenticated', 'public.products', 'update') as auth_modifie_products,
       has_table_privilege('anon', 'public.activity_log', 'select')      as anon_lit_journal_doit_etre_false;

-- 6) Bucket de photos : 1 ligne, public = true
select id, public from storage.buckets where id = 'products';

-- 7) Déclencheurs du journal : 4 lignes
select event_object_table as table_name, trigger_name
from information_schema.triggers
where trigger_schema = 'public' and trigger_name like 'audit_%'
group by 1, 2 order by 1;
