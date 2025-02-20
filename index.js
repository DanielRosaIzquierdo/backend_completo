
require('dotenv').config()
const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000;

app.use(cors())

app.use(express.json())

const v1Router = require('./v1/routes/routes')

app.use('/api/v1/ligas', v1Router);

let apiHost = process.env.API_HOST || 'localhost';

if (apiHost === 'localhost') apiHost = `${apiHost}:${PORT}`

swaggerDocument.host = apiHost;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(PORT, () => console.log(`App listening on port ${PORT}!`))