import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
    <div>
      <h1>{repoData.name}</h1>
      <p>{repoData.description}</p>
      <p>Stars: {repoData.stars}</p>
      <p>Forks: {repoData.forks}</p>
      <p>Open Issues: {repoData.openIssues}</p>
      <p>Language: {repoData.language}</p>
      <h2>Commit Activity</h2>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={commitChartData}>
          <XAxis dataKey='date' tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey='count' fill='#4f46e5' />
        </BarChart>
      </ResponsiveContainer>
      <h2>Issues Breakdown</h2>
<ResponsiveContainer width='100%' height={300}>
  <PieChart>
    <Pie data={issueChartData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={100} label>
      <Cell fill='#ef4444' />
      <Cell fill='#22c55e' />
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
  </ResponsiveContainer>
  <h2>Health Score: {health?.score}/100 — {health?.verdict}</h2>
<p>Days since last commit: {health?.daysSinceCommit}</p>
<p>Issue resolution rate: {health?.resolutionRate}%</p>

<h2>Top Contributors</h2>
{contributors.map(c => (
  <div key={c.username}>
    <img src={c.avatar} alt={c.username} width={30} />
    <a href={c.profile}>{c.username}</a>
    <span> — {c.contributions} commits</span>
  </div>
))}
    </div>
  )
}

export default RepoPage