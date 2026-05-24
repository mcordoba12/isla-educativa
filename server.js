import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const distPath = path.join(__dirname, 'dist')
const indexPath = path.join(distPath, 'index.html')

console.log(`[SERVER] Iniciando servidor en puerto ${PORT}`)
console.log(`[SERVER] Directorio: ${__dirname}`)
console.log(`[SERVER] Sirviendo desde: ${distPath}`)
console.log(`[SERVER] index.html existe: ${fs.existsSync(indexPath)}`)

// Servir archivos estáticos con cache headers
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: false
}))

// Logging de requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`)
  next()
})

// Redirigir todas las rutas NO estáticas a index.html (para React Router)
app.get('*', (req, res) => {
  console.log(`[SPA ROUTE] Sirviendo index.html para ${req.path}`)
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[ERROR] Error sirviendo index.html: ${err.message}`)
      res.status(500).send('Error loading application')
    }
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ [SERVER] SPA corriendo en http://0.0.0.0:${PORT}`)
})
