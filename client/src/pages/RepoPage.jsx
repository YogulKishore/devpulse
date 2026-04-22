import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRepo, getCommits, getIssues } from '../services/api'

function RepoPage() {
  const { owner, repo } = useParams()
  const [repoData, setRepoData] = useState(null)
  const [commits, setCommits] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [repoRes, commitsRes, issuesRes] = await Promise.all([
          getRepo(owner, repo),
          getCommits(owner, repo),
          getIssues(owner, repo)
        ])
        setRepoData(repoRes.data)
        setCommits(commitsRes.data.commits)
        setIssues(issuesRes.data.issues)
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

  return (
    <div>
      <h1>{repoData.name}</h1>
      <p>{repoData.description}</p>
      <p>Stars: {repoData.stars}</p>
      <p>Forks: {repoData.forks}</p>
      <p>Open Issues: {repoData.openIssues}</p>
      <p>Language: {repoData.language}</p>
    </div>
  )
}

export default RepoPage