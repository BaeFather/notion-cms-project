import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { NotionBlocks } from "@/components/notion/notion-blocks"
import { getPost, getPostBlocks } from "@/lib/notion"
import { formatDate } from "@/lib/utils"

export const revalidate = 60

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  return { title: post?.title ?? "글을 찾을 수 없음" }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  const blocks = await getPostBlocks(id)

  return (
    <div className="py-10">
      <Container className="max-w-3xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          목록으로
        </Link>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <span className="text-sm text-muted-foreground">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        <NotionBlocks blocks={blocks} />
      </Container>
    </div>
  )
}
