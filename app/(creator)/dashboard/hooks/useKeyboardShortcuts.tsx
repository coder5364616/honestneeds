'use client'

import { useEffect, useCallback, useRef, useState } from 'react'

/**
 * Keyboard shortcut handler type
 */
export type KeyboardShortcutHandler = (event: KeyboardEvent) => void

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  handler: KeyboardShortcutHandler
  description?: string
}

/**
 * Hook for managing keyboard shortcuts
 *
 * Usage:
 * useKeyboardShortcuts([
 *   {
 *     key: 'e',
 *     handler: () => setEditMode(true),
 *     description: 'Edit selected campaign'
 *   },
 *   {
 *     key: 's',
 *     ctrlKey: true,
 *     handler: () => saveForm(),
 *     description: 'Save form'
 *   }
 * ])
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const shortcutsRef = useRef(shortcuts)

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in input/textarea
      const targetElement = event.target as HTMLElement
      if (
        targetElement.tagName === 'INPUT' ||
        targetElement.tagName === 'TEXTAREA' ||
        (targetElement as HTMLElement).contentEditable === 'true'
      ) {
        return
      }

      // Check against all registered shortcuts
      for (const shortcut of shortcutsRef.current) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : true
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : true
        const altMatches = shortcut.altKey ? event.altKey : true

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault()
          shortcut.handler(event)
          break
        }
      }
    },
    [enabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

/**
 * Pre-defined keyboard shortcuts for dashboard
 */
export const DASHBOARD_SHORTCUTS = {
  SEARCH: { key: '/', description: 'Focus search' },
  EDIT: { key: 'e', description: 'Edit selected campaign' },
  PAUSE: { key: 'p', description: 'Pause selected campaign' },
  DELETE: { key: 'd', description: 'Delete selected campaign' },
  VIEW: { key: 'v', description: 'View selected campaign' },
  CLEAR_SELECTION: { key: 'Escape', description: 'Clear selection' },
  HELP: { key: '?', description: 'Show keyboard shortcuts help' },
  SELECT_ALL: { key: 'a', ctrlKey: true, description: 'Select all campaigns' },
  SAVE_VIEW: { key: 's', ctrlKey: true, description: 'Save current view' },
} as const

/**
 * Component to display keyboard shortcuts help
 */
export const KeyboardShortcutsHelp = ({ shortcuts }: { shortcuts: KeyboardShortcut[] }) => {
  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginTop: 0 }}>Keyboard Shortcuts</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}
      >
        <tbody>
          {shortcuts
            .filter((s) => s.description)
            .map((shortcut) => {
              let keyDisplay = shortcut.key.toUpperCase()
              if (shortcut.ctrlKey) {
                keyDisplay = `Ctrl+${keyDisplay}`
              }
              if (shortcut.shiftKey) {
                keyDisplay = `Shift+${keyDisplay}`
              }
              if (shortcut.altKey) {
                keyDisplay = `Alt+${keyDisplay}`
              }

              return (
                <tr
                  key={shortcut.description}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    padding: '8px',
                  }}
                >
                  <td style={{ padding: '8px', textAlign: 'left' }}>
                    <kbd
                      style={{
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                      }}
                    >
                      {keyDisplay}
                    </kbd>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'left' }}>
                    {shortcut.description}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Hook to manage keyboard shortcuts with help display
 */
export function useKeyboardShortcutsWithHelp(shortcuts: KeyboardShortcut[], enabled = true) {
  const [showHelp, setShowHelp] = useState<boolean>(false)
  
  useKeyboardShortcuts(shortcuts, enabled)

  return { showHelp, setShowHelp }
}
