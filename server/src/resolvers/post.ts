import { MyContext } from "src/types";
import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from "type-graphql";

@InputType()
class PostInput {
    @Field()
    title:string
    @Field()
    text: string
}


@Resolver()
export class PostResolver {

    @Query(()=>[Post])
    posts(): Promise<Post[]>{
        return Post.find(); //finder returns a promise of Post
    }

    @Query(() => Post, {nullable: true})
    post(@Arg("id") id: number): Promise<Post | null>{
        return Post.findOne({where: {id:id}})
    }

    @Mutation(()=> Post) // in graphql you have to specify mutation when making a query
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() {req}: MyContext
    ): Promise<Post>{
        console.log("session id: ", req.session)
        if(!req.session.userId){
            throw new Error("Not Authenticated")
        }
        return Post.create({
            ...input,
            creatorId: req.session.userId

        }).save();
    }

    @Mutation(()=> Post) // in graphql you have to specify mutation when making a query
    async updatePost(
        @Arg("id") id:number,
        @Arg("title", ()=>String, {nullable: true}) title: string, // if you had multiple fields on your post and some are optional to update, you can make them nullable but you have to explicity set the type
    ): Promise<Post| null>{
        const post = await Post.findOne({where: {id}});
        if (!post){
            return null;
        }
       if( typeof title !== 'undefined'){
        await Post.update({id}, {title})
   
       }
        return post;
    }

    @Mutation(()=> Boolean) // returning whether it worked or not
    async deletePost(
        @Arg("id") id:number
    ): Promise<boolean>{
        await Post.delete(id);
        return true;
    }
}


