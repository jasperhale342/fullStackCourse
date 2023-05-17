import { Request, Response } from "express";
import {Session, SessionData} from 'express-session'
import { Redis } from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

declare module 'express-session' {
    export interface SessionData {
        userId: number
    }
};

export type MyContext = {

    req: Request & {session: Session & Partial<SessionData>}  //& {session?: Session};
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof createUserLoader> // just give return value of a function
    upvoteLoader: ReturnType<typeof createUpvoteLoader>
};
