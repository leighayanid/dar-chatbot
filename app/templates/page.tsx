'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { PlusIcon, Loader2Icon, FileTextIcon, SparklesIcon, CopyIcon, Trash2Icon, EditIcon } from 'lucide-react'
import { AppHeader } from '@/components/app-header'

interface Template {
  id: string
  name: string
  description: string | null
  content: string
  category: string | null
  is_public: boolean
  is_system: boolean
  user_id: string | null
  created_at: string
}

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'custom',
  })

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'standup', label: 'Daily Standup' },
    { id: 'weekly', label: 'Weekly Review' },
    { id: 'monthly', label: 'Monthly Summary' },
    { id: 'custom', label: 'Custom' },
  ]

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load templates
  useEffect(() => {
    async function loadTemplates() {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .or(`user_id.eq.${user.id},is_system.eq.true,is_public.eq.true`)
          .order('is_system', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) throw error

        setTemplates(data || [])
      } catch (err) {
        console.error('Error loading templates:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadTemplates()
    }
  }, [user])

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const handleUseTemplate = (template: Template) => {
    // Store template in localStorage and redirect to dashboard
    localStorage.setItem('dar-template-content', template.content)
    router.push('/dashboard')
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('templates')
        // @ts-ignore - Supabase type inference issue
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          content: formData.content,
          category: formData.category,
          is_public: false,
          is_system: false,
        })
        .select()
        .single()

      if (error) throw error

      setTemplates([data, ...templates])
      setShowCreateModal(false)
      setFormData({ name: '', description: '', content: '', category: 'custom' })
    } catch (err) {
      console.error('Error creating template:', err)
      alert('Failed to create template. Please try again.')
    }
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingTemplate) return

    try {
      const { data, error } = await supabase
        .from('templates')
        // @ts-ignore - Supabase type inference issue
        .update({
          name: formData.name,
          description: formData.description || null,
          content: formData.content,
          category: formData.category,
        })
        .eq('id', editingTemplate.id)
        .select()
        .single()

      if (error) throw error

      setTemplates(templates.map(t => t.id === (data as any).id ? data as any : t))
      setEditingTemplate(null)
      setFormData({ name: '', description: '', content: '', category: 'custom' })
    } catch (err) {
      console.error('Error updating template:', err)
      alert('Failed to update template. Please try again.')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      setTemplates(templates.filter(t => t.id !== templateId))
    } catch (err) {
      console.error('Error deleting template:', err)
      alert('Failed to delete template. Please try again.')
    }
  }

  const handleEditClick = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      content: template.content,
      category: template.category || 'custom',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-rose-100 to-orange-100 p-6 shadow-lg dark:from-rose-950/50 dark:to-orange-950/50">
            <Loader2Icon className="size-16 animate-spin text-rose-400 dark:text-rose-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Loading Templates...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <AppHeader />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-7xl py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50">
                  Templates & Prompts
                </h1>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Start with pre-built templates or create your own
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="group rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                <PlusIcon className="mr-2 inline size-5" />
                Create Template
              </button>
            </div>
          </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                  : 'bg-white/80 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-12 text-center shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <FileTextIcon className="mx-auto mb-4 size-16 text-zinc-400 dark:text-zinc-600" />
            <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              No templates yet
            </h3>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Create your first custom template to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <PlusIcon className="size-5" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group relative rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/80"
              >
                {/* System/Public Badge */}
                {template.is_system && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 px-3 py-1 text-xs font-semibold text-white">
                    <SparklesIcon className="size-3" />
                    System
                  </div>
                )}

                {/* Template Content */}
                <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {template.description}
                  </p>
                )}

                {/* Category Tag */}
                <div className="mb-4">
                  <span className="inline-block rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {template.category}
                  </span>
                </div>

                {/* Preview */}
                <div className="mb-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <pre className="line-clamp-4 whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">
                    {template.content}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                  >
                    <CopyIcon className="mr-2 inline size-4" />
                    Use Template
                  </button>

                  {/* Edit/Delete for user templates */}
                  {!template.is_system && template.user_id === user?.id && (
                    <>
                      <button
                        onClick={() => handleEditClick(template)}
                        className="rounded-xl bg-zinc-100 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        title="Edit template"
                      >
                        <EditIcon className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="rounded-xl bg-red-100 px-3 py-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                        title="Delete template"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h2>

            <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} className="space-y-4">
              {/* Template Name */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Template Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                  placeholder="e.g., Daily Standup"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                  placeholder="Brief description of this template"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                >
                  <option value="standup">Daily Standup</option>
                  <option value="weekly">Weekly Review</option>
                  <option value="monthly">Monthly Summary</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Template Content
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={10}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                  placeholder="Enter your template content with prompts..."
                />
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Tip: Use line breaks to create sections and questions
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingTemplate(null)
                    setFormData({ name: '', description: '', content: '', category: 'custom' })
                  }}
                  className="flex-1 rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
