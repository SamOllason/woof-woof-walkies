'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

/**
 * Floating feedback button with modal for collecting user feedback.
 * Uses Formspree to send feedback directly to email - no backend needed.
 * Perfect for pilot/beta testing with friends and family.
 */
export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/manrplrv'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!feedback.trim()) {
      toast.error('Please enter some feedback')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          // Formspree will automatically capture submission time
          page: window.location.pathname,
        }),
      })

      if (response.ok) {
        toast.success('Thank you for your feedback! 🐕')
        setFeedback('')
        setIsOpen(false)
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      toast.error('Failed to send feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating feedback button - fixed position bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white 
          px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          flex items-center gap-2 z-40"
        aria-label="Send feedback"
      >
        <span className="text-lg">💬</span>
        <span className="hidden sm:inline font-medium">Feedback</span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal content */}
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Send Feedback 🐕
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Thanks for testing Woof Woof Walkies! Your feedback helps make it better.
            </p>

            <form onSubmit={handleSubmit}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you like? What could be better? Any bugs?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                  placeholder:text-gray-500 text-gray-900 resize-none"
                rows={5}
                disabled={isSubmitting}
                autoFocus
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                    text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-colors disabled:opacity-50 
                    disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
