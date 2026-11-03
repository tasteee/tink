import { describe, expect, it } from 'vitest'
import { computePosition, type Placement } from '../shared/overlay'
import './test-helpers'
describe('overlay placement',()=>{
 it('unknown runtime placement falls back to a valid centered placement',()=>{
  const anchor={getBoundingClientRect:()=>new DOMRect(100,100,100,40)}
  const floating=document.createElement('div')
  Object.defineProperty(floating,'offsetWidth',{value:50})
  Object.defineProperty(floating,'offsetHeight',{value:40})
  Object.defineProperty(document.documentElement,'clientWidth',{value:800,configurable:true})
  Object.defineProperty(document.documentElement,'clientHeight',{value:600,configurable:true})
  const position=computePosition(anchor,floating,{placement:'unknown' as Placement})
  expect(position).toEqual({x:125,y:148,side:'bottom',placement:'bottom'})
  delete (document.documentElement as unknown as Record<string,unknown>).clientWidth
  delete (document.documentElement as unknown as Record<string,unknown>).clientHeight
 })
})
