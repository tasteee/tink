import { interactionStyles } from '../shared/interaction-styles'
import { defineElement } from "../shared/define-element";
import { c, css } from "atomico";
import { oneOf } from '../shared/prop-types'

/*
 * z-progress, a slim linear meter. Hairline track, accent-filled bar. Supports
 * a determinate value (0–max) or an indeterminate sweep (is-indeterminate).
 * No shadows; the fill is a flat accent band.
 */
const styles = css`
  :host {
    display: block;
    width: 100%;
    --accent: var(--color-neutral-8);
  }

  :host([tone="secondary"]) {
    --accent: var(--pink);
  }

  :host([tone="success"]) {
    --accent: var(--success);
  }
  :host([tone="danger"]) {
    --accent: var(--destructive);
  }

  :host([is-hidden]) {
    display: none;
  }

  .track {
    position: relative;
    width: 100%;
    height: var(--bar-height, 0.5rem);
    background: color-mix(in oklch, var(--border) 70%, transparent);
    border-radius: 999px;
    overflow: hidden;
  }

  :host([size="sm"]) .track {
    --bar-height: 0.3125rem;
  }
  :host([size="lg"]) .track {
    --bar-height: 0.75rem;
  }

	.bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		border-radius: 999px;
		background: var(--accent);
		transition: width var(--motion-slow) var(--ease-enter);
	}

  .track.is-indeterminate .bar {
    width: 35% !important;
    animation: z-progress-sweep 1.2s ease-in-out infinite;
  }

  @keyframes z-progress-sweep {
    0% {
      left: -35%;
    }
    100% {
      left: 100%;
    }
  }
`;
export const ZProgress = c(
  (props) => {
    const isMaxNumber =
      typeof props.max === "number" && Number.isFinite(props.max) && props.max > 0;
    const isValueNumber =
      typeof props.value === "number" && Number.isFinite(props.value);
    const propsValue = (isValueNumber ? props.value : 0) as number;
    const max = (isMaxNumber ? props.max : 100) as number;
    const value = isValueNumber ? Math.max(0, Math.min(propsValue, max)) : 0;
    const pct = max > 0 ? (value / max) * 100 : 0;

    return (
      <host
        shadowDom
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax={String(max)}
        aria-valuenow={props.isIndeterminate ? undefined : String(value)}
      >
        <div class={props.isIndeterminate ? "track is-indeterminate" : "track"}>
          <div class="bar" style={{ width: String(pct) + "%" }}></div>
        </div>
      </host>
    );
  },
  {
    props: {
      value: { type: Number, reflect: true },
      max: { type: Number, reflect: true },
      tone: { type: oneOf('neutral', 'secondary', 'success', 'danger'), reflect: true },
      size: { type: String, reflect: true },
      isIndeterminate: { type: Boolean, reflect: true },
      isHidden: { type: Boolean, reflect: true },
    },
    styles: [styles, interactionStyles],
  },
);

defineElement("z-progress", ZProgress);
