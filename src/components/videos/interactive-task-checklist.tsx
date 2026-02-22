'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Task, Database } from '@/types'

interface InteractiveTaskChecklistProps {
    videoId: string
    tasks: Task[]
    suggestedTaskIds: string[] | null
}

export function InteractiveTaskChecklist({ videoId, tasks, suggestedTaskIds }: InteractiveTaskChecklistProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    // Initialize state from AI suggestions if present, but fallback to empty
    const [selectedIds, setSelectedIds] = useState<string[]>(suggestedTaskIds || [])

    const hasSuggestions = suggestedTaskIds && suggestedTaskIds.length > 0
    const aiSuggestedTasks = tasks.filter(t => suggestedTaskIds?.includes(t.id))

    const handleToggle = (taskId: string) => {
        setSelectedIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        )
    }

    const handleConfirm = async () => {
        if (selectedIds.length === 0) return

        setLoading(true)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('tasks')
            .update({ status: 'completed' })
            .in('id', selectedIds)

        if (error) {
            toast.error('Failed to confirm tasks', { description: error.message })
            setLoading(false)
            return
        }

        // Clear the staging area on the video now that it's been confirmed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('videos')
            .update({ ai_suggested_tasks: [] })
            .eq('video_id', videoId)

        toast.success('Tasks Confirmed', { description: `${selectedIds.length} task(s) marked as completed.` })
        setLoading(false)
        router.refresh()
    }

    if (!hasSuggestions) {
        return (
            <div className="space-y-4">
                <p className="text-stone-500 text-sm">Waiting for AI Task Analysis to run before showing suggestions.</p>
                <ul className="space-y-3">
                    {tasks.map((t) => (
                        <li key={t.id} className="flex items-start justify-between p-3 rounded-lg border bg-stone-50 overflow-hidden opacity-60">
                            <div className="flex flex-col gap-1 pr-4">
                                <p className="font-medium text-stone-700">{t.name}</p>
                                <p className="text-sm text-stone-500">{t.description || 'No description'}</p>
                            </div>
                            <Badge variant={t.status === 'completed' ? 'default' : 'secondary'} className={t.status === 'completed' ? 'bg-green-600' : ''}>
                                {t.status}
                            </Badge>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b">
                <h3 className="font-medium text-amber-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    AI Suggestions
                </h3>
                <p className="text-sm text-stone-500">{aiSuggestedTasks.length} tasks identified</p>
            </div>
            <ul className="space-y-3">
                {aiSuggestedTasks.map((t) => (
                    <li key={t.id} className="flex flex-row items-center gap-4 p-3 rounded-lg border bg-white shadow-sm transition-all hover:bg-stone-50">
                        <Checkbox
                            id={`task-${t.id}`}
                            checked={selectedIds.includes(t.id)}
                            onCheckedChange={() => handleToggle(t.id)}
                            className="h-5 w-5 rounded-sm data-[state=checked]:bg-amber-600 data-[state=checked]:text-white"
                        />
                        <div className="flex flex-col gap-1 flex-1">
                            <label htmlFor={`task-${t.id}`} className="font-medium text-stone-900 cursor-pointer">{t.name}</label>
                            <p className="text-sm text-stone-500">{t.description || 'No description'}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="pt-4 border-t mt-6">
                <Button
                    onClick={handleConfirm}
                    disabled={loading || selectedIds.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                    {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Committing...</>
                    ) : (
                        <>Confirm {selectedIds.length} Completed Tasks</>
                    )}
                </Button>
            </div>
        </div>
    )
}
