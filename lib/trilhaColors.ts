// Tailwind classes precisam existir como strings literais no código para o JIT
// gerar o CSS. Como `cor_tailwind` vem do banco (ex: "blue-600"), mapeamos
// para classes completas aqui em vez de interpolar a string diretamente.

const BG: Record<string, string> = {
  'green-600': 'bg-green-600',
  'orange-600': 'bg-orange-600',
  'gray-600': 'bg-gray-600',
  'pink-600': 'bg-pink-600',
  'blue-600': 'bg-blue-600',
  'yellow-400': 'bg-yellow-400',
}

const BG_LIGHT: Record<string, string> = {
  'green-600': 'bg-green-50',
  'orange-600': 'bg-orange-50',
  'gray-600': 'bg-gray-100',
  'pink-600': 'bg-pink-50',
  'blue-600': 'bg-blue-50',
  'yellow-400': 'bg-yellow-50',
}

const TEXT: Record<string, string> = {
  'green-600': 'text-green-600',
  'orange-600': 'text-orange-600',
  'gray-600': 'text-gray-600',
  'pink-600': 'text-pink-600',
  'blue-600': 'text-blue-600',
  'yellow-400': 'text-yellow-600',
}

const BORDER: Record<string, string> = {
  'green-600': 'border-green-200',
  'orange-600': 'border-orange-200',
  'gray-600': 'border-gray-200',
  'pink-600': 'border-pink-200',
  'blue-600': 'border-blue-200',
  'yellow-400': 'border-yellow-200',
}

const FALLBACK = 'gray-600'

export function trilhaBg(cor: string | null | undefined): string {
  return BG[cor ?? ''] ?? BG[FALLBACK]
}

export function trilhaBgLight(cor: string | null | undefined): string {
  return BG_LIGHT[cor ?? ''] ?? BG_LIGHT[FALLBACK]
}

export function trilhaText(cor: string | null | undefined): string {
  return TEXT[cor ?? ''] ?? TEXT[FALLBACK]
}

export function trilhaBorder(cor: string | null | undefined): string {
  return BORDER[cor ?? ''] ?? BORDER[FALLBACK]
}
