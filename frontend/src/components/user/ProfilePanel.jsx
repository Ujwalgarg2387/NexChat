import { useState, useRef } from 'react'
import { useAuthStore } from '../../context/authStore'
import { userAPI, fileAPI } from '../../services/api'
import Avatar from '../common/Avatar'
import toast from 'react-hot-toast'

export default function ProfilePanel({ onClose }) {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username || '', about: user?.about || '' })
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const fileRef = useRef(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await userAPI.updateProfile(form)
      updateUser(data)
      setEditing(false)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select an image')
    const formData = new FormData()
    formData.append('file', file)
    setUploadingPic(true)
    try {
      const { data } = await fileAPI.upload(formData)
      const { data: updated } = await userAPI.updatePicture(data.fileUrl)
      updateUser(updated)
      toast.success('Profile picture updated')
    } catch {
      toast.error('Failed to upload picture')
    } finally {
      setUploadingPic(false)
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
        <p className="text-white text-sm font-medium">Profile</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-8 border-b border-nex-border bg-nex-panel">
        <div className="relative">
          <Avatar user={user} size="xl" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPic}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            {uploadingPic ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m0-7L8.5 3.5H5C3.89 3.5 3 4.39 3 5.5v13C3 19.61 3.89 20.5 5 20.5h14c1.11 0 2-.89 2-2v-13c0-1.11-.89-2-2-2h-3.5L12 0z"/>
              </svg>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
        </div>
        <p className="text-nex-muted text-xs mt-2">Tap to change photo</p>
      </div>

      {/* Info */}
      <div className="px-4 py-4 space-y-5">
        <div>
          <p className="text-nex-primary text-xs mb-1.5 flex items-center justify-between">
            Your name
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-nex-primary hover:underline text-xs">Edit</button>
            )}
          </p>
          {editing ? (
            <input
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-nex-search text-nex-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nex-primary"
              placeholder="Your name"
            />
          ) : (
            <p className="text-nex-text text-sm py-2">{user?.username}</p>
          )}
        </div>

        <div>
          <p className="text-nex-primary text-xs mb-1.5">About</p>
          {editing ? (
            <textarea
              value={form.about}
              onChange={e => setForm({ ...form, about: e.target.value })}
              className="w-full bg-nex-search text-nex-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nex-primary resize-none"
              rows={3}
              placeholder="Something about yourself"
            />
          ) : (
            <p className="text-nex-text text-sm py-2">{user?.about || 'Hey there! I am using NexChat'}</p>
          )}
        </div>

        <div>
          <p className="text-nex-primary text-xs mb-1.5">Email</p>
          <p className="text-nex-text text-sm py-2">{user?.email}</p>
        </div>

        {editing && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { setEditing(false); setForm({ username: user?.username, about: user?.about }) }}
              className="flex-1 py-2 rounded-lg border border-nex-border text-nex-muted text-sm hover:bg-nex-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-nex-primary text-white text-sm hover:bg-nex-primaryDark transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
