import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getRepo, getHealth, getPulls } from '../services/api'

function ComparePage() {
  const { owner1, repo1, owner2, repo2 } = useParams()
  const navigate = useNavigate()

  const [data1, setData1] = useState(null)
  const [data2, setData2] = useState(null)
  const [health1, setHealth1] = useState(null)
  const [health2, setHealth2] = useState(null)
  const [pulls1, setPulls1] = useState(null)
  const [pulls2, setPulls2] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [r1, r2, h1, h2, p1, p2] = await Promise.all([
          getRepo(owner1, repo1),
          getRepo(owner2, repo2),
          getHealth(owner1, repo1),
          getHealth(owner2, repo2),
          getPulls(owner1, repo1),
          getPulls(owner2, repo2),
        ])
        setData1(r1.data)
        setData2(r2.data)
        setHealth1(h1.data)
        setHealth2(h2.data)
        setPulls1(p1.data)
        setPulls2(p2.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [owner1, repo1, owner2, repo2])

  if (loading) return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4'></div>
        <p className='text-zinc-500 text-sm'>Comparing repositories...</p>
      </div>
    </div>
  )

  function StatRow({ label, val1, val2, higher = 'more' }) {
    const v1 = parseFloat(val1)
    const v2 = parseFloat(val2)
    const win1 = higher === 'more' ? v1 > v2 : v1 < v2
    const win2 = higher === 'more' ? v2 > v1 : v2 < v1
    return (
      <div className='flex items-center justify-between py-3 border-b border-white/5'>
        <span className={`text-sm font-medium ${win1 ? 'text-green-400' : 'text-zinc-300'}`}>{val1}</span>
        <span className='text-xs text-zinc-600 w-32 text-center'>{label}</span>
        <span className={`text-sm font-medium ${win2 ? 'text-green-400' : 'text-zinc-300'}`}>{val2}</span>
      </div>
    )
  }

  const winner = health1?.score > health2?.score ? `${owner1}/${repo1}` : `${owner2}/${repo2}`

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='border-b border-white/5 px-8 py-4 flex items-center justify-between'>
        <button
          onClick={() => navigate('/')}
          className='text-zinc-500 hover:text-white text-sm transition-colors'
        >
          ← DevPulse
        </button>
        <span className='text-zinc-500 text-sm'>Repository Comparison</span>
      </div>

      <div className='max-w-4xl mx-auto px-8 py-10'>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className='grid grid-cols-3 gap-4 mb-8 text-center'
        >
          <div>
            <p className='text-lg font-bold'>{owner1}/{repo1}</p>
            <p className='text-zinc-500 text-xs mt-1'>{data1?.language}</p>
          </div>
          <div className='flex items-center justify-center'>
            <span className='text-zinc-600 text-sm'>vs</span>
          </div>
          <div>
            <p className='text-lg font-bold'>{owner2}/{repo2}</p>
            <p className='text-zinc-500 text-xs mt-1'>{data2?.language}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='border border-white/10 rounded-xl p-6 mb-6'
        >
          <StatRow label='Health Score' val1={health1?.score} val2={health2?.score} />
          <StatRow label='Stars' val1={data1?.stars.toLocaleString()} val2={data2?.stars.toLocaleString()} />
          <StatRow label='Forks' val1={data1?.forks.toLocaleString()} val2={data2?.forks.toLocaleString()} />
          <StatRow label='Open Issues' val1={data1?.openIssues} val2={data2?.openIssues} higher='less' />
          <StatRow label='Issue Resolution' val1={`${health1?.resolutionRate}%`} val2={`${health2?.resolutionRate}%`} />
          <StatRow label='PR Merge Rate' val1={`${pulls1?.mergeRate}%`} val2={`${pulls2?.mergeRate}%`} />
          <StatRow label='Days Since Commit' val1={health1?.daysSinceCommit} val2={health2?.daysSinceCommit} higher='less' />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='border border-green-500/20 bg-green-500/5 rounded-xl p-6 text-center'
        >
          <p className='text-zinc-400 text-sm mb-1'>Winner</p>
          <p className='text-2xl font-bold text-green-400'>{winner}</p>
          <p className='text-zinc-500 text-xs mt-1'>Based on overall health score</p>
        </motion.div>

      </div>
    </div>
  )
}

export default ComparePage