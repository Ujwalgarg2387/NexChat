import { useAuthStore } from '../../context/authStore'
import { useChatStore } from '../../context/chatStore'
import Avatar from '../common/Avatar'
import { format, isToday, isYesterday } from 'date-fns'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd/MM/yy')
}

function getMessagePreview(msg, currentUserId) {
  if (!msg) return ''
  if (msg.deleted) return '🚫 This message was deleted'
  const isMe = msg.sender?.id === currentUserId
  const prefix = isMe ? 'You: ' : (msg.sender?.username ? `${msg.sender.username}: ` : '')
  switch (msg.messageType) {
    case 'IMAGE': return `${prefix}📷 Photo`
    case 'VIDEO': return `${prefix}🎥 Video`
    case 'DOCUMENT': return `${prefix}📄 ${msg.fileName || 'Document'}`
    default: return `${prefix}${msg.content || ''}`
  }
}

export default function ChatListItem({ chat, isSelected, onClick }) {
  const { user } = useAuthStore()
  const { onlineUsers } = useChatStore()

  const isGroup = chat.isGroupChat
  const displayName = isGroup
    ? chat.chatName
    : (chat.users?.find(u => u.id !== user?.id)?.username || 'Unknown')
  const otherUser = !isGroup ? chat.users?.find(u => u.id !== user?.id) : null
  const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false

  const avatarUser = isGroup
    ? { username: chat.chatName, profilePicture: chat.groupPicture, id: chat.id }
    : otherUser

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-nex-border/30
        ${isSelected ? 'bg-nex-hover' : 'hover:bg-nex-hover'}`}
    >
      <Avatar user={avatarUser} size="md" showOnline={!isGroup} isOnline={isOnline} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-nex-text text-sm font-medium truncate">{displayName}</span>
          {chat.latestMessage?.createdAt && (
            <span className="text-nex-muted text-xs flex-shrink-0 ml-2">
              {formatTime(chat.latestMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <p className="text-nex-muted text-xs truncate flex-1">
            {getMessagePreview(chat.latestMessage, user?.id)}
          </p>
        </div>
      </div>
    </div>
  )
}
