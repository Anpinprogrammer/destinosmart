-- 0001_user_plan.sql
-- Planes comerciales canónicos de DestinoSmart.
-- No usar variantes en español: free / occasional / frequent.

create type public.user_plan as enum ('free', 'occasional', 'frequent');
