import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { siteConfig } from "@/config/site"
import { Container } from "@/components/layout/container"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-8">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </Container>
    </footer>
  )
}
