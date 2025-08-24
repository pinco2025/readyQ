'use client'

import { Wifi, WifiOff, AlertCircle, RefreshCw, Power, PowerOff } from 'lucide-react'
import { useRealtime } from '@/hooks/useRealtime'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

interface RealtimeStatusProps {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showRetryButton?: boolean
  showToggleButton?: boolean
  showDebugInfo?: boolean
}

export function RealtimeStatus({ 
  showText = true, 
  size = 'md', 
  className = '',
  showRetryButton = false,
  showToggleButton = false,
  showDebugInfo = false
}: RealtimeStatusProps) {
  const { isConnected, retryConnection, enableRealtime, disableRealtime, isRealtimeEnabled } = useRealtime()

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 12
      case 'md': return 16
      case 'lg': return 20
      default: return 16
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs'
      case 'md': return 'text-sm'
      case 'lg': return 'text-base'
      default: return 'text-sm'
    }
  }

  const getStatusInfo = () => {
    if (!isRealtimeEnabled) {
      return {
        icon: PowerOff,
        color: 'text-gray-500',
        text: 'Realtime disabled',
        tooltip: 'Real-time updates are disabled. The app will use polling for updates.'
      }
    } else if (isConnected) {
      return {
        icon: Wifi,
        color: 'text-green-500',
        text: 'Live updates enabled',
        tooltip: 'Real-time updates are working. Changes will appear instantly across all devices.'
      }
    } else {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        text: 'Offline mode',
        tooltip: 'Real-time updates are disabled. You may need to check your connection or Supabase configuration.'
      }
    }
  }

  const statusInfo = getStatusInfo()
  const IconComponent = statusInfo.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <IconComponent 
              size={getIconSize()} 
              className={statusInfo.color} 
            />
            {showText && (
              <span className={`${getTextSize()} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            )}
            {showRetryButton && !isConnected && isRealtimeEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  retryConnection()
                }}
                className="h-6 w-6 p-0 hover:bg-red-500/10"
              >
                <RefreshCw size={12} className="text-red-500" />
              </Button>
            )}
            {showToggleButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  if (isRealtimeEnabled) {
                    disableRealtime()
                  } else {
                    enableRealtime()
                  }
                }}
                className="h-6 w-6 p-0 hover:bg-blue-500/10"
                title={isRealtimeEnabled ? 'Disable realtime' : 'Enable realtime'}
              >
                {isRealtimeEnabled ? (
                  <PowerOff size={12} className="text-blue-500" />
                ) : (
                  <Power size={12} className="text-blue-500" />
                )}
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo.tooltip}</p>
          {!isConnected && isRealtimeEnabled && showRetryButton && (
            <p className="text-xs mt-1 text-gray-400">
              Click the refresh button to retry connection
            </p>
          )}
          {showToggleButton && (
            <p className="text-xs mt-1 text-gray-400">
              Click the power button to {isRealtimeEnabled ? 'disable' : 'enable'} realtime
            </p>
          )}
          {showDebugInfo && (
            <div className="text-xs mt-2 p-2 bg-gray-800 rounded border">
              <p><strong>Debug Info:</strong></p>
              <p>Realtime Enabled: {isRealtimeEnabled ? 'Yes' : 'No'}</p>
              <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
              <p>Status: {statusInfo.text}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
