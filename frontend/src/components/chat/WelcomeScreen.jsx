export default function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-nex-bg gap-4 select-none">
      <div className="w-24 h-24 bg-nex-panel rounded-full flex items-center justify-center border border-nex-border">
        <svg viewBox="0 0 24 24" className="w-12 h-12 fill-nex-muted">
          <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-nex-text text-2xl font-light mb-2">NexChat Web</h2>
        <p className="text-nex-muted text-sm max-w-xs leading-relaxed">
          Send and receive messages securely. Select a conversation from the left to begin.
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4 text-nex-muted text-xs">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
        End-to-end encrypted
      </div>
    </div>
  )
}
