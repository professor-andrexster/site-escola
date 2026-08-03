export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      noticias: {
        Row: {
          id: string
          titulo: string
          slug: string
          resumo: string | null
          conteudo: string | null
          imagem_url: string | null
          destaque_home: boolean
          publicado: boolean
          categoria: string | null
          autor_id: string | null
          autor_nome: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          slug: string
          resumo?: string | null
          conteudo?: string | null
          imagem_url?: string | null
          destaque_home?: boolean
          publicado?: boolean
          categoria?: string | null
          autor_id?: string | null
          autor_nome?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          slug?: string
          resumo?: string | null
          conteudo?: string | null
          imagem_url?: string | null
          destaque_home?: boolean
          publicado?: boolean
          categoria?: string | null
          autor_id?: string | null
          autor_nome?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      paginas_conteudo: {
        Row: {
          id: string
          pagina: string
          titulo: string | null
          conteudo: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          pagina: string
          titulo?: string | null
          conteudo?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          pagina?: string
          titulo?: string | null
          conteudo?: string | null
          updated_at?: string
        }
      }
      configuracoes_site: {
        Row: {
          chave: string
          valor: string | null
        }
        Insert: {
          chave: string
          valor?: string | null
        }
        Update: {
          chave?: string
          valor?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          mensagem: string | null
          lido: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          telefone?: string | null
          mensagem?: string | null
          lido?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          mensagem?: string | null
          lido?: boolean
          created_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          titulo: string
          codigo: string
          descricao: string | null
          turma_alvo: string
          lobby_aberto: boolean
          ativo: boolean
          encerrado: boolean
          tempo_por_pergunta: number
          quiz_iniciado_em: string | null
          pergunta_atual: number
          pergunta_liberada_em: string | null
          resposta_revelada: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          codigo: string
          descricao?: string | null
          turma_alvo?: string
          lobby_aberto?: boolean
          ativo?: boolean
          encerrado?: boolean
          tempo_por_pergunta?: number
          quiz_iniciado_em?: string | null
          pergunta_atual?: number
          pergunta_liberada_em?: string | null
          resposta_revelada?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          codigo?: string
          descricao?: string | null
          turma_alvo?: string
          lobby_aberto?: boolean
          ativo?: boolean
          encerrado?: boolean
          tempo_por_pergunta?: number
          quiz_iniciado_em?: string | null
          pergunta_atual?: number
          pergunta_liberada_em?: string | null
          resposta_revelada?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quiz_perguntas: {
        Row: {
          id: string
          quiz_id: string
          ordem: number
          enunciado: string
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          resposta_correta: 'a' | 'b' | 'c' | 'd'
          pontos: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          ordem?: number
          enunciado: string
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          resposta_correta: 'a' | 'b' | 'c' | 'd'
          pontos?: number
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          ordem?: number
          enunciado?: string
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_d?: string
          resposta_correta?: 'a' | 'b' | 'c' | 'd'
          pontos?: number
          created_at?: string
        }
      }
      quiz_participantes: {
        Row: {
          id: string
          quiz_id: string
          user_id: string | null
          nome: string
          turma: string
          pontuacao_total: number
          concluido: boolean
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id?: string | null
          nome: string
          turma: string
          pontuacao_total?: number
          concluido?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string | null
          nome?: string
          turma?: string
          pontuacao_total?: number
          concluido?: boolean
          created_at?: string
        }
      }
      quiz_respostas: {
        Row: {
          id: string
          participante_id: string
          pergunta_id: string
          resposta: 'a' | 'b' | 'c' | 'd' | null
          correta: boolean
          tempo_resposta: number | null
          pontos_obtidos: number
          created_at: string
        }
        Insert: {
          id?: string
          participante_id: string
          pergunta_id: string
          resposta?: 'a' | 'b' | 'c' | 'd' | null
          correta?: boolean
          tempo_resposta?: number | null
          pontos_obtidos?: number
          created_at?: string
        }
        Update: {
          id?: string
          participante_id?: string
          pergunta_id?: string
          resposta?: 'a' | 'b' | 'c' | 'd' | null
          correta?: boolean
          tempo_resposta?: number | null
          pontos_obtidos?: number
          created_at?: string
        }
      }
      alunos: {
        Row: {
          id: string
          nome: string
          matricula: string
          turma: string
          serie: string
          turno: string
          data_nascimento: string | null
          cpf: string | null
          responsavel: string | null
          telefone: string | null
          email: string | null
          foto_url: string | null
          ativo: boolean
          user_id: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          nome: string
          matricula: string
          turma: string
          serie: string
          turno?: string
          data_nascimento?: string | null
          cpf?: string | null
          responsavel?: string | null
          telefone?: string | null
          email?: string | null
          foto_url?: string | null
          ativo?: boolean
          user_id?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          matricula?: string
          turma?: string
          serie?: string
          turno?: string
          data_nascimento?: string | null
          cpf?: string | null
          responsavel?: string | null
          telefone?: string | null
          email?: string | null
          foto_url?: string | null
          ativo?: boolean
          user_id?: string | null
          criado_em?: string
          atualizado_em?: string
        }
      }
      trilhas: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          icone: string | null
          cor_tailwind: string | null
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          icone?: string | null
          cor_tailwind?: string | null
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          icone?: string | null
          cor_tailwind?: string | null
        }
      }
      perfis_vocacionais: {
        Row: {
          id: string
          aluno_id: string
          trilha_id: string
          pontuacao: number
          atualizado_em: string
        }
        Insert: {
          id?: string
          aluno_id: string
          trilha_id: string
          pontuacao?: number
          atualizado_em?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          trilha_id?: string
          pontuacao?: number
          atualizado_em?: string
        }
      }
      testes_vocacionais: {
        Row: {
          id: string
          aluno_id: string
          respostas: Json
          realizado_em: string
        }
        Insert: {
          id?: string
          aluno_id: string
          respostas: Json
          realizado_em?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          respostas?: Json
          realizado_em?: string
        }
      }
      projetos: {
        Row: {
          id: string
          aluno_id: string
          trilha_id: string | null
          titulo: string
          descricao: string | null
          imagem_url: string | null
          link_externo: string | null
          tags: string[] | null
          destaque: boolean
          criado_em: string
          serie_na_epoca: string | null
          equipe_id: string | null
        }
        Insert: {
          id?: string
          aluno_id: string
          trilha_id?: string | null
          titulo: string
          descricao?: string | null
          imagem_url?: string | null
          link_externo?: string | null
          tags?: string[] | null
          destaque?: boolean
          criado_em?: string
          serie_na_epoca?: string | null
          equipe_id?: string | null
        }
        Update: {
          id?: string
          aluno_id?: string
          trilha_id?: string | null
          titulo?: string
          descricao?: string | null
          imagem_url?: string | null
          link_externo?: string | null
          tags?: string[] | null
          destaque?: boolean
          criado_em?: string
          serie_na_epoca?: string | null
          equipe_id?: string | null
        }
      }
      cursos: {
        Row: {
          id: string
          titulo: string
          slug: string
          descricao: string | null
          capa_url: string | null
          categoria: string | null
          nivel: string
          autor_nome: string
          publicado: boolean
          ordem: number
          carga_horaria: number | null
          criado_por: string | null
          criado_em: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          titulo: string
          slug: string
          descricao?: string | null
          capa_url?: string | null
          categoria?: string | null
          nivel?: string
          autor_nome?: string
          publicado?: boolean
          ordem?: number
          carga_horaria?: number | null
          criado_por?: string | null
          criado_em?: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          slug?: string
          descricao?: string | null
          capa_url?: string | null
          categoria?: string | null
          nivel?: string
          autor_nome?: string
          publicado?: boolean
          ordem?: number
          carga_horaria?: number | null
          criado_por?: string | null
          criado_em?: string
          updated_at?: string
          created_at?: string
        }
      }
      aulas: {
        Row: {
          id: string
          curso_id: string
          titulo: string
          slug: string
          descricao: string | null
          ordem: number
          slides_urls: string[]
          conteudo: string | null
          revisado: boolean
          duracao_estimada_min: number | null
          publicado: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          curso_id: string
          titulo: string
          slug: string
          descricao?: string | null
          ordem?: number
          slides_urls?: string[]
          conteudo?: string | null
          revisado?: boolean
          duracao_estimada_min?: number | null
          publicado?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          curso_id?: string
          titulo?: string
          slug?: string
          descricao?: string | null
          ordem?: number
          slides_urls?: string[]
          conteudo?: string | null
          revisado?: boolean
          duracao_estimada_min?: number | null
          publicado?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      progresso_aulas: {
        Row: {
          id: string
          user_id: string
          aula_id: string
          curso_id: string
          slide_atual: number
          concluida: boolean
          concluida_em: string | null
          atualizado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          aula_id: string
          curso_id: string
          slide_atual?: number
          concluida?: boolean
          concluida_em?: string | null
          atualizado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          aula_id?: string
          curso_id?: string
          slide_atual?: number
          concluida?: boolean
          concluida_em?: string | null
          atualizado_em?: string
        }
      }
      ideias: {
        Row: {
          id: string
          autor_id: string
          titulo: string
          dor: string | null
          lacuna: string | null
          inovacao: string | null
          trilha_id: string | null
          status: 'nova' | 'em_analise' | 'adotada' | 'arquivada'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          autor_id: string
          titulo: string
          dor?: string | null
          lacuna?: string | null
          inovacao?: string | null
          trilha_id?: string | null
          status?: 'nova' | 'em_analise' | 'adotada' | 'arquivada'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          autor_id?: string
          titulo?: string
          dor?: string | null
          lacuna?: string | null
          inovacao?: string | null
          trilha_id?: string | null
          status?: 'nova' | 'em_analise' | 'adotada' | 'arquivada'
          created_at?: string
          updated_at?: string
        }
      }
      ideia_votos: {
        Row: {
          id: string
          ideia_id: string
          profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          ideia_id: string
          profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          ideia_id?: string
          profile_id?: string
          created_at?: string
        }
      }
      ideia_comentarios: {
        Row: {
          id: string
          ideia_id: string
          autor_id: string
          corpo: string
          created_at: string
        }
        Insert: {
          id?: string
          ideia_id: string
          autor_id: string
          corpo: string
          created_at?: string
        }
        Update: {
          id?: string
          ideia_id?: string
          autor_id?: string
          corpo?: string
          created_at?: string
        }
      }
      desafios: {
        Row: {
          id: string
          titulo: string
          subtitulo: string | null
          briefing: string | null
          professor_id: string | null
          turma_alvo: string | null
          ano_letivo: string
          pontos_total: number
          publicado: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          subtitulo?: string | null
          briefing?: string | null
          professor_id?: string | null
          turma_alvo?: string | null
          ano_letivo?: string
          pontos_total?: number
          publicado?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          subtitulo?: string | null
          briefing?: string | null
          professor_id?: string | null
          turma_alvo?: string | null
          ano_letivo?: string
          pontos_total?: number
          publicado?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      desafio_fases: {
        Row: {
          id: string
          desafio_id: string
          ordem: number
          titulo: string
          descricao: string | null
          entregavel_instrucoes: string | null
          pontos_max: number
          semana_sugerida: number | null
        }
        Insert: {
          id?: string
          desafio_id: string
          ordem: number
          titulo: string
          descricao?: string | null
          entregavel_instrucoes?: string | null
          pontos_max?: number
          semana_sugerida?: number | null
        }
        Update: {
          id?: string
          desafio_id?: string
          ordem?: number
          titulo?: string
          descricao?: string | null
          entregavel_instrucoes?: string | null
          pontos_max?: number
          semana_sugerida?: number | null
        }
      }
      desafio_papeis: {
        Row: {
          id: string
          desafio_id: string
          nome: string
          descricao: string | null
        }
        Insert: {
          id?: string
          desafio_id: string
          nome: string
          descricao?: string | null
        }
        Update: {
          id?: string
          desafio_id?: string
          nome?: string
          descricao?: string | null
        }
      }
      equipes: {
        Row: {
          id: string
          desafio_id: string
          nome_empresa: string | null
          ideia_id: string | null
          turma: string | null
          created_at: string
        }
        Insert: {
          id?: string
          desafio_id: string
          nome_empresa?: string | null
          ideia_id?: string | null
          turma?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          desafio_id?: string
          nome_empresa?: string | null
          ideia_id?: string | null
          turma?: string | null
          created_at?: string
        }
      }
      equipe_membros: {
        Row: {
          id: string
          equipe_id: string
          profile_id: string
          papel_id: string | null
        }
        Insert: {
          id?: string
          equipe_id: string
          profile_id: string
          papel_id?: string | null
        }
        Update: {
          id?: string
          equipe_id?: string
          profile_id?: string
          papel_id?: string | null
        }
      }
      entregas: {
        Row: {
          id: string
          equipe_id: string
          fase_id: string
          conteudo: string | null
          arquivo_url: string | null
          link_url: string | null
          dados_estruturados: Record<string, unknown> | null
          status: 'pendente' | 'entregue' | 'avaliada'
          nota: number | null
          feedback_professor: string | null
          enviado_em: string | null
          avaliado_em: string | null
        }
        Insert: {
          id?: string
          equipe_id: string
          fase_id: string
          conteudo?: string | null
          arquivo_url?: string | null
          link_url?: string | null
          dados_estruturados?: Record<string, unknown> | null
          status?: 'pendente' | 'entregue' | 'avaliada'
          nota?: number | null
          feedback_professor?: string | null
          enviado_em?: string | null
          avaliado_em?: string | null
        }
        Update: {
          id?: string
          equipe_id?: string
          fase_id?: string
          conteudo?: string | null
          arquivo_url?: string | null
          link_url?: string | null
          dados_estruturados?: Record<string, unknown> | null
          status?: 'pendente' | 'entregue' | 'avaliada'
          nota?: number | null
          feedback_professor?: string | null
          enviado_em?: string | null
          avaliado_em?: string | null
        }
      }
      biblioteca_categorias: {
        Row: {
          id: string
          nome: string
          ativo: boolean
          criado_em: string
          atualizado_em: string
          atualizado_por: string | null
        }
        Insert: {
          id?: string
          nome: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
        Update: {
          id?: string
          nome?: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
      }
      biblioteca_editoras: {
        Row: {
          id: string
          nome: string
          ativo: boolean
          criado_em: string
          atualizado_em: string
          atualizado_por: string | null
        }
        Insert: {
          id?: string
          nome: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
        Update: {
          id?: string
          nome?: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
      }
      biblioteca_autores: {
        Row: {
          id: string
          nome: string
          ativo: boolean
          criado_em: string
          atualizado_em: string
          atualizado_por: string | null
        }
        Insert: {
          id?: string
          nome: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
        Update: {
          id?: string
          nome?: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
      }
      biblioteca_obras: {
        Row: {
          id: string
          titulo: string
          subtitulo: string | null
          ano_publicacao: number | null
          edicao: string | null
          isbn: string | null
          idioma: string
          numero_paginas: number | null
          sinopse: string | null
          palavras_chave: string[]
          publico_indicado: string | null
          area_conhecimento: string | null
          classificacao_catalogacao: string | null
          situacao: 'ativa' | 'inativa'
          capa_url: string | null
          observacoes_internas: string | null
          editora_id: string | null
          categoria_id: string | null
          criado_em: string
          atualizado_em: string
          atualizado_por: string | null
        }
        Insert: {
          id?: string
          titulo: string
          subtitulo?: string | null
          ano_publicacao?: number | null
          edicao?: string | null
          isbn?: string | null
          idioma?: string
          numero_paginas?: number | null
          sinopse?: string | null
          palavras_chave?: string[]
          publico_indicado?: string | null
          area_conhecimento?: string | null
          classificacao_catalogacao?: string | null
          situacao?: 'ativa' | 'inativa'
          capa_url?: string | null
          observacoes_internas?: string | null
          editora_id?: string | null
          categoria_id?: string | null
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
        Update: {
          id?: string
          titulo?: string
          subtitulo?: string | null
          ano_publicacao?: number | null
          edicao?: string | null
          isbn?: string | null
          idioma?: string
          numero_paginas?: number | null
          sinopse?: string | null
          palavras_chave?: string[]
          publico_indicado?: string | null
          area_conhecimento?: string | null
          classificacao_catalogacao?: string | null
          situacao?: 'ativa' | 'inativa'
          capa_url?: string | null
          observacoes_internas?: string | null
          editora_id?: string | null
          categoria_id?: string | null
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
      }
      biblioteca_obras_autores: {
        Row: {
          id: string
          obra_id: string
          autor_id: string
        }
        Insert: {
          id?: string
          obra_id: string
          autor_id: string
        }
        Update: {
          id?: string
          obra_id?: string
          autor_id?: string
        }
      }
      biblioteca_exemplares: {
        Row: {
          id: string
          obra_id: string
          tombo: string
          codigo_barras: string | null
          situacao: 'disponivel' | 'emprestado' | 'reservado' | 'em_reparo' | 'extraviado' | 'baixado'
          estado_conservacao: 'novo' | 'bom' | 'regular' | 'ruim'
          estante: string | null
          prateleira: string | null
          data_entrada: string
          origem_aquisicao: 'compra' | 'doacao' | 'programa_governo' | 'transferencia'
          valor_referencia: number | null
          consulta_local: boolean
          observacoes: string | null
          criado_em: string
          atualizado_em: string
          atualizado_por: string | null
        }
        Insert: {
          id?: string
          obra_id: string
          tombo: string
          codigo_barras?: string | null
          situacao?: 'disponivel' | 'emprestado' | 'reservado' | 'em_reparo' | 'extraviado' | 'baixado'
          estado_conservacao?: 'novo' | 'bom' | 'regular' | 'ruim'
          estante?: string | null
          prateleira?: string | null
          data_entrada?: string
          origem_aquisicao?: 'compra' | 'doacao' | 'programa_governo' | 'transferencia'
          valor_referencia?: number | null
          consulta_local?: boolean
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
        Update: {
          id?: string
          obra_id?: string
          tombo?: string
          codigo_barras?: string | null
          situacao?: 'disponivel' | 'emprestado' | 'reservado' | 'em_reparo' | 'extraviado' | 'baixado'
          estado_conservacao?: 'novo' | 'bom' | 'regular' | 'ruim'
          estante?: string | null
          prateleira?: string | null
          data_entrada?: string
          origem_aquisicao?: 'compra' | 'doacao' | 'programa_governo' | 'transferencia'
          valor_referencia?: number | null
          consulta_local?: boolean
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
      }
      biblioteca_leitores: {
        Row: {
          id: string
          nome_completo: string
          nome_social: string | null
          tipo_leitor: 'aluno' | 'professor' | 'funcionario' | 'comunidade'
          matricula: string | null
          data_nascimento: string | null
          turma: string | null
          turno: string | null
          ano_escolar: string | null
          telefone: string | null
          email: string | null
          nome_responsavel: string | null
          telefone_responsavel: string | null
          situacao: 'ativo' | 'inativo' | 'bloqueado'
          motivo_bloqueio: string | null
          data_cadastro: string
          observacoes: string | null
          criado_em: string
          atualizado_em: string
          atualizado_por: string | null
        }
        Insert: {
          id?: string
          nome_completo: string
          nome_social?: string | null
          tipo_leitor: 'aluno' | 'professor' | 'funcionario' | 'comunidade'
          matricula?: string | null
          data_nascimento?: string | null
          turma?: string | null
          turno?: string | null
          ano_escolar?: string | null
          telefone?: string | null
          email?: string | null
          nome_responsavel?: string | null
          telefone_responsavel?: string | null
          situacao?: 'ativo' | 'inativo' | 'bloqueado'
          motivo_bloqueio?: string | null
          data_cadastro?: string
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
        Update: {
          id?: string
          nome_completo?: string
          nome_social?: string | null
          tipo_leitor?: 'aluno' | 'professor' | 'funcionario' | 'comunidade'
          matricula?: string | null
          data_nascimento?: string | null
          turma?: string | null
          turno?: string | null
          ano_escolar?: string | null
          telefone?: string | null
          email?: string | null
          nome_responsavel?: string | null
          telefone_responsavel?: string | null
          situacao?: 'ativo' | 'inativo' | 'bloqueado'
          motivo_bloqueio?: string | null
          data_cadastro?: string
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
          atualizado_por?: string | null
        }
      }
      biblioteca_emprestimos: {
        Row: {
          id: string
          exemplar_id: string
          leitor_id: string
          data_emprestimo: string
          data_prevista: string
          data_devolucao: string | null
          renovacoes_feitas: number
          situacao: 'em_andamento' | 'devolvido' | 'devolvido_com_atraso' | 'renovado' | 'perdido'
          registrado_por: string | null
          devolvido_por: string | null
          observacoes: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          exemplar_id: string
          leitor_id: string
          data_emprestimo?: string
          data_prevista: string
          data_devolucao?: string | null
          renovacoes_feitas?: number
          situacao?: 'em_andamento' | 'devolvido' | 'devolvido_com_atraso' | 'renovado' | 'perdido'
          registrado_por?: string | null
          devolvido_por?: string | null
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          exemplar_id?: string
          leitor_id?: string
          data_emprestimo?: string
          data_prevista?: string
          data_devolucao?: string | null
          renovacoes_feitas?: number
          situacao?: 'em_andamento' | 'devolvido' | 'devolvido_com_atraso' | 'renovado' | 'perdido'
          registrado_por?: string | null
          devolvido_por?: string | null
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
        }
      }
      biblioteca_renovacoes: {
        Row: {
          id: string
          emprestimo_id: string
          autorizado_por: string | null
          data_prevista_anterior: string
          nova_data_prevista: string
          criado_em: string
        }
        Insert: {
          id?: string
          emprestimo_id: string
          autorizado_por?: string | null
          data_prevista_anterior: string
          nova_data_prevista: string
          criado_em?: string
        }
        Update: {
          id?: string
          emprestimo_id?: string
          autorizado_por?: string | null
          data_prevista_anterior?: string
          nova_data_prevista?: string
          criado_em?: string
        }
      }
      biblioteca_reservas: {
        Row: {
          id: string
          obra_id: string
          leitor_id: string
          data_reserva: string
          posicao_fila: number
          validade: string
          situacao: 'aguardando' | 'disponivel' | 'atendida' | 'expirada' | 'cancelada'
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          obra_id: string
          leitor_id: string
          data_reserva?: string
          posicao_fila: number
          validade: string
          situacao?: 'aguardando' | 'disponivel' | 'atendida' | 'expirada' | 'cancelada'
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          obra_id?: string
          leitor_id?: string
          data_reserva?: string
          posicao_fila?: number
          validade?: string
          situacao?: 'aguardando' | 'disponivel' | 'atendida' | 'expirada' | 'cancelada'
          criado_em?: string
          atualizado_em?: string
        }
      }
      biblioteca_movimentacoes: {
        Row: {
          id: string
          exemplar_id: string
          situacao_anterior: string | null
          situacao_nova: string
          motivo: string | null
          responsavel_id: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          exemplar_id: string
          situacao_anterior?: string | null
          situacao_nova: string
          motivo?: string | null
          responsavel_id?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          exemplar_id?: string
          situacao_anterior?: string | null
          situacao_nova?: string
          motivo?: string | null
          responsavel_id?: string | null
          criado_em?: string
        }
      }
      biblioteca_configuracoes: {
        Row: {
          id: true
          prazo_dias_aluno: number
          prazo_dias_professor: number
          prazo_dias_funcionario: number
          prazo_dias_comunidade: number
          limite_exemplares_aluno: number
          limite_exemplares_professor: number
          limite_exemplares_funcionario: number
          limite_exemplares_comunidade: number
          max_renovacoes: number
          dias_suspensao_por_atraso: number
          multa_habilitada: boolean
          valor_multa_por_dia: number
          gera_tombo_automatico: boolean
          prefixo_tombo: string
          reserva_habilitada: boolean
          prazo_validade_reserva_dias: number
          consulta_interna_professor_habilitada: boolean
          nome_biblioteca: string
          texto_comprovante: string | null
          observacoes_implantacao: string | null
          atualizado_em: string
          atualizado_por: string | null
        }
        Insert: {
          id?: true
          prazo_dias_aluno?: number
          prazo_dias_professor?: number
          prazo_dias_funcionario?: number
          prazo_dias_comunidade?: number
          limite_exemplares_aluno?: number
          limite_exemplares_professor?: number
          limite_exemplares_funcionario?: number
          limite_exemplares_comunidade?: number
          max_renovacoes?: number
          dias_suspensao_por_atraso?: number
          multa_habilitada?: boolean
          valor_multa_por_dia?: number
          gera_tombo_automatico?: boolean
          prefixo_tombo?: string
          reserva_habilitada?: boolean
          prazo_validade_reserva_dias?: number
          consulta_interna_professor_habilitada?: boolean
          nome_biblioteca?: string
          texto_comprovante?: string | null
          observacoes_implantacao?: string | null
          atualizado_em?: string
          atualizado_por?: string | null
        }
        Update: {
          id?: true
          prazo_dias_aluno?: number
          prazo_dias_professor?: number
          prazo_dias_funcionario?: number
          prazo_dias_comunidade?: number
          limite_exemplares_aluno?: number
          limite_exemplares_professor?: number
          limite_exemplares_funcionario?: number
          limite_exemplares_comunidade?: number
          max_renovacoes?: number
          dias_suspensao_por_atraso?: number
          multa_habilitada?: boolean
          valor_multa_por_dia?: number
          gera_tombo_automatico?: boolean
          prefixo_tombo?: string
          reserva_habilitada?: boolean
          prazo_validade_reserva_dias?: number
          consulta_interna_professor_habilitada?: boolean
          nome_biblioteca?: string
          texto_comprovante?: string | null
          observacoes_implantacao?: string | null
          atualizado_em?: string
          atualizado_por?: string | null
        }
      }
      biblioteca_calendario: {
        Row: {
          id: string
          data: string
          motivo: string
          criado_em: string
          criado_por: string | null
        }
        Insert: {
          id?: string
          data: string
          motivo: string
          criado_em?: string
          criado_por?: string | null
        }
        Update: {
          id?: string
          data?: string
          motivo?: string
          criado_em?: string
          criado_por?: string | null
        }
      }
      biblioteca_auditoria: {
        Row: {
          id: string
          usuario_id: string | null
          acao: string
          tabela_afetada: string
          registro_afetado: string | null
          valor_anterior: Json | null
          valor_novo: Json | null
          criado_em: string
        }
        Insert: {
          id?: string
          usuario_id?: string | null
          acao: string
          tabela_afetada: string
          registro_afetado?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
          criado_em?: string
        }
        Update: {
          id?: string
          usuario_id?: string | null
          acao?: string
          tabela_afetada?: string
          registro_afetado?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
          criado_em?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      ranking_geral_quiz: {
        Args: Record<string, never>
        Returns: {
          user_id: string
          nome_completo: string
          turma: string | null
          pontuacao_total: number
        }[]
      }
    }
    Enums: Record<string, never>
  }
}

export type Noticia = Database['public']['Tables']['noticias']['Row']
export type NoticiaInsert = Database['public']['Tables']['noticias']['Insert']
export type NoticiaUpdate = Database['public']['Tables']['noticias']['Update']

export type PaginaConteudo = Database['public']['Tables']['paginas_conteudo']['Row']
export type PaginaConteudoUpdate = Database['public']['Tables']['paginas_conteudo']['Update']

export type ConfiguracaoSite = Database['public']['Tables']['configuracoes_site']['Row']

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']

export type Quiz = Database['public']['Tables']['quizzes']['Row']
export type QuizInsert = Database['public']['Tables']['quizzes']['Insert']
export type QuizUpdate = Database['public']['Tables']['quizzes']['Update']

export type QuizPergunta = Database['public']['Tables']['quiz_perguntas']['Row']
export type QuizPerguntaInsert = Database['public']['Tables']['quiz_perguntas']['Insert']
export type QuizPerguntaUpdate = Database['public']['Tables']['quiz_perguntas']['Update']

export type QuizParticipante = Database['public']['Tables']['quiz_participantes']['Row']
export type QuizParticipanteInsert = Database['public']['Tables']['quiz_participantes']['Insert']
export type QuizParticipanteUpdate = Database['public']['Tables']['quiz_participantes']['Update']

export type QuizResposta = Database['public']['Tables']['quiz_respostas']['Row']
export type QuizRespostaInsert = Database['public']['Tables']['quiz_respostas']['Insert']

export type Aluno = Database['public']['Tables']['alunos']['Row']
export type AlunoInsert = Database['public']['Tables']['alunos']['Insert']
export type AlunoUpdate = Database['public']['Tables']['alunos']['Update']

export type Trilha = Database['public']['Tables']['trilhas']['Row']

export type PerfilVocacional = Database['public']['Tables']['perfis_vocacionais']['Row']
export type PerfilVocacionalInsert = Database['public']['Tables']['perfis_vocacionais']['Insert']

export type TesteVocacional = Database['public']['Tables']['testes_vocacionais']['Row']
export type TesteVocacionalInsert = Database['public']['Tables']['testes_vocacionais']['Insert']

export type Projeto = Database['public']['Tables']['projetos']['Row']
export type ProjetoInsert = Database['public']['Tables']['projetos']['Insert']
export type ProjetoUpdate = Database['public']['Tables']['projetos']['Update']

export type Curso = Database['public']['Tables']['cursos']['Row']
export type CursoInsert = Database['public']['Tables']['cursos']['Insert']
export type CursoUpdate = Database['public']['Tables']['cursos']['Update']

export type Aula = Database['public']['Tables']['aulas']['Row']
export type AulaInsert = Database['public']['Tables']['aulas']['Insert']
export type AulaUpdate = Database['public']['Tables']['aulas']['Update']

export type ProgressoAula = Database['public']['Tables']['progresso_aulas']['Row']
export type ProgressoAulaInsert = Database['public']['Tables']['progresso_aulas']['Insert']
export type ProgressoAulaUpdate = Database['public']['Tables']['progresso_aulas']['Update']

export type Ideia = Database['public']['Tables']['ideias']['Row']
export type IdeiaInsert = Database['public']['Tables']['ideias']['Insert']
export type IdeiaUpdate = Database['public']['Tables']['ideias']['Update']

export type IdeiaVoto = Database['public']['Tables']['ideia_votos']['Row']
export type IdeiaComentario = Database['public']['Tables']['ideia_comentarios']['Row']
export type IdeiaComentarioInsert = Database['public']['Tables']['ideia_comentarios']['Insert']

export type Desafio = Database['public']['Tables']['desafios']['Row']
export type DesafioInsert = Database['public']['Tables']['desafios']['Insert']
export type DesafioUpdate = Database['public']['Tables']['desafios']['Update']

export type DesafioFase = Database['public']['Tables']['desafio_fases']['Row']
export type DesafioFaseInsert = Database['public']['Tables']['desafio_fases']['Insert']

export type DesafioPapel = Database['public']['Tables']['desafio_papeis']['Row']
export type DesafioPapelInsert = Database['public']['Tables']['desafio_papeis']['Insert']

export type Equipe = Database['public']['Tables']['equipes']['Row']
export type EquipeInsert = Database['public']['Tables']['equipes']['Insert']

export type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row']
export type EquipeMembroInsert = Database['public']['Tables']['equipe_membros']['Insert']

export type Entrega = Database['public']['Tables']['entregas']['Row']
export type EntregaInsert = Database['public']['Tables']['entregas']['Insert']
export type EntregaUpdate = Database['public']['Tables']['entregas']['Update']

// Profile
export interface Profile {
  id: string
  nome_completo: string
  role: 'aluno' | 'aluno_fundamental' | 'monitor' | 'professor' | 'bibliotecario' | 'diretora' | 'vice_diretora' | 'admin'
  turma: string | null
  disciplina: string | null
  aprovado: boolean
  email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Pergunta da prova final de um curso (resposta_correta só via service role;
// o aluno recebe as perguntas pela rota de servidor, já sem o gabarito).
export interface CursoProvaPergunta {
  id: string
  curso_id: string
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  resposta_correta: 'a' | 'b' | 'c' | 'd'
  ordem: number
  created_at: string
}

// Certificado de conclusão de curso. Os campos de texto são um retrato do
// momento da emissão: renomear o curso depois não muda certificados antigos.
export interface Certificado {
  id: string
  codigo: string
  user_id: string
  curso_id: string
  aluno_nome: string
  curso_titulo: string
  autor_nome: string | null
  carga_horaria: number
  nota: number
  emitido_em: string
}

// Desafio de aula/curso do módulo Cursos (gabarito só via service role).
// Não confundir com Desafio (motor de desafios em fases da Fábrica de Ideias).
export interface CursoDesafio {
  id: string
  curso_id: string
  aula_id: string | null
  titulo: string
  enunciado: string
  tipo: 'quiz' | 'pratico' | 'dissertativo'
  gabarito: string | null
  ordem: number
  created_at: string
}

// Identidade (CPF e dados de recuperação, 1:1 com auth.users, leitura só do dono ou service role)
export interface Identidade {
  user_id: string
  cpf: string
  data_nascimento: string | null
  email_alternativo: string | null
  criado_via: 'auto_aluno' | 'auto_professor' | 'direcao' | 'gestao' | 'convite_bibliotecario'
  criado_em: string
}

// Convite de acesso (hoje so bibliotecario), com token de aceite unico
export interface ConviteUsuario {
  id: string
  nome: string
  email: string
  papel: 'bibliotecario'
  token: string
  criado_por: string | null
  criado_em: string
  expira_em: string
  aceito_em: string | null
  usuario_id: string | null
  revogado_em: string | null
}

// Biblioteca
export type BibliotecaCategoria = Database['public']['Tables']['biblioteca_categorias']['Row']
export type BibliotecaCategoriaInsert = Database['public']['Tables']['biblioteca_categorias']['Insert']
export type BibliotecaCategoriaUpdate = Database['public']['Tables']['biblioteca_categorias']['Update']

export type BibliotecaEditora = Database['public']['Tables']['biblioteca_editoras']['Row']
export type BibliotecaEditoraInsert = Database['public']['Tables']['biblioteca_editoras']['Insert']
export type BibliotecaEditoraUpdate = Database['public']['Tables']['biblioteca_editoras']['Update']

export type BibliotecaAutor = Database['public']['Tables']['biblioteca_autores']['Row']
export type BibliotecaAutorInsert = Database['public']['Tables']['biblioteca_autores']['Insert']
export type BibliotecaAutorUpdate = Database['public']['Tables']['biblioteca_autores']['Update']

export type BibliotecaObra = Database['public']['Tables']['biblioteca_obras']['Row']
export type BibliotecaObraInsert = Database['public']['Tables']['biblioteca_obras']['Insert']
export type BibliotecaObraUpdate = Database['public']['Tables']['biblioteca_obras']['Update']

export type BibliotecaObraAutor = Database['public']['Tables']['biblioteca_obras_autores']['Row']
export type BibliotecaObraAutorInsert = Database['public']['Tables']['biblioteca_obras_autores']['Insert']

export type BibliotecaExemplar = Database['public']['Tables']['biblioteca_exemplares']['Row']
export type BibliotecaExemplarInsert = Database['public']['Tables']['biblioteca_exemplares']['Insert']
export type BibliotecaExemplarUpdate = Database['public']['Tables']['biblioteca_exemplares']['Update']

export type BibliotecaLeitor = Database['public']['Tables']['biblioteca_leitores']['Row']
export type BibliotecaLeitorInsert = Database['public']['Tables']['biblioteca_leitores']['Insert']
export type BibliotecaLeitorUpdate = Database['public']['Tables']['biblioteca_leitores']['Update']

export type BibliotecaEmprestimo = Database['public']['Tables']['biblioteca_emprestimos']['Row']
export type BibliotecaEmprestimoInsert = Database['public']['Tables']['biblioteca_emprestimos']['Insert']
export type BibliotecaEmprestimoUpdate = Database['public']['Tables']['biblioteca_emprestimos']['Update']

export type BibliotecaRenovacao = Database['public']['Tables']['biblioteca_renovacoes']['Row']
export type BibliotecaRenovacaoInsert = Database['public']['Tables']['biblioteca_renovacoes']['Insert']

export type BibliotecaReserva = Database['public']['Tables']['biblioteca_reservas']['Row']
export type BibliotecaReservaInsert = Database['public']['Tables']['biblioteca_reservas']['Insert']
export type BibliotecaReservaUpdate = Database['public']['Tables']['biblioteca_reservas']['Update']

export type BibliotecaMovimentacao = Database['public']['Tables']['biblioteca_movimentacoes']['Row']
export type BibliotecaMovimentacaoInsert = Database['public']['Tables']['biblioteca_movimentacoes']['Insert']

export type BibliotecaConfiguracoes = Database['public']['Tables']['biblioteca_configuracoes']['Row']
export type BibliotecaConfiguracoesUpdate = Database['public']['Tables']['biblioteca_configuracoes']['Update']

export type BibliotecaCalendario = Database['public']['Tables']['biblioteca_calendario']['Row']
export type BibliotecaCalendarioInsert = Database['public']['Tables']['biblioteca_calendario']['Insert']

export type BibliotecaAuditoria = Database['public']['Tables']['biblioteca_auditoria']['Row']
export type BibliotecaAuditoriaInsert = Database['public']['Tables']['biblioteca_auditoria']['Insert']

// Log de atividades (auditoria, leitura só gestão)
export interface LogAtividade {
  id: string
  user_id: string | null
  acao: string
  detalhes: Record<string, unknown> | null
  ip: string | null
  criado_em: string
}
