import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import publicRouteIndex from './routes/public.index';
import securedRouteIndex from './routes/secured.index';

const app = express()


// TODO: Configure CORS https://expressjs.com/en/resources/middleware/cors.html
app.use(cors())
process.env.NODE_ENV !== 'prod' && app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

app.use('/api/v1', publicRouteIndex);
app.use('/api/v1', securedRouteIndex);

// TODO: remove this code and handle not found exception
app.use('*', (req, res) => res.status(404).json({
  error: 'not found'
}));

export default app
