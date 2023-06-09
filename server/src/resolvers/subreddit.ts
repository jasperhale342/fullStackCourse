import { dataSource } from "src/datasource";
import { Subreddit } from "src/entities/Subreddit";
import { isAuth } from "src/middleware/isAuth";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";


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

    @Mutation(()=> SubredditResponse)
    @UseMiddleware(isAuth)
    async createSubreddit(
        @Arg("name") name: string,
        @Arg("rules") rules: string,
        @Ctx() {req}: MyContext
    ): Promise<Subreddit | SubredditResponse | null> {
        if (name.length < 1 ){
            return {errors: [
                {
                    field: "name",
                    message: "name must be at least two characters long"
                }
            ]}
        }

        const subreddit = await Subreddit.findOne({where:{name:name}})
        const userId = req.session.userId

        // the subreddit cant already exist
        if (subreddit) {
            return {errors: [
                {
                    field: "name",
                    message: "name already taken"
                }
            ]}
        }

        // the user that created the subreddit will default to being a mod


        const newSub = await dataSource.createQueryBuilder()
        .insert()
        .into(Subreddit)
        .values([{
            name: name,
            rules: rules
        }]).returning("*")
        .execute()

        await dataSource.transaction(async tm => {
            await tm.query(`
            insert into User_Subreddit ("isModerator", "userId", "subredditId")
            values ($1, $2, $3)
            `, [true, userId, newSub])
        })

        return newSub.raw[0]
        
    }



}