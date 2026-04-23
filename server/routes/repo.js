const express = require('express')
const axios = require('axios')
const router = express.Router()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const githubAPI = axios.create({
    baseURL:'https://api.github.com',
    headers:{
        Authorization:`Bearer ${GITHUB_TOKEN}`,
        Accept:'application/vnd.github.v3+json',
    },
})

router.get('/:owner/:repo', async(req, res) =>{
    const{owner, repo} = req.params

    try{
        const{data} = await githubAPI.get(`/repos/${owner}/${repo}`)
        res.json({
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        language: data.language,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        })
    } catch(err){
        res.status(404).json({error:'Repo not found'})
    }
})

router.get('/:owner/:repo/commits', async(req, res) =>{
    const{owner, repo} = req.params

    try{
        const{data} = await githubAPI.get(`/repos/${owner}/${repo}/commits`, {
            params:{per_page:100}
        })

        const commits = data.map(commit => ({
            message:commit.commit.message,
            author:commit.commit.author.name,
            date:commit.commit.author.date,
        }))

        res.json({total:commits.length, commits})
    }catch(err){
        res.status(500).json({error:'Failedd to fetch commits'})
    }
})

router.get('/:owner/:repo/issues', async(req, res) => {
    const{owner, repo} = req.params

    try{
        const{data} = await githubAPI.get(`/repos/${owner}/${repo}/issues`, {
            params: {per_page:100, state:'all'}
        })

        const issues = data.map(issue =>({
            title: issue.title,
            state: issue.state,
            createdAt: issue.created_at,
            closedAt: issue.closed_at,
            author: issue.user.login,
        }))

        res.json({total: issues.length, issues })
    }   catch(err){
        res.status(500).json({error:'Failed to fetch issues'})
    }
})

router.get('/:owner/:repo/contributors', async (req, res) => {
  const { owner, repo } = req.params

  try {
    const { data } = await githubAPI.get(`/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 10 }
    })

    const contributors = data.map(contributor => ({
      username: contributor.login,
      contributions: contributor.contributions,
      avatar: contributor.avatar_url,
      profile: contributor.html_url,
    }))

    res.json({ contributors })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributors' })
  }
})

router.get('/:owner/:repo/health', async (req, res) => {
  const { owner, repo } = req.params

  try {
    const [repoRes, commitsRes, issuesRes] = await Promise.all([
      githubAPI.get(`/repos/${owner}/${repo}`),
      githubAPI.get(`/repos/${owner}/${repo}/commits`, { params: { per_page: 100 } }),
      githubAPI.get(`/repos/${owner}/${repo}/issues`, { params: { per_page: 100, state: 'all' } }),
    ])

    const repoData = repoRes.data
    const commits = commitsRes.data
    const issues = issuesRes.data

    // days since last commit
    const lastCommit = new Date(commits[0].commit.author.date)
    const daysSinceCommit = Math.floor((new Date() - lastCommit) / (1000 * 60 * 60 * 24))

    // issue resolution rate
    const closedIssues = issues.filter(i => i.state === 'closed').length
    const resolutionRate = issues.length > 0 ? (closedIssues / issues.length) * 100 : 0

    // score calculation
    let score = 100

    // penalise for inactivity
    if (daysSinceCommit > 30) score -= 20
    if (daysSinceCommit > 90) score -= 20
    if (daysSinceCommit > 180) score -= 20

    // reward issue resolution
    if (resolutionRate > 70) score += 10
    if (resolutionRate < 30) score -= 15

    // reward stars
    if (repoData.stargazers_count > 1000) score += 10
    if (repoData.stargazers_count > 10000) score += 10

    score = Math.min(100, Math.max(0, score))

    res.json({
      score,
      daysSinceCommit,
      resolutionRate: Math.round(resolutionRate),
      stars: repoData.stargazers_count,
      verdict: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate health score' })
  }
})

router.post('/:owner/:repo/summarise', async (req, res) => {
    try {
        console.log('Received body:', req.body)
        const response = await axios.post('http://localhost:8000/summarise', req.body)
        res.json(response.data)
    } catch (err) {
        res.status(500).json({error: 'AI service unavailable'})
    }
})

router.get('/:owner/:repo/pulls', async (req, res) => {
    const {owner, repo} = req.params

    try {
        const [openRes, closedRes] = await Promise.all ([
            githubAPI.get(`/repos/${owner}/${repo}/pulls`, {params: {state:'open', per_page:100}}),
            githubAPI.get(`/repos/${owner}/${repo}/pulls`, {params: {state: 'closed', per_page:100}}),
        ])

    const open = openRes.data.length
    const closed = closedRes.data.length
    const total = open + closed
    const mergeRate = total > 0 ? Math.round((closed / total) * 100) : 0

    res.json({
        open,
        closed,
        total,
        mergeRate,
    })
}catch(err){
    res.status(500).json({error:'Falied to fetch pull requests'})
}
})

module.exports = router