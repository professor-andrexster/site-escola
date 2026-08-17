/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empacota o servidor com só o que ele usa, num diretório que roda sozinho
  // (`node server.js`). É o formato que o systemd espera e o mesmo padrão dos
  // outros dois serviços Next deste VPS.
  //
  // Sem isto, publicar significaria copiar 1,2 GB de node_modules para dentro
  // de /srv/escola/app a cada deploy; com isto, são ~50 MB.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yxtjkorchxcjkfnbekrs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
}

module.exports = nextConfig
