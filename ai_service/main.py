from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI()

class RepoSummaryRequest(BaseModel):
    name: str
    stars: int
    forks: int
    openIssues: int
    language: str
    score: int
    daysSinceCommit: int
    resolutionRate: int
    verdict: str

@app.post("/summarise")
def summarise(data: RepoSummaryRequest):
    prompt = f"""You are a senior software engineer analysing a GitHub repository.
    
Repository: {data.name}
Language: {data.language}
Stars: {data.stars}
Forks: {data.forks}
Open Issues: {data.openIssues}
Health Score: {data.score}/100
Days since last commit: {data.daysSinceCommit}
Issue resolution rate: {data.resolutionRate}%
Verdict: {data.verdict}

Write a 3-4 sentence health summary of this repository. Be direct and useful.
Should a developer depend on this in production? Why or why not?"""

    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama3.1:8b",
        "prompt": prompt,
        "stream": False
    })

    result = response.json()
    return {"summary": result["response"]}

@app.get("/")
def root():
    return {"message": "DevPulse AI service running"}