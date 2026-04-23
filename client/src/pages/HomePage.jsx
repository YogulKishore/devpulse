import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getHistory } from '../services/api'

function HomePage() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getHistory().then(res => setHistory(res.data.history))
  }, [])

  function handleSearch() {
    if (!input.includes('/')) return alert('Format: owner/repo')
    const [owner, repo] = input.split('/')
    navigate(`/repo/${owner}/${repo}`)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className='min-h-screen bg-black text-white flex flex-col items-center justify-center px-4'>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='text-center mb-12'
      >
        <div className='inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-zinc-400 mb-8'>
          <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse'></span>
          GitHub Repository Intelligence
        </div>
        <h1 className='text-6xl font-bold tracking-tight mb-4'>
          Dev<span className='text-zinc-400'>Pulse</span>
        </h1>
        <p className='text-zinc-500 text-lg'>
          Analyse any GitHub repository's health in seconds
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='w-full max-w-lg'
      >
        <div className='flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl'>
          <input
            type='text'
            placeholder='facebook/react'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className='flex-1 bg-transparent px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none text-sm'
          />
          <button
            onClick={handleSearch}
            className='px-5 py-2.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-zinc-200 transition-colors'
          >
            Analyse
          </button>
        </div>
        <p className='text-zinc-600 text-xs text-center mt-3'>
          Press Enter or click Analyse
        </p>
      </motion.div>

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='mt-12 w-full max-w-lg'
        >
          <p className='text-zinc-600 text-xs mb-3'>Recent searches</p>
          <div className='space-y-2'>
            {history.map((item, i) => (
              <div
                key={i}
                onClick={() => navigate(`/repo/${item.owner}/${item.repo}`)}
                className='flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors'
              >
                <span className='text-sm text-zinc-300'>{item.owner}/{item.repo}</span>
                <span className='text-xs text-zinc-600'>
                  {new Date(item.searched_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  )
}

export default HomePage