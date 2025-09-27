import express from 'express';
import { searchController } from '../controller/searchController.js';

const app = express();

app.post('/', searchController);

export default app;