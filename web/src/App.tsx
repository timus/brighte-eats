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

type LeadFiltersState = {
    searchQuery: string
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

const SERVICE_META: Record<EatsService, { label: string; badge: string }> = {
    DELIVERY: { label: 'Delivery', badge: 'DELIVERY' },
    PICK_UP: { label: 'Pick-up', badge: 'PICK-UP' },
    PAYMENT: { label: 'Payment', badge: 'PAYMENT' },
}

const SERVICES: EatsService[] = Object.keys(SERVICE_META) as EatsService[]

const getServiceLabel = (service: EatsService) => SERVICE_META[service].label
const getServiceBadge = (service: EatsService) => SERVICE_META[service].badge

const formatDate = (iso?: string) => {
    if (!iso) {
        return '—'
    }
    const date = new Date(iso)
    return date.toLocaleString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const TABLE_HEADERS = ['Name', 'Email', 'Postcode', 'Lead Date', 'Services'] as const

export default function App() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [filters, setFilters] = useState<LeadFiltersState>({
        searchQuery: '',
        postcode: '',
        service: '',
    })

    const loadLeads = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await fetchLeads()
            setLeads(data)
        } catch (caught: any) {
            setError(caught?.message ?? 'Failed to load leads')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLeads()
    }, [])

    const filteredLeads = useMemo(() => {
        const queryText = filters.searchQuery.trim().toLowerCase()
        const postcodeQuery = filters.postcode.trim()
        const selectedService = filters.service

        return leads.filter((lead) => {
            const matchesQuery =
                !queryText ||
                lead.name.toLowerCase().includes(queryText) ||
                lead.email.toLowerCase().includes(queryText)

            const matchesPostcode = !postcodeQuery || lead.postcode.includes(postcodeQuery)
            const matchesService = !selectedService || lead.services.includes(selectedService)

            return matchesQuery && matchesPostcode && matchesService
        })
    }, [leads, filters])

    const onCreateLead = async (input: CreateLeadInput) => {
        setError(null)
        await registerLead(input)
        await loadLeads()
    }

    return (
        <div className="page">
            <div className="container">
                <LeadsToolbar loading={loading} onRefresh={loadLeads} />

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

function LeadFilters(props: { value: LeadFiltersState; onChange: (value: LeadFiltersState) => void }) {
    const { value, onChange } = props

    return (
        <div className="filters">
            <div>
                <label className="label">Search (name/email)</label>
                <input
                    className="input"
                    value={value.searchQuery}
                    onChange={(event) => onChange({ ...value, searchQuery: event.target.value })}
                    placeholder="e.g. sumit or @test.com"
                />
            </div>

            <div>
                <label className="label">Postcode</label>
                <input
                    className="input"
                    value={value.postcode}
                    onChange={(event) => onChange({ ...value, postcode: event.target.value })}
                    placeholder="e.g. 2000"
                />
            </div>

            <div>
                <label className="label">Service</label>
                <select
                    className="input"
                    value={value.service}
                    onChange={(event) => onChange({ ...value, service: event.target.value as EatsService | '' })}
                >
                    <option value="">All</option>
                    {SERVICES.map((service) => (
                        <option key={service} value={service}>
                            {getServiceLabel(service)}
                        </option>
                    ))}
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
                    {TABLE_HEADERS.map((header) => (
                        <th key={header}>{header}</th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={TABLE_HEADERS.length} style={{ padding: 16, color: '#666' }}>
                            Loading…
                        </td>
                    </tr>
                ) : leads.length === 0 ? (
                    <tr>
                        <td colSpan={TABLE_HEADERS.length} style={{ padding: 16, color: '#666' }}>
                            No leads found.
                        </td>
                    </tr>
                ) : (
                    leads.map((lead) => (
                        <tr key={lead.id}>
                            <td className="nameCell">{lead.name}</td>
                            <td>{lead.email}</td>
                            <td>{lead.postcode}</td>
                            <td>{formatDate(lead.createdAt)}</td>
                            <td>
                                {lead.services.length ? (
                                    <ServiceBadges services={lead.services} />
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
            {props.services.map((service) => (
                <span key={service} className="badge">
          {getServiceBadge(service)}
        </span>
            ))}
        </div>
    )
}

function AddLeadForm(props: {
    onCreate: (input: CreateLeadInput) => Promise<void>
    onError: (msg: string) => void
}) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')
    const [postcode, setPostcode] = useState('')

    const [selectedServices, setSelectedServices] = useState<Record<EatsService, boolean>>({
        DELIVERY: false,
        PICK_UP: false,
        PAYMENT: false,
    })

    const [submitting, setSubmitting] = useState(false)

    const chosenServices = SERVICES.filter((service) => selectedServices[service])

    const validate = () => {
        if (!name.trim()) {
            return 'Name is required'
        }
        if (!email.trim()) {
            return 'Email is required'
        }
        if (!mobile.trim()) {
            return 'Mobile is required'
        }
        if (!postcode.trim()) {
            return 'Postcode is required'
        }
        if (chosenServices.length === 0) {
            return 'Select at least one service'
        }
        return null
    }

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const validationError = validate()
        if (validationError) return props.onError(validationError)

        setSubmitting(true)
        try {
            await props.onCreate({
                name: name.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                postcode: postcode.trim(),
                services: chosenServices,
            })

            setName('')
            setEmail('')
            setMobile('')
            setPostcode('')
            setSelectedServices({ DELIVERY: false, PICK_UP: false, PAYMENT: false })
        } catch (caught: any) {
            props.onError(caught?.message ?? 'Failed to register lead')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleService = (service: EatsService) => {
        setSelectedServices((previous) => ({ ...previous, [service]: !previous[service] }))
    }

    return (
        <form onSubmit={onSubmit} className="form">
            <div>
                <label className="label">Name</label>
                <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <div>
                <label className="label">Email</label>
                <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div>
                <label className="label">Mobile</label>
                <input className="input" value={mobile} onChange={(event) => setMobile(event.target.value)} />
            </div>

            <div>
                <label className="label">Postcode</label>
                <input className="input" value={postcode} onChange={(event) => setPostcode(event.target.value)} />
            </div>

            <div>
                <label className="label">Services interested in</label>
                <div className="checkGroup">
                    {SERVICES.map((service) => (
                        <label key={service} className="checkPill">
                            <input
                                type="checkbox"
                                checked={selectedServices[service]}
                                onChange={() => toggleService(service)}
                            />
                            <span>{getServiceLabel(service)}</span>
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
