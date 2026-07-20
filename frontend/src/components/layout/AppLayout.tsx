import { useState, type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  const [railOpen, setRailOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar onMenuOpen={() => setMobileOpen(true)} />
      <Sidebar
        railOpen={railOpen}
        onRailOpenChange={setRailOpen}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="app-main">
        <div className="page">{children}</div>
      </main>
      <div
        className={`app-content-overlay ${railOpen ? 'app-content-overlay-open' : ''}`}
        onClick={() => setRailOpen(false)}
        aria-hidden="true"
      />
    </div>
  );
}
