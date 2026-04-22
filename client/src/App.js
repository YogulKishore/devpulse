import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RepoPage from './pages/RepoPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/repo/:owner/:repo' element={<RepoPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App