export interface SbDepsConfig {
	/**
	 * Prefix prepended to Angular component selectors.
	 * Defaults to `'app-'`. Set to `''` for no prefix.
	 * @example 'app-'  →  selector: 'app-button-atom'
	 * @example 'my-'   →  selector: 'my-button-atom'
	 * @example ''      →  selector: 'button-atom'
	 */
	angularSelectorPrefix?: string
}

export function defineSbDepsConfig(config: SbDepsConfig): SbDepsConfig {
	return config
}
