import {
  Client,
  collectPaginatedAPI,
  isFullBlock,
  isFullPage,
  isNotionClientError,
  APIErrorCode,
  ClientErrorCode,
} from "@notionhq/client"
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

/** Notion/네트워크 에러를 사용자에게 보여줄 친절한 메시지로 변환한다 */
function toFriendlyError(error: unknown): Error {
  if (isNotionClientError(error)) {
    switch (error.code) {
      case APIErrorCode.Unauthorized:
      case APIErrorCode.RestrictedResource:
        return new Error(
          "Notion 연동 권한에 문제가 있습니다. 통합이 데이터베이스에 연결되어 있는지 확인해주세요."
        )
      case APIErrorCode.ObjectNotFound:
        return new Error("요청한 데이터를 Notion에서 찾을 수 없습니다.")
      case APIErrorCode.RateLimited:
      case APIErrorCode.ServiceOverload:
      case APIErrorCode.ServiceUnavailable:
      case APIErrorCode.GatewayTimeout:
      case APIErrorCode.InternalServerError:
      case ClientErrorCode.RequestTimeout:
        return new Error(
          "Notion 서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요."
        )
      default:
        return new Error(`${error.message} 잠시 후 다시 시도해주세요.`)
    }
  }
  return new Error(
    "일시적인 네트워크 오류가 발생하여 잠시 후 다시 시도해주세요."
  )
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

  return { id: page.id, title, tags, createdAt, contentPreview: "" }
}

/** 블록의 rich_text를 순수 텍스트로 추출한다. rich_text가 없는 블록 타입은 빈 문자열을 반환한다. */
function extractPlainText(block: BlockObjectResponse): string {
  switch (block.type) {
    case "paragraph":
      return block.paragraph.rich_text.map((t) => t.plain_text).join("")
    case "heading_1":
      return block.heading_1.rich_text.map((t) => t.plain_text).join("")
    case "heading_2":
      return block.heading_2.rich_text.map((t) => t.plain_text).join("")
    case "heading_3":
      return block.heading_3.rich_text.map((t) => t.plain_text).join("")
    case "quote":
      return block.quote.rich_text.map((t) => t.plain_text).join("")
    case "callout":
      return block.callout.rich_text.map((t) => t.plain_text).join("")
    case "to_do":
      return block.to_do.rich_text.map((t) => t.plain_text).join("")
    case "bulleted_list_item":
      return block.bulleted_list_item.rich_text.map((t) => t.plain_text).join("")
    case "numbered_list_item":
      return block.numbered_list_item.rich_text.map((t) => t.plain_text).join("")
    case "toggle":
      return block.toggle.rich_text.map((t) => t.plain_text).join("")
    default:
      return ""
  }
}

/** 본문이 없으면 빈 문자열, maxLength 이하면 그대로, 넘으면 잘라서 "..."을 붙인다 */
function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim()
  if (trimmed.length === 0) return ""
  return trimmed.length > maxLength
    ? `${trimmed.slice(0, maxLength)}...`
    : trimmed
}

/** 글 본문 앞부분에서 미리보기 텍스트를 자동으로 추출한다 (F001 카드 미리보기, F004 검색 대상) */
async function getPostPreview(pageId: string, maxLength = 30): Promise<string> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 10,
    })
    const text = response.results
      .filter(isFullBlock)
      .map(extractPlainText)
      .join(" ")
    return truncate(text, maxLength)
  } catch {
    return ""
  }
}

/** 학습노트 목록을 최신순으로 가져온다 (F001). 100개를 넘어도 전부 가져온다. */
export async function getPosts(): Promise<Post[]> {
  try {
    const results = await collectPaginatedAPI(notion.dataSources.query, {
      data_source_id: DATA_SOURCE_ID,
      sorts: [{ property: "CreatedAt", direction: "descending" }],
    })

    const posts = results.filter(isFullPage).map(mapPageToPost)

    return await Promise.all(
      posts.map(async (post) => ({
        ...post,
        contentPreview: await getPostPreview(post.id),
      }))
    )
  } catch (error) {
    throw toFriendlyError(error)
  }
}

/** 단일 글의 속성을 가져온다 (F002). 존재하지 않는 글은 null을 반환하고, 그 외 에러는 던진다. */
export async function getPost(id: string): Promise<Post | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id })
    if (!isFullPage(page)) return null
    return mapPageToPost(page)
  } catch (error) {
    if (
      isNotionClientError(error) &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return null
    }
    throw toFriendlyError(error)
  }
}

/** 페이지 본문 블록을 하위 블록까지 재귀적으로 가져온다 (F002). 100개를 넘어도 전부 가져온다. */
export async function getPostBlocks(
  blockId: string
): Promise<BlockWithChildren[]> {
  try {
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
  } catch (error) {
    throw toFriendlyError(error)
  }
}
