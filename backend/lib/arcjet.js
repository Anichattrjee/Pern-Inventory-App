import arcjet, {shield, detectBot, tokenBucket} from "@arcjet/node";
import { config } from "dotenv";

config();

export const aj=arcjet({
    key:process.env.ARCJET_KEY,
    characteristics:["ip.src"],// Track requests by IP
    rules:[
        shield({mode:"LIVE"}),//sheild protects your app from common attacks like SQL INJECTTION, XSS and CSRF attacks
        //bot detection rule
        detectBot({
            mode:"LIVE",
            //block all bots except search engine
            allow:[
                "CATEGORY:SEARCH_ENGINE"
            ]
        }),
        //rate limiting by token-bucket algorithm
        tokenBucket({
            mode:"LIVE",
            refillRate:5,
            interval:10,
            capacity:10
        })
    ]
});