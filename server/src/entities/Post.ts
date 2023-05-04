import { Entity, Property, PrimaryKey } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {

  @Field()
  @PrimaryKey()
  id!: number;
  
  @Field(() => String)
  @Property({type: 'date'})
  createdAt: Date = new Date();
 
  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
  
  @Field() // can choose what to expose and what to hide. dont out @Field if you want to hide
  @Property({type: "text"})
  title!: string;

}