import { afterEach, describe, expect, it, vi } from 'vitest'
import { getThemePreference, setThemePreference, subscribeToTheme } from '../shared/theme'
afterEach(()=>{vi.useRealTimers(); document.documentElement.classList.remove('isThemeFading'); document.documentElement.style.removeProperty('--theme-fade-out-duration')})
describe('theme transitions',()=>{
 it('a repeated choice cancels an in-flight fade without duplicate notifications',()=>{
  vi.useFakeTimers()
  document.documentElement.style.setProperty('--theme-fade-out-duration','400ms')
  setThemePreference('dark'); vi.runAllTimers()
  const listener=vi.fn(); const unsubscribe=subscribeToTheme(listener)
  setThemePreference('light')
  setThemePreference('light')
  expect(document.documentElement.classList.contains('isThemeFading')).toBe(false)
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  vi.runAllTimers()
  expect(listener).toHaveBeenCalledTimes(1)
  unsubscribe()
 })
 it('a zero duration commits synchronously and invalid preferences are ignored',()=>{
  document.documentElement.style.setProperty('--theme-fade-out-duration','0ms')
  setThemePreference('dark')
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  setThemePreference('invalid' as 'dark')
  expect(getThemePreference()).toBe('dark')
 })
})
