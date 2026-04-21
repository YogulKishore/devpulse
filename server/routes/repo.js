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

module.exports = router