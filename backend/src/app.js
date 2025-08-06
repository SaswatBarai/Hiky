import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {rateLimit} from "express-rate-limit"
import morgan from "morgan"
import cookieParser from "cookie-parser";
import http from 'http';



const app = express();


app.use(helmet());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity, adjust as needed
}));
app.use(cookieParser());








// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests, please try again later."
})

app.use(limiter);


app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});



import userRoutes from "./routes/user.route.js";

app.use("/api/v1/users", userRoutes);







export default app;