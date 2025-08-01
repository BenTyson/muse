'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isAfter, startOfDay } from 'date-fns'

interface DateTimeSelectorProps {
  selectedDate: Date | null
  selectedTime: string | null
  sessionDuration: number
  onDateTimeChange: (date: Date | null, time: string | null) => void
}

export default function DateTimeSelector({
  selectedDate,
  selectedTime,
  sessionDuration,
  onDateTimeChange,
}: DateTimeSelectorProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, sessionDuration])

  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true)
    try {
      const response = await fetch(
        `/api/availability?date=${format(date, 'yyyy-MM-dd')}&duration=${sessionDuration}`
      )
      const data = await response.json()
      if (response.ok) {
        setAvailableSlots(data.availableSlots)
      } else {
        console.error('Failed to fetch availability:', data.error)
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    // Don't allow selecting past dates
    if (!isAfter(date, startOfDay(new Date()))) {
      return
    }
    
    onDateTimeChange(date, null) // Reset time when date changes
  }

  const handleTimeSelect = (time: string) => {
    onDateTimeChange(selectedDate, time)
  }

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7))
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Date</h3>
        
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-lg font-medium">
            {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
          </span>
          
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {weekDates.map((date) => {
            const isPast = !isAfter(date, startOfDay(new Date()))
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                disabled={isPast}
                className={`
                  p-3 text-sm rounded-lg border transition-colors
                  ${isPast 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                  }
                  ${isSelected 
                    ? 'border-red-500 bg-red-500 text-white' 
                    : 'text-gray-900'
                  }
                `}
              >
                {format(date, 'd')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Time</h3>
          
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading available times...</span>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available time slots for this date. Please select another date.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {availableSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`
                    px-4 py-2 text-sm rounded-lg border transition-colors
                    ${selectedTime === time
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-900'
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedTime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">
              Session scheduled for {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}