-- A escola não divide as turmas em A/B/C, apenas 1°, 2° e 3° Ano.
-- Junta todos os alunos cadastrados em "1° Ano A/B/C" (e equivalentes
-- para 2° e 3°) em uma única série "1° Ano" / "2° Ano" / "3° Ano".

update public.profiles
set turma = regexp_replace(turma, '^(1°|2°|3°) Ano [A-C]$', '\1 Ano')
where turma ~ '^(1°|2°|3°) Ano [A-C]$';

update public.quizzes
set turma_alvo = regexp_replace(turma_alvo, '^(1°|2°|3°) Ano [A-C]$', '\1 Ano')
where turma_alvo ~ '^(1°|2°|3°) Ano [A-C]$';
