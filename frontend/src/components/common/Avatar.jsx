import { fileAPI } from '../../services/api'

export default function Avatar({ user, size = 'md', showOnline = false, isOnline = false, className = '' }) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
  const dotSizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' }

  const initials = user?.username
    ? user.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const colors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-600', 'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500']
  const colorIdx = (user?.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIdx]

  const imgUrl = user?.profilePicture ? fileAPI.getUrl(user.profilePicture) : null

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center ${imgUrl ? '' : bgColor}`}>
        {imgUrl ? (
          <img src={imgUrl} alt={user?.username} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
        ) : null}
        <span className={`${imgUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-white font-semibold`}>{initials}</span>
      </div>
      {showOnline && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-nex-panel ${isOnline ? 'bg-nex-primary' : 'bg-nex-muted'}`} />
      )}
    </div>
  )
}
