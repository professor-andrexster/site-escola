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
          created_at: string
          updated_at: string
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
          created_at?: string
          updated_at?: string
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
          created_at?: string
          updated_at?: string
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
  role: 'aluno' | 'monitor' | 'professor' | 'direcao'
  turma: string | null
  disciplina: string | null
  aprovado: boolean
  email: string | null
  created_at: string
  updated_at: string
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

// Identidade (CPF + dados de recuperação, 1:1 com auth.users — leitura só do dono ou service role)
export interface Identidade {
  user_id: string
  cpf: string
  data_nascimento: string | null
  email_alternativo: string | null
  criado_via: 'auto_aluno' | 'auto_professor' | 'direcao'
  criado_em: string
}

// Log de atividades (auditoria — leitura só direção)
export interface LogAtividade {
  id: string
  user_id: string | null
  acao: string
  detalhes: Record<string, unknown> | null
  ip: string | null
  criado_em: string
}
