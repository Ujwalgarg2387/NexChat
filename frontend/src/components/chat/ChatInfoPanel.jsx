import { useState } from 'react'
import { useAuthStore } from '../../context/authStore'
import { useChatStore } from '../../context/chatStore'
import { chatAPI } from '../../services/api'
import Avatar from '../common/Avatar'
import toast from 'react-hot-toast'

export default function ChatInfoPanel({ onClose }) {
  const { user } = useAuthStore()
  const { selectedChat, updateChatList, removeChat } = useChatStore()
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(selectedChat?.chatName || '')
  const isGroup = selectedChat?.isGroupChat
  const otherUser = !isGroup ? selectedChat?.users?.find(u => u.id !== user?.id) : null
  const isAdmin = isGroup && selectedChat?.admins?.includes(user?.id)

  const handleRename = async () => {
    if (!newName.trim()) return
    try {
      const { data } = await chatAPI.renameGroup(selectedChat.id, newName)
      updateChatList(data)
      setEditing(false)
      toast.success('Group renamed')
    } catch {
      toast.error('Failed to rename group')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return
    try {
      const { data } = await chatAPI.removeFromGroup(selectedChat.id, userId)
      updateChatList(data)
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const handleLeaveGroup = async () => {
    if (!window.confirm('Leave this group?')) return
    try {
      await chatAPI.removeFromGroup(selectedChat.id, user.id)
      removeChat(selectedChat.id)
      onClose()
      toast.success('Left the group')
    } catch {
      toast.error('Failed to leave group')
    }
  }

  const displayUser = isGroup ? null : otherUser

  return (
    <div className="w-80 flex flex-col bg-nex-panel border-l border-nex-border animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-nex-border">
        <button onClick={onClose} className="text-nex-icon hover:text-nex-text transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/>
          </svg>
        </button>
        <span className="text-nex-text text-sm font-medium">
          {isGroup ? 'Group Info' : 'Contact Info'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar + name */}
        <div className="flex flex-col items-center py-6 px-4 border-b border-nex-border">
          <Avatar
            user={isGroup ? { username: selectedChat?.chatName, profilePicture: selectedChat?.groupPicture, id: selectedChat?.id } : otherUser}
            size="xl"
          />
          <div className="mt-3 text-center">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="bg-nex-search text-nex-text text-center px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nex-primary"
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                  autoFocus
                />
                <button onClick={handleRename} className="text-nex-primary text-xs">Save</button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <h3 className="text-nex-text font-medium text-lg">
                  {isGroup ? selectedChat?.chatName : otherUser?.username}
                </h3>
                {isGroup && isAdmin && (
                  <button onClick={() => setEditing(true)} className="text-nex-muted hover:text-nex-icon ml-1">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                )}
              </div>
            )}
            {!isGroup && (
              <p className="text-nex-muted text-sm mt-0.5">{otherUser?.email}</p>
            )}
          </div>
        </div>

        {/* About */}
        {(isGroup ? selectedChat?.groupDescription : otherUser?.about) && (
          <div className="px-4 py-4 border-b border-nex-border">
            <p className="text-nex-primary text-xs mb-1">{isGroup ? 'Description' : 'About'}</p>
            <p className="text-nex-text text-sm">{isGroup ? selectedChat?.groupDescription : otherUser?.about}</p>
          </div>
        )}

        {/* Members (for groups) */}
        {isGroup && (
          <div className="px-4 py-3">
            <p className="text-nex-primary text-xs mb-3">
              {selectedChat?.users?.length} members
            </p>
            {selectedChat?.users?.map(member => (
              <div key={member.id} className="flex items-center gap-3 py-2.5 group">
                <Avatar user={member} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-nex-text text-sm truncate">
                    {member.id === user?.id ? 'You' : member.username}
                    {selectedChat?.admins?.includes(member.id) && (
                      <span className="ml-1.5 text-xs text-nex-primary">(admin)</span>
                    )}
                  </p>
                  <p className="text-nex-muted text-xs truncate">{member.about || ''}</p>
                </div>
                {isAdmin && member.id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {isGroup && (
          <div className="px-4 py-3 border-t border-nex-border">
            <button
              onClick={handleLeaveGroup}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Leave group
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
