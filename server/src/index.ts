import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import Redis from 'ioredis';
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constant";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createUserLoader } from "./utils/createUserLoader";
import { dataSource } from './datasource';





 const main  = async () =>{
  await dataSource.initialize();
  await dataSource.runMigrations()

  const session = require('express-session');
  const RedisStore = connectRedis(session); //for storing cookies
  const redis = new Redis({ path: process.env.REDIS_URL
  });

  // const redis = new Redis({
  //   path: 'redis://:6379'
  // })
  const app = express();
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }))
  
  
  app.set('trust proxy', 1);
  app.use(
    session({
      name: COOKIE_NAME,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
      store: new RedisStore({
        client: redis as any,
        disableTouch: true // so you not accessing redis constantly
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__, //cookie only works in https,
        domain: __prod__ ? ".jasperware.co" : undefined
      },
    }));

      const apolloServer = new ApolloServer({
        schema: await buildSchema({
          resolvers: [HelloResolver, PostResolver, UserResolver],
          validate: false
        }),
        context: ({ req, res }) => ({ 
          req, 
          res, 
          redis, 
          userLoader: createUserLoader(),
          upvoteLoader: createUserLoader()
          
        }) //special object that is accessable by all resolvers, can also access response and request
      }); //bacthes and caches loading of users within a single request

    apolloServer.applyMiddleware({app, cors: false });

    app.get("/", (_, res)=>{
        res.header('Content-Type', 'application/json')
        res.send("hello");
    });


    app.listen((process.env.PORT), () =>{
        console.log("server started on localhost:4000")
    });

  //  await  Post.delete({})
}
main().catch((err) => { 
    console.error(err)
});



