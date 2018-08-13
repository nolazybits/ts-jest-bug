/**
 * Interface all Sauce module should extend
 */
import {AsyncContainerModule, injectable} from "inversify";
import {SCEDiModuleDoesNotExists} from "./errors/SCEDiModuleDoesNotExists";

@injectable()
export abstract class IModule
{
    /**
     * this methods MUST be overwritten (and will be if you used the template to generate the module)
     * @constructor
     */
    public static async GetContainerModule(): Promise<AsyncContainerModule>
    {
        throw new SCEDiModuleDoesNotExists(this.name);
    }

    /**
     * By default called once after the module has been registered against Sauce
     * @returns {Promise<void>}
     */
    public abstract async setup(): Promise<void>;

    /**
     * starting the module
     * @returns {Promise<void>}
     */
    public abstract async start(): Promise<void>;

    /**
     * stopping the module
     * @returns {Promise<void>}
     */
    public abstract async stop(): Promise<void>;

    /**
     * teardown (cleanup). By default called before the module is de-registered from Sauce
     * @returns {Promise<void>}
     */
    public abstract async teardown(): Promise<void>;
}