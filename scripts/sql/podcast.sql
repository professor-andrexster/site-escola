-- Podcast "JB no Ar" (2026-11-10): equipe de alunos com autorizacao dos
-- responsaveis, episodios (entrevista ou materia) com aprovacao do monitor e
-- publicacao no JBInforma. Idempotente.
--   mysql escola_jb < scripts/sql/podcast.sql

CREATE TABLE IF NOT EXISTS `podcast_membros` (
  `id`                     char(36)     NOT NULL DEFAULT uuid(),
  `user_id`                char(36)     NOT NULL,
  `papel`                  varchar(10)  NOT NULL,              -- monitor | aluno
  `aluno_id`               char(36)     DEFAULT NULL,
  `responsavel_nome`       varchar(120) DEFAULT NULL,
  `responsavel_cpf`        varchar(14)  DEFAULT NULL,
  `autorizacao_status`     varchar(12)  NOT NULL DEFAULT 'pendente', -- pendente | enviada | aceita | revogada
  `autorizacao_arquivo`    varchar(300) DEFAULT NULL,          -- caminho na pasta PRIVADA
  `autorizacao_enviada_em` datetime(3)  DEFAULT NULL,
  `autorizacao_aceita_em`  datetime(3)  DEFAULT NULL,
  `autorizacao_aceita_por` char(36)     DEFAULT NULL,
  `ano_letivo`             int          NOT NULL,
  `adicionado_por`         char(36)     DEFAULT NULL,
  `criado_em`              datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `podcast_membros_user_key` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `podcast_episodios` (
  `id`                     char(36)     NOT NULL DEFAULT uuid(),
  `slug`                   varchar(170) NOT NULL,
  `tipo`                   varchar(12)  NOT NULL DEFAULT 'entrevista', -- entrevista | materia
  `quadro`                 varchar(30)  DEFAULT NULL,
  `titulo`                 varchar(140) NOT NULL,
  `resumo`                 varchar(300) DEFAULT NULL,
  `texto`                  longtext     DEFAULT NULL,           -- texto puro; vira HTML escapado na hora de mostrar
  `entrevistado_nome`      varchar(120) DEFAULT NULL,
  `entrevistado_descricao` varchar(200) DEFAULT NULL,
  `termo_entrevistado`     varchar(300) DEFAULT NULL,           -- caminho na pasta PRIVADA
  `audio_url`              varchar(300) DEFAULT NULL,
  `audio_bytes`            int          DEFAULT NULL,
  `status`                 varchar(12)  NOT NULL DEFAULT 'rascunho', -- rascunho | revisao | ajustar | publicado | retirado
  `feedback`               text         DEFAULT NULL,
  `no_jbinforma`           tinyint(1)   NOT NULL DEFAULT 1,
  `noticia_id`             char(36)     DEFAULT NULL,
  `autor_id`               char(36)     NOT NULL,
  `publicado_em`           datetime(3)  DEFAULT NULL,
  `publicado_por`          char(36)     DEFAULT NULL,
  `criado_em`              datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  `atualizado_em`          datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `podcast_episodios_slug_key` (`slug`),
  KEY `podcast_episodios_status_idx` (`status`),
  KEY `podcast_episodios_autor_idx` (`autor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `podcast_participantes` (
  `episodio_id` char(36) NOT NULL,
  `user_id`     char(36) NOT NULL,
  PRIMARY KEY (`episodio_id`, `user_id`),
  KEY `podcast_participantes_user_idx` (`user_id`),
  CONSTRAINT `podcast_participantes_episodio_fkey` FOREIGN KEY (`episodio_id`) REFERENCES `podcast_episodios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2026-11-10 (noite): permissoes por aluno e auditoria.
ALTER TABLE `podcast_membros`
  ADD COLUMN IF NOT EXISTS `pode_postar` tinyint(1) NOT NULL DEFAULT 0 AFTER `ano_letivo`,
  ADD COLUMN IF NOT EXISTS `pode_audio`  tinyint(1) NOT NULL DEFAULT 0 AFTER `pode_postar`;

CREATE TABLE IF NOT EXISTS `podcast_auditoria` (
  `id`        bigint       NOT NULL AUTO_INCREMENT,
  `quando`    datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  `ator_id`   char(36)     DEFAULT NULL,
  `ator_nome` varchar(160) DEFAULT NULL,
  `acao`      varchar(40)  NOT NULL,
  `alvo_tipo` varchar(12)  DEFAULT NULL,  -- monitor | aluno | episodio | termo
  `alvo_id`   char(36)     DEFAULT NULL,
  `alvo_nome` varchar(200) DEFAULT NULL,
  `detalhe`   varchar(500) DEFAULT NULL,  -- nunca CPF
  `ip`        varchar(64)  DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `podcast_auditoria_quando_idx` (`quando`),
  KEY `podcast_auditoria_alvo_idx` (`alvo_id`),
  KEY `podcast_auditoria_ator_idx` (`ator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2026-11-10 (noite): quadros criados pelo painel (antes eram fixos no codigo).
CREATE TABLE IF NOT EXISTS `podcast_quadros` (
  `id`         char(36)     NOT NULL DEFAULT uuid(),
  `chave`      varchar(30)  NOT NULL,
  `nome`       varchar(60)  NOT NULL,
  `ideia`      varchar(240) DEFAULT NULL,
  `ordem`      int          NOT NULL DEFAULT 0,
  `ativo`      tinyint(1)   NOT NULL DEFAULT 1,
  `criado_por` char(36)     DEFAULT NULL,
  `criado_em`  datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `podcast_quadros_chave_key` (`chave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `podcast_quadros` (`chave`, `nome`, `ideia`, `ordem`) VALUES
  ('papo-de-corredor',  'Papo de Corredor',  'Entrevista rápida com alguém da escola: funcionário, professor, colega com uma história boa.', 1),
  ('giro-jb',           'Giro JB',           'As notícias da semana em poucos minutos: evento, jogo, prova, aviso.', 2),
  ('quem-faz-a-escola', 'Quem Faz a Escola', 'Perfil de quem trabalha nos bastidores: cantina, secretaria, limpeza, portaria.', 3),
  ('fala-ex-aluno',     'Fala, Ex-aluno',    'Quem estudou aqui conta onde chegou e o que faria diferente.', 4),
  ('debate',            'Na Roda',           'Dois ou três alunos conversam sobre um tema: celular na sala, vestibular, redes sociais.', 5),
  ('cidade',            'Pela Cidade',       'O que acontece em Carlos Chagas e afeta quem estuda aqui.', 6);

-- 2026-11-10 (noite): capa por episodio, categoria da materia no JBInforma,
-- transcricao automatica e contador de plays.
ALTER TABLE `podcast_episodios`
  ADD COLUMN IF NOT EXISTS `capa`                varchar(300) DEFAULT NULL AFTER `audio_bytes`,   -- caminho na pasta PRIVADA
  ADD COLUMN IF NOT EXISTS `categoria`           varchar(20)  DEFAULT NULL AFTER `quadro`,
  ADD COLUMN IF NOT EXISTS `transcricao`         longtext     DEFAULT NULL AFTER `texto`,
  ADD COLUMN IF NOT EXISTS `transcricao_status`  varchar(10)  DEFAULT NULL AFTER `transcricao`,   -- gerando | pronta | erro
  ADD COLUMN IF NOT EXISTS `transcricao_erro`    varchar(300) DEFAULT NULL AFTER `transcricao_status`,
  ADD COLUMN IF NOT EXISTS `transcricao_em`      datetime(3)  DEFAULT NULL AFTER `transcricao_erro`,
  ADD COLUMN IF NOT EXISTS `transcricao_publica` tinyint(1)   NOT NULL DEFAULT 0 AFTER `transcricao_em`,
  ADD COLUMN IF NOT EXISTS `plays`               int          NOT NULL DEFAULT 0 AFTER `no_jbinforma`;
