import { Context, Schema } from "koishi";
import awaitTo from "await-to-js";
import type {} from "@koishijs/plugin-server";

export const name = "api-send";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export const inject = {
  required: ["server"],
};

interface RequestBody {
  sid: string;
  to: string;
  message: string;
}

export function apply(ctx: Context) {
  ctx.server.post("/send", async (koa) => {
    const data: RequestBody | undefined = koa.request.body;
    const { sid, to, message } = data ?? {};
    if (!sid || !to) {
      koa.status = 400;
      koa.body = {
        success: false,
        message: "sid或to参数缺失",
      };
      return;
    }

    const bot = ctx.bots.find((bot) => bot.sid === sid);
    if (!bot) {
      koa.status = 400;
      koa.body = {
        success: false,
        message: `没有找到bot：${sid}`,
      };
      return;
    }

    const [err, res] = await awaitTo(bot.sendMessage(to, message));
    if (err) {
      koa.status = 400;
      koa.body = {
        success: false,
        message: err.message || "发送失败",
      };
      return;
    }

    koa.body = {
      success: true,
      message: "发送成功",
      result: res,
    };
  });
}
