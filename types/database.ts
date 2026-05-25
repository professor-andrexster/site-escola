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
