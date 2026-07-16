import { FormDoc } from '@app/docs/FormDoc'
const presets=['#BF40BF','#F24A9B','#5A67D8','#10B981']
export const ZColorPickerDoc = () => <FormDoc tag="z-color-picker" description="A hex color control with a swatch trigger. Use it where people meaningfully choose a color, not as decorative page chrome." examples={[
 {title:'Choose a brand color',description:'Value is a hex string and can be persisted from the change event.',code:`<z-color-picker value="#BF40BF" />`,children:<z-color-picker value="#BF40BF" />},
 {title:'Offer sensible presets',description:'Presets make common choices fast without blocking a custom value.',code:`<z-color-picker value="#BF40BF" presets={['#BF40BF', '#F24A9B']} />`,children:<z-color-picker value="#BF40BF" presets={presets} />}
]} reference={[{term:'value',detail:'Current hex color value.'},{term:'presets',detail:'Property array of quick-pick hex values.'},{term:'change',detail:'Bubbling event detail is { value }.'},{term:'tone / is-disabled',detail:'Accent intent and unavailable state.'}]} />
