import { Entity, Column, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { Upvote } from "./Upvote";
import { Subreddit } from "./Subreddit";

@ObjectType()
@Entity()
export class Post extends BaseEntity{

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field( () => Int, {nullable:true})
  voteStatus: number | null 
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
 
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date ;
  
  @Field() // can choose what to expose and what to hide. dont out @Field if you want to hide
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type: "int", default: 0})
  points!: number;
  
  @Field()
  @Column()
  creatorId: number

  @Field(()=>User)
  @ManyToOne(()=>User, user=>user.posts) 
  creator: User;


  @Field(()=>Subreddit)
  @ManyToOne(()=>Subreddit, subreddit=>subreddit.posts) 
  subreddit: Subreddit;
  
  @OneToMany(() => Upvote, upvote =>upvote.user)
  upvotes: Upvote[]

  

}