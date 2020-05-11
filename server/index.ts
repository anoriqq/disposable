import express from 'express';
import bodyParser from 'body-parser';
import next from 'next';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

app.prepare().then(()=>{
  const server = express();

  server.use(bodyParser.json());

  server.get('*', (req, res)=>{
    return handle(req, res);
  });

  server.listen(port, err=>{
    if(err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
