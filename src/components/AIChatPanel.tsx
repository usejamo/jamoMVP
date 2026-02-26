import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DEMO_COMMANDS, matchCommand } from '../data/demoCommands'
import type { PendingSuggestion } from '../types/draft'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isThinking?: boolean
}

interface Props {
  draftGenerated: boolean
  onCommand: (suggestion: PendingSuggestion) => void
  onSuggestionResolved: () => void
  lastResolution: 'accepted' | 'declined' | null
}

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content: "Hi — I'm jamo AI. I can help you refine this proposal. Try one of the quick edits below, or type your own instruction.",
}

export default function AIChatPanel({ draftGenerated, onCommand, onSuggestionResolved, lastResolution }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // When a suggestion is accepted/declined, send a follow-up message
  useEffect(() => {
    if (!lastResolution) return
    const msg: ChatMessage = {
      id: `resolution-${Date.now()}`,
      role: 'assistant',
      content: lastResolution === 'accepted'
        ? "Change applied. The proposal has been updated."
        : "No problem — the original content has been kept.",
    }
    setMessages(prev => [...prev, msg])
    onSuggestionResolved()
  }, [lastResolution, onSuggestionResolved])

  function handleSubmit(text: string) {
    if (!text.trim() || pending) return

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text.trim() }
    const thinkingMsg: ChatMessage = { id: 'thinking', role: 'assistant', content: '', isThinking: true }
    setMessages(prev => [...prev, userMsg, thinkingMsg])
    setInput('')
    setPending(true)

    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== 'thinking'))

      if (!draftGenerated) {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: "Please generate the proposal draft first — I need the content loaded before I can make edits.",
        }])
        setPending(false)
        return
      }

      const command = matchCommand(text)
      if (command) {
        const assistantMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: command.assistantMessage }
        setMessages(prev => [...prev, assistantMsg])

        const el = document.getElementById(command.targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }

        setTimeout(() => {
          onCommand({
            commandKey: command.key,
            targetId: command.targetId,
            explanation: command.explanation,
            suggestedPreview: command.suggestedPreview,
            status: 'pending',
          })
          setPending(false)
        }, 600)
      } else {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: "I didn't catch that. Try one of the quick actions below, or rephrase your request.",
        }])
        setPending(false)
      }
    }, 900)
  }

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-100 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-jamo-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">jamo AI</p>
          <p className="text-xs text-gray-400">Proposal assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.isThinking ? (
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-jamo-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick action chips */}
      {!pending && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
          {DEMO_COMMANDS.map(cmd => (
            <button
              key={cmd.key}
              onClick={() => handleSubmit(cmd.label)}
              className="text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 px-2.5 py-1 rounded-full transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-jamo-300 focus-within:ring-2 focus-within:ring-jamo-100 transition-all">
          <input
            className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none"
            placeholder="Ask jamo to edit..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(input) }}
            disabled={pending}
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || pending}
            className="w-6 h-6 rounded-lg bg-jamo-500 hover:bg-jamo-600 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
