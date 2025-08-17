import React, { useEffect, useState } from 'react'

const API_C = (path)=> `http://localhost:8080/api/catalog${path}`
const API_L = (path)=> `http://localhost:8080/api/loans${path}`

export default function NewLoan(){
  const [books,setBooks]=useState([])
  const [bookId,setBookId]=useState('')
  const [userId,setUserId]=useState('1')
  const [msg,setMsg]=useState('')

  useEffect(()=>{
    fetch(API_C('/books')).then(r=>r.json()).then(setBooks)
  }, [])

  async function submit(e){
    e.preventDefault()
    setMsg('')
    const res = await fetch(API_L('/loans'), {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user_id: Number(userId), book_id: Number(bookId)})
    })
    if(res.ok){
      const data = await res.json()
      setMsg('Emprunt créé: #' + data.id)
    } else {
      const t = await res.text()
      setMsg('Erreur: ' + t)
    }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Utilisateur (ID): </label>
        <input value={userId} onChange={e=>setUserId(e.target.value)} />
      </div>
      <div>
        <label>Livre: </label>
        <select value={bookId} onChange={e=>setBookId(e.target.value)}>
          <option value="">-- choisir --</option>
          {books.map(b=> <option key={b.id} value={b.id}>{b.title} — dispo {b.available_copies}</option>)}
        </select>
      </div>
      <button type="submit" disabled={!bookId}>Emprunter</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}
