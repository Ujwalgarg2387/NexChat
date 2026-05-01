import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../../context/authStore'
import { useChatStore } from '../../context/chatStore'
import { messageAPI } from '../../services/api'
import Avatar from '../common/Avatar'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import ChatInfoPanel from './ChatInfoPanel'
import toast from 'react-hot-toast'

export default function ChatWindow() {
  const { user } = useAuthStore()
  const {
    selectedChat, messages, loadingMessages,
    typingUsers, onlineUsers, clearMessages, deselectChat
  } = useChatStore()

  const [showInfo, setShowInfo] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { x, y }
  const messagesEndRef = useRef(null)
  const contextMenuRef = useRef(null)

  const isGroup = selectedChat?.isGroupChat
  const otherUser = !isGroup ? selectedChat?.users?.find(u => u.id !== user?.id) : null
  const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false
  const chatTyping = typingUsers[selectedChat?.id] || {}
  const typingNames = Object.values(chatTyping).map(t => t.username)

  const displayName = isGroup
    ? selectedChat?.chatName
    : (otherUser?.username || 'Unknown')
  const avatarUser = isGroup
    ? { username: selectedChat?.chatName, profilePicture: selectedChat?.groupPicture, id: selectedChat?.id }
    : otherUser

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingNames.length])

  // Close context menu on outside click or scroll
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [contextMenu])

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleCloseChat = () => {
    deselectChat()
    setContextMenu(null)
  }

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all messages? This cannot be undone.')) return
    try {
      await messageAPI.clearHistory(selectedChat.id)
      clearMessages()
      toast.success('Chat history cleared')
    } catch {
      toast.error('Failed to clear history')
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg.createdAt ? new Date(msg.createdAt).toDateString() : 'Unknown'
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-nex-panel border-b border-nex-border">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfo(true)}>
            <Avatar user={avatarUser} size="md" showOnline={!isGroup} isOnline={isOnline} />
            <div>
              <p className="text-nex-text text-sm font-medium">{displayName}</p>
              <p className="text-nex-muted text-xs">
                {typingNames.length > 0 ? (
                  <span className="text-nex-primary">
                    {typingNames.length === 1
                      ? `${typingNames[0]} is typing...`
                      : `${typingNames.join(', ')} are typing...`}
                  </span>
                ) : isGroup ? (
                  `${selectedChat?.users?.length || 0} members`
                ) : isOnline ? (
                  'online'
                ) : otherUser?.lastSeen ? (
                  `last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                ) : 'offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              title="Clear chat history"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-nex-hover transition-colors text-nex-icon"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              title="Chat info"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-nex-hover transition-colors text-nex-icon"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages — right-click triggers context menu */}
        <div
          className="flex-1 overflow-y-auto px-4 py-2"
          style={{ backgroundImage: 'url("/chat-bg.png")', backgroundColor: '#0b141a' }}
          onContextMenu={handleContextMenu}
        >
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-nex-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-nex-muted gap-2">
              <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current opacity-20">
                <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
              <p className="text-sm">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center justify-center my-3">
                  <span className="bg-nex-panel text-nex-muted text-xs px-3 py-1 rounded-full border border-nex-border">
                    {formatDateLabel(date)}
                  </span>
                </div>
                {msgs.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            ))
          )}

          {typingNames.length > 0 && (
            <div className="flex items-end gap-1 mb-2">
              <div className="bg-nex-incoming rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <MessageInput />
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          onClick={e => e.stopPropagation()}
          className="fixed z-50 min-w-[160px] rounded-lg shadow-lg border border-nex-border bg-nex-panel overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleCloseChat}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-nex-text hover:bg-nex-hover transition-colors text-left"
          >
            {/* X / close icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-nex-muted shrink-0">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Close chat
          </button>
        </div>
      )}

      {showInfo && <ChatInfoPanel onClose={() => setShowInfo(false)} />}
    </div>
  )
}