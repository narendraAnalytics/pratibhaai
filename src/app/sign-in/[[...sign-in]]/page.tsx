import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: '#FAFAFA' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7,#FB7185)' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M12 2l1.8 4.6 4.7 1.6-4 3 1 4.8L12 13.6 8.5 16l1-4.8-4-3 4.7-1.6L12 2z" fill="white" />
          </svg>
        </div>
        <span className="font-extrabold text-[17px] tracking-tight" style={{ color: '#1F1035' }}>
          Pratibha<span style={{ color: '#7C3AED' }}> AI</span>
        </span>
      </div>
      <SignIn />
    </div>
  )
}
