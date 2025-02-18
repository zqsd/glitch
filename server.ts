import simple from "./examples/simple.html";

const server = Bun.serve({
    static: {
        "/": simple,
    },
    async fetch(req) {
        return new Response("Hello, world!");
    },
    development: process.env.NODE_ENV !== 'production',
});
console.log(`Listening on ${server.url}`);