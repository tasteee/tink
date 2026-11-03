import { describe, expect, it, vi } from 'vitest'
import '../elements/z-tabs'
import '../components/z-accordion'
import '../components/z-collapsible'
import '../components/z-select'
import '../components/z-combobox'
import '../components/z-field'
import '../components/z-input'
import '../components/z-textarea'
import '../components/z-number-input'
import '../components/z-progress'
import '../components/z-dialog'
import '../components/z-switch'
import '../components/z-checkbox'
import '../components/z-button'
import { getShadowRoot, waitForRender } from './test-helpers'

// happy-dom has no top layer; browser checks cover actual popover placement.
vi.mock('../shared/overlay', async (importOriginal) => ({
 ...await importOriginal<typeof import('../shared/overlay')>(),
 showFloating: vi.fn(), hideFloating: vi.fn()
}))

const mount = async (tag: string, props: Record<string, unknown> = {}) => {
 const el = document.createElement(tag)
 Object.assign(el, props)
 document.body.append(el)
 await waitForRender()
 return el
}
const key = async (el: HTMLElement, key: string) => {
 el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
 await waitForRender()
}

describe('core keyboard contracts', () => {
 it('tabs start on the first enabled tab and move focus with selection', async () => {
  const el = await mount('z-tabs', { tabs: [{value:'a',label:'A',isDisabled:true},{value:'b',label:'B'},{value:'c',label:'C'},{value:'d',label:'D',isDisabled:true}] })
  el.innerHTML = '<div slot="b">Panel B</div><div slot="c">Panel C</div>'
  await waitForRender()
  const root=getShadowRoot(el), buttons=root.querySelectorAll('button')
  expect(buttons[1].getAttribute('aria-selected')).toBe('true')
  buttons[1].focus()
  await key(buttons[1], 'End')
  expect(el.getAttribute('value')).toBe('c')
  expect(root.activeElement?.id).toBe('tab-2')
  expect(root.querySelector('[role="tabpanel"]:not([hidden])')?.getAttribute('aria-labelledby')).toBe(buttons[2].id)
  await key(root.querySelector<HTMLButtonElement>('#tab-2')!, 'ArrowRight')
  expect(root.activeElement?.id).toBe('tab-1')
 })
 it('tabs accept an empty string value and recover from removed selections', async () => {
  const el=await mount('z-tabs',{value:'',tabs:[{value:'x',label:'X'},{value:'',label:'Empty'}]})
  expect(getShadowRoot(el).querySelectorAll('button')[1].tabIndex).toBe(0)
  Object.assign(el,{tabs:[{value:'x',label:'X'}]})
  await waitForRender()
  expect(getShadowRoot(el).querySelector('button')?.tabIndex).toBe(0)
 })
 it('select opens from the end, skips disabled options, and closes on Tab', async () => {
  const el=await mount('z-select',{label:'Workspace',options:[{value:'a',label:'Alpha'},{value:'b',label:'Beta',isDisabled:true},{value:'c',label:'Charlie'}]})
  const root=getShadowRoot(el), trigger=root.querySelector('button')!
  await key(trigger,'ArrowUp')
  expect(trigger.getAttribute('aria-activedescendant')).toBe('option-2')
  await key(trigger,'ArrowUp')
  expect(trigger.getAttribute('aria-activedescendant')).toBe('option-0')
  await key(trigger,'End')
  await key(trigger,'Enter')
  expect(el.getAttribute('value')).toBe('c')
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  expect(root.activeElement).toBe(trigger)
  trigger.click(); await waitForRender()
  await key(trigger,'Tab')
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
 })
 it('select supports typeahead and emits only a changed selection', async () => {
  const el=await mount('z-select',{value:'a',options:[{value:'a',label:'Alpha'},{value:'b',label:'Beta'}]})
  const events: unknown[]=[]; el.addEventListener('change',e=>events.push((e as CustomEvent).detail))
  const trigger=getShadowRoot(el).querySelector('button')!
  await key(trigger,'Enter'); await key(trigger,'Enter')
  expect(events).toEqual([])
  await key(trigger,'b'); await key(trigger,'Enter')
  expect(events).toEqual([{value:'b'}])
 })
 it('select never selects a disabled option and closes when disabled while open', async () => {
  const el=await mount('z-select',{options:[{value:'a',label:'A',isDisabled:true}]})
  const trigger=getShadowRoot(el).querySelector('button')!
  await key(trigger,'ArrowDown'); await key(trigger,'Enter')
  expect(el.getAttribute('value')).toBe(null)
  expect(trigger.getAttribute('aria-activedescendant')).toBe(null)
  Object.assign(el,{isDisabled:true}); await waitForRender(); await waitForRender()
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
 })
 it('combobox skips disabled results and resets after filtering and blur', async () => {
  const el=await mount('z-combobox',{options:[{value:'a',label:'Alpha'},{value:'b',label:'Beta',isDisabled:true},{value:'c',label:'Charlie'}]})
  const input=getShadowRoot(el).querySelector('input')!
  input.focus(); await waitForRender()
  await key(input,'ArrowDown')
  expect(input.getAttribute('aria-activedescendant')).toBe('option-2')
  await key(input,'Enter')
  expect(el.getAttribute('value')).toBe('c')
  input.value='Beta'; input.dispatchEvent(new Event('input',{bubbles:true})); await waitForRender(); await waitForRender()
  expect(input.getAttribute('aria-activedescendant')).toBe(null)
  input.blur(); await waitForRender()
  expect(input.getAttribute('aria-expanded')).toBe('false')
  expect(input.value).toBe('Charlie')
 })
})

describe('field and native control contracts', () => {
 it('updates and clears only the label and required state it owns', async () => {
  const field=await mount('z-field',{label:'Name',isRequired:true})
  const input=document.createElement('z-input'); field.append(input)
  await waitForRender(); await waitForRender()
  expect(getShadowRoot(input).querySelector('input')?.getAttribute('aria-label')).toBe('Name')
  Object.assign(field,{label:'Project name',isRequired:false}); await waitForRender(); await waitForRender()
  expect(getShadowRoot(input).querySelector('input')?.getAttribute('aria-label')).toBe('Project name')
  expect(getShadowRoot(input).querySelector('input')?.required).toBe(false)
  Object.assign(field,{label:''}); await waitForRender(); await waitForRender()
  expect(getShadowRoot(input).querySelector('input')?.getAttribute('aria-label')).toBe(null)
 })
 it('preserves explicit control names and required state', async () => {
  const field=await mount('z-field',{label:'Wrapper'})
  const input=document.createElement('z-input'); Object.assign(input,{label:'Authored',isRequired:true}); field.append(input)
  await waitForRender(); await waitForRender()
  Object.assign(field,{label:'Changed',isRequired:false}); await waitForRender()
  expect(getShadowRoot(input).querySelector('input')?.getAttribute('aria-label')).toBe('Authored')
  expect(getShadowRoot(input).querySelector('input')?.required).toBe(true)
 })
 it('releases forwarded state when the slotted control is replaced', async () => {
  const field=await mount('z-field',{label:'Name',isRequired:true})
  const old=document.createElement('z-input'); field.append(old); await waitForRender(); await waitForRender()
  const next=document.createElement('z-input'); field.replaceChildren(next); await waitForRender(); await waitForRender()
  expect((old as HTMLElement & {label?:string}).label).toBeUndefined()
  expect(getShadowRoot(next).querySelector('input')?.getAttribute('aria-label')).toBe('Name')
 })
 it('switch native activation emits exactly one change', async () => {
  const el=await mount('z-switch',{label:'Notifications'})
  const events:unknown[]=[]; el.addEventListener('change',e=>events.push((e as CustomEvent).detail))
  const input=getShadowRoot(el).querySelector('input')!
  input.click(); await waitForRender()
  expect(events).toEqual([{checked:true,value:undefined}])
  expect(input.checked).toBe(true)
  expect(input.getAttribute('aria-label')).toBe('Notifications')
 })
 it('checkbox forwards field names and required state', async () => {
  const el=await mount('z-checkbox',{label:'Accept terms',isRequired:true})
  const input=getShadowRoot(el).querySelector('input')!
  expect(input.getAttribute('aria-label')).toBe('Accept terms')
  expect(input.required).toBe(true)
 })
 it('loading buttons expose busy state and prevent native activation', async () => {
  const el=await mount('z-button',{isLoading:true})
  const button=getShadowRoot(el).querySelector('button')!
  expect(button.disabled).toBe(true)
  expect(button.getAttribute('aria-busy')).toBe('true')
 })
 it('dialog heading and description name the native dialog', async () => {
  const el=await mount('z-dialog',{heading:'Invite people',description:'Choose your team'})
  const root=getShadowRoot(el), dialog=root.querySelector('dialog')!
  expect(root.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Invite people')
  expect(root.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toBe('Choose your team')
 })
 it('number input preserves fractional boundaries and precision', async () => {
  const el=await mount('z-number-input',{value:1.5,step:1,min:1.5,max:2.5,hasStepperButtons:true})
  const root=getShadowRoot(el), input=root.querySelector('input')!
  await key(input,'ArrowUp')
  expect(el.getAttribute('value')).toBe('2.5')
  await key(input,'ArrowDown')
  expect(el.getAttribute('value')).toBe('1.5')
  expect(input.getAttribute('role')).toBe('spinbutton')
  expect(input.getAttribute('aria-valuemin')).toBe('1.5')
 })
 it.each([0,-1,Infinity])('progress normalizes invalid max %s',async max=>{
  const el=await mount('z-progress',{max,value:50})
  expect(el.getAttribute('aria-valuemax')).toBe('100')
  expect(el.getAttribute('aria-valuenow')).toBe('50')
 })
 it('indeterminate progress omits the current value',async()=>{
  const el=await mount('z-progress',{isIndeterminate:true})
  expect(el.hasAttribute('aria-valuenow')).toBe(false)
 })
})

describe('text change events',()=>{
 it.each(['z-input','z-textarea'])('%s emits one input event and ignores unchanged blur',async tag=>{
  const el=await mount(tag,{value:'Initial'})
  const root=getShadowRoot(el), input=root.querySelector<HTMLInputElement>('input,textarea')!
  const inputEvents:Event[]=[], changes:unknown[]=[]
  el.addEventListener('input',e=>inputEvents.push(e))
  el.addEventListener('change',e=>changes.push((e as CustomEvent).detail))
  input.focus(); input.blur(); await waitForRender()
  expect(changes).toEqual([])
  input.focus(); input.value='Changed'
  input.dispatchEvent(new Event('input',{bubbles:true,composed:true})); await waitForRender()
  input.blur(); await waitForRender()
  expect(inputEvents).toHaveLength(1)
  expect(changes).toEqual([{value:'Changed'}])
 })
})

describe('field guidance slots',()=>{
 it('renders rich guidance without a string prop and gives errors priority',async()=>{
  const field=await mount('z-field')
  const guidance=document.createElement('span'); guidance.slot='description'; guidance.textContent='Helpful guidance'
  field.append(guidance); await waitForRender(); await waitForRender()
  const root=getShadowRoot(field)
  expect(root.querySelector<HTMLElement>('.description')?.hidden).toBe(false)
  const error=document.createElement('span'); error.slot='error'; error.textContent='Try again'
  field.append(error); await waitForRender(); await waitForRender()
  expect(root.querySelector<HTMLElement>('.error')?.hidden).toBe(false)
  expect(root.querySelector<HTMLElement>('.description')?.hidden).toBe(true)
  error.remove(); await waitForRender(); await waitForRender()
  expect(root.querySelector<HTMLElement>('.description')?.hidden).toBe(false)
 })
})

describe('focus and panel relationships',()=>{
 it('field labels focus the number input, even when the first stepper is disabled',async()=>{
  const field=await mount('z-field',{label:'Seats'})
  const control=document.createElement('z-number-input'); Object.assign(control,{min:1,value:1,hasStepperButtons:true}); field.append(control)
  await waitForRender(); await waitForRender()
  getShadowRoot(field).querySelector<HTMLElement>('.label')!.click()
  expect(getShadowRoot(control).activeElement?.tagName).toBe('INPUT')
 })
 it('tabs retain all panel references and click focus',async()=>{
  const el=await mount('z-tabs',{tabs:[{value:'a',label:'A'},{value:'b',label:'B'}]})
  el.innerHTML = '<div slot="a">Panel A</div><div slot="b">Panel B</div>'
  await waitForRender()
  const root=getShadowRoot(el)
  for(const tab of root.querySelectorAll('[role="tab"]')) expect(root.getElementById(tab.getAttribute('aria-controls')!)).not.toBe(null)
  root.querySelector<HTMLButtonElement>('#tab-1')!.click(); await waitForRender()
  expect(root.activeElement?.id).toBe('tab-1')
  expect(root.querySelectorAll('[role="tabpanel"]:not([hidden])')).toHaveLength(1)
 })
 it('tabs keep empty panels out of the accessibility tree (controller mode)',async()=>{
  const el=await mount('z-tabs',{tabs:[{value:'a',label:'A'},{value:'b',label:'B'}]})
  const root=getShadowRoot(el)
  expect(root.querySelectorAll('[role="tabpanel"]')).toHaveLength(0)
 })
})

describe('nested disclosures and textarea sizing',()=>{
 it('nested accordion changes do not close their outer section',async()=>{
  const outer=await mount('z-accordion')
  const parent=document.createElement('z-collapsible'), sibling=document.createElement('z-collapsible')
  Object.assign(parent,{isOpen:true}); outer.append(parent,sibling)
  const inner=document.createElement('z-accordion'), child=document.createElement('z-collapsible')
  inner.append(child); parent.append(inner); await waitForRender()
  getShadowRoot(child).querySelector<HTMLButtonElement>('button')!.click(); await waitForRender()
  expect(parent.hasAttribute('is-open')).toBe(true)
  expect(child.hasAttribute('is-open')).toBe(true)
  getShadowRoot(sibling).querySelector<HTMLButtonElement>('button')!.click(); await waitForRender()
  expect(parent.hasAttribute('is-open')).toBe(false)
  expect(child.hasAttribute('is-open')).toBe(true)
 })
 it('textarea auto-resize responds to property changes and can be turned off',async()=>{
  const el=await mount('z-textarea',{value:'Short'})
  const textarea=getShadowRoot(el).querySelector('textarea')!
  // Layout is browser-tested; this fixture supplies the measured content height.
  Object.defineProperty(textarea,'scrollHeight',{get:()=>textarea.value.length*10})
  Object.assign(el,{isAutoResize:true}); await waitForRender()
  expect(textarea.style.height).toBe('50px')
  Object.assign(el,{value:'Longer content'}); await waitForRender()
  expect(textarea.style.height).toBe('140px')
  Object.assign(el,{isAutoResize:false}); await waitForRender()
  expect(textarea.style.height).toBe('')
 })
})
