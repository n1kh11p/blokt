'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Copy, Check, Loader2 } from 'lucide-react'
import { getOrganizationInviteCode } from '@/lib/actions/team'

export function AddMemberDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && !inviteCode) {
      const fetchCode = async () => {
        setIsLoading(true)
        const result = await getOrganizationInviteCode()
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setInviteCode(result.data.code)
        }
        setIsLoading(false)
      }
      fetchCode()
    }
  }, [open, inviteCode])

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Share this organization code with new team members. They can enter it during sign-up to automatically join your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Organization Code</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={isLoading ? 'Loading...' : inviteCode}
                className="font-mono bg-stone-100"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={isLoading || !inviteCode}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Instruct new team members to paste this code when they register for a new Blokt account.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="bg-stone-900 text-white hover:bg-stone-800:bg-stone-200"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
