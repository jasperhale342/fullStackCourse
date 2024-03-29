import { MyContext } from "src/types";
import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { dataSource } from "../datasource";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";


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
        @Root() post: Post){ 
        return post.text.slice(0, 50)
    }

    @FieldResolver(() => User)
    creator(@Root() post: Post,
    @Ctx() {userLoader}: MyContext){ 
       return userLoader.load(post.creatorId)
    }

    // @FieldResolver(()=> Int, {nullable:true})
    // async voteStatus(
    //     @Root() post: Post,
    //     @Ctx() {upvoteLoader, req}: MyContext){
    //        if (!req.session.userId) {
    //         return null
    //        }
    //     const key = {
    //         postId: post.id,
    //         userId: req.session.userId
    //     } 
    //     const upvote  = await upvoteLoader.load(key)

    //     console.log("upvote data: ", upvote)
    //     return null
    //     // const upvote  = await upvoteLoader.loadMany(key)
    //     // console.log("after")
    //     // return upvote ? upvote.value : null
    // }

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
        const upvote = await Upvote.findOne({where: {postId, userId}})
        //user has voted onm the post before and they are changing they're vote
        if (upvote && upvote.value !== realValue){ 
            await dataSource.transaction(async (tm) => {
                await tm.query(`
                update upvote set value = $1 where "postId" = $2 and "userId" = $3 
                `, [realValue, postId, userId])

                await tm.query(`
                update post set points = points + $1 
                where id = $2
                `, [2 * realValue, postId])
            })

        } else if (!upvote) {
            // has never voted before
            await dataSource.transaction(async tm =>{
                await tm.query (` 
                insert into upvote ("userId", "postId", value)
                values ($1, $2, $3)`, [userId, postId, realValue]);

                await tm.query(`
                update post set points = points + $1
                where id = $2`, [realValue, postId])
            });
            
        }
          
        
        return true
    }


    @Query(()=>PaginatedPosts)
    async posts( 
        @Arg('limit', ()=>Int) limit:number,
        @Arg('cursor', ()=> String, {nullable: true}) cursor: string | null, //curser based pagination 
        //  how many do we want after a certain position 
        @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts>{
        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = realLimit +1

        

        const replacements: any[] = [realLimitPlusOne];
        if (req.session.userId){
            replacements.push(req.session.userId)
        }
    
        let cursorIdx = 3
        if (cursor){
            replacements.push(new Date (parseInt(cursor)))
            cursorIdx = replacements.length

        }
        //can change shape of object returned by using json_build_object
        const posts = await dataSource.query(`
        select p.*,  
        
        ${
            req.session.userId
            ? '(select value from upvote where "userId" = $2 and "postId" = p.id) "voteStatus"'
            : 'null as "voteStatus"'
        }
       
        from post p
        ${cursor ?  `where p."createdAt" < $${cursorIdx}` : ""}
        order by p."createdAt" DESC
        limit $1
        `, replacements)

        // ${ 
        //     req.session.userId 
        //     ? '(select value from upvote where "userId" = $2 and "postId" = p.id) "voteStatus"' 
        //     : 'null as "voteStatus"'
        // }

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
    post(
        @Arg("id", ()=>Int) id: number): Promise<Post | null>{
        return Post.findOne({where: {id:id}, relations: ["creator"]}, )
    }

    @Mutation(()=> Post) // in graphql you have to specify mutation when making a query
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() {req}: MyContext
    ): Promise<Post>{
        return Post.create({
            ...input,
            creatorId: req.session.userId

        }).save();
    }

    @Mutation(()=> Post, {nullable: true}) // in graphql you have to specify mutation when making a query
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", ()=> Int) id:number,
        @Arg("title") title: string, // if you had multiple fields on your post and some are optional to update, you can make them nullable but you have to explicity set the type
        @Arg("text") text: string,
        @Ctx() {req}: MyContext
    ): Promise<Post| null>{
        const result =  await dataSource.createQueryBuilder()
    .update(Post)
    .set({title, text})
    .where('id = :id and "creatorId" = :creatorId', {id, creatorId: req.session.userId})
    .returning("*")
    .execute()
        
     return result.raw[0]
       
    }

    @Mutation(()=> Boolean) // returning whether it worked or not
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", ()=> Int) id:number,
        @Ctx() {req}: MyContext
    ): Promise<boolean>{
        await Post.delete({id, creatorId: req.session.userId});
        return true;
    }
}


