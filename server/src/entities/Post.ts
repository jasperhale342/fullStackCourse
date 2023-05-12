import { Entity, Column, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Upvote } from "./Upvote";

@ObjectType()
@Entity()
export class Post extends BaseEntity{

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  
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

  @Field()
  @ManyToOne(()=>User, user=>user.posts) //setup forgien key in Users table
  creator: User;
  
  @OneToMany(() => Upvote, upvote =>upvote.user)
  upvotes: Upvote[]

}