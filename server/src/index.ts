// The VidyaSetu API server.
//
// A "backend server" is just a long-running program that listens on a
// network port and answers HTTP requests. Express is a thin framework
// that maps an incoming (method + path) — like GET /health — to a
// function that builds the response. That's the whole idea; everything
// else we add later (a database, login, sync) hangs off this skeleton.

import express from 'express';

const app = express();
const PORT = 3001;

// ---- Middleware ----
// Middleware are functions that run on every request, in order, before it
// reaches your route. This one reads a JSON request body and puts it on
// req.body so we can use it. We'll add more later (logging, auth checks).
app.use(express.json());

// ---- Routes ----
// A route says: "when a GET request comes in for /health, run this handler."
// The handler receives `req` (what the client sent) and `res` (how we reply).
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vidyasetu-server',
    time: new Date().toISOString(),
  });
});

// Root route — a friendly message if you open the server in a browser.
app.get('/', (req, res) => {
  res.send('VidyaSetu API is running. Try GET /health');
});

// ---- Start listening ----
// Until this line runs, nothing is served. app.listen opens the port and
// keeps the process alive, waiting for requests.
app.listen(PORT, () => {
  console.log(`VidyaSetu API listening on http://localhost:${PORT}`);
});
