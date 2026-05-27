import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1a3a5c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Faixa vermelha no topo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#c0392b',
          }}
        />

        {/* Letras JB */}
        <div
          style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}
        >
          JB
        </div>
      </div>
    ),
    { ...size }
  )
}
