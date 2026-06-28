/**
 * Reserved Budget Widget Component
 * 
 * Compact widget that shows:
 * - Amount locked in campaigns
 * - Quick summary status
 * - Link to detailed breakdown
 * 
 * Can be integrated into different pages (dashboard, settings, etc.)
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface WidgetData {
  reserved_dollars: string;
  reserved_cents: number;
  active_campaigns_count: number;
  available_dollars: string;
  available_cents: number;
  can_request_payout: boolean;
}

interface Props {
  className?: string;
  compact?: boolean;
  showLink?: boolean;
  onDataFetch?: (data: WidgetData) => void;
}

export default function ReservedBudgetWidget({
  className = '',
  compact = false,
  showLink = true,
  onDataFetch,
}: Props) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data && onDataFetch) {
      onDataFetch(data);
    }
  }, [data, onDataFetch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/creator/balance/breakdown');
      const json = response.data;
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching reserved budget:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${compact ? 'h-20' : 'h-32'} ${className}`}></div>
    );
  }

  if (error || !data) {
    return null; // Silently fail for widget to not disrupt page
  }

  // Don't show widget if no reserved funds
  if (data.reserved_cents === 0) {
    return null;
  }

  if (compact) {
    // Compact version - single row
    return (
      <div
        className={`bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-medium text-amber-900">
            ${data.reserved_dollars} locked in {data.active_campaigns_count} campaign{data.active_campaigns_count !== 1 ? 's' : ''}
          </span>
        </div>
        {showLink && (
          <Link
            href="/wallet"
            className="text-xs text-amber-700 hover:text-amber-900 font-medium whitespace-nowrap"
          >
            Learn more →
          </Link>
        )}
      </div>
    );
  }

  // Full version - card layout
  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
          <Lock className="h-5 w-5 text-amber-700" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">Funds Locked in Campaigns</h3>
          <p className="text-2xl font-bold text-amber-900 mt-1">${data.reserved_dollars}</p>

          <p className="text-sm text-amber-800 mt-2">
            {data.active_campaigns_count} active campaign{data.active_campaigns_count !== 1 ? 's' : ''} • 
            ${data.available_dollars} available to spend on rewards
          </p>

          {showLink && (
            <Link
              href="/wallet"
              className="inline-block text-sm font-medium text-amber-700 hover:text-amber-900 mt-3"
            >
              View detailed breakdown →
            </Link>
          )}
        </div>
      </div>

      <div className="bg-amber-100 rounded-md p-3 mt-4">
        <p className="text-xs text-amber-900">
          <strong>💡 Tip:</strong> Money gets locked when you activate a sharing campaign. 
          It's used to reward supporters. Locked funds become available when campaigns end.
        </p>
      </div>
    </div>
  );
}
