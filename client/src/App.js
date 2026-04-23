import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RepoPage from './pages/RepoPage'
import ComparePage from './pages/ComparePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/repo/:owner/:repo' element={<RepoPage />} />
        <Route path='/compare/:owner1/:repo1/:owner2/:repo2' element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App