'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] p-6">
          <div className="max-w-md w-full bg-[#1A1A1A] border border-[#EF4444]/30 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-[#EF4444]/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
            </div>
            
            <h2 className="text-xl font-semibold text-[#E5E7EB] mb-2">
              Something went wrong
            </h2>
            
            <p className="text-[#9CA3AF] mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            <div className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full border-[#374151] text-[#9CA3AF] hover:bg-[#374151]/30"
              >
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-[#9CA3AF] cursor-pointer hover:text-[#D1D5DB]">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-[#111111] rounded border border-[#374151] text-xs text-[#9CA3AF] overflow-auto scrollbar-hide">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
