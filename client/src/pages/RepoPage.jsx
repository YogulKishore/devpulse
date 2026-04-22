import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getRepo, getCommits, getIssues, getHealth, getContributors } from '../services/api'

function RepoPage() {
  const { owner, repo } = useParams()
  const [repoData, setRepoData] = useState(null)
  const [commits, setCommits] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState(null)
  const [contributors, setContributors] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      try {
        const [repoRes, commitsRes, issuesRes, healthRes, contributorsRes] = await Promise.all([
            getRepo(owner, repo),
            getCommits(owner, repo),
            getIssues(owner, repo),
            getHealth(owner, repo),
            getContributors(owner, repo)
            ])
            setRepoData(repoRes.data)
            setCommits(commitsRes.data.commits)
            setIssues(issuesRes.data.issues)
            setHealth(healthRes.data)
            setContributors(contributorsRes.data.contributors)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [owner, repo])

  if (loading) return <p>Loading...</p>
  if (!repoData) return <p>Repo not found</p>

  function processCommits(commits) {
    const counts = {}
    commits.forEach(commit => {
        const date = commit.date.split('T')[0]
        counts[date] = (counts[date] || 0) + 1
    })
    return Object.entries(counts)
    .map(([date, count]) => ({ date, count}))
    .sort((a,b) => new Date(a.date) - new Date(b.date))
  }

  function processIssues(issues) {
    const open = issues.filter(issue => issue.state === 'open').length
    const closed = issues.filter(issue => issue.state === 'closed').length
    return [
        {name:'open', value:open},
        {name:'closed', value:closed},
    ]
  }

  const commitChartData = processCommits(commits)
  const issueChartData = processIssues(issues)

  return (
  <div className='min-h-screen bg-gray-950 text-white p-8'>
    
    <div className='max-w-5xl mx-auto'>
      <button
        onClick={() => navigate('/')}
        className='mb-6 text-gray-400 hover:text-white text-sm flex items-center gap-1'
      >
  ← Back to search
      </button>

      <div className='mb-8'>
        <h1 className='text-4xl font-bold'>{repoData.name}</h1>
        <p className='text-gray-400 mt-2'>{repoData.description}</p>
      </div>

      <div className='grid grid-cols-4 gap-4 mb-8'>
        <div className='bg-gray-900 rounded-xl p-4'>
          <p className='text-gray-400 text-sm'>Stars</p>
          <p className='text-2xl font-bold'>{repoData.stars.toLocaleString()}</p>
        </div>
        <div className='bg-gray-900 rounded-xl p-4'>
          <p className='text-gray-400 text-sm'>Forks</p>
          <p className='text-2xl font-bold'>{repoData.forks.toLocaleString()}</p>
        </div>
        <div className='bg-gray-900 rounded-xl p-4'>
          <p className='text-gray-400 text-sm'>Open Issues</p>
          <p className='text-2xl font-bold'>{repoData.openIssues.toLocaleString()}</p>
        </div>
        <div className='bg-gray-900 rounded-xl p-4'>
          <p className='text-gray-400 text-sm'>Language</p>
          <p className='text-2xl font-bold'>{repoData.language}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-8 mb-8'>
        <div className='bg-gray-900 rounded-xl p-6'>
          <h2 className='text-xl font-semibold mb-4'>Commit Activity</h2>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={commitChartData}>
              <XAxis dataKey='date' tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#111827', border: 'none' }} />
              <Bar dataKey='count' fill='#6366f1' radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-gray-900 rounded-xl p-6'>
          <h2 className='text-xl font-semibold mb-4'>Issues Breakdown</h2>
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <Pie data={issueChartData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={80} label>
                <Cell fill='#ef4444' />
                <Cell fill='#22c55e' />
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-8'>
        <div className='bg-gray-900 rounded-xl p-6'>
          <h2 className='text-xl font-semibold mb-2'>Health Score</h2>
          <p className='text-6xl font-bold text-indigo-400'>{health?.score}</p>
          <p className='text-gray-400 mt-1'>{health?.verdict}</p>
          <div className='mt-4 space-y-2'>
            <p className='text-sm text-gray-400'>Days since last commit: <span className='text-white'>{health?.daysSinceCommit}</span></p>
            <p className='text-sm text-gray-400'>Issue resolution rate: <span className='text-white'>{health?.resolutionRate}%</span></p>
          </div>
        </div>

        <div className='bg-gray-900 rounded-xl p-6'>
          <h2 className='text-xl font-semibold mb-4'>Top Contributors</h2>
          <div className='space-y-3'>
            {contributors.map(c => (
              <div key={c.username} className='flex items-center gap-3'>
                <img src={c.avatar} alt={c.username} className='w-8 h-8 rounded-full' />
                <a href={c.profile} target='_blank' rel='noreferrer' className='text-indigo-400 hover:underline'>{c.username}</a>
                <span className='text-gray-400 text-sm ml-auto'>{c.contributions} commits</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  </div>
)
}

export default RepoPage