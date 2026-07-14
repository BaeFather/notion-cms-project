export const siteConfig = {
  name: "학습노트",
  description: "Notion을 CMS로 사용하는 개인 학습 노트",
  url: "https://example.com",
  nav: [{ title: "홈", href: "/" }],
  links: {
    github: "https://github.com",
  },
} as const

export type SiteConfig = typeof siteConfig
