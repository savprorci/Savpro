-- ÉTAPE 5 : donner le rôle administrateur à ton compte
-- 1) Crée d'abord le compte dans Supabase > Authentication > Users > Add user
--    (coche « Auto confirm user »).
-- 2) REMPLACE l'e-mail ci-dessous (entre les apostrophes), puis clique sur Run.

insert into public.profiles (user_id, role, full_name, active)
select id, 'admin', 'Administrateur', true
from auth.users
where lower(email) = lower('ton-email@exemple.com')
on conflict (user_id) do update set role = 'admin', active = true;

-- Contrôle : doit afficher 1 ligne avec ton e-mail
select u.email, p.role, p.active
from public.profiles p join auth.users u on u.id = p.user_id
where p.role = 'admin';
