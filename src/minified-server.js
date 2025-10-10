import express from 'express';
import path from 'path';
const app = express();
const PORT = 8000;
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '')));
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
// Middleware to parse JSON bodies
app.use(express.json());
// POST endpoint that echoes the request
app.post('/message', (req, res) => {
    console.log('Received POST request:', req.body);

    // Echo back the request body
    res.json({
        message: 'Echo response',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Example page</title>
              <link rel="stylesheet" href="styles.css"/>
              <script>
              window.ai_context = {
                  'someKey': 'some_value'
              }
              </script>
              <script type="module" src="main.js"></script>
            </head>
            <body>
                <div>Some Page</div>
            </body>
        </html>
    `);
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`POST to http://localhost:${PORT}/chat to test`);
});
