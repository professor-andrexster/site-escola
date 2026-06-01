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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
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

// Profile
export interface Profile {
  id: string
  nome_completo: string
  role: 'aluno' | 'professor' | 'direcao'
  turma: string | null
  disciplina: string | null
  aprovado: boolean
  created_at: string
  updated_at: string
}
