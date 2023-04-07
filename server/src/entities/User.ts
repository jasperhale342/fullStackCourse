import { Entity, Property, PrimaryKey } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {

  @Field(()=>Int)
  @PrimaryKey()
  id!: number;
  
  @Field(() => String)
  @Property({type: 'date'})
  createdAt: Date = new Date();
 
  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
  
  @Field() // can choose what to expose and what to hide. dont out @Field if you want to hide
  @Property({type: "text", unique: true}) // only one person can have this username
  username!: string;

  @Property({type: "text"})
  password!: string;

  @Field() // can choose what to expose and what to hide. dont out @Field if you want to hide
  @Property({type: "text", unique: true}) // only one person can have this username
  email!: string;

}