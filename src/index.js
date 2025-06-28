export default {
  async fetch(request, env) {
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      prompt: "What is the origin of the phrase Hello, World",
    });

    return new Response(JSON.stringify(response));
  },
};