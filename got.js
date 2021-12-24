module.exports = (() => {
    const got = require("got");

    class Got {
        static async init() {
            const data = await knex("Got").select();

            Got.data = [];

            for (const inst of data) {
                const type = inst.Type;

                let options = {};
                if (type === "Function") {
                    options = eval(inst.Value)();
                } else if (type === "JSON") {
                    options = JSON.parse(inst.Value);
                }
                const instance = got.extend(options);
                instance["Name"] = inst.Name;
                Got.data.push(instance);
            }

            return this;
        }

        static get (identifier) {
            if (identifier instanceof Got) {
                return identifier;
            } else if (typeof identifier === "string") {
                return Got.data.find(i => i.Name === identifier);
            } else {
                throw new bot.Error({
                    message: "Invalid identifier provided!"
                });
            }
        }

        static specificName = "Got";
    }

    return new Proxy(Got, {
        get: (target, prop) => {
            return (typeof target[prop] !== "undefined")
                ? target[prop]
                : got[prop];
        },
        apply: (target, that, args) => {
            if (typeof args[0] === "string") {
                const inst = Got.get(args[0]);
                if (inst) {
                    return inst(...args.slice(1));
                }
            }

            return got(...args);
        }
    });
})();
