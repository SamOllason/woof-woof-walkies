import { describe, it, expect } from 'vitest'
import { parseDistance, calculateDifficulty, formatDuration } from '../walkConversion'

describe('walkConversion utilities', () => {
  describe('parseDistance', () => {
    it('parses "2.5 km" to 2.5', () => {
      expect(parseDistance('2.5 km')).toBe(2.5)
    })

    it('parses "10 km" to 10', () => {
      expect(parseDistance('10 km')).toBe(10)
    })

    it('handles "2.5km" without space', () => {
      expect(parseDistance('2.5km')).toBe(2.5)
    })

    it('handles decimal distances like "0.8 km"', () => {
      expect(parseDistance('0.8 km')).toBe(0.8)
    })

    it('returns 0 for invalid input', () => {
      expect(parseDistance('invalid')).toBe(0)
    })

    it('returns 0 for empty string', () => {
      expect(parseDistance('')).toBe(0)
    })

    it('handles uppercase "KM"', () => {
      expect(parseDistance('5 KM')).toBe(5)
    })
  })

  describe('calculateDifficulty', () => {
    it('returns "easy" for distance < 3km', () => {
      expect(calculateDifficulty(2)).toBe('easy')
      expect(calculateDifficulty(2.9)).toBe('easy')
    })

    it('returns "moderate" for distance 3-6km', () => {
      expect(calculateDifficulty(3)).toBe('moderate')
      expect(calculateDifficulty(4.5)).toBe('moderate')
      expect(calculateDifficulty(6)).toBe('moderate')
    })

    it('returns "hard" for distance > 6km', () => {
      expect(calculateDifficulty(6.1)).toBe('hard')
      expect(calculateDifficulty(10)).toBe('hard')
    })

    it('returns "easy" for 0 distance', () => {
      expect(calculateDifficulty(0)).toBe('easy')
    })

    it('returns "easy" for negative distance (edge case)', () => {
      expect(calculateDifficulty(-1)).toBe('easy')
    })
  })

  describe('formatDuration', () => {
    it('converts 1800 seconds to 30 minutes', () => {
      expect(formatDuration(1800)).toBe(30)
    })

    it('converts 3600 seconds to 60 minutes', () => {
      expect(formatDuration(3600)).toBe(60)
    })

    it('rounds 1850 seconds (30.83 min) to 31 minutes', () => {
      expect(formatDuration(1850)).toBe(31)
    })

    it('rounds 1820 seconds (30.33 min) to 30 minutes', () => {
      expect(formatDuration(1820)).toBe(30)
    })

    it('returns 0 for undefined input', () => {
      expect(formatDuration(undefined)).toBe(0)
    })

    it('returns 0 for 0 seconds', () => {
      expect(formatDuration(0)).toBe(0)
    })

    it('handles small durations (90 seconds = 2 minutes)', () => {
      expect(formatDuration(90)).toBe(2)
    })
  })
})
