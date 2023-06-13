
import { dataSource } from "../datasource";
import { Subreddit } from "../entities/Subreddit";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";


@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}



@ObjectType()
class SubredditResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => Subreddit, {nullable:true})
    subreddit?: Subreddit
}



@Resolver(Subreddit)
export class SubredditResolver {

    // create Subreddit
    @Mutation(()=> SubredditResponse)
    @UseMiddleware(isAuth)
    async createSubreddit(
        @Arg("name") name: string,
        @Arg("rules") rules: string,
        @Ctx() {req}: MyContext
        // should return a subreddit response but getting type issue come back later
    ): Promise<SubredditResponse> { 
        console.log("length of name is ", name.length)
        if (name.length <= 2 ){
            return {
                errors: [
                    {
                        field: "name",
                        message: "name must be at least two characters long"
                    }
            ]
            }
        }

        const subredditOld = await Subreddit.findOne({where:{name:name}})
        const userId = req.session.userId

        // the subreddit cant already exist
        if (subredditOld) {
            return {errors: [
                {
                    field: "name",
                    message: "Subreddit name already exists. Please choose another"
                }
            ]}
        }

        // the user that created the subreddit will default to being a mod
        try {
            await dataSource.transaction(async tm => {
                await tm.query(`
                insert into subreddit ("name", "rules")
                values ($1, $2)
                `, [name, rules])
                
                await tm.query(`
                insert into User_Subreddit ("userId", "subredditId")
                values (${userId}, (select id from subreddit where name = '${name}')) 
                `)
            })

        } catch(err) {  
                return {
                    errors: [{
                        field: "",
                        message: "Could not create Subreddit"
                    }]
                }
        }

        const  subreddit = await Subreddit.findOne({where: {name:name}}) || undefined
        return {subreddit}
        
    }

    // retrieve Subreddit
    @Query(()=>Subreddit, {nullable: true})
    subreddit(
        @Arg("id", ()=> Int) id:number
    ):Promise<Subreddit | null> {
        return Subreddit.findOne({where: {id:id}})
    }

    // update Subreddit
    @Mutation(()=>Boolean)
    @UseMiddleware(isAuth)
    async deleteSubreddit (
        @Arg("name") name:string
    ): Promise<boolean | SubredditResponse> {
        try {
            await Subreddit.delete({name:name})
        } catch (err) {
            return {errors: [{
                field: "name",
                message: "Could not delete subreddit"
            }]}
        }
        
        return true
    }


    // delete Subreddit



}