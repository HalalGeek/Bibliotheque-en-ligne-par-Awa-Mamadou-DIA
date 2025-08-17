from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import os

from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./catalog.db")
PORT = int(os.getenv("PORT", "8001"))

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class BookORM(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    author = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=True)
    total_copies = Column(Integer, nullable=False, default=1)
    available_copies = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class BookIn(BaseModel):
    title: str
    author: str
    category: Optional[str] = None
    total_copies: int = Field(ge=0, default=1)
    available_copies: int = Field(ge=0, default=1)

class BookOut(BookIn):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

app = FastAPI(title="Catalog Service", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok", "service": "catalog"}

@app.get("/books", response_model=List[BookOut])
def list_books(q: Optional[str] = Query(None, description="Recherche par titre/auteur/catégorie")):
    db = SessionLocal()
    try:
        query = db.query(BookORM)
        if q:
            like = f"%{q.lower()}%"
            query = query.filter(
                (BookORM.title.ilike(like)) |
                (BookORM.author.ilike(like)) |
                (BookORM.category.ilike(like))
            )
        books = query.order_by(BookORM.created_at.desc()).all()
        return books
    finally:
        db.close()

@app.get("/books/{book_id}", response_model=BookOut)
def get_book(book_id: int):
    db = SessionLocal()
    try:
        book = db.query(BookORM).get(book_id)
        if not book:
            raise HTTPException(404, "Book not found")
        return book
    finally:
        db.close()

@app.post("/books", response_model=BookOut, status_code=201)
def create_book(book: BookIn):
    db = SessionLocal()
    try:
        b = BookORM(**book.dict())
        db.add(b)
        db.commit()
        db.refresh(b)
        return b
    finally:
        db.close()

@app.put("/books/{book_id}", response_model=BookOut)
def update_book(book_id: int, book: BookIn):
    db = SessionLocal()
    try:
        b = db.query(BookORM).get(book_id)
        if not b:
            raise HTTPException(404, "Book not found")
        for k,v in book.dict().items():
            setattr(b, k, v)
        db.commit()
        db.refresh(b)
        return b
    finally:
        db.close()

@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int):
    db = SessionLocal()
    try:
        b = db.query(BookORM).get(book_id)
        if not b:
            raise HTTPException(404, "Book not found")
        db.delete(b)
        db.commit()
        return
    finally:
        db.close()

# endpoints utilitaires pour le service loans
@app.post("/books/{book_id}/decrement", response_model=BookOut)
def decrement(book_id: int):
    db = SessionLocal()
    try:
        b = db.query(BookORM).get(book_id)
        if not b:
            raise HTTPException(404, "Book not found")
        if b.available_copies <= 0:
            raise HTTPException(400, "No available copies")
        b.available_copies -= 1
        db.commit()
        db.refresh(b)
        return b
    finally:
        db.close()

@app.post("/books/{book_id}/increment", response_model=BookOut)
def increment(book_id: int):
    db = SessionLocal()
    try:
        b = db.query(BookORM).get(book_id)
        if not b:
            raise HTTPException(404, "Book not found")
        if b.available_copies < b.total_copies:
            b.available_copies += 1
            db.commit()
            db.refresh(b)
        return b
    finally:
        db.close()
