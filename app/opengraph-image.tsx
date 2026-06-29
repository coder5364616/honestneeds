import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Route segment config — generated at build/request time on the Node runtime
// so we can read the logo file off disk.
export const runtime = 'nodejs'

export const alt = 'Honest Need — Help a Neighbor. Change a Life.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  // Embed the brand logo as a data URI so Satori can render it without a
  // network fetch. The logo is a 1024×1024 PNG in /public.
  const logoData = await readFile(join(process.cwd(), 'public', 'honest-need-logo.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          // On-brand emerald gradient fills the whole canvas — no black bars.
          background: 'linear-gradient(135deg, #064E3B 0%, #059669 55%, #34D399 100%)',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo in a soft white card so the colourful badge pops on the gradient */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 360,
            height: 360,
            borderRadius: 48,
            background: '#FFFFFF',
            boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={300} height={300} alt="Honest Need" style={{ borderRadius: 32 }} />
        </div>

        {/* Title + tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 56,
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', fontSize: 74, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.05 }}>
            Honest Need
          </div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, color: '#D1FAE5', marginTop: 18 }}>
            Help a Neighbor. Change a Life.
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.82)', marginTop: 22, maxWidth: 620, lineHeight: 1.4 }}>
            Community crowdfunding & peer-support — create a need, share it, and let people help directly.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
