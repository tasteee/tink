import { FormDoc } from '@app/docs/FormDoc'

export const ZTextareaDoc = () => <FormDoc tag="z-textarea" description="A multi-line text field for a meaningful amount of freeform content. Use z-input for short, single-line values." examples={[
	{ title: 'Collect a short message', description: 'Use z-field for the visible, accessible label and a useful initial height.', code: `<z-field label="Message"><z-textarea rows="4" placeholder="Write a note..." /></z-field>`, children: <z-field label="Message"><z-textarea rows={4} placeholder="Write a note..." /></z-field> },
	{ title: 'Explain validation next to the field', description: 'Keep the error specific and actionable.', code: `<z-field label="Description" error="Describe the issue in at least 20 characters."><z-textarea is-invalid value="Too short" /></z-field>`, children: <z-field label="Description" error="Describe the issue in at least 20 characters."><z-textarea isInvalid value="Too short" /></z-field> }
]} />
