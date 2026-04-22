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
  <div className='min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center'>
    <h1 className='text-5xl font-bold mb-4'>DevPulse</h1>
    <p className='text-gray-400 mb-8'>GitHub Repository Health Dashboard</p>
    <div className='flex gap-2'>
      <input
        type='text'
        placeholder='e.g. facebook/react'
        value={input}
        onChange={e => setInput(e.target.value)}
        className='px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white w-72 focus:outline-none focus:border-indigo-500'
      />
      <button
        onClick={handleSearch}
        className='px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors'
      >
        Analyse
      </button>
    </div>
  </div>
)
}

export default HomePage