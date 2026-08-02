-- 026: extensoes de banco usadas pelo modulo de biblioteca.
-- pg_trgm da busca parcial por trecho (pesquisar "casmurro" encontra
-- "Dom Casmurro"); unaccent ignora acento na busca. A funcao unaccent()
-- de um argumento e STABLE, nao IMMUTABLE, entao nao pode entrar direto
-- num indice, por isso o wrapper abaixo, que fixa o dicionario e vira
-- IMMUTABLE de verdade.
--
-- O Supabase costuma instalar extensoes no schema "extensions", nao em
-- "public". A funcao abaixo procura o dicionario "unaccent" nos dois
-- lugares (SET search_path), pra funcionar em qualquer um dos dois casos
-- sem eu precisar adivinhar qual o projeto usa.
-- Rodar manualmente no SQL Editor do Supabase.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

CREATE OR REPLACE FUNCTION biblioteca_texto_busca(entrada text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SET search_path = public, extensions
AS $$
  SELECT lower(unaccent(coalesce(entrada, '')));
$$;
