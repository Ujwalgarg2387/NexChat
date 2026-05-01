export default function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-nex-bg gap-4">
      <div className="w-16 h-16 bg-nex-primary rounded-full flex items-center justify-center animate-pulse">
        <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
          <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <p className="text-nex-muted text-sm tracking-widest uppercase">NexChat</p>
    </div>
  )
}
