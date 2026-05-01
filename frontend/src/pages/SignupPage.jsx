import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signup } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { username, email, password, confirm } = form
    if (!username || !email || !password) return toast.error('All fields are required')
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await signup(username, email, password)
      navigate('/')
      toast.success('Welcome to NexChat!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-nex-bg">
      <div className="w-full max-w-md px-8 py-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-nex-primary rounded-full flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
              <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-light text-nex-text tracking-wide">NexChat</h1>
          <p className="text-nex-muted text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'username', label: 'Username', type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-nex-muted text-xs mb-2 uppercase tracking-wider">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-nex-panel border border-nex-border rounded-lg px-4 py-3 text-nex-text placeholder-nex-muted focus:outline-none focus:border-nex-primary transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-nex-muted text-xs mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full bg-nex-panel border border-nex-border rounded-lg px-4 py-3 pr-12 text-nex-text placeholder-nex-muted focus:outline-none focus:border-nex-primary transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nex-muted hover:text-nex-text">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d={showPassword
                    ? "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"
                    : "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  }/>
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-nex-muted text-xs mb-2 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat password"
              className="w-full bg-nex-panel border border-nex-border rounded-lg px-4 py-3 text-nex-text placeholder-nex-muted focus:outline-none focus:border-nex-primary transition-colors"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-nex-primary hover:bg-nex-primaryDark text-white font-medium py-3 rounded-lg transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-nex-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-nex-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
