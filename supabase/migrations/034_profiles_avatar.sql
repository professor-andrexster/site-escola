-- 034: foto de perfil. Cada pessoa pode colocar a propria foto, e a gestao
-- pode editar a foto e o nome de qualquer usuario. Guardado como URL
-- publica do bucket "imagens" (ja usado pelo site), pasta avatars/.
-- Rodar manualmente no SQL Editor do Supabase, depois da 033.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
