'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeftIcon, Loader2Icon, FileTextIcon, CalendarIcon, DownloadIcon, Trash2Icon, PlusIcon } from 'lucide-react'
import Link from 'next/link'

interface Report {
  id: string
  title: string
  report_type: string
  start_date: string
  end_date: string
  content: string
  created_at: string
}

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load reports
  useEffect(() => {
    async function loadReports() {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setReports(data || [])
      } catch (err) {
        console.error('Error loading reports:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadReports()
    }
  }, [user])

  const generateReport = async () => {
    if (!user) return

    try {
      setGenerating(true)

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()

      if (reportType === 'weekly') {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setDate(startDate.getDate() - 30)
      }

      // Fetch messages in date range
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      if (!messages || messages.length === 0) {
        alert('No accomplishments found in this date range. Log some entries first!')
        setGenerating(false)
        return
      }

      // Group messages by date
      const messagesByDate = new Map<string, string[]>()
      messages.forEach((msg: any) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0]
        if (!messagesByDate.has(date)) {
          messagesByDate.set(date, [])
        }
        messagesByDate.get(date)!.push(msg.content)
      })

      // Generate report content
      const reportTitle = `${reportType === 'weekly' ? 'Weekly' : 'Monthly'} Report - ${endDate.toLocaleDateString()}`
      let reportContent = `# ${reportTitle}\n\n`
      reportContent += `**Period:** ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n\n`
      reportContent += `## Summary\n\n`
      reportContent += `- Total entries: ${messages.length}\n`
      reportContent += `- Active days: ${messagesByDate.size}\n`
      reportContent += `- Average per day: ${(messages.length / messagesByDate.size).toFixed(1)}\n\n`
      reportContent += `## Daily Accomplishments\n\n`

      // Add daily entries
      Array.from(messagesByDate.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .forEach(([date, contents]) => {
          const dateObj = new Date(date)
          reportContent += `### ${dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`
          contents.forEach((content, idx) => {
            reportContent += `${idx + 1}. ${content}\n\n`
          })
        })

      // Save report
      const { data: newReport, error: saveError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title: reportTitle,
          report_type: reportType,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          content: reportContent,
        } as any)
        .select()
        .single()

      if (saveError) throw saveError

      setReports([newReport, ...reports])
      setShowGenerateModal(false)
    } catch (err) {
      console.error('Error generating report:', err)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = (report: Report) => {
    const blob = new Blob([report.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/\s+/g, '-').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      setReports(reports.filter(r => r.id !== reportId))
    } catch (err) {
      console.error('Error deleting report:', err)
      alert('Failed to delete report. Please try again.')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-rose-100 to-orange-100 p-6 shadow-lg dark:from-rose-950/50 dark:to-orange-950/50">
            <Loader2Icon className="size-16 animate-spin text-rose-400 dark:text-rose-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Loading Reports...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50">
                Reports
              </h1>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Generate and manage your accomplishment reports
              </p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="group rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <PlusIcon className="mr-2 inline size-5" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-12 text-center shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <FileTextIcon className="mx-auto mb-4 size-16 text-zinc-400 dark:text-zinc-600" />
            <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              No reports yet
            </h3>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Generate your first weekly or monthly report
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <PlusIcon className="size-5" />
              Generate Report
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/80"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <FileTextIcon className="size-5 text-rose-400" />
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        {report.title}
                      </h3>
                    </div>
                    <div className="mb-4 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon className="size-4" />
                        {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                      </span>
                      <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
                        {report.report_type}
                      </span>
                      <span className="text-xs">
                        Created {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <pre className="line-clamp-6 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                        {report.content}
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadReport(report)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                  >
                    <DownloadIcon className="mr-2 inline size-4" />
                    Download
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    <Trash2Icon className="mr-2 inline size-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Generate Report
            </h2>

            <div className="mb-6 space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Select the type of report you want to generate:
              </p>

              <button
                onClick={() => setReportType('weekly')}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  reportType === 'weekly'
                    ? 'border-rose-400 bg-rose-50 dark:border-rose-400 dark:bg-rose-950/20'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Weekly Report</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Last 7 days</p>
                  </div>
                  {reportType === 'weekly' && (
                    <div className="size-5 rounded-full bg-rose-400" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setReportType('monthly')}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  reportType === 'monthly'
                    ? 'border-rose-400 bg-rose-50 dark:border-rose-400 dark:bg-rose-950/20'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Monthly Report</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Last 30 days</p>
                  </div>
                  {reportType === 'monthly' && (
                    <div className="size-5 rounded-full bg-rose-400" />
                  )}
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                disabled={generating}
                className="flex-1 rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={generateReport}
                disabled={generating}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {generating ? (
                  <>
                    <Loader2Icon className="mr-2 inline size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
