import path from "path";
import { DataSource } from "typeorm";

export const dataSource =  new DataSource({
    type:'postgres',
    url:  process.env.DATABASE_URL,
    logging: true,
    // synchronize: true, // create tables automatically, dont need to run migrations 
    entities: ["dist/entities/**/*.js"],
    migrations: [path.join(__dirname, "../dist/migrations/*{.ts,.js}")]
  })