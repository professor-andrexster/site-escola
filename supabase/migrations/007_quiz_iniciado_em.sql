-- Permite calcular, em qualquer cliente, qual pergunta deve estar sendo
-- exibida agora (e o tempo restante) a partir do momento em que o
-- professor iniciou o quiz, sincronizando o avanço das perguntas para
-- todos os participantes sem precisar de um host controlando ao vivo.

alter table public.quizzes
  add column if not exists quiz_iniciado_em timestamptz;
