import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuthStore } from '../../context/authStore'
import { useChatStore } from '../../context/chatStore'
import { messageAPI, fileAPI } from '../../services/api'
import { wsService } from '../../services/websocket'
import EmojiPicker from 'emoji-picker-react'
import toast from 'react-hot-toast'

export default function MessageInput() {
  const { user } = useAuthStore()
  const { selectedChat, addMessage } = useChatStore()
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const typingTimerRef = useRef(null)
  const isTypingRef = useRef(false)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  const sendTypingSignal = useCallback((typing) => {
    if (!selectedChat || !user) return
    wsService.sendTyping(selectedChat.id, user.id, user.username, typing)
    isTypingRef.current = typing
  }, [selectedChat, user])

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) sendTypingSignal(false)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
  }, [sendTypingSignal])

  useEffect(() => {
    return () => stopTyping()
  }, [selectedChat])

  const handleTextChange = (e) => {
    setText(e.target.value)
    if (!isTypingRef.current) sendTypingSignal(true)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => sendTypingSignal(false), 2000)
  }

  const handleSend = async () => {
    const content = text.trim()
    if (!content || !selectedChat) return

    stopTyping()
    setText('')

    try {
      await messageAPI.send({ chatId: selectedChat.id, content, messageType: 'TEXT' })
    } catch {
      toast.error('Failed to send message')
      setText(content)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji)
    inputRef.current?.focus()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedChat) return
    e.target.value = ''

    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)

    try {
      const { data } = await fileAPI.upload(formData)
      const messageType = data.messageType === 'IMAGES' ? 'IMAGE'
        : data.messageType === 'VIDEOS' ? 'VIDEO' : 'DOCUMENT'

      await messageAPI.send({
        chatId: selectedChat.id,
        content: '',
        messageType,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileMimeType: data.fileMimeType,
      })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'File upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative bg-nex-panel border-t border-nex-border px-3 py-2">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-full right-0 mb-1 z-50 animate-fade-in">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width={320}
            height={380}
            searchPlaceHolder="Search emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {uploading && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-nex-border">
          <div className="h-full bg-nex-primary animate-pulse" style={{ width: '60%' }} />
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Emoji button */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-nex-hover transition-colors text-nex-icon mb-0.5"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
        </button>

        {/* File attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-nex-hover transition-colors text-nex-icon mb-0.5 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onClick={() => setShowEmoji(false)}
          placeholder="Type a message"
          rows={1}
          className="flex-1 bg-nex-search rounded-lg px-4 py-2.5 text-sm text-nex-text placeholder-nex-muted focus:outline-none resize-none max-h-32 overflow-y-auto leading-relaxed"
          style={{ minHeight: '40px' }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !uploading}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors mb-0.5
            ${text.trim()
              ? 'bg-nex-primary hover:bg-nex-primaryDark text-white'
              : 'text-nex-icon hover:bg-nex-hover'
            }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
