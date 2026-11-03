import { type as atomicoType } from 'atomico'

/*
 * Narrow string props.
 *
 * Atomico types a `{ type: String }` prop as `string`, so the declaration
 * file a consumer reads says `size: string` where the docs say
 * `sm | md | lg`, and `size="huge"` typechecks. `oneOf` keeps the runtime
 * exactly what `String` was — Atomico's `type()` is the identity — and makes
 * the declared type the literal union. scripts/build-cem.mjs reads the same
 * call, so the manifest carries the union too, and the API contract test
 * holds the two to each other.
 */
export const oneOf = <const Values extends readonly [string, ...string[]]>(...values: Values) =>
	atomicoType<Values[number]>(String)
