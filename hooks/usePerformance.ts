'use client'

import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage?: number
  taskCount: number
}

interface UsePerformanceReturn {
  measureRender: (componentName: string) => () => void
  getMetrics: () => PerformanceMetrics
  optimizeTaskList: (tasks: any[], maxTasks?: number) => any[]
}

export function usePerformance(): UsePerformanceReturn {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    taskCount: 0,
  })
  const renderStartTime = useRef<number>(0)

  // Measure render performance
  const measureRender = useCallback((componentName: string) => {
    renderStartTime.current = performance.now()
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current
      metricsRef.current.renderTime = renderTime
      
      if (process.env.NODE_ENV === 'development') {
    
      }
    }
  }, [])

  // Get current performance metrics
  const getMetrics = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    
    return { ...metricsRef.current }
  }, [])

  // Optimize task list for performance
  const optimizeTaskList = useCallback((tasks: any[], maxTasks: number = 100) => {
    if (tasks.length <= maxTasks) {
      return tasks
    }

    // For large lists, implement virtualization or pagination
    const optimizedTasks = tasks.slice(0, maxTasks)
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Task list optimized: showing ${maxTasks} of ${tasks.length} tasks`)
    }

    return optimizedTasks
  }, [])

  // Monitor memory usage
  useEffect(() => {
    if ('memory' in performance) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory
        const usedMB = memory.usedJSHeapSize / 1024 / 1024
        const totalMB = memory.totalJSHeapSize / 1024 / 1024
        
        if (usedMB > 100) { // Alert if using more than 100MB
          console.warn(`High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`)
        }
      }, 10000) // Check every 10 seconds

      return () => clearInterval(interval)
    }
  }, [])

  return {
    measureRender,
    getMetrics,
    optimizeTaskList,
  }
}
