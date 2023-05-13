import { MyContext } from "src/types";
import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { dataSource } from "../index";

@InputType()
class PostInput {
    @Field()
    title:string
    @Field()
    text: string
}

@ObjectType()
class PaginatedPosts{
    @Field(()=>[Post])
    posts: Post[]
    @Field()
    hasMore:boolean
}



@Resolver(Post) // need to specify what you are resolving. In the case its the 'Post' object type
export class PostResolver {

    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post){ 
        return root.text.slice(0, 50)
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote (
        @Arg('postId', ()=>Int) postId: number,
        @Arg("value", ()=>Int) value: number,
        @Ctx() {req}: MyContext
    ) {
        const isUpvote = value !== -1
        const realValue = isUpvote ? 1 : -1
        const {userId} = req.session
        //  await Upvote.insert({
        //     userId,
        //     postId,
        //     value: realValue
        //  })
          
        await dataSource.query(`
        START TRANSACTION;
        
        insert into upvote ("userId", "postId", value)
        values (${userId}, ${postId}, ${realValue});

        update post set points = points +${realValue}
        where id = ${postId};
        
        COMMIT;
        `)
        return true
    }


    @Query(()=>PaginatedPosts)
    async posts( 
        @Arg('limit', ()=>Int) limit:number,
        @Arg('cursor', ()=> String, {nullable: true}) cursor: string | null //curser based pagination 
        //  how many do we want after a certain position 
        
    ): Promise<PaginatedPosts>{
        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = realLimit +1

        const replacements: any[] = [realLimitPlusOne];

        if (cursor){
            replacements.push(new Date (parseInt(cursor)))
        }
        //can change shape of object returned by using json_build_object
        const posts = await dataSource.query(`
        select p.*,  
        json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email
            ) creator 
        from post p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ?  `where p."createdAt" < $2` : ""}
        order by p."createdAt" DESC
        limit $1
        `,
            replacements)

        // const qb =  dataSource
        //     .getRepository(Post)
        //     .createQueryBuilder("p")
        //     .innerJoinAndSelect(
        //         "p.creator",
        //         "u", //alias u for user
        //          'u.id = p."creatorId"'  

        //     )
        //     .orderBy('p."createdAt"', "DESC")
        //     .take(realLimitPlusOne)

        // if (cursor){
        //     qb.where('p."createdAt" < :cursor', 
        //         { cursor: new Date(parseInt(cursor)) 
        //     })
        // }
        
        // const posts = await qb.getMany()
        return {
            posts:  posts.slice(0, realLimit), 
            hasMore: posts.length === realLimitPlusOne
        }
        
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


