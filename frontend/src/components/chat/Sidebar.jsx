import { useState, useEffect } from 'react'
import { useAuthStore } from '../../context/authStore'
import { useChatStore } from '../../context/chatStore'
import { userAPI } from '../../services/api'
import Avatar from '../common/Avatar'
import ChatListItem from './ChatListItem'
import SearchUsers from '../user/SearchUsers'
import CreateGroupModal from '../group/CreateGroupModal'
import ProfilePanel from '../user/ProfilePanel'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { chats, loadingChats, selectedChat, selectChat, fetchChats } = useChatStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState('chats') // 'chats' | 'search' | 'profile' | 'newGroup'
  const [showMenu, setShowMenu] = useState(false)

  const filteredChats = chats.filter(chat => {
    const name = getChatDisplayName(chat, user)
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  function getChatDisplayName(chat, currentUser) {
    if (chat.isGroupChat) return chat.chatName
    const other = chat.users?.find(u => u.id !== currentUser?.id)
    return other?.username || chat.chatName || 'Unknown'
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <div className="w-[380px] min-w-[320px] flex flex-col bg-nex-panel border-r border-nex-border h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-nex-panel">
        <button onClick={() => setView(view === 'profile' ? 'chats' : 'profile')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar user={user} size="md" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('search')}
            title="New chat"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-nex-hover transition-colors text-nex-icon"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z"/>
            </svg>
          </button>

          <button
            onClick={() => setView('newGroup')}
            title="New group"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-nex-hover transition-colors text-nex-icon"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-nex-hover transition-colors text-nex-icon"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-44 bg-nex-hover border border-nex-border rounded-lg shadow-xl z-50 py-1 animate-fade-in">
                <button onClick={() => { setView('profile'); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-nex-text hover:bg-nex-panel transition-colors">
                  Profile
                </button>
                <button onClick={() => { handleLogout(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-nex-panel transition-colors">
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2">
        <div className="relative">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-nex-muted">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => view === 'chats' && setView('chats')}
            placeholder="Search or start new chat"
            className="w-full bg-nex-search rounded-lg pl-9 pr-4 py-2 text-sm text-nex-text placeholder-nex-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {view === 'profile' && (
          <ProfilePanel onClose={() => setView('chats')} />
        )}
        {view === 'search' && (
          <SearchUsers onClose={() => setView('chats')} />
        )}
        {view === 'newGroup' && (
          <CreateGroupModal onClose={() => setView('chats')} />
        )}
        {view === 'chats' && (
          <>
            {loadingChats ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-nex-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-nex-muted gap-2">
                <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current opacity-30">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <p className="text-sm">{searchQuery ? 'No results found' : 'No chats yet'}</p>
                <p className="text-xs opacity-60">{!searchQuery && 'Click the chat icon to start messaging'}</p>
              </div>
            ) : (
              filteredChats.map(chat => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChat?.id === chat.id}
                  onClick={() => selectChat(chat)}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
