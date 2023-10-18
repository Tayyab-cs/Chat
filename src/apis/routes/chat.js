import express from 'express';
import { createGroup, joinGroup } from '../controllers/index.js';

const route = express.Router();

route.post('/createGroup', createGroup);
route.post('/joinGroup', joinGroup);

export default route;
