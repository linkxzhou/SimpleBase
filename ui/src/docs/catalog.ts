import catalogJson from '../../../docs/_meta.json'
import type { DocsCatalog, DocsModuleMeta, DocsPageMeta, ResolvedDocsPage } from './types'

/**
 * Vite 的 import.meta.glob 只能使用相对字面量（不能把 @docs alias 写进 glob）。
 * 路径相对本文件指向仓库根 docs/：ui/src/docs → ../../../docs。
 * 懒加载，避免把 ducklake-docs.md 打进首包。
 */
const markdownLoaders = import.meta.glob<string>('../../../docs/**/*.md', {
  query: '?raw',
  import: 'default'
})

export const docsCatalog = catalogJson as DocsCatalog

export const defaultDocsRoute = {
  module: docsCatalog.defaultModule,
  slug: docsCatalog.defaultSlug
} as const

const loaderByFile = new Map<string, () => Promise<string>>()
for (const [globKey, loader] of Object.entries(markdownLoaders)) {
  const file = toDocsRelative(globKey)
  if (file) loaderByFile.set(file, loader)
}

export function loaderCount(): number {
  return loaderByFile.size
}

export function findModule(moduleId: string | undefined): DocsModuleMeta | undefined {
  if (!moduleId) return undefined
  return docsCatalog.modules.find((m) => m.id === moduleId)
}

export function findPage(
  moduleId: string | undefined,
  slug: string | undefined
): ResolvedDocsPage | undefined {
  const mod = findModule(moduleId)
  if (!mod) return undefined
  const page = slug
    ? mod.pages.find((p) => p.slug === slug)
    : mod.pages[0]
  if (!page) return undefined
  return { module: mod, page, path: docsPath(mod.id, page.slug) }
}

export function firstPageOf(mod: DocsModuleMeta): DocsPageMeta | undefined {
  return mod.pages[0]
}

export function docsPath(moduleId: string, slug: string): string {
  return `/docs/${moduleId}/${slug}`
}

export function loadMarkdownFile(file: string): Promise<string> | undefined {
  const loader = loaderByFile.get(normalizeFile(file))
  return loader?.()
}

/** 将 markdown 相对链接（.md / docs/xxx.md）解析为 wiki 路由 */
export function resolveDocsHref(href: string, fromFile: string): string | undefined {
  const trimmed = href.trim()
  if (!trimmed || trimmed.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return undefined
  }
  const [pathPart, hash = ''] = trimmed.split('#')
  const hashSuffix = hash ? `#${hash}` : ''
  if (pathPart.startsWith('/docs/')) return `${pathPart}${hashSuffix}`

  const fromDir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/')) : ''
  let rel = pathPart.replace(/^\.\//, '')
  if (rel.startsWith('docs/')) rel = rel.slice('docs/'.length)
  rel = normalizeFile(joinDocsPath(fromDir, rel))
  if (rel.endsWith('.md')) {
    const hit = pageByFile(rel)
    if (hit) return `${hit.path}${hashSuffix}`
  }
  return undefined
}

export function pageByFile(file: string): ResolvedDocsPage | undefined {
  const want = normalizeFile(file)
  for (const mod of docsCatalog.modules) {
    for (const page of mod.pages) {
      if (normalizeFile(page.file) === want) {
        return { module: mod, page, path: docsPath(mod.id, page.slug) }
      }
    }
  }
  return undefined
}

function toDocsRelative(globKey: string): string {
  const clean = globKey.replace(/\\/g, '/').replace(/\?.*$/, '')
  const marker = '/docs/'
  const idx = clean.lastIndexOf(marker)
  if (idx >= 0) return clean.slice(idx + marker.length)
  if (clean.startsWith('docs/')) return clean.slice('docs/'.length)
  const prefix = '../../../docs/'
  if (clean.startsWith(prefix)) return clean.slice(prefix.length)
  return ''
}

function normalizeFile(file: string): string {
  return file.replace(/\\/g, '/').replace(/^\.\//, '')
}

function joinDocsPath(fromDir: string, rel: string): string {
  if (rel.startsWith('/')) return rel.replace(/^\/+/, '')
  const parts = (fromDir ? fromDir.split('/') : []).concat(rel.split('/'))
  const out: string[] = []
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return out.join('/')
}
