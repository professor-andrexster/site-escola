-- Aba Projetos: pastas por serie, trabalhos, envio de link do aluno e
-- avaliacoes de andamento do professor. Criado em 2026-09-28.
-- Aplicar uma vez no MariaDB de producao (idempotente: IF NOT EXISTS).
--   mysql escola_jb < scripts/sql/projetos-turma.sql

CREATE TABLE IF NOT EXISTS `projeto_pastas` (
  `id`         char(36)    NOT NULL DEFAULT uuid(),
  `serie`      varchar(20) NOT NULL,
  `ordem`      int         NOT NULL DEFAULT 0,
  `criado_por` char(36)    DEFAULT NULL,
  `criado_em`  datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `projeto_pastas_serie_key` (`serie`),
  KEY `projeto_pastas_criado_por_fkey` (`criado_por`),
  CONSTRAINT `projeto_pastas_criado_por_fkey` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projeto_trabalhos` (
  `id`            char(36)     NOT NULL DEFAULT uuid(),
  `pasta_id`      char(36)     NOT NULL,
  `titulo`        varchar(140) NOT NULL,
  `resumo`        varchar(300) DEFAULT NULL,
  `briefing`      text         DEFAULT NULL,
  `publicado`     tinyint(1)   NOT NULL DEFAULT 0,
  `ordem`         int          NOT NULL DEFAULT 0,
  `criado_por`    char(36)     DEFAULT NULL,
  `criado_em`     datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  `atualizado_em` datetime(3)  NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `projeto_trabalhos_pasta_idx` (`pasta_id`),
  KEY `projeto_trabalhos_criado_por_fkey` (`criado_por`),
  CONSTRAINT `projeto_trabalhos_pasta_fkey` FOREIGN KEY (`pasta_id`) REFERENCES `projeto_pastas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projeto_trabalhos_criado_por_fkey` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projeto_envios` (
  `id`            char(36)     NOT NULL DEFAULT uuid(),
  `trabalho_id`   char(36)     NOT NULL,
  `user_id`       char(36)     NOT NULL,
  `link_url`      varchar(300) NOT NULL,
  `repo_url`      varchar(300) DEFAULT NULL,
  `comentario`    text         DEFAULT NULL,
  `status`        varchar(20)  NOT NULL DEFAULT 'enviado',
  `nota`          decimal(4,1) DEFAULT NULL,
  `feedback`      text         DEFAULT NULL,
  `avaliado_em`   datetime(3)  DEFAULT NULL,
  `enviado_em`    datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  `atualizado_em` datetime(3)  NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `projeto_envios_trabalho_user_key` (`trabalho_id`,`user_id`),
  KEY `projeto_envios_user_idx` (`user_id`),
  CONSTRAINT `projeto_envios_trabalho_fkey` FOREIGN KEY (`trabalho_id`) REFERENCES `projeto_trabalhos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projeto_envios_user_fkey` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projeto_avaliacoes` (
  `id`           char(36)     NOT NULL DEFAULT uuid(),
  `envio_id`     char(36)     NOT NULL,
  `avaliador_id` char(36)     DEFAULT NULL,
  `status`       varchar(20)  NOT NULL,
  `nota`         decimal(4,1) DEFAULT NULL,
  `feedback`     text         DEFAULT NULL,
  `criado_em`    datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `projeto_avaliacoes_envio_idx` (`envio_id`),
  KEY `projeto_avaliacoes_avaliador_fkey` (`avaliador_id`),
  CONSTRAINT `projeto_avaliacoes_envio_fkey` FOREIGN KEY (`envio_id`) REFERENCES `projeto_envios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projeto_avaliacoes_avaliador_fkey` FOREIGN KEY (`avaliador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
