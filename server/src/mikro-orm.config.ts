import { __prod__ } from "./constant";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    },
    entities: [Post, User],
    dbName: "fullstackdatabase",
    password: "root",
    debug:  !__prod__,
    type: 'postgresql'
} as Parameters<typeof MikroORM.init>[0];