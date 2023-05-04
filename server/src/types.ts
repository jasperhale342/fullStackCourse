import { Connection, IDatabaseDriver, EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";
import {Session, SessionData} from 'express-session'
import { Redis } from "ioredis";

declare module 'express-session' {
    export interface SessionData {
        userId: number
    }
};

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    req: Request & {session: Session & Partial<SessionData>}  //& {session?: Session};
    res: Response;
    redis: Redis
};
