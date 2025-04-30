import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import productRouter from "./routes/productRoutes.js";
import {sql} from "./config/db.js";
import { aj } from "./lib/arcjet.js";

config();

const app=express();
const PORT=process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());//helmet is a security middleware that helps securing your application bu setting up different http headers
app.use(morgan("dev"));//morgan is a middleware that logs the http requests

//apply arcjet rate-limiting to all routes
app.use(async(req,res,next)=>{
    try {
        const decision=await aj.protect(req,{
            requested:1 //this specifies that each request consumes 1 token
        });

        if(decision.isDenied())
        {
            if(decision.reason.isRateLimit())
            {
                return res.status(429).json({message:"Too Many Requests."});
            }
            else if(decision.reason.isBot())
            {
                return res.status(429).json({message:"Bot access denied."});
            }
            else
            {
                return res.status(403).json({message:"Forbidden."});
            }
        }
        //check for spoofed bots
        if(decision.results.some((result)=>result.reason.isBot() && result.reason.isSpoofed())){
            return res.status(403).json({error:"Spoofed Bot Detected."});
        }
        //if no case satisfies the  user can continue
        next(); 
    } catch (error) {
        console.log("Arcject Error: ",error);
        next(error);
    }
});

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
