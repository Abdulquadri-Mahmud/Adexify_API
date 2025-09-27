import express from 'express';
import { searchController } from '../controller/searchController.js';

const app = express();

app.get('/', searchController);

export default app;