import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { Post } from "@/lib/notion"

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
          {post.contentPreview && (
            <CardDescription className="line-clamp-2">
              {post.contentPreview}
            </CardDescription>
          )}
        </CardHeader>
        <div className="flex flex-wrap items-center gap-1.5 px-(--card-spacing)">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="px-(--card-spacing) text-xs text-muted-foreground">
          {formatDate(post.createdAt)}
        </p>
      </Card>
    </Link>
  )
}
