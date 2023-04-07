import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";


@Resolver()
export class PostResolver {

    @Query(()=>[Post])
    posts(@Ctx() {em}: MyContext): Promise<Post[]>{
        return em.find(Post, {}); //finder returns a promise of Post
    }

    @Query(() => Post, {nullable: true})
    post(
        @Arg("id", () =>Int) id: number, //id is what you have to pass in 
        @Ctx() {em}: MyContext
    ): Promise<Post | null>{
        return em.findOne(Post, {id});
    }

    @Mutation(()=> Post) // in graphql you have to specify mutation when making a query
    async createPost(
        @Arg("title") title:string,
        @Ctx() { em }: MyContext
    ): Promise<Post>{
        const post = em.create(Post, {title});
        await em.persistAndFlush(post)
        return post;
    }

    @Mutation(()=> Post) // in graphql you have to specify mutation when making a query
    async updatePost(
        @Arg("id") id:number,
        @Arg("title", ()=>String, {nullable: true}) title: string, // if you had multiple fields on your post and some are optional to update, you can make them nullable but you have to explicity set the type
        @Ctx() { em }: MyContext
    ): Promise<Post| null>{
        const post = await em.findOne(Post, {id});
        if (!post){
            return null;
        }
       if( typeof title !== 'undefined'){
        post.title =title;
        await em.persistAndFlush(post);
       }
        

        return post;
    }

    @Mutation(()=> Boolean) // returning whether it worked or not
    async deletePost(
        @Arg("id") id:number,
        @Ctx() { em }: MyContext
    ): Promise<boolean>{
        await em.nativeDelete(Post, {id});
        return true;
    }
}


