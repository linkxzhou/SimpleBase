import { marked } from 'marked'
import { resolveDocsHref } from './catalog'
import type { DocsTocItem } from './types'

marked.setOptions({ gfm: true, breaks: false })

export interface RenderedDocs {
  html: string
  toc: DocsTocItem[]
}

export function renderMarkdown(source: string, fromFile: string): RenderedDocs {
  const raw = marked.parse(source, { async: false }) as string
  const usedIds = new Map<string, number>()
  const toc: DocsTocItem[] = []

  const html = raw
    .replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_all, levelStr: string, inner: string) => {
      const level = Number(levelStr)
      const text = stripTags(inner)
      const id = uniqueId(slugify(text), usedIds)
      if (level === 2 || level === 3) {
        toc.push({ id, text, level })
      }
      return `<h${level} id="${escapeAttr(id)}">${inner}</h${level}>`
    })
    .replace(/<a\s+([^>]*?)href="([^"]*)"([^>]*)>/g, (all, pre: string, href: string, post: string) => {
      const decoded = decodeHref(href)
      const next = resolveDocsHref(decoded, fromFile) ?? rewriteHashOnly(decoded)
      if (!next) return all
      const external = /^https?:\/\//i.test(next)
      const extra = external ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a ${pre}href="${escapeAttr(next)}"${post}${extra}>`
    })

  return { html, toc }
}

function rewriteHashOnly(href: string): string | undefined {
  return href.startsWith('#') ? href : undefined
}

function slugify(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'section'
}

function uniqueId(base: string, used: Map<string, number>): string {
  const n = used.get(base) ?? 0
  used.set(base, n + 1)
  return n === 0 ? base : `${base}-${n + 1}`
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function decodeHref(href: string): string {
  try {
    return decodeURIComponent(href)
  } catch {
    return href
  }
}
