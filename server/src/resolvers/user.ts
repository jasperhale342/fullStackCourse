 import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import {EntityManager} from '@mikro-orm/postgresql'
import { COOKIE_NAME } from "../constant";

@InputType()
class UsernamePasswordInput{
    @Field()
    email: string
    @Field()
    username: string
    @Field()
    password: string

}
@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}


@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable:true})
    user?: User
}


@Resolver()
export class UserResolver {

    // @Mutation(() => Boolean)
    // forgotPassword(
    //     @Arg('email') email: string,
    //     @Ctx() {em} : MyContext
    // ) {
    //     // const user = await em.findOne()
    //     return true
    // }

    @Query(()=>User, {nullable: true})
    async me(
        @Ctx() {req, em}: MyContext
    ) {
        if (!req.session.userId)
            return null;
        const user = await em.findOne(User, {id: req.session.userId});
        return user;
    }

    @Mutation(()=>UserResponse)
     async register(
         @Arg('options') options:UsernamePasswordInput,
         @Ctx() {em, req} :MyContext //get some types formt the your own context
     ): Promise<UserResponse>{
        if (options.username.length <= 2){
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2"
                }]
            }
        }
        if (options.password.length <= 2){
            return {
                errors: [{
                    field: "password",
                    message: "length must be greater than 2"
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password)
         
        let user;
        try{
            const result = await (em as EntityManager)
            .createQueryBuilder(User)
            .getKnexQuery()
            .insert({
                username: options.username,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            }).returning("*");
            user = result[0];
        } catch (err) {
            if(err.code == 23505){ //|| err.detail.inlcudes("already exists")){
                return {
                    errors: [{
                        field: "username",
                        message: "username already taken"
                    }]
                }
            }
            console.log("message", err.message)
        }
        console.log(user)
        req.session.userId = user.id;
        return {user};
    }

    @Mutation(()=>UserResponse)
     async login(
         @Arg('options') options:UsernamePasswordInput,
         @Ctx() {em, req} :MyContext
     ): Promise<UserResponse>{
         const user = await em.findOne(User, {username: options.username})
         if(!user){
             return {
                 errors: [
                    {
                        field: 'username',
                        message: 'username does not exist'
                    }
                ]
             }
         }
         const valid = await argon2.verify( user.password, options.password)
         if(!valid){
            return {
                errors: [
                   {
                       field: 'username',
                       message: 'incorrect password'
                   }
               ]
            }
        }
        // console.log("this is working: my request");
        req.session.userId = user.id; //able to store whatever you want in the session and access it later
        console.log("=== REQUEST SESSION ===");
        // console.log(req);
        return {user};
    }

    @Mutation(()=> Boolean)
    logout(@Ctx() {req, res}: MyContext){
        return new Promise ((resolve) =>
         req.session.destroy((err)=> {
            res.clearCookie(COOKIE_NAME)  
            if (err) {
                console.log(err);
                resolve(false)
                return;
            }
            resolve (true)
        })
        )
    }
}




