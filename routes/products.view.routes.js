import express from 'express';
import { recordAndGetproductsViewModels, } from '../controller/productsView.controller.js';

const app = express();

// Get total views of a product
app.post("/views", recordAndGetproductsViewModels);

export default app;