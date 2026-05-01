import { useState } from 'react'
import { useAuthStore } from '../../context/authStore'
import { useChatStore } from '../../context/chatStore'
import { messageAPI, fileAPI } from '../../services/api'
import Avatar from '../common/Avatar'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MessageBubble({ message }) {
  const { user } = useAuthStore()
  const { deleteMessage } = useChatStore()
  const [showMenu, setShowMenu] = useState(false)
  const isOwn = message.sender?.id === user?.id
  const isGroup = !!message.chatId

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return format(new Date(dateStr), 'HH:mm')
  }

  const handleDelete = async () => {
    try {
      await messageAPI.deleteMessage(message.id)
      deleteMessage(message.id)
      toast.success('Message deleted')
    } catch {
      toast.error('Failed to delete message')
    }
    setShowMenu(false)
  }

  const renderContent = () => {
    if (message.deleted) {
      return (
        <span className="italic text-nex-muted text-sm flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          This message was deleted
        </span>
      )
    }

    switch (message.messageType) {
      case 'IMAGE':
        return (
          <div className="max-w-xs">
            <a href={fileAPI.getUrl(message.fileUrl)} target="_blank" rel="noopener noreferrer">
              <img
                src={fileAPI.getUrl(message.fileUrl)}
                alt={message.fileName || 'Image'}
                className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onError={e => { e.target.src = ''; e.target.alt = 'Image failed to load' }}
              />
            </a>
            {message.content && <p className="text-sm mt-1">{message.content}</p>}
          </div>
        )
      case 'VIDEO':
        return (
          <div className="max-w-xs">
            <video
              src={fileAPI.getUrl(message.fileUrl)}
              controls
              className="rounded-lg max-w-full max-h-48"
            />
          </div>
        )
      case 'DOCUMENT':
        return (
          <a
            href={fileAPI.getUrl(message.fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors min-w-[200px]"
          >
            <div className="w-10 h-10 bg-nex-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-nex-primary">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm truncate max-w-[180px]">{message.fileName || 'Document'}</p>
              <p className="text-xs text-nex-muted">{message.fileSize}</p>
            </div>
          </a>
        )
      default:
        return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
    }
  }

  // System messages
  if (message.messageType === 'SYSTEM') {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-nex-panel/80 text-nex-muted text-xs px-3 py-1 rounded-full">{message.content}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 mb-1 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar for group incoming messages */}
      {!isOwn && (
        <Avatar user={message.sender} size="xs" className="mb-1 flex-shrink-0" />
      )}

      <div className={`relative max-w-[65%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender name in group chats */}
        {!isOwn && (
          <span className="text-xs text-nex-primary mb-0.5 ml-1">{message.sender?.username}</span>
        )}

        <div
          className={`relative px-3 py-2 rounded-2xl shadow-sm
            ${isOwn
              ? 'bg-nex-outgoing text-nex-text rounded-br-sm'
              : 'bg-nex-incoming text-nex-text rounded-bl-sm'
            }`}
          onMouseLeave={() => setShowMenu(false)}
        >
          {renderContent()}

          {/* Time + read status */}
          <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-nex-muted/80">{formatTime(message.createdAt)}</span>
            {isOwn && !message.deleted && (
              <svg viewBox="0 0 16 15" className={`w-4 h-3 ${message.readBy?.length > 0 ? 'fill-blue-400' : 'fill-nex-muted/60'}`}>
                <path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879a.32.32 0 01-.484.033l-.358-.325a.319.319 0 00-.484.032l-.378.483a.418.418 0 00.036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 00-.064-.512zm-4.1 0l-.478-.372a.365.365 0 00-.51.063L4.566 9.879a.32.32 0 01-.484.033L2.82 8.527a.319.319 0 00-.484.032l-.378.483a.418.418 0 00.036.541l2.631 2.527c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 00-.064-.512z"/>
              </svg>
            )}
          </div>

          {/* Context menu button */}
          {isOwn && !message.deleted && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-nex-hover rounded-full flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-nex-muted">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-0 right-0 mt-6 w-36 bg-nex-hover border border-nex-border rounded-lg shadow-xl z-50 py-1 animate-fade-in">
            <button onClick={handleDelete}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-nex-panel transition-colors">
              Delete message
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
