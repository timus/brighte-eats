import { useEffect, useState } from 'react'
import {fetchLeads} from "./graphqlClient";


type Lead = {
    id: string
    name: string
    email: string
    postcode: string
    services: string[]
}

export default function App() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeads().then((data) => {
            setLeads(data)
            setLoading(false)
        })
    }, [])

    if (loading) return <p>Loading…</p>

    return (
        <div style={{ padding: 20 }}>
            <h2>Brighte Eats Leads</h2>

            <ul>
                {leads.map((l) => (
                    <li key={l.id}>
                        <strong>{l.name}</strong> — {l.email} — {l.postcode}
                        <br />
                        Services: {l.services.join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    )
}
