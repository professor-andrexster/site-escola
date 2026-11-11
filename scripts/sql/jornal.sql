-- JBInforma, a agencia de noticias da escola (2026-11-10): redacao dos alunos
-- com fontes locais e checklist, checagem "E verdade?", edicao da semana,
-- pauta aberta, Erramos, Memoria e Servico. Idempotente.
--   mysql --default-character-set=utf8mb4 escola_jb < scripts/sql/jornal.sql

ALTER TABLE `noticias`
  ADD COLUMN IF NOT EXISTS `tipo`          varchar(12)  NOT NULL DEFAULT 'materia',  -- materia | checagem | memoria | servico
  ADD COLUMN IF NOT EXISTS `editoria`      varchar(12)  DEFAULT NULL,                -- escola | bairro | cidade
  ADD COLUMN IF NOT EXISTS `status`        varchar(12)  DEFAULT NULL,                -- NULL = noticia antiga; rascunho | revisao | ajustar | publicado | retirado
  ADD COLUMN IF NOT EXISTS `texto`         longtext     DEFAULT NULL,                -- texto puro digitado na redacao (o HTML de `conteudo` sai dele)
  ADD COLUMN IF NOT EXISTS `fontes`        text         DEFAULT NULL,                -- JSON [{nome, papel, como}]
  ADD COLUMN IF NOT EXISTS `checklist`     text         DEFAULT NULL,                -- JSON ["chave", ...] marcadas
  ADD COLUMN IF NOT EXISTS `boato`         text         DEFAULT NULL,                -- checagem: o que estao dizendo
  ADD COLUMN IF NOT EXISTS `veredito`      varchar(12)  DEFAULT NULL,                -- verdade | falso | enganoso | sem_prova
  ADD COLUMN IF NOT EXISTS `tema`          varchar(12)  DEFAULT NULL,                -- saude | golpe | concurso | servico
  ADD COLUMN IF NOT EXISTS `como_checamos` text         DEFAULT NULL,                -- um passo por linha
  ADD COLUMN IF NOT EXISTS `memoria_ano`   int          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `valido_ate`    date         DEFAULT NULL,                -- servico: some do mural depois desta data
  ADD COLUMN IF NOT EXISTS `feedback`      text         DEFAULT NULL,                -- recado do monitor ao devolver
  ADD COLUMN IF NOT EXISTS `publicado_em`  datetime(3)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `pauta_id`      char(36)     DEFAULT NULL;

CREATE INDEX IF NOT EXISTS `noticias_tipo_idx` ON `noticias` (`tipo`, `publicado`);
CREATE INDEX IF NOT EXISTS `noticias_status_idx` ON `noticias` (`status`);

CREATE TABLE IF NOT EXISTS `jornal_edicoes` (
  `id`           char(36)     NOT NULL DEFAULT uuid(),
  `numero`       int          NOT NULL,
  `titulo`       varchar(140) NOT NULL,
  `inicio`       date         NOT NULL,
  `fim`          date         NOT NULL,
  `carta`        text         DEFAULT NULL,          -- recado da redacao, texto puro
  `materias`     text         DEFAULT NULL,          -- JSON [noticia_id, ...] na ordem da pagina; a primeira e a manchete
  `episodio_id`  char(36)     DEFAULT NULL,          -- Giro JB da semana (podcast_episodios.id)
  `status`       varchar(10)  NOT NULL DEFAULT 'rascunho', -- rascunho | publicada
  `publicado_em` datetime(3)  DEFAULT NULL,
  `criado_por`   char(36)     DEFAULT NULL,
  `criado_em`    datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `jornal_edicoes_numero_key` (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jornal_pautas` (
  `id`             char(36)     NOT NULL DEFAULT uuid(),
  `titulo`         varchar(140) NOT NULL,
  `descricao`      text         DEFAULT NULL,
  `origem`         varchar(8)   NOT NULL DEFAULT 'publico', -- publico | equipe
  `nome`           varchar(80)  DEFAULT NULL,               -- quem sugeriu (opcional, so o primeiro nome vai ao quadro)
  `vinculo`        varchar(16)  DEFAULT NULL,               -- aluno | familia | funcionario | ex-aluno | morador
  `status`         varchar(10)  NOT NULL DEFAULT 'nova',    -- nova (so a redacao ve) | sugerida | apurando | recusada
  `resposta`       varchar(300) DEFAULT NULL,               -- recado publico da redacao
  `responsavel_id` char(36)     DEFAULT NULL,               -- quem pegou a pauta
  `noticia_id`     char(36)     DEFAULT NULL,
  `ip`             varchar(64)  DEFAULT NULL,
  `criado_em`      datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  `atualizado_em`  datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `jornal_pautas_status_idx` (`status`),
  KEY `jornal_pautas_ip_idx` (`ip`, `criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jornal_correcoes` (
  `id`         char(36)    NOT NULL DEFAULT uuid(),
  `noticia_id` char(36)    NOT NULL,
  `texto`      text        NOT NULL,
  `criado_por` char(36)    DEFAULT NULL,
  `criado_em`  datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `jornal_correcoes_noticia_idx` (`noticia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
