import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Books from './pages/Books.jsx'
import BookDetails from './pages/BookDetails.jsx'
import Loans from './pages/Loans.jsx'
import LoanDetails from './pages/LoanDetails.jsx'
import NewLoan from './pages/NewLoan.jsx'

function App(){
  return (
    <BrowserRouter>
      <div style={{maxWidth:900, margin:'0 auto', padding:20}}>
        <h1>Bibliothèque en ligne</h1>
        <nav style={{display:'flex', gap:12, marginBottom:20}}>
          <Link to="/">Livres</Link>
          <Link to="/loans">Emprunts</Link>
          <Link to="/loans/new">Nouvel emprunt</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Books/>} />
          <Route path="/books/:id" element={<BookDetails/>} />
          <Route path="/loans" element={<Loans/>} />
          <Route path="/loans/:id" element={<LoanDetails/>} />
          <Route path="/loans/new" element={<NewLoan/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App/>)
