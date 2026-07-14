import { Client, collectPaginatedAPI, isFullBlock, isFullPage } from "@notionhq/client"
import type { BlockObjectResponse, PageObjectResponse } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID!

export interface Post {
  id: string
  title: string
  tags: string[]
  createdAt: string | null
  contentPreview: string
}

export type BlockWithChildren = BlockObjectResponse & {
  children: BlockWithChildren[]
}

function mapPageToPost(page: PageObjectResponse): Post {
  const props = page.properties

  const titleProp = props["이름"]
  const title =
    titleProp?.type === "title"
      ? titleProp.title.map((t) => t.plain_text).join("")
      : "제목 없음"

  const tagsProp = props["Tags"]
  const tags = tagsProp?.type === "multi_select"
    ? tagsProp.multi_select.map((t) => t.name)
    : []

  const dateProp = props["CreatedAt"]
  const createdAt =
    dateProp?.type === "date" ? dateProp.date?.start ?? null : null

  const contentProp = props["Content"]
  const contentPreview =
    contentProp?.type === "rich_text"
      ? contentProp.rich_text.map((t) => t.plain_text).join("")
      : ""

  return { id: page.id, title, tags, createdAt, contentPreview }
}

/** 학습노트 목록을 최신순으로 가져온다 (F001). 100개를 넘어도 전부 가져온다. */
export async function getPosts(): Promise<Post[]> {
  const results = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: DATA_SOURCE_ID,
    sorts: [{ property: "CreatedAt", direction: "descending" }],
  })

  return results.filter(isFullPage).map(mapPageToPost)
}

/** 단일 글의 속성을 가져온다 (F002). 존재하지 않는 id는 null을 반환한다. */
export async function getPost(id: string): Promise<Post | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id })
    if (!isFullPage(page)) return null
    return mapPageToPost(page)
  } catch {
    return null
  }
}

/** 페이지 본문 블록을 하위 블록까지 재귀적으로 가져온다 (F002). 100개를 넘어도 전부 가져온다. */
export async function getPostBlocks(
  blockId: string
): Promise<BlockWithChildren[]> {
  const results = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: blockId,
  })

  const blocks = await Promise.all(
    results.filter(isFullBlock).map(async (block) => {
      const children = block.has_children
        ? await getPostBlocks(block.id)
        : []
      return { ...block, children }
    })
  )

  return blocks
}
