import { useState, useCallback } from 'react'
import { userAPI } from '../../services/api'
import { useChatStore } from '../../context/chatStore'
import Avatar from '../common/Avatar'
import toast from 'react-hot-toast'

export default function SearchUsers({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { accessOrCreateChat, selectChat } = useChatStore()

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const { data } = await userAPI.searchUsers(q)
      setResults(data)
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    const timer = setTimeout(() => search(val), 400)
    return () => clearTimeout(timer)
  }

  const handleSelect = async (user) => {
    try {
      const chat = await accessOrCreateChat(user.id)
      await selectChat(chat)
      onClose()
    } catch {
      toast.error('Failed to open chat')
    }
  }

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-nex-primary">
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/>
          </svg>
        </button>
        <div>
          <p className="text-white text-sm font-medium">New chat</p>
          <p className="text-white/70 text-xs">Search users by name or email</p>
        </div>
      </div>

      {/* Search input */}
      <div className="p-3 bg-nex-panel">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search users..."
          autoFocus
          className="w-full bg-nex-search rounded-lg px-4 py-2.5 text-sm text-nex-text placeholder-nex-muted focus:outline-none"
        />
      </div>

      {/* Results */}
      <div>
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-nex-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && results.length === 0 && query.trim() && (
          <div className="text-center py-8 text-nex-muted text-sm">No users found</div>
        )}
        {results.map(user => (
          <div
            key={user.id}
            onClick={() => handleSelect(user)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-nex-hover cursor-pointer transition-colors border-b border-nex-border/30"
          >
            <Avatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-nex-text text-sm font-medium truncate">{user.username}</p>
              <p className="text-nex-muted text-xs truncate">{user.about || user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
