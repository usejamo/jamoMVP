import { useState, useEffect, useRef, useCallback } from 'react'
import type { DraftSection, Annotation, AnnotationSourceType, PendingSuggestion } from '../types/draft'
import { DEMO_COMMANDS } from '../data/demoCommands'
import RenderBlock from './RenderBlock'
import SuggestedChange from './SuggestedChange'

const SOURCE_META: Record<AnnotationSourceType, { dot: string; badge: string; quoteBorder: string; label: string }> = {
  rfp:      { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700',  quoteBorder: 'border-amber-300',  label: 'RFP' },
  kickoff:  { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700',    quoteBorder: 'border-blue-300',   label: 'Kick-off Call' },
  template: { dot: 'bg-purple-400', badge: 'bg-purple-50 text-purple-700',quoteBorder: 'border-purple-300', label: 'Template' },
  other:    { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700',  quoteBorder: 'border-green-300',  label: 'Document' },
}

const HIGHLIGHT_LEGEND: Record<AnnotationSourceType, string> = {
  rfp:      'bg-amber-100',
  kickoff:  'bg-blue-100',
  template: 'bg-purple-100',
  other:    'bg-green-100',
}

interface PopoverState {
  annotation: Annotation
  anchorRect: DOMRect
}

function AnnotationPopover({ state, onClose }: { state: PopoverState; onClose: () => void }) {
  const meta = SOURCE_META[state.annotation.sourceType]
  const ref = useRef<HTMLDivElement>(null)
  const POPOVER_WIDTH = 320
  const GAP = 8

  const rawTop = state.anchorRect.bottom + GAP
  const rawLeft = state.anchorRect.left
  const clampedLeft = Math.min(rawLeft, window.innerWidth - POPOVER_WIDTH - 16)

  const [top, setTop] = useState(rawTop)
  useEffect(() => {
    if (ref.current) {
      const popRect = ref.current.getBoundingClientRect()
      if (popRect.bottom > window.innerHeight - 16) {
        setTop(state.anchorRect.top - popRect.height - GAP)
      }
    }
  }, [state.anchorRect.top, state.anchorRect.bottom])

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
      style={{ width: POPOVER_WIDTH, top, left: clampedLeft }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
            {meta.label}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="text-xs font-medium text-gray-600 truncate">{state.annotation.sourceDoc}</p>
        </div>
        <blockquote className={`text-xs text-gray-600 leading-relaxed border-l-2 pl-3 italic ${meta.quoteBorder}`}>
          "{state.annotation.quote}"
        </blockquote>
      </div>
    </div>
  )
}

function DraftNav({ sections, activeId }: { sections: DraftSection[]; activeId: string }) {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="sticky top-8 self-start w-48 shrink-0 pr-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contents</p>
      <ul className="space-y-0.5">
        {sections.map(section => {
          const isActive = activeId === section.id
          const label = section.title.replace(/^\d+\.\s*/, '')
          return (
            <li key={section.id}>
              <button
                onClick={() => scrollTo(section.id)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors leading-snug ${
                  isActive
                    ? 'bg-jamo-50 text-jamo-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
              {section.subsections && isActive && (
                <ul className="mt-0.5 mb-1 ml-2 space-y-0.5 border-l border-gray-100 pl-2">
                  {section.subsections.map(sub => (
                    <li key={sub.id}>
                      <button
                        onClick={() => scrollTo(sub.id)}
                        className="w-full text-left text-xs px-2 py-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors leading-snug"
                      >
                        {sub.title.replace(/^\d+\.\d+\s*/, '')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

interface Props {
  sections: DraftSection[]
  pendingSuggestion: PendingSuggestion | null
  onSuggestionAccepted: (commandKey: string) => void
  onSuggestionDeclined: () => void
}

export default function ProposalDraftRenderer({
  sections,
  pendingSuggestion,
  onSuggestionAccepted,
  onSuggestionDeclined,
}: Props) {
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const ids = sections.map(s => s.id)
    const observers: IntersectionObserver[] = []
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [sections])

  useEffect(() => {
    const close = () => setPopover(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const handleAnnotationClick = useCallback((e: React.MouseEvent<HTMLSpanElement>, annotation: Annotation) => {
    e.stopPropagation()
    const anchorRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopover({ annotation, anchorRect })
  }, [])

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        <span className="text-xs text-gray-400 font-medium">Source highlights:</span>
        {(['rfp', 'kickoff', 'other'] as AnnotationSourceType[]).map(type => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`inline-block w-3 h-3 rounded-sm ${HIGHLIGHT_LEGEND[type]}`} />
            {SOURCE_META[type].label}
          </span>
        ))}
      </div>

      {/* Two-column: nav + content */}
      <div className="flex gap-2">
        <DraftNav sections={sections} activeId={activeId} />

        <div className="flex-1 min-w-0">
          {sections.map(section => {
            const isSuggested = pendingSuggestion?.targetId === section.id
            const command = isSuggested
              ? DEMO_COMMANDS.find(c => c.key === pendingSuggestion!.commandKey)
              : null

            const sectionContent = (
              <>
                {section.blocks.map((block, i) => (
                  <RenderBlock key={i} block={block} onAnnotationClick={handleAnnotationClick} />
                ))}
                {section.subsections?.map(sub => (
                  <div key={sub.id} id={sub.id} className="mt-4 ml-2 scroll-mt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">{sub.title}</h4>
                    {sub.blocks.map((block, i) => (
                      <RenderBlock key={i} block={block} onAnnotationClick={handleAnnotationClick} />
                    ))}
                  </div>
                ))}
              </>
            )

            return (
              <div key={section.id} id={section.id} className="mb-8 scroll-mt-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">
                  {section.title}
                </h3>

                {isSuggested && command ? (
                  <SuggestedChange
                    explanation={command.explanation}
                    suggestedPreview={command.suggestedPreview}
                    acceptedBlocks={command.acceptedBlocks}
                    originalChildren={sectionContent}
                    onAccept={() => onSuggestionAccepted(command.key)}
                    onDecline={onSuggestionDeclined}
                  />
                ) : (
                  sectionContent
                )}
              </div>
            )
          })}
        </div>
      </div>

      {popover && (
        <AnnotationPopover state={popover} onClose={() => setPopover(null)} />
      )}
    </div>
  )
}
