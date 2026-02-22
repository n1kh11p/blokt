'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { processVideoAnnotations } from '@/lib/actions/upload'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AnalyzeVideoButtonProps {
    videoId: string
}

export function AnalyzeVideoButton({ videoId }: AnalyzeVideoButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleAnalyze() {
        setLoading(true)
        const result = await processVideoAnnotations(videoId)

        if (result.success) {
            if (result.completedTaskIds && result.completedTaskIds.length > 0) {
                toast.success(`Analysis Complete`, {
                    description: `AI marked ${result.completedTaskIds.length} task(s) as completed.`
                })
            } else {
                toast.info(`Analysis Complete`, {
                    description: `No specific tasks were verified as complete by the AI.`
                })
            }
            router.refresh()
        } else {
            toast.error('Analysis Failed', { description: result.error || 'Something went wrong.' })
        }

        setLoading(false)
    }

    return (
        <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run AI Task Analysis
                </>
            )}
        </Button>
    )
}
