import React, { useEffect, useMemo, useState } from 'react'
import { fetchLeads, registerLead } from './graphqlClient'
import './App.css'

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

const labelForService = (s: EatsService) => (s === 'PICK_UP' ? 'Pick-up' : s.charAt(0) + s.slice(1).toLowerCase())
const badgeForService = (s: EatsService) => (s === 'PICK_UP' ? 'PICK-UP' : s)

type LeadFiltersState = {
    q: string
    postcode: string
    service: EatsService | ''
}

type CreateLeadInput = {
    name: string
    email: string
    mobile: string
    postcode: string
    services: EatsService[]
}

export default function App() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [filters, setFilters] = useState<LeadFiltersState>({
        q: '',
        postcode: '',
        service: '',
    })

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
        const qq = filters.q.trim().toLowerCase()
        const pc = filters.postcode.trim()

        return leads.filter((l) => {
            const matchesQ = !qq || l.name.toLowerCase().includes(qq) || l.email.toLowerCase().includes(qq)
            const matchesPostcode = !pc || l.postcode.includes(pc)
            const matchesService = !filters.service || l.services.includes(filters.service)

            return matchesQ && matchesPostcode && matchesService
        })
    }, [leads, filters])

    const onCreateLead = async (input: CreateLeadInput) => {
        setError(null)
        await registerLead(input)
        await load()
    }

    return (
        <div className="page">
            <div className="container">
                <LeadsToolbar loading={loading} onRefresh={load} />

                {error && <div className="alert">{error}</div>}

                <div className="grid">
                    <section className="card">
                        <div className="cardTitleRow">
                            <h2>Leads</h2>
                            <div className="count">
                                Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong>
                            </div>
                        </div>

                        <LeadFilters value={filters} onChange={setFilters} />

                        <LeadsTable leads={filteredLeads} loading={loading} />
                    </section>

                    <aside className="card">
                        <h2 style={{ margin: 0, fontSize: 18 }}>Add Lead</h2>
                        <p className="helpText">Register a new expression of interest.</p>

                        <AddLeadForm onCreate={onCreateLead} onError={setError} />
                    </aside>
                </div>
            </div>
        </div>
    )
}

function LeadsToolbar(props: { loading: boolean; onRefresh: () => void }) {
    return (
        <header className="header">
            <div>
                <h1>Brighte Eats Leads</h1>
                <p>Capture expressions of interest and view them in a dashboard.</p>
            </div>

            <button className="btn" onClick={props.onRefresh} disabled={props.loading} title="Refresh">
                {props.loading ? 'Refreshing…' : 'Refresh'}
            </button>
        </header>
    )
}

function LeadFilters(props: { value: LeadFiltersState; onChange: (v: LeadFiltersState) => void }) {
    const { value, onChange } = props

    return (
        <div className="filters">
            <div>
                <label className="label">Search (name/email)</label>
                <input
                    className="input"
                    value={value.q}
                    onChange={(e) => onChange({ ...value, q: e.target.value })}
                    placeholder="e.g. sumit or @test.com"
                />
            </div>

            <div>
                <label className="label">Postcode</label>
                <input
                    className="input"
                    value={value.postcode}
                    onChange={(e) => onChange({ ...value, postcode: e.target.value })}
                    placeholder="e.g. 2000"
                />
            </div>

            <div>
                <label className="label">Service</label>
                <select
                    className="input"
                    value={value.service}
                    onChange={(e) => onChange({ ...value, service: e.target.value as EatsService | '' })}
                >
                    <option value="">All</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="PICK_UP">Pick-up</option>
                    <option value="PAYMENT">Payment</option>
                </select>
            </div>
        </div>
    )
}

function LeadsTable(props: { leads: Lead[]; loading: boolean }) {
    const { leads, loading } = props

    return (
        <div className="tableWrap">
            <table>
                <thead>
                <tr>
                    {['Name', 'Email', 'Postcode', 'Services'].map((h) => (
                        <th key={h}>{h}</th>
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
                ) : leads.length === 0 ? (
                    <tr>
                        <td colSpan={4} style={{ padding: 16, color: '#666' }}>
                            No leads found.
                        </td>
                    </tr>
                ) : (
                    leads.map((l) => (
                        <tr key={l.id}>
                            <td className="nameCell">{l.name}</td>
                            <td>{l.email}</td>
                            <td>{l.postcode}</td>
                            <td>
                                {l.services.length ? (
                                    <ServiceBadges services={l.services} />
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
    )
}

function ServiceBadges(props: { services: EatsService[] }) {
    return (
        <div className="badges">
            {props.services.map((s) => (
                <span key={s} className="badge">
          {badgeForService(s)}
        </span>
            ))}
        </div>
    )
}

function AddLeadForm(props: { onCreate: (input: CreateLeadInput) => Promise<void>; onError: (msg: string) => void }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')
    const [postcode, setPostcode] = useState('')
    const [selected, setSelected] = useState<Record<EatsService, boolean>>({
        DELIVERY: false,
        PICK_UP: false,
        PAYMENT: false,
    })
    const [submitting, setSubmitting] = useState(false)

    const services = ALL_SERVICES.filter((s) => selected[s])

    const validate = () => {
        if (!name.trim()) return 'Name is required'
        if (!email.trim()) return 'Email is required'
        if (!mobile.trim()) return 'Mobile is required'
        if (!postcode.trim()) return 'Postcode is required'
        if (services.length === 0) return 'Select at least one service'
        return null
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) return props.onError(err)

        setSubmitting(true)
        try {
            await props.onCreate({
                name: name.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                postcode: postcode.trim(),
                services,
            })

            setName('')
            setEmail('')
            setMobile('')
            setPostcode('')
            setSelected({ DELIVERY: false, PICK_UP: false, PAYMENT: false })
        } catch (e: any) {
            props.onError(e?.message ?? 'Failed to register lead')
        } finally {
            setSubmitting(false)
        }
    }

    const toggle = (s: EatsService) => setSelected((prev) => ({ ...prev, [s]: !prev[s] }))

    return (
        <form onSubmit={onSubmit} className="form">
            <div>
                <label className="label">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
                <label className="label">Email</label>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
                <label className="label">Mobile</label>
                <input className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>

            <div>
                <label className="label">Postcode</label>
                <input className="input" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </div>

            <div>
                <label className="label">Services interested in</label>
                <div className="checkGroup">
                    {ALL_SERVICES.map((s) => (
                        <label key={s} className="checkPill">
                            <input type="checkbox" checked={selected[s]} onChange={() => toggle(s)} />
                            <span>{labelForService(s)}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button className="btn btnPrimary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Create Lead'}
            </button>
        </form>
    )
}
