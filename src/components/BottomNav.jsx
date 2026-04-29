export function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      <NavItem id="home" label="Painel" active={active === 'home'} onClick={() => onChange('home')}>
        <HomeIcon active={active === 'home'} />
      </NavItem>

      <NavItem id="overview" label="Análise" active={active === 'overview'} onClick={() => onChange('overview')}>
        <ChartIcon active={active === 'overview'} />
      </NavItem>

      {/* Centre add button */}
      <button className="nav-item" onClick={() => onChange('add')} style={{ paddingBottom: 8 }}>
        <div className="nav-add-ring">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="nav-label" style={{ color: active === 'add' ? 'var(--g500)' : 'var(--muted)' }}>Adicionar</span>
      </button>

      <NavItem id="savings" label="Poupança" active={active === 'savings'} onClick={() => onChange('savings')}>
        <SavingsIcon active={active === 'savings'} />
      </NavItem>

      <NavItem id="settings" label="Perfil" active={active === 'settings'} onClick={() => onChange('settings')}>
        <ProfileIcon active={active === 'settings'} />
      </NavItem>
    </nav>
  )
}

function NavItem({ id, label, active, onClick, children }) {
  return (
    <button className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
      {children}
      <span className="nav-label">{label}</span>
    </button>
  )
}

function HomeIcon({ active }) {
  const c = active ? 'var(--g500)' : 'var(--muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 22 9 12 15 12 15 22" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChartIcon({ active }) {
  const c = active ? 'var(--g500)' : 'var(--muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <line x1="18" y1="20" x2="18" y2="10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="20" x2="12" y2="4"  stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="6"  y1="20" x2="6"  y2="14" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function SavingsIcon({ active }) {
  const c = active ? 'var(--g500)' : 'var(--muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M19 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 3H8L5 7h14l-3-4z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="2" stroke={c} strokeWidth="2"/>
    </svg>
  )
}
function ProfileIcon({ active }) {
  const c = active ? 'var(--g500)' : 'var(--muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2"/>
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
