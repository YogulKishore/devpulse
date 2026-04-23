import axios from 'axios'

export const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

export const getRepo = (owner, repo) =>
    API.get(`/api/repo/${owner}/${repo}`)

export const getCommits = (owner, repo) =>
    API.get(`/api/repo/${owner}/${repo}/commits`)

export const getIssues = (owner, repo) =>
API.get(`/api/repo/${owner}/${repo}/issues`)

export const getContributors = (owner, repo) =>
  API.get(`/api/repo/${owner}/${repo}/contributors`)

export const getHealth = (owner, repo) =>
  API.get(`/api/repo/${owner}/${repo}/health`)

export const getPulls = (owner, repo) =>
  API.get(`/api/repo/${owner}/${repo}/pulls`)