import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import productRouter from "./routes/productRoutes.js";
import {sql} from "./config/db.js";

config();

const app=express();
const PORT=process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());//helmet is a security middleware that helps securing your application bu setting up different http headers
app.use(morgan("dev"));//morgan is a middleware that logs the http requests


app.use("/api/products",productRouter);


app.get("/test",(req,res)=>{
    console.log(res.getHeaders());
    res.send("Hello form test.");
});

async function initDB(){
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log("Database Inititalized.");
    } catch (error) {
        console.log("Error initializing database: ",error);
    }
}

initDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on PORT:${PORT}`);
    });
}).catch((e)=>{
    console.log("Couldnt start server as database initialization failed.");
});
