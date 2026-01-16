const express = require('express');
const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true }));

app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

app.use('*', notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => console.log('Backend running on http://localhost:' + port));
}

module.exports = app;
