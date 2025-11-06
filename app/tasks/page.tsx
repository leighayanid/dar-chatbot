'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import {
  PlusIcon,
  Loader2Icon,
  CheckCircle2Icon,
  CircleIcon,
  Trash2Icon,
  EditIcon,
  CalendarIcon,
  FlagIcon,
  TagIcon,
  XIcon
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: 'work' | 'personal' | 'health' | 'learning' | 'other'
  due_date: string | null
  completed_at: string | null
  position: number
  created_at: string
}

const priorityColors = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
}

const categoryColors = {
  work: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
  personal: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300',
  health: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300',
  learning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  other: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'work' as 'work' | 'personal' | 'health' | 'learning' | 'other',
    due_date: '',
  })

  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Load tasks
  useEffect(() => {
    async function loadTasks() {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('position', { ascending: true })
          .order('created_at', { ascending: false })

        if (error) throw error

        setTasks(data || [])
      } catch (err) {
        console.error('Error loading tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadTasks()
    }
  }, [user])

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter)

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        // @ts-ignore - Supabase type inference issue
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          category: formData.category,
          due_date: formData.due_date || null,
          status: 'pending',
          position: tasks.length,
        })
        .select()
        .single()

      if (error) throw error

      setTasks([...tasks, data])
      setShowModal(false)
      setFormData({ title: '', description: '', priority: 'medium', category: 'work', due_date: '' })
    } catch (err) {
      console.error('Error creating task:', err)
      alert('Failed to create task. Please try again.')
    }
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingTask) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        // @ts-ignore - Supabase type inference issue
        .update({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          category: formData.category,
          due_date: formData.due_date || null,
        })
        .eq('id', editingTask.id)
        .select()
        .single()

      if (error) throw error

      setTasks(tasks.map(t => t.id === (data as any).id ? data as any : t))
      setEditingTask(null)
      setFormData({ title: '', description: '', priority: 'medium', category: 'work', due_date: '' })
    } catch (err) {
      console.error('Error updating task:', err)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      const { data, error } = await supabase
        .from('tasks')
        // @ts-ignore - Supabase type inference issue
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', task.id)
        .select()
        .single()

      if (error) throw error

      setTasks(tasks.map(t => t.id === (data as any).id ? data as any : t))
    } catch (err) {
      console.error('Error toggling task:', err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      due_date: task.due_date || '',
    })
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-rose-100 to-orange-100 p-6 shadow-lg dark:from-rose-950/50 dark:to-orange-950/50">
            <Loader2Icon className="size-16 animate-spin text-rose-400 dark:text-rose-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Loading Tasks...
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
                  Tasks & Todos
                </h1>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Manage your daily tasks and track your progress
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="group rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                <PlusIcon className="mr-2 inline size-5" />
                New Task
              </button>
            </div>
          </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Tasks</p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending</p>
            <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">In Progress</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Completed</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                  : 'bg-white/80 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-12 text-center shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <CheckCircle2Icon className="mx-auto mb-4 size-16 text-zinc-400 dark:text-zinc-600" />
            <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </h3>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              {filter === 'all' ? 'Create your first task to get started' : `You don't have any ${filter} tasks`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                <PlusIcon className="size-5" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/80 ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 transition-transform hover:scale-110"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2Icon className="size-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <CircleIcon className="size-6 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`mb-2 text-lg font-bold ${task.status === 'completed' ? 'line-through' : ''} text-zinc-900 dark:text-zinc-50`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {task.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium ${categoryColors[task.category]}`}>
                        <TagIcon className="size-3" />
                        {task.category}
                      </span>

                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${priorityColors[task.priority]}`}>
                        <FlagIcon className="size-3" />
                        {task.priority} priority
                      </span>

                      {task.due_date && (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <CalendarIcon className="size-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="rounded-xl bg-zinc-100 p-2 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      title="Edit task"
                    >
                      <EditIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="rounded-xl bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                      title="Delete task"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showModal || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingTask(null)
                  setFormData({ title: '', description: '', priority: 'medium', category: 'work', due_date: '' })
                }}
                className="rounded-xl p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Task Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                  placeholder="Add more details about this task"
                />
              </div>

              {/* Priority & Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="priority" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="due_date" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Due Date (optional)
                </label>
                <input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTask(null)
                    setFormData({ title: '', description: '', priority: 'medium', category: 'work', due_date: '' })
                  }}
                  className="flex-1 rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
