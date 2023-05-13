import { Entity, Column,  BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

// many to many relatioship
// user <-> posts
// user -> join table <- posts
// user -> upvote <- posts


@Entity()
export class Upvote extends BaseEntity{
  

    @Column({type: "int"})
    value: number
 
   
    @PrimaryColumn()
    userId: number

 
    @PrimaryColumn()
    postId: number

    
    @ManyToOne(()=>User, (user)=>user.upvotes) //setup forgien key in Users table
    user: User;
  
    
    @ManyToOne(()=>Post, (post)=>post.upvotes) //setup forgien key in Users table
    post: Post;

}