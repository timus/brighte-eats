import { useEffect, useMemo, useState } from 'react'
import { fetchLeads, registerLead } from './graphqlClient'

type EatsService = 'DELIVERY' | 'PICK_UP' | 'PAYMENT'

type Lead = {
    id: string
    name: string
    email: string
    mobile?: string
    postcode: string
    services: EatsService[]
    createdAt?: string
}

const ALL_SERVICES: EatsService[] = ['DELIVERY', 'PICK_UP', 'PAYMENT']

const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 999,
    border: '1px solid #ddd',
    fontSize: 12,
    marginRight: 6,
    marginTop: 4
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #ddd',
    outline: 'none'
}

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#444',
    marginBottom: 6,
    display: 'block'
}

const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 6px 20px rgba(0,0,0,0.04)'
}

export default function App() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [q, setQ] = useState('')
    const [postcode, setPostcode] = useState('')
    const [service, setService] = useState<EatsService | ''>('')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')
    const [newPostcode, setNewPostcode] = useState('')
    const [selectedServices, setSelectedServices] = useState<Record<EatsService, boolean>>({
        DELIVERY: false,
        PICK_UP: false,
        PAYMENT: false
    })
    const [submitting, setSubmitting] = useState(false)

    const load = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await fetchLeads()
            setLeads(data)
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load leads')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const filteredLeads = useMemo(() => {
        const qq = q.trim().toLowerCase()
        const pc = postcode.trim()

        return leads.filter((l) => {
            const matchesQ =
                !qq ||
                l.name.toLowerCase().includes(qq) ||
                l.email.toLowerCase().includes(qq)

            const matchesPostcode = !pc || l.postcode.includes(pc)
            const matchesService = !service || l.services.includes(service)

            return matchesQ && matchesPostcode && matchesService
        })
    }, [leads, q, postcode, service])

    const onToggleService = (s: EatsService) => {
        setSelectedServices((prev) => ({ ...prev, [s]: !prev[s] }))
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const services = ALL_SERVICES.filter((s) => selectedServices[s])

        if (!name.trim())  {
            return setError('Name is required')
        }
        if (!email.trim()) {
            return setError('Email is required')
        }
        if (!mobile.trim()) {
            return setError('Mobile is required')
        }
        if (!newPostcode.trim()) {
            return setError('Postcode is required')
        }
        if (services.length === 0) {
            return setError('Select at least one service')
        }

        setSubmitting(true)
        try {
            await registerLead({
                name: name.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                postcode: newPostcode.trim(),
                services
            })

            setName('')
            setEmail('')
            setMobile('')
            setNewPostcode('')
            setSelectedServices({ DELIVERY: false, PICK_UP: false, PAYMENT: false })

            await load()
        } catch (e: any) {
            setError(e?.message ?? 'Failed to register lead')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
                <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 28 }}>Brighte Eats Leads</h1>
                        <p style={{ margin: '6px 0 0', color: '#555' }}>
                            Capture expressions of interest and view them in a dashboard.
                        </p>
                    </div>

                    <button
                        onClick={load}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 12,
                            border: '1px solid #ddd',
                            background: '#fff',
                            cursor: 'pointer'
                        }}
                        disabled={loading}
                        title="Refresh"
                    >
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </header>

                {error && (
                    <div
                        style={{
                            marginTop: 16,
                            padding: 12,
                            borderRadius: 12,
                            border: '1px solid #f1c1c1',
                            background: '#fff5f5',
                            color: '#9b1c1c'
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, marginTop: 16 }}>
                    {/* Left: table + filters */}
                    <section style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <h2 style={{ margin: 0, fontSize: 18 }}>Leads</h2>
                            <div style={{ color: '#666', fontSize: 13 }}>
                                Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong>
                            </div>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.8fr', gap: 10, marginTop: 12 }}>
                            <div>
                                <label style={labelStyle}>Search (name/email)</label>
                                <input
                                    style={inputStyle}
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="e.g. sumit or @test.com"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Postcode</label>
                                <input
                                    style={inputStyle}
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value)}
                                    placeholder="e.g. 2000"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Service</label>
                                <select
                                    style={{ ...inputStyle, appearance: 'auto' }}
                                    value={service}
                                    onChange={(e) => setService(e.target.value as EatsService | '')}
                                >
                                    <option value="">All</option>
                                    <option value="DELIVERY">Delivery</option>
                                    <option value="PICK_UP">Pick-up</option>
                                    <option value="PAYMENT">Payment</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ marginTop: 14, overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                <tr>
                                    {['Name', 'Email', 'Postcode', 'Services'].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                textAlign: 'left',
                                                fontSize: 12,
                                                color: '#666',
                                                padding: '10px 10px',
                                                borderBottom: '1px solid #eee'
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 16, color: '#666' }}>
                                            Loading…
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 16, color: '#666' }}>
                                            No leads found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((l) => (
                                        <tr key={l.id}>
                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid #f3f3f3', fontWeight: 600 }}>
                                                {l.name}
                                            </td>
                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid #f3f3f3' }}>{l.email}</td>
                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid #f3f3f3' }}>{l.postcode}</td>
                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid #f3f3f3' }}>
                                                {l.services.length ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                        {l.services.map((s) => (
                                                            <span key={s} style={badgeStyle}>
                                  {s === 'PICK_UP' ? 'PICK-UP' : s}
                                </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#888' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <aside style={cardStyle}>
                        <h2 style={{ margin: 0, fontSize: 18 }}>Add Lead</h2>
                        <p style={{ margin: '6px 0 14px', color: '#666', fontSize: 13 }}>
                            Register a new expression of interest.
                        </p>

                        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
                            <div>
                                <label style={labelStyle}>Name</label>
                                <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div>
                                <label style={labelStyle}>Mobile</label>
                                <input style={inputStyle} value={mobile} onChange={(e) => setMobile(e.target.value)} />
                            </div>

                            <div>
                                <label style={labelStyle}>Postcode</label>
                                <input style={inputStyle} value={newPostcode} onChange={(e) => setNewPostcode(e.target.value)} />
                            </div>

                            <div>
                                <label style={labelStyle}>Services interested in</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {ALL_SERVICES.map((s) => (
                                        <label
                                            key={s}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '8px 10px',
                                                border: '1px solid #ddd',
                                                borderRadius: 12,
                                                background: '#fff',
                                                cursor: 'pointer',
                                                userSelect: 'none'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedServices[s]}
                                                onChange={() => onToggleService(s)}
                                            />
                                            <span>{s === 'PICK_UP' ? 'Pick-up' : s.charAt(0) + s.slice(1).toLowerCase()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    marginTop: 6,
                                    padding: '12px 14px',
                                    borderRadius: 12,
                                    border: '1px solid #111',
                                    background: '#111',
                                    color: '#fff',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                {submitting ? 'Submitting…' : 'Create Lead'}
                            </button>
                        </form>
                    </aside>
                </div>
            </div>
        </div>
    )
}
