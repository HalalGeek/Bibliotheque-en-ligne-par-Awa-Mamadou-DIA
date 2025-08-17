import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const API = (path)=> `http://localhost:8080/api/catalog${path}`

export default function BookDetails(){
  const { id } = useParams()
  const [b,setB]=useState(null)
  useEffect(()=>{
    fetch(API(`/books/${id}`)).then(r=>r.json()).then(setB)
  }, [id])
  if(!b) return <div>Chargement...</div>
  return (
    <div>
      <h2>{b.title}</h2>
      <p>Auteur: {b.author}</p>
      <p>Catégorie: {b.category}</p>
      <p>Disponibilité: {b.available_copies}/{b.total_copies}</p>
      <p>Créé le: {new Date(b.created_at).toLocaleString()}</p>
    </div>
  )
}
