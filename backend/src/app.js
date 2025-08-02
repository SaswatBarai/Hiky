import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {rateLimit} from "express-rate-limit"
import dotenv from 'dotenv';


const app = express();
dotenv.config();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);



// Rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests, please try again later."
})



app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});






export default app;