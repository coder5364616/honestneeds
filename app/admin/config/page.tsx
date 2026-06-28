'use client'

import { useState } from 'react'
import { useAdminConfig, useUpdateConfig } from '@/api/hooks/useAdmin'
import { adminService } from '@/api/services/adminService'
import { toast } from 'react-toastify'
import { PageHeader, Loading, ErrorBlock, adminStyles as s } from '../_components/ui'

const LABELS: Record<string, string> = {
  platform_general: 'General',
  moderation_rules: 'Moderation Rules',
  payment_config: 'Payment Configuration',
  notification_settings: 'Notification Settings',
  email_templates: 'Email Templates',
  feature_flags: 'Feature Flags',
}

export default function ConfigPage() {
  const { data, isLoading, isError } = useAdminConfig()

  return (
    <div className={s.page}>
      <PageHeader title="Platform Configuration" subtitle="Manage platform-wide settings and feature flags" />
      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load configuration." />}
      {data && Object.entries(data).map(([key, value]) => (
        <ConfigCard key={key} settingKey={key} value={value} />
      ))}
      <BroadcastComposer />
    </div>
  )
}

function ConfigCard({ settingKey, value }: { settingKey: string; value: Record<string, unknown> }) {
  const [text, setText] = useState(JSON.stringify(value ?? {}, null, 2))
  const [err, setErr] = useState('')
  const update = useUpdateConfig()

  const save = () => {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text)
    } catch {
      setErr('Invalid JSON — please fix and try again.')
      return
    }
    setErr('')
    update.mutate({ key: settingKey, value: parsed })
  }

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>{LABELS[settingKey] || settingKey}</h2>
      {err && <div className={s.error}>{err}</div>}
      <textarea
        className={s.textarea}
        style={{ minHeight: 160, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className={s.modalActions}>
        <button className={`${s.btn} ${s.btnPrimary}`} disabled={update.isPending} onClick={save}>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function BroadcastComposer() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('announcement')
  const [priority, setPriority] = useState('normal')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }
    setSending(true)
    try {
      await adminService.createBroadcast({ title, message, type, priority })
      toast.success('Broadcast created')
      setTitle(''); setMessage('')
    } catch {
      toast.error('Failed to create broadcast')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>New Broadcast Notification</h2>
      <div className={s.toolbar}>
        <input className={s.input} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className={s.select} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="announcement">Announcement</option><option value="alert">Alert</option><option value="system">System</option><option value="warning">Warning</option><option value="info">Info</option>
        </select>
        <select className={s.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
      </div>
      <textarea className={s.textarea} placeholder="Message…" value={message} onChange={(e) => setMessage(e.target.value)} />
      <div className={s.modalActions}>
        <button className={`${s.btn} ${s.btnPrimary}`} disabled={sending} onClick={send}>{sending ? 'Sending…' : 'Create broadcast'}</button>
      </div>
    </div>
  )
}
