import {ISauceCore, SauceCore} from "../src";

new SauceCore().isReady.then(async (sauce: ISauceCore) =>
{
    await sauce.start();
});
