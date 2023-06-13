
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
class SuccessMessage{
    @Field()
    field: string;

    @Field()
    message: string;
}


@ObjectType()
class SubredditResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => [SuccessMessage], {nullable:true})
    success?: SuccessMessage[]
}



@Resolver(Subreddit)
export class SubredditResolver {

    @Query(()=>Subreddit, {nullable: true})
    subreddit(
        @Arg("id", ()=> Int) id:number
    ):Promise<Subreddit | null> {
        return Subreddit.findOne({where: {id:id}})
    }

    @Mutation(()=> Boolean)
    @UseMiddleware(isAuth)
    async createSubreddit(
        @Arg("name") name: string,
        @Arg("rules") rules: string,
        @Ctx() {req}: MyContext
    ): Promise<SubredditResponse | boolean> {
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

        const subreddit_old = await Subreddit.findOne({where:{name:name}})
        const userId = req.session.userId
        console.log("userid is ", userId)

        // the subreddit cant already exist
        if (subreddit_old) {
            return {errors: [
                {
                    field: "name",
                    message: "name already taken"
                }
            ]}
        }

        // the user that created the subreddit will default to being a mod


        

        let newSub;

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
            // console.log("new sub data", newSub?.raw)

        } catch(err) {
                console.log(err)
    
                return {
                    errors: [{
                        field: "NA",
                        message: "Something went wrong"
                    }]
                }
        }


       return true
        
    }



}