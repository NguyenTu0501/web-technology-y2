import express, {type Application} from 'express'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import productRouter from './routes/product.route.js'
import orderTableRouter from './routes/order-table.route.js'

const PORT_NUMBER = 8080;
const application: Application = express();
const publicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

application.use(express.json());
application.use(express.static(publicDirectory));
application.use('/api/products', productRouter);
application.use('/api/tables', orderTableRouter);

application.listen(PORT_NUMBER, () => console.log(`Server started on http://localhost:${PORT_NUMBER}`));
