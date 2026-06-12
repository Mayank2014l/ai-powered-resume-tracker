"use client";

import React, { useEffect, useState } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Sparkles, Calendar, TrendingUp, Award, Clock, 
  CheckCircle, Loader2, ArrowUpRight, BarChart3, ListFilter
} from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // 7, 30, 90

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          toast.error("Failed to load analytics data.");
        }
      } catch (err) {
        toast.error("An error occurred loading reports.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [dateRange]);

  if (loading || !data) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-2xs text-zinc-550 dark:text-zinc-400">Loading analytics metrics...</span>
      </div>
    );
  }

  const COLORS = ["#a1a1aa", "#6366f1", "#eab308", "#22c55e", "#ef4444"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Analytics Insights
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Monitor conversion rates and optimize your active pipeline.
          </p>
        </div>

        {/* Date Filter selector */}
        <div className="flex gap-2 shrink-0">
          <Calendar className="h-4.5 w-4.5 text-zinc-400 self-center" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-zinc-250 bg-white px-3 py-1.5 text-4xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white shadow-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* KEY AI-GENERATED INSIGHTS SECTION */}
      <div className="rounded-xl border border-indigo-600/20 bg-indigo-500/5 p-6 dark:border-indigo-500/20 dark:bg-indigo-950/10 shadow-sm flex items-start gap-4">
        <div className="rounded-lg bg-indigo-600 p-2.5 text-white shrink-0 shadow-md">
          <Sparkles className="h-5 w-5 fill-current" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wide">AI Performance Insights</h3>
          <p className="text-2xs text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed">
            {data.insights}
          </p>
        </div>
      </div>

      {/* TOP CHART SPLIT: Line & Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line Chart: Applications Over Time */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
            Application Momentum
          </h3>
          <div className="h-64 w-full text-4xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Match Scores by Company */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
            Match Scores by Target
          </h3>
          <div className="h-64 w-full text-4xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.companyMatchScores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* BOTTOM CHART SPLIT: Donut, Funnel, Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Donut Chart: Application Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            Pipeline Distribution
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.statusBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend list */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-4xs text-zinc-550 dark:text-zinc-400">
            {data.statusBreakdown.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.fill || COLORS[idx] }} />
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel Chart: Stage Conversion Rate */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
            Conversion Funnel
          </h3>
          
          <div className="space-y-4 text-2xs mt-4">
            {data.funnelData.map((item: any, idx: number) => {
              const maxVal = data.funnelData[0].count;
              const ratio = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>{item.stage}</span>
                    <span>{item.count} applications ({Math.round(ratio)}%)</span>
                  </div>
                  <div className="h-3 w-full rounded bg-zinc-150 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded" style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap Activity Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-900/35 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            Search Intensity Matrix
          </h3>
          <p className="text-4xs text-zinc-500 mb-4 leading-normal">
            Application submission intensity based on day of week and hour range.
          </p>

          <div className="space-y-2.5">
            {/* Heatmap grid header */}
            <div className="grid grid-cols-5 gap-1 text-center text-4xs font-bold text-zinc-400 uppercase tracking-wider pb-1">
              <div>Day</div>
              <div>Morning</div>
              <div>Noon</div>
              <div>Evening</div>
              <div>Night</div>
            </div>

            {data.heatmapData.map((dayData: any, idx: number) => {
              // Helper to assign BG color based on weight intensity
              const getCellColor = (val: number) => {
                if (val === 0) return "bg-zinc-100 dark:bg-zinc-900";
                if (val <= 1) return "bg-indigo-500/20 text-indigo-600";
                if (val <= 3) return "bg-indigo-500/50 text-white";
                return "bg-indigo-600 text-white";
              };

              return (
                <div key={idx} className="grid grid-cols-5 gap-1.5 text-center text-3xs items-center font-medium">
                  <div className="text-4xs text-zinc-400 font-bold text-left">{dayData.day}</div>
                  <div className={`rounded py-1.5 font-bold ${getCellColor(dayData.morning)}`}>{dayData.morning}</div>
                  <div className={`rounded py-1.5 font-bold ${getCellColor(dayData.afternoon)}`}>{dayData.afternoon}</div>
                  <div className={`rounded py-1.5 font-bold ${getCellColor(dayData.evening)}`}>{dayData.evening}</div>
                  <div className={`rounded py-1.5 font-bold ${getCellColor(dayData.night)}`}>{dayData.night}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
