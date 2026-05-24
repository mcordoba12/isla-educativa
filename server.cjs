const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log(`[SERVER] Iniciando servidor en puerto ${PORT}`);
console.log(`[SERVER] Directorio: ${__dirname}`);
console.log(`[SERVER] Sirviendo desde: ${distPath}`);
console.log(`[SERVER] index.html existe: ${fs.existsSync(indexPath)}`);

// Servir archivos estáticos desde dist/
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: false
}));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

// SPA routing: servir index.html para todas las rutas no-estáticas
app.get('*', (req, res) => {
  console.log(`[SPA ROUTE] Sirviendo index.html para ${req.path}`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[ERROR] Error sirviendo index.html: ${err.message}`);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled Rejection:', err);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ [SERVER] SPA corriendo en http://0.0.0.0:${PORT}`);
});
