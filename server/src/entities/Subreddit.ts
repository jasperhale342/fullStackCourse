import { Entity, Column, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { Upvote } from "./Upvote";
import { Post } from "./Post";
import { User_Subreddit } from "./User_Subreddit";

@ObjectType()
@Entity()
export class Subreddit extends BaseEntity{

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
 
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date ;
  
  @Field() 
  @Column()
  name!: string;

  @Field()
  @Column()
  rules!: string;

  @OneToMany(() => Post, post =>post.creator)
  posts: Post[]

  @OneToMany(() => User_Subreddit, user =>user.user)
  users: User[]

  

}
/*
name of community
moderators
posts
users subscribed to it
rules of community
updatedAt 
createdAt

*/