import { Fragment } from "react"
import type { RichTextItemResponse } from "@notionhq/client"

import { cn } from "@/lib/utils"
import type { BlockWithChildren } from "@/lib/notion"

function RichText({ richText }: { richText: RichTextItemResponse[] }) {
  return (
    <>
      {richText.map((text, i) => {
        const { annotations, plain_text, href } = text
        let node: React.ReactNode = plain_text

        if (annotations.code) {
          node = (
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              {node}
            </code>
          )
        }
        if (annotations.bold) node = <strong>{node}</strong>
        if (annotations.italic) node = <em>{node}</em>
        if (annotations.strikethrough) node = <s>{node}</s>
        if (annotations.underline) node = <u>{node}</u>
        if (href) {
          node = (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              {node}
            </a>
          )
        }

        return <Fragment key={i}>{node}</Fragment>
      })}
    </>
  )
}

function renderBlock(block: BlockWithChildren): React.ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="leading-7">
          <RichText richText={block.paragraph.rich_text} />
        </p>
      )
    case "heading_1":
      return (
        <h2 className="mt-8 text-2xl font-semibold">
          <RichText richText={block.heading_1.rich_text} />
        </h2>
      )
    case "heading_2":
      return (
        <h3 className="mt-6 text-xl font-semibold">
          <RichText richText={block.heading_2.rich_text} />
        </h3>
      )
    case "heading_3":
      return (
        <h4 className="mt-4 text-lg font-semibold">
          <RichText richText={block.heading_3.rich_text} />
        </h4>
      )
    case "quote":
      return (
        <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
          <RichText richText={block.quote.rich_text} />
        </blockquote>
      )
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>
            {block.code.rich_text.map((t) => t.plain_text).join("")}
          </code>
        </pre>
      )
    case "divider":
      return <hr className="my-6 border-border" />
    case "image": {
      const { image } = block
      const src =
        image.type === "external" ? image.external.url : image.file.url
      const caption = image.caption.map((t) => t.plain_text).join("")
      return (
        <figure className="space-y-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- Notion 서명 URL은 만료되므로 next/image 최적화 대신 원본을 직접 사용 */}
          <img src={src} alt={caption || "이미지"} className="rounded-lg" />
          {caption && (
            <figcaption className="text-center text-sm text-muted-foreground">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }
    case "to_do":
      return (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={block.to_do.checked}
            disabled
            className="mt-1.5 size-4 rounded border-input"
          />
          <span
            className={cn(
              block.to_do.checked && "text-muted-foreground line-through"
            )}
          >
            <RichText richText={block.to_do.rich_text} />
          </span>
        </div>
      )
    case "callout": {
      const icon = block.callout.icon
      let iconNode: React.ReactNode = "📌"
      if (icon?.type === "emoji") iconNode = icon.emoji
      else if (icon?.type === "external")
        iconNode = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon.external.url} alt="" className="size-5" />
        )
      else if (icon?.type === "file")
        iconNode = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon.file.url} alt="" className="size-5" />
        )

      return (
        <div className="flex gap-3 rounded-lg bg-muted p-4">
          <span className="text-lg leading-none">{iconNode}</span>
          <div className="leading-7">
            <RichText richText={block.callout.rich_text} />
          </div>
        </div>
      )
    }
    case "toggle":
      return (
        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer font-medium">
            <RichText richText={block.toggle.rich_text} />
          </summary>
          {block.children.length > 0 && (
            <div className="mt-2 pl-4">
              <NotionBlocks blocks={block.children} />
            </div>
          )}
        </details>
      )
    default:
      return null
  }
}

/** Notion 페이지 본문 블록을 렌더링한다 (F002). 연속된 목록 블록은 ul/ol로 묶는다. */
export function NotionBlocks({ blocks }: { blocks: BlockWithChildren[] }) {
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item"
    ) {
      const listType = block.type
      const items: BlockWithChildren[] = []
      while (i < blocks.length && blocks[i].type === listType) {
        items.push(blocks[i])
        i++
      }

      const ListTag = listType === "bulleted_list_item" ? "ul" : "ol"
      elements.push(
        <ListTag
          key={items[0].id}
          className={cn(
            "ml-6 space-y-1",
            listType === "bulleted_list_item" ? "list-disc" : "list-decimal"
          )}
        >
          {items.map((item) => {
            const richText =
              item.type === "bulleted_list_item"
                ? item.bulleted_list_item.rich_text
                : item.type === "numbered_list_item"
                  ? item.numbered_list_item.rich_text
                  : []
            return (
              <li key={item.id}>
                <RichText richText={richText} />
                {item.children.length > 0 && (
                  <NotionBlocks blocks={item.children} />
                )}
              </li>
            )
          })}
        </ListTag>
      )
      continue
    }

    elements.push(<Fragment key={block.id}>{renderBlock(block)}</Fragment>)
    i++
  }

  return <div className="space-y-4">{elements}</div>
}
