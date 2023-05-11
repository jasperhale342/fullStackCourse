import { MyContext } from "src/types";
import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { dataSource } from "../index";

@InputType()
class PostInput {
    @Field()
    title:string
    @Field()
    text: string
}


@Resolver(Post) // need to specify what you are resolving. In the case its the 'Post' object type
export class PostResolver {

    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post){ 
        return root.text.slice(0, 50)
    }

    @Query(()=>[Post])
    async posts( 
        @Arg('limit', ()=>Int) limit:number,
        @Arg('cursor', ()=> String, {nullable: true}) cursor: string | null //curser based pagination 
        //  how many do we want after a certain position 
    ): Promise<Post[]>{
        const realLimit = Math.min(50, limit)
        const posts =  dataSource
            .getRepository(Post)
            .createQueryBuilder("p")
            .orderBy('"createdAt"', "DESC")
            .take(realLimit)

        if (cursor){
            posts.where('"createdAt" < :cursor', 
                { cursor: new Date(parseInt(cursor)) 
            })
        }
        return posts.getMany()
        
    }

    @Query(() => Post, {nullable: true})
    post(@Arg("id") id: number): Promise<Post | null>{
        return Post.findOne({where: {id:id}})
    }

    @Mutation(()=> Post) // in graphql you have to specify mutation when making a query
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() {req}: MyContext
    ): Promise<Post>{
        console.log("session id: ", req.session)
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


