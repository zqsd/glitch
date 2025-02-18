import { plugin, type BunPlugin } from "bun";

const myPlugin: BunPlugin = {
    name: "GLSL",
    async setup(build) {
        build.onLoad({ filter: /\.(frag|vert)$/ }, async (args) => {
            const text = await Bun.file(args.path).text();
            return {
                contents: text,
                loader: "text",
            };
        });
    },
};

//plugin(myPlugin);

export default myPlugin;