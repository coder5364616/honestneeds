/**
 * Creator Balance Breakdown Component
 * 
 * Displays creator's earnings with clear breakdown of:
 * - Available balance (can withdraw)
 * - Reserved/Locked balance (in active campaigns)
 * - Per-campaign breakdown with timelines
 * 
 * This component helps creators understand why they can't withdraw
 * certain funds and when they will become available
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Lock, TrendingUp, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Campaign {
  campaign_id: string;
  campaign_title: string;
  reserved_cents: number;
  reserved_dollars: string;
  days_remaining: number;
  campaign_end_date: string;
}

interface BalanceBreakdownData {
  success: boolean;
  data: {
    total_earned_cents: number;
    total_earned_dollars: string;
    available_cents: number;
    available_dollars: string;
    reserved_cents: number;
    reserved_dollars: string;
    can_request_payout: boolean;
    minimum_payout_cents: number;
    reserved_by_campaign: Campaign[];
    active_campaigns_count: number;
    summary: string;
  };
}

export default function CreatorBalanceBreakdown() {
  const [breakdown, setBreakdown] = useState<BalanceBreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalanceBreakdown();
  }, []);

  const fetchBalanceBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/creator/balance/breakdown');
      setBreakdown(response.data);
    } catch (err) {
      console.error('Error fetching balance breakdown:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Error loading balance</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button
            onClick={fetchBalanceBreakdown}
            className="text-sm text-red-700 underline mt-2 hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!breakdown?.data) {
    return null;
  }

  const data = breakdown.data;

  return (
    <div className="space-y-6">
      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Balance Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-green-700 font-medium">Available for Withdrawal</p>
              <h3 className="text-3xl font-bold text-green-900 mt-1">
                ${data.available_dollars}
              </h3>
            </div>
            <div className="bg-green-200 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
          </div>
          
          <Link
            href="/wallet"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded mt-2 transition"
          >
            View earnings
          </Link>
        </div>

        {/* Reserved Balance Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-amber-700 font-medium">Locked in Campaigns</p>
              <h3 className="text-3xl font-bold text-amber-900 mt-1">
                ${data.reserved_dollars}
              </h3>
            </div>
            <div className="bg-amber-200 rounded-full p-3">
              <Lock className="h-6 w-6 text-amber-700" />
            </div>
          </div>
          
          <p className="text-sm text-amber-700 mt-2">
            {data.active_campaigns_count} active {data.active_campaigns_count === 1 ? 'campaign' : 'campaigns'}
          </p>
        </div>
      </div>

      {/* Total Earned */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900">Total Earned (Lifetime)</h4>
        <p className="text-2xl font-bold text-blue-900 mt-2">${data.total_earned_dollars}</p>
      </div>

      {/* Summary Message */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <p className="text-sm text-slate-700">{data.summary}</p>
      </div>

      {/* Reserved by Campaign Breakdown */}
      {data.reserved_by_campaign.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-slate-50 border-b px-4 py-3">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Reserved by Campaign
            </h4>
          </div>

          <div className="divide-y">
            {data.reserved_by_campaign.map((campaign, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-slate-900">{campaign.campaign_title}</h5>
                    <p className="text-xs text-slate-500">ID: {campaign.campaign_id}</p>
                  </div>
                  <span className="text-lg font-bold text-amber-600">
                    ${campaign.reserved_dollars}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
                  <Calendar className="h-4 w-4" />
                  {campaign.days_remaining > 0 ? (
                    <>
                      Available in <strong>{campaign.days_remaining}</strong> day{campaign.days_remaining !== 1 ? 's' : ''}
                    </>
                  ) : (
                    <span className="text-green-600 font-medium">Available now</span>
                  )}
                </div>

                {campaign.days_remaining > 0 && (
                  <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, (30 - campaign.days_remaining) / 30 * 100))}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">About Locked Funds</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Funds are locked when you activate a sharing campaign</li>
          <li>✓ They're used to reward supporters who share your campaign</li>
          <li>✓ When campaigns end, locked funds become available for withdrawal</li>
          <li>✓ You can still view your payout history anytime</li>
        </ul>
      </div>
    </div>
  );
}
