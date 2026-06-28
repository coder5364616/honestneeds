import { Suspense } from 'react'
import type { Metadata } from 'next'
import CampaignDetailClient from './CampaignDetailClient'

// Server-side base URLs. NEXT_PUBLIC_* env vars are inlined at build and are
// also readable on the server, which is what we need for generateMetadata
// (runs on the server / at the edge, never in the browser).
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.honestneed.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`
// Origin that serves uploaded assets (legacy relative image paths like
// "uploads/abc.jpg" come from the backend, not the marketing site).
const ASSET_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_URL || API_URL.replace(/\/api\/?$/, '')

type CampaignMeta = {
  title?: string
  description?: string
  full_description?: string
  image_url?: string
  image?: { url?: string }
  video?: { thumbnail_url?: string }
  creator_name?: string
  need_type?: string
  category?: string
  status?: string
}

/**
 * Fetch just enough of the campaign to build social-preview metadata.
 * The campaign GET endpoint is public and accepts either the Mongo _id or the
 * human campaign_id, so a shared deep link of either form resolves here.
 * Network/parse failures fall back to null so we degrade to site-wide defaults
 * rather than throwing during metadata generation.
 */
async function fetchCampaignMeta(id: string): Promise<CampaignMeta | null> {
  try {
    const res = await fetch(`${API_URL}/campaigns/${encodeURIComponent(id)}`, {
      // Cache the preview payload briefly so crawler re-hits don't hammer the
      // API, while still picking up edited titles/images within a minute.
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return (json?.data as CampaignMeta) || null
  } catch {
    return null
  }
}

/** Open Graph requires absolute image URLs; Cloudinary URLs already are. */
function absoluteImage(url?: string | null): string {
  if (!url) return DEFAULT_OG_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // Root-absolute and legacy relative upload paths are served by the backend.
  const path = url.startsWith('/') ? url : `/${url}`
  return `${ASSET_ORIGIN}${path}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const campaign = await fetchCampaignMeta(id)
  const canonical = `${SITE_URL}/campaigns/${id}`

  if (!campaign) {
    // Unknown / removed campaign — keep it shareable but generic, and don't let
    // crawlers index a dead deep link.
    return {
      title: 'Campaign',
      description: 'Discover and support community campaigns on Honest Need.',
      alternates: { canonical },
      robots: { index: false, follow: true },
      openGraph: {
        type: 'website',
        url: canonical,
        siteName: 'Honest Need',
        title: 'Campaign | Honest Need',
        description: 'Discover and support community campaigns on Honest Need.',
        images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Honest Need' }],
      },
      twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE] },
    }
  }

  const title = campaign.title || 'Campaign'
  const rawDescription =
    campaign.description || campaign.full_description || 'Help support this campaign on Honest Need.'
  // OG descriptions get truncated by most scrapers around ~200 chars; trim
  // cleanly and strip newlines so the preview reads as a single blurb.
  const description = rawDescription.replace(/\s+/g, ' ').trim().slice(0, 200)

  const previewImage = absoluteImage(
    campaign.image_url || campaign.image?.url || campaign.video?.thumbnail_url,
  )

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      siteName: 'Honest Need',
      title,
      description,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImage],
    },
  }
}

export default function CampaignDetailPage() {
  // The interactive campaign UI reads the route param + search params itself
  // (useParams / useSearchParams), so it must live under a Suspense boundary
  // now that the page shell is a server component.
  return (
    <Suspense fallback={null}>
      <CampaignDetailClient />
    </Suspense>
  )
}
