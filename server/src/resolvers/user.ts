import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASWORD_PREFIX } from "../constant";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import {v4} from 'uuid';
import {dataSource} from "../datasource"

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


@Resolver(User)
export class UserResolver {
    
    @FieldResolver(()=>String) 
    email(@Root() user: User, @Ctx() {req}: MyContext){
        //this is the current user and its ok to show them their own email
        if (req.session.userId === user.id){
            return user.email
        }
        //current user wants to see someon elses email
        return ""
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2){
            return { errors: [
                {
                    field: "newPassword",
                    message: "length must be greater than 2"
                }
            ]}
            }
            const key = FORGET_PASWORD_PREFIX+token
            const userId = await redis.get(key)
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "Token Expired"
                        }
                    ]
                }
            }
            const userIdNUM = parseInt(userId)
            const user = await User.findOne( {where: { id: userIdNUM} });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "user no longer exists",

                        }
                    ]
                }
            }
            user.password = await argon2.hash(newPassword)
            await User.update({id:userIdNUM}, {password: await argon2.hash(newPassword)})
            await redis.del(key)

            // log user in after changin passwordd
            req.session.userId = user.id

            return { user }
    }

    @Mutation(() => Boolean)
    
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis} : MyContext
    ) {
        const user = await User.findOne({where:  {email}})
        if (!user) {
            return true
        }
        const token = v4();
       await redis.set(
            FORGET_PASWORD_PREFIX + token, // good to put prefixes before hand 
            user.id, 
            'EX',
             1000*60*60*24*3)
        await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}"> reset password</a>`);
        return true
    }

    @Query(()=>User, {nullable: true})
     me(
        @Ctx() {req,}: MyContext
    ) {
        if (!req.session.userId)
            return null;
        return User.findOne({where: {id: req.session.userId}} );
    }

    @Mutation(()=>UserResponse)
     async register(
         @Arg('options') options:UsernamePasswordInput,
         @Ctx() { req} :MyContext //get some types formt the your own context
     ): Promise<UserResponse>{
        const errors = validateRegister(options)
        if (errors){
            return {errors}
        }

        const hashedPassword = await argon2.hash(options.password)
         
        let user;
        try{
            //could also do User.create({...stuff...}).save() instead
           const result =   await dataSource.createQueryBuilder().insert().into(User).values([
                {
                    username: options.username,
                    email: options.email,
                    password: hashedPassword
                }
            ]).returning("*").execute();
            user =  result.raw[0];
        } catch (err) {
            if(err.code == 23505){ //|| err.detail.inlcudes("already exists")){
                return {
                    errors: [{
                        field: "username",
                        message: "username already taken"
                    }]
                }
            }

        }
    
        req.session.userId = user.id;
        return {user};
    }

    @Mutation(()=>UserResponse)
     async login(
         @Arg('usernameOrEmail') usernameOrEmail:string,
         @Arg('password') password:string,
         @Ctx() {req} :MyContext
     ): Promise<UserResponse>{ 
         const user = await User.findOne(usernameOrEmail.includes('@') 
         ? {where: {email: usernameOrEmail}}
         : {where: {username: usernameOrEmail}})
         if(!user){
             return {
                 errors: [
                    {
                        field: 'usernameOrEmail',
                        message: 'username does not exist'
                    }
                ]
             }
         }
         const valid = await argon2.verify( user.password, password)
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
        return {user};
    }

    @Mutation(()=> Boolean)
    logout(@Ctx() {req, res}: MyContext){
        return new Promise ((resolve) =>
         req.session.destroy((err)=> {
            res.clearCookie(COOKIE_NAME)  
            if (err) {
                resolve(false)
                return;
            }
            resolve (true)
        })
        )
    }
}




