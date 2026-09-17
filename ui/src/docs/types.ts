export interface DocsPageMeta {
  slug: string
  title: string
  file: string
}

export interface DocsModuleMeta {
  id: string
  title: string
  pages: DocsPageMeta[]
}

export interface DocsCatalog {
  title: string
  defaultModule: string
  defaultSlug: string
  modules: DocsModuleMeta[]
}

export interface DocsTocItem {
  id: string
  text: string
  level: 2 | 3
}

export interface ResolvedDocsPage {
  module: DocsModuleMeta
  page: DocsPageMeta
  path: string
}
