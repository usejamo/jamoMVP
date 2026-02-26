import type { ContentBlock, Segment, Annotation } from '../types/draft'

function RenderSegment({
  seg,
  onAnnotationClick,
}: {
  seg: Segment
  onAnnotationClick: (e: React.MouseEvent<HTMLSpanElement>, annotation: Annotation) => void
}) {
  if ('plain' in seg) return <>{seg.plain}</>
  const { text, annotation } = seg

  const HIGHLIGHT: Record<string, string> = {
    rfp:      'bg-amber-100 border-b-2 border-amber-400 cursor-pointer hover:bg-amber-200',
    kickoff:  'bg-blue-100 border-b-2 border-blue-400 cursor-pointer hover:bg-blue-200',
    template: 'bg-purple-100 border-b-2 border-purple-400 cursor-pointer hover:bg-purple-200',
    other:    'bg-green-100 border-b-2 border-green-400 cursor-pointer hover:bg-green-200',
  }

  return (
    <span
      className={`rounded-sm px-0.5 transition-colors ${HIGHLIGHT[annotation.sourceType] ?? ''}`}
      onClick={e => onAnnotationClick(e, annotation)}
      title={`Source: ${annotation.sourceDoc}`}
    >
      {text}
    </span>
  )
}

export default function RenderBlock({
  block,
  onAnnotationClick,
}: {
  block: ContentBlock
  onAnnotationClick: (e: React.MouseEvent<HTMLSpanElement>, annotation: Annotation) => void
}) {
  if (block.kind === 'p') {
    return (
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        {block.segments.map((seg, i) => (
          <RenderSegment key={i} seg={seg} onAnnotationClick={onAnnotationClick} />
        ))}
      </p>
    )
  }

  if (block.kind === 'ul') {
    return (
      <ul className="list-disc list-outside ml-5 space-y-1 mb-3">
        {block.items.map((item, i) => (
          <li key={i} className="text-sm text-gray-700 leading-relaxed">
            {item.map((seg, j) => (
              <RenderSegment key={j} seg={seg} onAnnotationClick={onAnnotationClick} />
            ))}
          </li>
        ))}
      </ul>
    )
  }

  if (block.kind === 'table') {
    return (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {block.headers.map((h, i) => (
                <th key={i} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border border-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 text-gray-700 border border-gray-200 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
