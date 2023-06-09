import path from "path";
import { DataSource } from "typeorm";


export const dataSource =  new DataSource({
    type:'postgres',
    url:  process.env.DATABASE_URL,
    logging: true,
    // username: process.env.DATABASE_USERNAME ? process.env.DATABASE_USERNAME : undefined,
    // password: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD : undefined,
    synchronize: true, // create tables automatically, dont need to run migrations 
    entities: ["dist/entities/**/*.js"],
    migrations: [path.join(__dirname, "../dist/migrations/*{.ts,.js}")]
  })