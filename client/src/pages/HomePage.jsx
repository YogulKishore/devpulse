import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const [input, setInput] = useState('')
    const navigate = useNavigate()

    function handleSearch() {
        if (!input.includes('/')) return alert('Format: owner/repo')
        const [owner, repo] = input.split('/')
        navigate(`/repo/${owner}/${repo}`)
    }

    return (
        <div>
        <h1>DevPulse</h1>
        <p>Enter a GitHub repository to analyse its health</p>
        <input
            type='text'
            placeholder='e.g. facebook/react'
            value={input}
            onChange={e => setInput(e.target.value)}
        />
        <button onClick={handleSearch}>Analyse</button>
        </div>
    )
}

export default HomePage