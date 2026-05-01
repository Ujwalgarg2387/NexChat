import { useState, useCallback } from 'react'
import { userAPI, chatAPI } from '../../services/api'
import { useChatStore } from '../../context/chatStore'
import Avatar from '../common/Avatar'
import toast from 'react-hot-toast'

export default function CreateGroupModal({ onClose }) {
  const [step, setStep] = useState(1) // 1=search, 2=details
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const { updateChatList, selectChat } = useChatStore()

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const { data } = await userAPI.searchUsers(q)
      setResults(data)
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }, [])

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(window._searchTimer)
    window._searchTimer = setTimeout(() => search(val), 400)
  }

  const toggleSelect = (user) => {
    setSelected(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    )
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return toast.error('Group name is required')
    if (selected.length < 1) return toast.error('Add at least one member')
    setCreating(true)
    try {
      const { data } = await chatAPI.createGroup({
        chatName: groupName,
        groupDescription: description,
        userIds: selected.map(u => u.id),
      })
      updateChatList(data)
      await selectChat(data)
      onClose()
      toast.success(`Group "${groupName}" created!`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-nex-primary">
        <button onClick={step === 2 ? () => setStep(1) : onClose} className="text-white/80 hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/>
          </svg>
        </button>
        <div>
          <p className="text-white text-sm font-medium">New group</p>
          {step === 1 && <p className="text-white/70 text-xs">Add participants</p>}
        </div>
        {step === 1 && selected.length > 0 && (
          <button
            onClick={() => setStep(2)}
            className="ml-auto bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1 text-sm transition-colors"
          >
            Next →
          </button>
        )}
      </div>

      {step === 1 ? (
        <>
          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="px-4 py-2 bg-nex-panel flex flex-wrap gap-2 border-b border-nex-border">
              {selected.map(u => (
                <div key={u.id} className="flex items-center gap-1.5 bg-nex-hover rounded-full px-2.5 py-1 text-xs text-nex-text">
                  <Avatar user={u} size="xs" />
                  <span>{u.username}</span>
                  <button onClick={() => toggleSelect(u)} className="text-nex-muted hover:text-red-400 ml-0.5">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="p-3 bg-nex-panel">
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
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
            {results.map(user => {
              const isSelected = !!selected.find(u => u.id === user.id)
              return (
                <div
                  key={user.id}
                  onClick={() => toggleSelect(user)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-nex-hover cursor-pointer transition-colors border-b border-nex-border/30"
                >
                  <Avatar user={user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-nex-text text-sm font-medium truncate">{user.username}</p>
                    <p className="text-nex-muted text-xs truncate">{user.about || user.email}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-nex-primary border-nex-primary' : 'border-nex-muted'}`}>
                    {isSelected && (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Step 2: Group details */
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-nex-hover rounded-full flex items-center justify-center text-nex-muted">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Group name (required)"
                className="w-full bg-nex-search text-nex-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nex-primary"
                autoFocus
              />
            </div>
          </div>

          <div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Group description (optional)"
              rows={2}
              className="w-full bg-nex-search text-nex-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nex-primary resize-none"
            />
          </div>

          <div>
            <p className="text-nex-muted text-xs mb-2">{selected.length} participants selected:</p>
            <div className="flex flex-wrap gap-2">
              {selected.map(u => (
                <div key={u.id} className="flex items-center gap-1.5 bg-nex-hover rounded-full px-2.5 py-1 text-xs text-nex-text">
                  <Avatar user={u} size="xs" />
                  {u.username}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || !groupName.trim()}
            className="w-full bg-nex-primary hover:bg-nex-primaryDark text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      )}
    </div>
  )
}
