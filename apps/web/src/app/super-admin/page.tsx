"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { ListChecks, LogOut, RefreshCw, Settings2, TrendingUp } from 'lucide-react';

type Barbershop = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  subscriptionStatus: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  plan?: string;
  expiredAt?: string;
};

type Stats = {
  totalBarbershops: number;
  activeBarbershops: number;
  suspendedBarbershops: number;
};

type SuperAdminBarbershopPayload = {
  id: string;
  name: string;
  slug?: string;
  city?: string | null;
  address?: string | null;
  status?: Barbershop['subscriptionStatus'];
  subscriptionStatus?: Barbershop['subscriptionStatus'];
  plan?: string;
  expiredAt?: string;
};

type AuthUser = {
  appRole?: string;
  role?: string;
  dbRole?: string;
  fullName?: string;
  email?: string;
};

type Section = 'tenants' | 'subscription' | 'stats';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
const resolveRole = (user?: AuthUser | null): string => user?.appRole || user?.role || user?.dbRole || '';

const statusToBadge = (status: Barbershop['subscriptionStatus']) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'SUSPENDED') return 'danger';
  if (status === 'EXPIRED') return 'warning';
  return 'muted';
};

export default function SuperAdminPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [actorName, setActorName] = useState('SUPER ADMIN');
  const [error, setError] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [activeSection, setActiveSection] = useState<Section>('tenants');
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [starterPrice, setStarterPrice] = useState('149000');
  const [starterDuration, setStarterDuration] = useState('30');
  const [proPrice, setProPrice] = useState('299000');
  const [proDuration, setProDuration] = useState('30');

  const filteredBarbershops = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return barbershops;
    return barbershops.filter((item) => item.name.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query));
  }, [barbershops, search]);

  const hydrateSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || payload?.message || 'Unauthorized');
      }
      const user = payload?.data?.user as AuthUser | undefined;
      if (!user) throw new Error('Invalid session payload');
      if (resolveRole(user) !== 'SUPER_ADMIN') throw new Error('Akun ini bukan SUPER ADMIN.');

      setActorName(user.fullName || user.email || 'SUPER ADMIN');
      setIsAuthenticated(true);
      setError('');
      return true;
    } catch (err) {
      setIsAuthenticated(false);
      setBarbershops([]);
      setStats(null);
      setError(err instanceof Error ? err.message : 'Silakan login sebagai SUPER ADMIN.');
      return false;
    } finally {
      setAuthChecking(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError('');

      const [shopsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/super-admin/barbershops`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/super-admin/stats`, { credentials: 'include' }),
      ]);

      const shopsPayload = await shopsRes.json().catch(() => ({}));
      const statsPayload = await statsRes.json().catch(() => ({}));

      if (!shopsRes.ok || shopsPayload?.success === false) {
        throw new Error(shopsPayload?.error?.message || shopsPayload?.message || 'Gagal memuat tenant.');
      }
      if (!statsRes.ok || statsPayload?.success === false) {
        throw new Error(statsPayload?.error?.message || statsPayload?.message || 'Gagal memuat statistik.');
      }

      const rows = Array.isArray(shopsPayload?.data?.barbershops)
        ? (shopsPayload.data.barbershops as SuperAdminBarbershopPayload[])
        : [];

      const mapped = rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
        address: row.city || row.address || '-',
        subscriptionStatus: row.status || row.subscriptionStatus || 'ACTIVE',
        plan: row.plan || 'Pro',
        expiredAt: row.expiredAt || '-',
      }));
      setBarbershops(mapped);
      setStats({
        totalBarbershops: statsPayload?.data?.totalBarbershops || 0,
        activeBarbershops: statsPayload?.data?.activeBarbershops || 0,
        suspendedBarbershops: statsPayload?.data?.suspendedBarbershops || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadData();
  }, [isAuthenticated, loadData]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Identifier dan password wajib diisi.');
      return;
    }

    try {
      setAuthLoading(true);
      setError('');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || payload?.message || 'Login gagal.');
      }

      const hydrated = await hydrateSession();
      if (!hydrated) throw new Error('Session SUPER ADMIN tidak valid.');

      setPassword('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network failure
    }
    setIsAuthenticated(false);
    setBarbershops([]);
    setStats(null);
    setPassword('');
    setError('Session SUPER ADMIN berakhir. Silakan login ulang.');
  };

  const runTenantAction = async (id: string, action: 'activate' | 'suspend' | 'delete') => {
    try {
      setMutating(true);
      const url = action === 'delete'
        ? `${API_BASE_URL}/super-admin/barbershops/${id}`
        : `${API_BASE_URL}/super-admin/barbershops/${id}/${action}`;

      const response = await fetch(url, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || payload?.message || 'Aksi gagal.');
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aksi gagal.');
    } finally {
      setMutating(false);
    }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Memverifikasi session superadmin..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <Badge variant="warning">Superadmin Login</Badge>
          <CardTitle className="mt-3 text-2xl">Akses Panel Global</CardTitle>
          <CardDescription className="mt-2">Masuk dengan email/username superadmin.</CardDescription>
          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <Input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Email atau username"
              autoComplete="username"
            />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            {error ? <Toast variant="danger">{error}</Toast> : null}
            <Button type="submit" variant="primary" className="w-full" loading={authLoading}>
              Login Superadmin
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-3 py-4 lg:grid-cols-[250px_1fr]">
        <aside className="surface-panel p-3">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Superadmin</p>
            <p className="mt-1 text-sm font-black">{actorName}</p>
          </div>
          <nav className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveSection('tenants')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${activeSection === 'tenants' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-200 hover:bg-white/10'}`}
            >
              <ListChecks size={16} />
              Tenants
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('subscription')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${activeSection === 'subscription' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-200 hover:bg-white/10'}`}
            >
              <Settings2 size={16} />
              Subscription
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('stats')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${activeSection === 'stats' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-200 hover:bg-white/10'}`}
            >
              <TrendingUp size={16} />
              Stats
            </button>
          </nav>
          <Button variant="danger" className="mt-4 w-full" onClick={handleLogout}>
            <LogOut size={14} />
            Logout
          </Button>
        </aside>

        <section className="space-y-4">
          <header className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Global Control</p>
              <h1 className="text-2xl font-black">Superadmin Panel</h1>
            </div>
            <Button variant="secondary" onClick={() => void loadData()} loading={loading}>
              <RefreshCw size={14} />
              Refresh
            </Button>
          </header>

          {error ? <Toast variant="danger">{error}</Toast> : null}

          {activeSection === 'tenants' ? (
            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Tenant List</CardTitle>
                  <CardDescription>Kelola status tenant, plan, dan aksi suspend/activate.</CardDescription>
                </div>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau slug..."
                  className="w-full md:w-72"
                />
              </div>

              <div className="overflow-x-auto">
                <Table className="min-w-[860px]">
                  <THead>
                    <TR>
                      <TH>Nama</TH>
                      <TH>Slug</TH>
                      <TH>Status</TH>
                      <TH>Plan</TH>
                      <TH>Expired Date</TH>
                      <TH>Aksi</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {filteredBarbershops.map((tenant) => (
                      <TR key={tenant.id}>
                        <TD className="font-bold">{tenant.name}</TD>
                        <TD>{tenant.slug}</TD>
                        <TD>
                          <Badge variant={statusToBadge(tenant.subscriptionStatus)}>{tenant.subscriptionStatus}</Badge>
                        </TD>
                        <TD>{tenant.plan || 'Pro'}</TD>
                        <TD>{tenant.expiredAt || '-'}</TD>
                        <TD>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="secondary" loading={mutating} onClick={() => void runTenantAction(tenant.id, 'activate')}>
                              Activate
                            </Button>
                            <Button size="sm" variant="warning" loading={mutating} onClick={() => void runTenantAction(tenant.id, 'suspend')}>
                              Suspend
                            </Button>
                            <Button size="sm" variant="danger" loading={mutating} onClick={() => void runTenantAction(tenant.id, 'delete')}>
                              Delete
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </Card>
          ) : null}

          {activeSection === 'subscription' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardTitle>Plan Config: Starter</CardTitle>
                <CardDescription className="mt-1">Harga dan durasi paket starter.</CardDescription>
                <div className="mt-4 space-y-3">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Harga
                    <Input value={starterPrice} onChange={(event) => setStarterPrice(event.target.value)} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Durasi (hari)
                    <Input value={starterDuration} onChange={(event) => setStarterDuration(event.target.value)} />
                  </label>
                  <Button variant="primary">Save Plan</Button>
                </div>
              </Card>
              <Card>
                <CardTitle>Plan Config: Pro</CardTitle>
                <CardDescription className="mt-1">Harga dan durasi paket pro.</CardDescription>
                <div className="mt-4 space-y-3">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Harga
                    <Input value={proPrice} onChange={(event) => setProPrice(event.target.value)} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Durasi (hari)
                    <Input value={proDuration} onChange={(event) => setProDuration(event.target.value)} />
                  </label>
                  <Button variant="primary">Save Plan</Button>
                </div>
              </Card>
            </div>
          ) : null}

          {activeSection === 'stats' ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardDescription>Total Tenant</CardDescription>
                <CardTitle className="mt-2 text-3xl">{stats?.totalBarbershops || 0}</CardTitle>
              </Card>
              <Card>
                <CardDescription>Active Tenant</CardDescription>
                <CardTitle className="mt-2 text-3xl text-emerald-300">{stats?.activeBarbershops || 0}</CardTitle>
              </Card>
              <Card>
                <CardDescription>Revenue Platform (Placeholder)</CardDescription>
                <CardTitle className="mt-2 text-3xl text-amber-300">Rp {(stats?.activeBarbershops || 0) * 299000}</CardTitle>
              </Card>
              <Card className="md:col-span-3">
                <CardTitle>Ringkasan</CardTitle>
                <CardDescription className="mt-2">
                  Tenant suspended: {stats?.suspendedBarbershops || 0}. Pantau metrik ini untuk keputusan plan dan retention.
                </CardDescription>
              </Card>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
