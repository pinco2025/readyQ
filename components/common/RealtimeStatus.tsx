'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react'

interface RealtimeStatusProps {
  isConnected: boolean
  lastUpdate: Date | null
  updateCount: number
}

export function RealtimeStatus({ isConnected, lastUpdate, updateCount }: RealtimeStatusProps) {
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState<string>('')

  useEffect(() => {
    const updateTimeSince = () => {
      if (!lastUpdate) {
        setTimeSinceLastUpdate('Never')
        return
      }

      const now = new Date()
      const diff = now.getTime() - lastUpdate.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (seconds < 60) {
        setTimeSinceLastUpdate(`${seconds}s ago`)
      } else if (minutes < 60) {
        setTimeSinceLastUpdate(`${minutes}m ago`)
      } else {
        setTimeSinceLastUpdate(`${hours}h ago`)
      }
    }

    updateTimeSince()
    const interval = setInterval(updateTimeSince, 1000)

    return () => clearInterval(interval)
  }, [lastUpdate])

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    if (isConnected) {
      return 'Real-time connected'
    } else {
      return 'Real-time disconnected'
    }
  }

  const getStatusColor = () => {
    if (isConnected) {
      return 'bg-green-500/10 text-green-600 border-green-500/20'
    } else {
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
            {isConnected && (
              <span className="text-xs opacity-70">
                {timeSinceLastUpdate}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium mb-1">
              {isConnected ? 'Real-time Active' : 'Real-time Inactive'}
            </p>
            {isConnected ? (
              <div className="text-xs space-y-1">
                <p>Last update: {timeSinceLastUpdate}</p>
                <p>Total updates: {updateCount}</p>
                <p>Firebase Firestore connected</p>
              </div>
            ) : (
              <div className="text-xs">
                <p>Real-time updates are disabled.</p>
                <p>You may need to check your Firebase configuration.</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
