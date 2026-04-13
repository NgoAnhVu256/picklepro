'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User, ShoppingCart, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestedProducts?: { id: string; name: string; brand: string; price: number; slug: string }[]
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [userClosed, setUserClosed] = useState(false)

  // Auto-open chatbot sau 2 giây trên desktop (không auto-open trên mobile)
  useEffect(() => {
    const wasClosed = sessionStorage.getItem('picklepro_chat_closed')
    if (wasClosed) {
      setUserClosed(true)
      return
    }
    // Không auto-open trên mobile (< 640px)
    if (typeof window !== 'undefined' && window.innerWidth < 640) return
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleToggle = () => {
    if (isOpen) {
      // User chủ động đóng → lưu lại, không auto-open nữa
      sessionStorage.setItem('picklepro_chat_closed', '1')
      setUserClosed(true)
    }
    setIsOpen(!isOpen)
  }
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Xin chào! 👋 Tôi là trợ lý AI của PicklePro. Tôi có thể giúp bạn:\n\n• Tư vấn chọn vợt Pickleball\n• Gợi ý phụ kiện phù hợp\n• So sánh sản phẩm\n\nBạn cần tôi hỗ trợ gì?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })



      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra')
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau! 🙏' },
        ])
        setLoading(false)
        return
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          suggestedProducts: data.suggestedProducts,
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Không thể kết nối server. Vui lòng kiểm tra mạng và thử lại.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-foreground text-background rotate-0'
            : 'bg-gradient-to-br from-lime to-lime-dark text-white shadow-lime/40'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Pulse ring when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-lime/30 animate-ping pointer-events-none" />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-8rem)] bg-white/95 backdrop-blur-xl border border-lime/20 rounded-3xl shadow-2xl shadow-lime/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-lime to-lime-dark px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">PicklePro AI</h3>
              <p className="text-white/70 text-xs">Tư vấn sản phẩm thông minh</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white/70 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-lime text-lime-dark rounded-br-md font-medium'
                        : 'bg-muted/50 text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Suggested Products */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="space-y-1.5">
                      {msg.suggestedProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-lime/10 border border-lime/20 hover:bg-lime/20 transition-colors group"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-lg">🏓</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1 group-hover:text-lime-dark">{product.name}</p>
                            <p className="text-xs text-lime-dark font-bold">{formatPrice(product.price)}</p>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4 text-foreground/70" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted/50">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-lime-dark/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-lime-dark/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-lime-dark/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {['Tư vấn vợt cho người mới', 'Vợt nào đang sale?', 'So sánh JOOLA vs Selkirk'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-xs font-medium text-lime-dark hover:bg-lime/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="px-4 py-3 border-t border-lime/10 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về sản phẩm Pickleball..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-lime/20 bg-muted/30 text-sm focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime/30 placeholder:text-muted-foreground/50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-lime-dark hover:bg-lime-dark/80 text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
