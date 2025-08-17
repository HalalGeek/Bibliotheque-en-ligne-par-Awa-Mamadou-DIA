import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
app.use(cors())
app.use(morgan('dev'))

const PORT = process.env.PORT || 8080
const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:8001'
const LOANS_URL = process.env.LOANS_URL || 'http://localhost:8002'

app.get('/health', (req,res)=> res.json({status:'ok', gateway:true}))

app.use('/api/catalog', createProxyMiddleware({
  target: CATALOG_URL,
  changeOrigin: true,
  pathRewrite: {'^/api/catalog': ''}
}))

app.use('/api/loans', createProxyMiddleware({
  target: LOANS_URL,
  changeOrigin: true,
  pathRewrite: {'^/api/loans': ''}
}))

app.listen(PORT, ()=> console.log(`Gateway running on :${PORT}`))
