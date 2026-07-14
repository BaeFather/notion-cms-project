import { Container } from "@/components/layout/container"
import { PostExplorer } from "@/components/notion/post-explorer"
import { getPosts } from "@/lib/notion"

export const revalidate = 60

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="py-10">
      <Container className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">학습노트</h1>
          <p className="text-muted-foreground">
            Notion에 기록한 학습 내용을 모아봅니다.
          </p>
        </div>

        <PostExplorer posts={posts} />
      </Container>
    </div>
  )
}
