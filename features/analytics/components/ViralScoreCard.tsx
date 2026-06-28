'use client'

/** AN-09 — AI Viral Score Predictor card (embeddable in campaign analytics). */

import { useViralScore } from '@/api/hooks/useAdvancedAnalytics'
import {
  SectionTitle,
  Card,
  Grid,
  Row,
  Muted,
  Empty,
  BarList,
  ScoreGauge,
  Spinner,
} from '@/features/analytics/ui'

export default function ViralScoreCard({ campaignId }: { campaignId: string | undefined }) {
  const { data, isLoading, isError } = useViralScore(campaignId)

  if (isLoading) return <Card><Spinner /></Card>
  if (isError) return <Card><Empty>Could not compute viral score.</Empty></Card>
  if (!data) return null

  return (
    <Card>
      <SectionTitle style={{ fontSize: '1.1rem' }}>AI Viral Score</SectionTitle>
      <Grid $min="240px">
        <Row $gap={4} style={{ justifyContent: 'center' }}>
          <ScoreGauge score={data.viral_score} rating={data.rating} />
        </Row>
        <div>
          <Muted style={{ marginBottom: 10, fontWeight: 600 }}>What drives this score</Muted>
          <BarList
            items={data.factor_breakdown.map((f) => ({
              label: f.factor,
              value: f.score,
              display: `${f.score}/100`,
            }))}
          />
        </div>
      </Grid>

      <SectionTitle style={{ fontSize: '1rem', marginTop: 20 }}>Recommendations</SectionTitle>
      <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', lineHeight: 1.7 }}>
        {data.recommendations.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      <Row $gap={4} $wrap style={{ marginTop: 16 }}>
        <Muted>Viral coefficient: <strong>{data.signals.viral_coefficient}</strong></Muted>
        <Muted>Shares/day: <strong>{data.signals.shares_per_day}</strong></Muted>
        <Muted>Referral conv.: <strong>{data.signals.referral_conversion_rate}%</strong></Muted>
        <Muted>Age: <strong>{data.signals.age_days}d</strong></Muted>
      </Row>
    </Card>
  )
}
