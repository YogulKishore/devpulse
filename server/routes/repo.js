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

module.exports = router