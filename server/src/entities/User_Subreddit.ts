import { Entity, Column,  BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Subreddit } from "./Subreddit";

@Entity()
export class User_Subreddit extends BaseEntity{
  

    @Column({type: "bool", default:true})
    isModerator: boolean
 
   
    @PrimaryColumn()
    userId: number

 
    @PrimaryColumn()
    subredditId: number

    
    @ManyToOne(()=>User, (user)=>user.subreddits) 
    user: User;
  

    @ManyToOne(()=>Subreddit, (subreddit)=>subreddit.users)
    subreddit: Subreddit;

}