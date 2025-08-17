import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API = (path)=> `http://localhost:8080/api/catalog${path}`

export default function Books(){
  const [q,setQ]=useState('')
  const [items,setItems]=useState([])

  async function load(){
    const url = q ? `/books?q=${encodeURIComponent(q)}` : '/books'
    const res = await fetch(API(url))
    setItems(await res.json())
  }
  useEffect(()=>{ load() }, [])

  return (
    <div>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Recherche titre/auteur/catégorie" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load}>Rechercher</button>
      </div>
      <ul>
        {items.map(b=> (
          <li key={b.id}>
            <Link to={`/books/${b.id}`}>{b.title}</Link> — {b.author} [{b.category}] — dispo: {b.available_copies}/{b.total_copies}
          </li>
        ))}
      </ul>
    </div>
  )
}
