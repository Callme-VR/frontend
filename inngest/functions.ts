import { inngest } from "@/inngest/client";

export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    triggers: [{ event: "app/hello.world" }],
  },
  async ({ event, step }) => {
    const message = await step.run("build-message", async () => {
      return `Hello, ${event.data.name ?? "World"}! 👋`;
    });

    await step.sleep("wait-a-moment", "1s");

    await step.run("log-message", async () => {
      console.log("[Inngest]", message);
      return { logged: true };
    });

    return { message };
  },
);
