import { execFileSync } from 'node:child_process'
import { relative as pathRelative } from 'node:path'

export type GitProvider =
	| 'github'
	| 'gitlab'
	| 'bitbucket'
	| 'azure-devops'
	| 'codeberg'
	| 'gitea'
	| 'sourcehut'
	| 'gitee'
	| 'unknown'

export type DetectedProjectUrl = {
	/** Empty when `provider` is `'azure-devops'` or `'unknown'`. */
	url: string
	provider: GitProvider
	host: string
	/** The owner/repo segment, with any trailing `.git` stripped. May contain slashes (nested GitLab groups). */
	ownerRepo: string
	/** URL scheme used to build the project URL. Preserved from the parsed origin when it's `http` or `https`; defaults to `https` for SSH/SCP-style origins. */
	scheme: 'http' | 'https'
	branch: string
	branchSource: 'origin-head' | 'fallback-main'
	/** POSIX-slash path from git root to cwd. Empty string when cwd is the git root. */
	subpath: string
	/** Surfaced when we deliberately skip auto-apply (e.g. Azure DevOps, unparseable origin). */
	warning?: string
}

/**
 * Run a git subcommand, returning trimmed stdout or `null` on any failure.
 * Never throws — every error path (no git, not a repo, non-zero exit, timeout)
 * collapses to `null` so callers can fall through to manual entry.
 */
function runGit(cwd: string, args: ReadonlyArray<string>): string | null {
	try {
		const out = execFileSync('git', args, {
			cwd,
			timeout: 1500,
			stdio: ['ignore', 'pipe', 'ignore'],
			encoding: 'utf8',
		})
		return out.trim() || null
	} catch {
		return null
	}
}

function getOriginUrl(cwd: string): string | null {
	return runGit(cwd, ['config', '--get', 'remote.origin.url'])
}

function getGitRoot(cwd: string): string | null {
	return runGit(cwd, ['rev-parse', '--show-toplevel'])
}

function getDefaultBranch(
	cwd: string,
): { branch: string; source: DetectedProjectUrl['branchSource'] } {
	const raw = runGit(cwd, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])
	// `git symbolic-ref --short` returns e.g. `origin/main`. Strip the leading
	// `origin/` segment to get the bare branch name.
	if (raw) {
		const slash = raw.indexOf('/')
		const branch = slash >= 0 ? raw.slice(slash + 1) : raw
		if (branch) return { branch, source: 'origin-head' }
	}
	return { branch: 'main', source: 'fallback-main' }
}

function computeSubpath(gitRoot: string, cwd: string): string {
	const rel = pathRelative(gitRoot, cwd)
	if (!rel || rel === '.') return ''
	// Path-relative may emit backslashes on Windows; the URLs we build are POSIX-style.
	return rel.replace(/\\/g, '/')
}

type ParsedOrigin = {
	scheme: 'http' | 'https'
	host: string
	/**
	 * Optional non-default port from a protocol-style origin (e.g. `7990` from
	 * `http://git.mycorp.local:7990/...`). Preserved so self-hosted instances
	 * served on a non-default port still produce working view-source URLs.
	 * Empty string when the origin didn't specify a port.
	 */
	port: string
	ownerRepo: string
}

/**
 * Normalise the variety of forms a git origin can take into a `{ scheme, host, ownerRepo }`
 * triple. Trailing `.git` is stripped from the path. Returns `null` if the
 * input doesn't look like any of the supported shapes.
 *
 * `scheme` is preserved from the original origin only for `http://` and
 * `https://` URLs (the two schemes that can legitimately appear in a web
 * "view source" URL). Non-web protocols (`ssh://`, `git://`) and SCP-style
 * origins (`git@host:path`) default to `https` since the web equivalent of
 * those clone URLs is HTTPS in practice.
 *
 * Handled forms:
 * - `https://host/owner/repo.git`         → `scheme: 'https'`
 * - `http://host/owner/repo.git`          → `scheme: 'http'`
 * - `git@host:owner/repo.git`             (SCP-style SSH) → `scheme: 'https'`
 * - `ssh://git@host[:port]/owner/repo.git` (SSH URL form)  → `scheme: 'https'`
 * - `git://host/owner/repo.git`           (git protocol)   → `scheme: 'https'`
 */
export function parseOriginUrl(raw: string): ParsedOrigin | null {
	const trimmed = raw.trim()
	if (!trimmed) return null

	// SCP-style: user@host:path  (no `://`, single colon separating host and path).
	// Must check this BEFORE protocol-style parsing because the protocol-style
	// regex would not match this, but anchoring on `://` lets us distinguish.
	if (!trimmed.includes('://')) {
		// `git@host:owner/repo.git` — single colon between host and path.
		// No port semantics in SCP-style URLs.
		const scp = trimmed.match(/^(?:([^@]+)@)?([^:]+):(.+)$/)
		if (scp) {
			const host = scp[2]!
			const ownerRepo = stripDotGit(scp[3]!.replace(/^\/+/, ''))
			if (host && ownerRepo)
				return { scheme: 'https', host, port: '', ownerRepo }
		}
		return null
	}

	// Protocol-style: <proto>://[user@]host[:port]/owner/repo.git
	const m = trimmed.match(
		/^([a-z][a-z0-9+.-]*):\/\/(?:[^@/]+@)?([^/:?#]+)(?::(\d+))?\/+(.+?)\/*$/i,
	)
	if (!m) return null
	const rawScheme = m[1]!.toLowerCase()
	const host = m[2]!
	const port = m[3] ?? ''
	const ownerRepo = stripDotGit(m[4]!)
	if (!host || !ownerRepo) return null
	// Preserve the scheme only when it's a web scheme; non-web protocols
	// (ssh, git) get rewritten to https.
	const scheme: 'http' | 'https' =
		rawScheme === 'http' ? 'http' : 'https'
	return { scheme, host, port, ownerRepo }
}

function stripDotGit(s: string): string {
	return s.endsWith('.git') ? s.slice(0, -4) : s
}

/**
 * Map a hostname to a known provider. Uses `endsWith` / `includes` semantics
 * (not exact match) so enterprise instances (`github.mycorp.com`,
 * `gitlab.acme.io`, `gitea.internal`) are still recognised. The cost of a
 * false positive here is a wrong URL the user has to fix manually in
 * preview.ts — acceptable trade against missing every self-hosted instance.
 */
export function providerFromHost(host: string): GitProvider {
	const h = host.toLowerCase()
	if (h === 'github.com' || h.includes('github')) return 'github'
	if (h === 'gitlab.com' || h.includes('gitlab')) return 'gitlab'
	if (h === 'bitbucket.org') return 'bitbucket'
	if (
		h === 'dev.azure.com' ||
		h === 'ssh.dev.azure.com' ||
		h.endsWith('.visualstudio.com')
	)
		return 'azure-devops'
	if (h === 'codeberg.org') return 'codeberg'
	if (h.includes('gitea') || h.includes('forgejo')) return 'gitea'
	if (h === 'git.sr.ht') return 'sourcehut'
	if (h === 'gitee.com') return 'gitee'
	return 'unknown'
}

/**
 * Build the project-root URL for the given provider. Pure string assembly —
 * the runtime concatenates this with the dep-graph componentPath (e.g.
 * `src/components/Foo.tsx`) via `URL + '/' + path`, so every shape we emit
 * must produce a working link under that concat.
 *
 * Returns `''` for providers whose URL shape is incompatible with the concat
 * (currently `azure-devops`) or where we have no known shape (`unknown`).
 */
export function buildUrl(
	provider: GitProvider,
	scheme: 'http' | 'https',
	host: string,
	port: string,
	ownerRepo: string,
	branch: string,
	subpath: string,
): string {
	const tail = subpath ? `/${subpath}` : ''
	const hostPort = port ? `${host}:${port}` : host
	const base = `${scheme}://${hostPort}/${ownerRepo}`

	switch (provider) {
		case 'github':
		case 'gitee':
			return `${base}/blob/${branch}${tail}`
		case 'gitlab':
			return `${base}/-/blob/${branch}${tail}`
		case 'bitbucket':
			return `${base}/src/${branch}${tail}`
		case 'codeberg':
		case 'gitea':
			return `${base}/src/branch/${branch}${tail}`
		case 'sourcehut':
			return `${base}/tree/${branch}/item${tail}`
		case 'azure-devops':
		case 'unknown':
			return ''
	}
}

export function detectProjectRepoUrl(cwd: string): DetectedProjectUrl | null {
	const gitRoot = getGitRoot(cwd)
	if (!gitRoot) return null

	const originRaw = getOriginUrl(cwd)
	if (!originRaw) return null

	const parsed = parseOriginUrl(originRaw)
	if (!parsed) {
		return {
			url: '',
			provider: 'unknown',
			host: '',
			ownerRepo: '',
			scheme: 'https',
			branch: 'main',
			branchSource: 'fallback-main',
			subpath: '',
			warning: `Could not parse the git origin URL (${originRaw}).`,
		}
	}

	const provider = providerFromHost(parsed.host)
	const { branch, source: branchSource } = getDefaultBranch(cwd)
	const subpath = computeSubpath(gitRoot, cwd)
	const url = buildUrl(
		provider,
		parsed.scheme,
		parsed.host,
		parsed.port,
		parsed.ownerRepo,
		branch,
		subpath,
	)

	let warning: string | undefined
	if (provider === 'azure-devops') {
		warning =
			"Azure DevOps repos aren't supported by auto-detect (the URL shape uses query strings that don't compose with component paths) — please enter a URL manually below."
	} else if (provider === 'unknown') {
		warning = `Unknown git host '${parsed.host}' — please enter a URL manually below.`
	}

	return {
		url,
		provider,
		host: parsed.host,
		ownerRepo: parsed.ownerRepo,
		scheme: parsed.scheme,
		branch,
		branchSource,
		subpath,
		warning,
	}
}
