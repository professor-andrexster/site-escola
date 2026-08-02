-- 018: JBQuiz estilo Kahoot — professor comanda o ritmo.
-- A pergunta só troca quando o professor manda, e a resposta certa
-- só aparece (para todos ao mesmo tempo) quando ele revela.

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS pergunta_atual int DEFAULT 0;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS pergunta_liberada_em timestamptz;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS resposta_revelada boolean DEFAULT false;
