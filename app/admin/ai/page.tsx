'use client'

import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useAIOverview, useAITimeseries, useAILogs, useAIFeatures } from '@/api/hooks/useAdmin'
import type { AIGenerationLogEntry } from '@/api/services/adminService'
import { PageHeader, Stat, Loading, ErrorBlock, Empty, Badge, Pagination, adminStyles as s } from '../_components/ui'
import { fmtNum, fmtDateTime } from '../_lib/format'

const WINDOWS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
]

export default function AIPage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, isError } = useAIOverview(days)
  const { data: ts } = useAITimeseries(days)

  const trendChart = (ts || []).map((d) => ({ date: d.date, Calls: d.calls, Failed: d.failedCalls }))

  return (
    <div className={s.page}>
      <PageHeader
        title="AI Subsystem"
        subtitle="Provider status, usage, cost and generation log across AI-01..AI-12"
        actions={
          <select className={s.select} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {WINDOWS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        }
      />

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load AI overview." />}

      {data && (
        <>
          <div className={s.statGrid}>
            <Stat
              accent
              label="Provider"
              value={data.provider.name.charAt(0).toUpperCase() + data.provider.name.slice(1)}
              sub={data.provider.enabled ? `Enabled · ${data.provider.model}` : 'Disabled — no API key configured'}
            />
            <Stat
              label="Total Calls"
              value={fmtNum(data.summary.totalCalls)}
              sub={`${(data.summary.successRate * 100).toFixed(1)}% success · ${fmtNum(data.summary.failedCalls)} failed`}
            />
            <Stat
              label="Tokens Used"
              value={fmtNum(data.summary.totalTokens)}
              sub={`${fmtNum(data.summary.inputTokens)} in · ${fmtNum(data.summary.outputTokens)} out`}
            />
            <Stat
              label="Avg Latency"
              value={`${fmtNum(data.summary.avgLatencyMs)} ms`}
              sub={`Fast model: ${data.provider.fastModel}`}
            />
          </div>

          <div className={s.split}>
            <div className={s.card}>
              <h2 className={s.sectionTitle}>Call Volume ({days}d)</h2>
              {trendChart.length === 0 ? <Empty text="No AI calls in this window." /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trendChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="Calls" fill="#1A5FA8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Failed" fill="#C0392B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className={s.card}>
              <h2 className={s.sectionTitle}>Effort & Thresholds</h2>
              {Object.entries(data.config.effort).map(([k, v]) => (
                <div className={s.defRow} key={k}>
                  <span className={s.defKey}>{k} effort</span>
                  <span className={s.defVal}>{v}</span>
                </div>
              ))}
              <div className={s.defRow}><span className={s.defKey}>Fraud review threshold</span><span className={s.defVal}>{data.config.fraudReviewThreshold}</span></div>
              <div className={s.defRow}><span className={s.defKey}>Moderation block / warn</span><span className={s.defVal}>{data.config.moderationBlockThreshold} / {data.config.moderationWarnThreshold}</span></div>
              <div className={s.defRow}><span className={s.defKey}>Rate limit</span><span className={s.defVal}>{data.config.rateLimit.maxRequests} / {Math.round(data.config.rateLimit.windowMs / 1000)}s</span></div>
            </div>
          </div>

          <div className={s.card}>
            <h2 className={s.sectionTitle}>Usage by Feature</h2>
            {data.byFeature.length === 0 ? <Empty text="No AI feature usage yet." /> : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr><th>Feature</th><th>Calls</th><th>Success Rate</th><th>Tokens</th><th>Avg Latency</th></tr>
                  </thead>
                  <tbody>
                    {data.byFeature.map((f) => (
                      <tr key={f.feature}>
                        <td><span className={s.mono}>{f.feature}</span></td>
                        <td>{fmtNum(f.calls)}</td>
                        <td>{(f.successRate * 100).toFixed(1)}%</td>
                        <td>{fmtNum(f.totalTokens)}</td>
                        <td>{fmtNum(f.avgLatencyMs)} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <GenerationLog />
    </div>
  )
}

function GenerationLog() {
  const [feature, setFeature] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)

  const { data: features } = useAIFeatures()
  const { data, isLoading, isError } = useAILogs({ feature, success, page, limit: 20 })

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>Generation Log</h2>

      <div className={s.toolbar}>
        <select className={s.select} value={feature} onChange={(e) => { setFeature(e.target.value); setPage(1) }}>
          <option value="">All features</option>
          {(features || []).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select className={s.select} value={success} onChange={(e) => { setSuccess(e.target.value); setPage(1) }}>
          <option value="">All outcomes</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load generation log." />}

      {data && (data.logs.length === 0 ? <Empty text="No generations match." /> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>When</th><th>Feature</th><th>Model</th><th>Kind</th><th>Tokens</th><th>Latency</th><th>User</th><th>Outcome</th></tr></thead>
              <tbody>
                {data.logs.map((l: AIGenerationLogEntry) => (
                  <tr key={l._id}>
                    <td className={s.muted}>{fmtDateTime(l.created_at)}</td>
                    <td><span className={s.mono}>{l.feature}</span></td>
                    <td className={s.muted}>{l.model || '—'}</td>
                    <td className={s.muted}>{l.kind}</td>
                    <td>{fmtNum(l.input_tokens + l.output_tokens)}</td>
                    <td>{fmtNum(l.latency_ms)} ms</td>
                    <td className={s.muted}>{l.user_id?.display_name || '—'}</td>
                    <td>
                      <Badge status={l.success ? 'success' : 'failed'} label={l.success ? 'Success' : (l.error || 'Failed')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
        </>
      ))}
    </div>
  )
}
