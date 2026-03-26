import { BotContext } from "../config";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import { DB } from "../config";
import { GrammyError } from "grammy";

export async function acceptPrivacyToS(ctx: BotContext, db: DB) {
    try {
        if(!ctx.auth?.user?.id) {
            await ctx.answerCallbackQuery()
            await ctx.editMessageText("You are not logged in")
            return
        }

        if(ctx.auth.user.privacyToS){
            await ctx.answerCallbackQuery()
            await ctx.editMessageText("You have already accepted the Privacy Policy and Terms of Service")
            return
        }
        
        await ctx.answerCallbackQuery()
        await ctx.editMessageText("Thank You 🙂")
        await db.update(users).set({
            privacyToS: true,
        }).where(eq(users.id, ctx.auth.user.id));
    } catch (error) {
        if(error instanceof Error) {
            if(!(error instanceof GrammyError)) {
                await ctx.answerCallbackQuery()
                await ctx.editMessageText("Something went wrong. Please try again later")
            }
        }
        console.error("Error in acceptPrivacyToS", error)
    }
}

export async function cancelPrivacyToS(ctx: BotContext, db: DB) {
    try {
        await ctx.answerCallbackQuery()
        await ctx.deleteMessage()
    } catch (error) {
        console.error("Error in cancelPrivacyToS: ", error)
    }
}