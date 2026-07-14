"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/components/notion/post-card"
import type { Post } from "@/lib/notion"

export function PostExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPosts = posts.filter((post) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.contentPreview.toLowerCase().includes(normalizedQuery)
    const matchesTag = !activeTag || post.tags.includes(activeTag)
    return matchesQuery && matchesTag
  })

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목이나 본문으로 검색"
          className="h-9 pl-8"
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              <Badge variant={activeTag === tag ? "default" : "outline"}>
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          조건에 맞는 글이 없습니다.
        </p>
      )}
    </div>
  )
}
