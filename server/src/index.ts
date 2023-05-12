import "reflect-metadata"
import { COOKIE_NAME, __prod__ } from "./constant";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import { DataSource,  } from "typeorm";
import cors from 'cors'
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";
import { Upvote } from "./entities/Upvote";







export const dataSource =  new DataSource({
    type:'postgres',
    database: 'lireddit2',
    logging: true,
    synchronize: true, // create tables automatically, dont need to run migrations 
    entities: [Post, User, Upvote],
    migrations: [path.join(__dirname, "./migrations/*")]
  })


 const main  = async () =>{
  await dataSource.initialize();
  // await Post.delete({})
  // await dataSource.runMigrations();


  const session = require('express-session');
  const RedisStore = connectRedis(session); //for storing cookies
  const redis = new Redis();
  const app = express();
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }))
  
  
  app.set('trust proxy', 1);
  app.use(
    session({
      name: COOKIE_NAME,
      saveUninitialized: false,
      secret: 'kljhsafdlkashdkfdfgh',
      resave: false,
      store: new RedisStore({
        client: redis as any,
        disableTouch: true // so you not accessing redis constantly
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: false, //cookie only works in https
      },
    }));

      const apolloServer = new ApolloServer({
        schema: await buildSchema({
          resolvers: [HelloResolver, PostResolver, UserResolver],
          validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis }) //special object that is accessable by all resolvers, can also access response and request
      });

    apolloServer.applyMiddleware({app, cors: false });

    app.get("/", (_, res)=>{
        res.header('Content-Type', 'application/json')
        res.send("hello");
    });


    app.listen(4000, () =>{
        console.log("server started on localhost:4000")
    });

  //  await  Post.delete({})
}
main().catch((err) => { 
    console.error(err)
});

// async function bootstrap(app:any, redis:any) { // should probably make types
//   const apolloServer = new ApolloServer({
//     schema: await buildSchema({
//       resolvers: [HelloResolver, PostResolver, UserResolver],
//       validate: false
//     }),
//     context: ({ req, res }) => ({ req, res, redis }) //special object that is accessable by all resolvers, can also access response and request
//   });

// apolloServer.applyMiddleware({app, cors: false });
// }


