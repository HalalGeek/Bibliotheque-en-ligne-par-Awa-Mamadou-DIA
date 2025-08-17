import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
const API = (path)=> `http://localhost:8080/api/loans${path}`

export default function Loans(){
  const [items,setItems]=useState([])
  useEffect(()=>{ fetch(API('/loans')).then(r=>r.json()).then(setItems) }, [])
  return (
    <div>
      <ul>
        {items.map(l=>(
          <li key={l.id}>
            <Link to={`/loans/${l.id}`}>Emprunt #{l.id}</Link> — user: {l.user_id} — livre: {l.book_id} — emprunté: {new Date(l.borrowed_at).toLocaleDateString()} — {l.returned_at ? 'Retourné' : 'En cours'}
          </li>
        ))}
      </ul>
    </div>
  )
}
