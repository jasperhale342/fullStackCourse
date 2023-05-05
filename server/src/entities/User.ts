import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity{

  @Field(()=>Int)
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
 
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
  
  @Field() // can choose what to expose and what to hide. dont out @Field if you want to hide
  @Column({ unique: true}) // only one person can have this username
  username!: string;

  @Column()
  password!: string;

  @Field() // can choose what to expose and what to hide. dont out @Field if you want to hide
  @Column({type: "text", unique: true}) // only one person can have this username
  email!: string;

}