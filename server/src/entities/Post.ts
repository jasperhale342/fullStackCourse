import { Entity, Column, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { Field, ObjectType } from "type-graphql";

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

}