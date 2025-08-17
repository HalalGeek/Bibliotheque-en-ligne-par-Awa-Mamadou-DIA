import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
const API = (path)=> `http://localhost:8080/api/loans${path}`

export default function LoanDetails(){
  const { id } = useParams()
  const [l,setL]=useState(null)
  async function load(){ const r = await fetch(API(`/loans/${id}`)); setL(await r.json()) }
  async function doReturn(){
    await fetch(API(`/loans/${id}/return`), { method:'POST' })
    await load()
  }
  useEffect(()=>{ load() }, [id])
  if(!l) return <div>Chargement...</div>
  return (
    <div>
      <h2>Emprunt #{l.id}</h2>
      <p>User: {l.user_id}</p>
      <p>Livre: {l.book_id}</p>
      <p>Emprunté le: {new Date(l.borrowed_at).toLocaleString()}</p>
      <p>À rendre le: {new Date(l.due_at).toLocaleString()}</p>
      <p>Statut: {l.returned_at ? `Retourné le ${new Date(l.returned_at).toLocaleString()}` : 'En cours'}</p>
      {!l.returned_at && <button onClick={doReturn}>Rendre le livre</button>}
    </div>
  )
}
