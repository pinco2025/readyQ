'use client'

import { useCallback, useEffect, useRef } from 'react'

interface UseAccessibilityReturn {
  focusFirstElement: () => void
  handleKeyboardNavigation: (event: KeyboardEvent) => void
  announceToScreenReader: (message: string) => void
  setFocusTrap: (containerRef: React.RefObject<HTMLElement>) => void
}

export function useAccessibility(): UseAccessibilityReturn {
  const focusTrapRef = useRef<HTMLElement | null>(null)

  // Focus the first focusable element
  const focusFirstElement = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement
      firstElement.focus()
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    const { key, target } = event
    
    // Escape key to close modals or return to previous state
    if (key === 'Escape') {
      const activeModal = document.querySelector('[role="dialog"]')
      if (activeModal) {
        const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]')
        if (closeButton) {
          (closeButton as HTMLElement).click()
        }
      }
    }

    // Enter key to activate buttons and links
    if (key === 'Enter' && target instanceof HTMLElement) {
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        target.click()
      }
    }

    // Space key to activate buttons
    if (key === ' ' && target instanceof HTMLElement) {
      if (target.tagName === 'BUTTON') {
        event.preventDefault()
        target.click()
      }
    }
  }, [])

  // Announce messages to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    // Create a live region for screen reader announcements
    let liveRegion = document.getElementById('screen-reader-announcements')
    
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'screen-reader-announcements'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only' // Hidden visually but accessible to screen readers
      document.body.appendChild(liveRegion)
    }

    liveRegion.textContent = message
    
    // Clear the message after a short delay
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = ''
      }
    }, 1000)
  }, [])

  // Set up focus trap for modals
  const setFocusTrap = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    focusTrapRef.current = containerRef.current
    
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
        
        // Handle Tab key to trap focus
        const handleTabKey = (event: KeyboardEvent) => {
          if (event.key === 'Tab') {
            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault()
                lastElement.focus()
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault()
                firstElement.focus()
              }
            }
          }
        }
        
        containerRef.current.addEventListener('keydown', handleTabKey)
        
        // Focus first element when modal opens
        firstElement.focus()
        
        // Cleanup function
        return () => {
          if (containerRef.current) {
            containerRef.current.removeEventListener('keydown', handleTabKey)
          }
        }
      }
    }
  }, [])

  // Set up global keyboard navigation
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation)
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation)
    }
  }, [handleKeyboardNavigation])

  return {
    focusFirstElement,
    handleKeyboardNavigation,
    announceToScreenReader,
    setFocusTrap,
  }
}
