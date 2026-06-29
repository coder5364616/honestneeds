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
  // network fetch. The logo is a 1024×1024 PNG (colourful badge on white).
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
          justifyContent: 'center',
          // White matches the logo's own background so the square badge blends
          // into the landscape frame — no black/blank bars.
          background: '#FFFFFF',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={610}
          height={610}
          alt="Honest Need"
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size }
  )
}
