/**
 * This type exists just to be able to do type checking with typeof in the SauceCore methods.
 */
/* istanbul ignore file : we do not need to test this class */
import {IModule} from "./IModule";

export class InternalModule
    extends IModule
    implements IModule
{
    /* tslint:disable */
    // @ts-ignore
    public constructor (...rest) {}
    /* tslint:enable */

    public async setup(): Promise<void>
    {
        return undefined;
    }

    public async start(): Promise<void>
    {
        return undefined;
    }

    public async stop(): Promise<void>
    {
        return undefined;
    }

    public async teardown(): Promise<void>
    {
        return undefined;
    }
}
