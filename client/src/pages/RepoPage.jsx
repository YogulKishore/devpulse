import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getRepo, getCommits, getIssues, getHealth, getContributors, API, getPulls } from '../services/api'

function RepoPage() {
  const { owner, repo } = useParams()
  const [repoData, setRepoData] = useState(null)
  const [commits, setCommits] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState(null)
  const [contributors, setContributors] = useState([])
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const navigate = useNavigate()
  const [pulls, setPulls] = useState(null)
  const [compareInput, setCompareInput] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [repoRes, commitsRes, issuesRes, healthRes, contributorsRes, pullsRes] = await Promise.all([
          getRepo(owner, repo),
          getCommits(owner, repo),
          getIssues(owner, repo),
          getHealth(owner, repo),
          getContributors(owner, repo),
          getPulls(owner, repo)
        ])
        setRepoData(repoRes.data)
        setCommits(commitsRes.data.commits)
        setIssues(issuesRes.data.issues)
        setHealth(healthRes.data)
        setContributors(contributorsRes.data.contributors)
        setPulls(pullsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [owner, repo])

  if (loading) return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4'></div>
        <p className='text-zinc-500 text-sm'>Analysing repository...</p>
      </div>
    </div>
  )

  if (!repoData) return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <p className='text-zinc-500'>Repository not found</p>
    </div>
  )

  function processCommits(commits) {
    const counts = {}
    commits.forEach(commit => {
      const date = commit.date.split('T')[0]
      counts[date] = (counts[date] || 0) + 1
    })
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }
  
  function handleCompare() {
  if (!compareInput.includes('/')) return alert('Format: owner/repo')
  const [owner2, repo2] = compareInput.split('/')
  navigate(`/compare/${owner}/${repo}/${owner2}/${repo2}`)
  }

  function processIssues(issues) {
    const open = issues.filter(i => i.state === 'open').length
    const closed = issues.filter(i => i.state === 'closed').length
    return [
      { name: 'Open', value: open },
      { name: 'Closed', value: closed },
    ]
  }

  async function generateSummary() {
    setSummaryLoading(true)
    try {
      const response = await API.post(`/api/repo/${owner}/${repo}/summarise`, {
        name: repoData.name,
        stars: repoData.stars,
        forks: repoData.forks,
        openIssues: repoData.openIssues,
        language: repoData.language,
        score: health.score,
        daysSinceCommit: health.daysSinceCommit,
        resolutionRate: health.resolutionRate,
        verdict: health.verdict
      })
      setSummary(response.data.summary)
    } catch (err) {
      console.error(err)
    } finally {
      setSummaryLoading(false)
    }
  }

  const commitChartData = processCommits(commits)
  const issueChartData = processIssues(issues)

  const scoreColor = health?.score >= 80 ? 'text-green-400' : health?.score >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='border-b border-white/5 px-8 py-4 flex items-center justify-between'>
        <button
          onClick={() => navigate('/')}
          className='text-zinc-500 hover:text-white text-sm transition-colors flex items-center gap-2'
        >
          ← DevPulse
        </button>
        <div className='flex items-center gap-2 text-sm text-zinc-500'>
          <span>{owner}</span>
          <span>/</span>
          <span className='text-white'>{repo}</span>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-8 py-10'>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='mb-10'
        >
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>{repoData.name}</h1>
              <p className='text-zinc-500 mt-1 text-sm'>{repoData.description}</p>
            </div>
            <div className='text-right'>
              <p className={`text-5xl font-bold ${scoreColor}`}>{health?.score}</p>
              <p className='text-zinc-500 text-xs mt-1'>Health Score</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className='grid grid-cols-4 gap-3 mb-8'
        >
          {[
            { label: 'Stars', value: repoData.stars.toLocaleString() },
            { label: 'Forks', value: repoData.forks.toLocaleString() },
            { label: 'Open Issues', value: repoData.openIssues.toLocaleString() },
            { label: 'Language', value: repoData.language },
          ].map(({ label, value }) => (
            <div key={label} className='border border-white/8 rounded-xl p-4 bg-white/2'>
              <p className='text-zinc-500 text-xs mb-1'>{label}</p>
              <p className='text-white font-semibold text-lg'>{value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className='grid grid-cols-2 gap-6 mb-6'
        >
          <div className='border border-white/8 rounded-xl p-6 bg-white/2'>
            <h2 className='text-sm font-medium text-zinc-400 mb-4'>Commit Activity</h2>
            <ResponsiveContainer width='100%' height={200}>
              <BarChart data={commitChartData}>
                <XAxis dataKey='date' tick={{ fontSize: 9, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey='count' fill='#ffffff' radius={[3, 3, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='border border-white/8 rounded-xl p-6 bg-white/2'>
            <h2 className='text-sm font-medium text-zinc-400 mb-4'>Issues Breakdown</h2>
            <ResponsiveContainer width='100%' height={200}>
              <PieChart>
                <Pie data={issueChartData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={70} label>
                  <Cell fill='#ef4444' />
                  <Cell fill='#22c55e' />
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className='grid grid-cols-2 gap-6 mb-6'
        >
          <div className='border border-white/8 rounded-xl p-6 bg-white/2'>
            <h2 className='text-sm font-medium text-zinc-400 mb-4'>Health Details</h2>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-zinc-500 text-sm'>Verdict</span>
                <span className={`text-sm font-medium ${scoreColor}`}>{health?.verdict}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-zinc-500 text-sm'>Days since last commit</span>
                <span className='text-sm text-white'>{health?.daysSinceCommit}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-zinc-500 text-sm'>Issue resolution rate</span>
                <span className='text-sm text-white'>{health?.resolutionRate}%</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-zinc-500 text-sm'>PR merge rate</span>
                <span className='text-sm text-white'>{pulls?.mergeRate}%</span>
              </div>
            </div>
          </div>

          <div className='border border-white/8 rounded-xl p-6 bg-white/2'>
            <h2 className='text-sm font-medium text-zinc-400 mb-4'>Top Contributors</h2>
            <div className='space-y-2.5'>
              {contributors.slice(0, 5).map(c => (
                <div key={c.username} className='flex items-center gap-3'>
                  <img src={c.avatar} alt={c.username} className='w-6 h-6 rounded-full opacity-80' />
                  <a href={c.profile} target='_blank' rel='noreferrer' className='text-sm text-zinc-300 hover:text-white transition-colors'>{c.username}</a>
                  <span className='text-zinc-600 text-xs ml-auto'>{c.contributions}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className='border border-white/8 rounded-xl p-6 bg-white/2'
        >
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sm font-medium text-zinc-400'>AI Summary</h2>
            <button
              onClick={generateSummary}
              disabled={summaryLoading}
              className='px-4 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-40'
            >
              {summaryLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {summary ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-zinc-400 text-sm leading-relaxed'
            >
              {summary}
            </motion.p>
          ) : (
            <p className='text-zinc-600 text-sm'>Click Generate to get an AI powered health summary of this repository.</p>
          )}
        </motion.div>

        <div className='border border-white/10 rounded-xl p-6 mt-6'>
          <h2 className='text-sm font-medium text-zinc-400 mb-4'>Compare with another repo</h2>
          <div className='flex gap-2'>
            <input
              type='text'
              placeholder='owner/repo'
              value={compareInput}
              onChange={e => setCompareInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCompare()}
              className='flex-1 bg-transparent border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30'
            />
            <button
              onClick={handleCompare}
              className='px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-zinc-200 transition-colors'
            >
              Compare
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default RepoPage