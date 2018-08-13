import {Express} from "express";
import http from "http";
import {Container} from "inversify";
import {IModule} from "./IModule";
import {InternalModule} from "./InternalModule";

export abstract class ISauceCore extends IModule
{
    public abstract isReady: Promise<ISauceCore>;

    /**
     * Get the server instance created by SauceCore
     */
    public abstract createServer(serverPort?: string): Promise<http.Server>;

    /**
     * De register a module against Sauce
     * @param {typeof IModule} moduleClass
     * @returns {Promise<void>}
     */
    public async abstract deregister(moduleClass: typeof InternalModule): Promise<void>;

    /**
     * Get the Sauce DI container
     */
    public abstract getAppContainer(): Container;

    /**
     * Get the express instance created by SauceCore
     */
    public abstract getExpress(): Express;

    /**
     * get the registered module instance
     * @param moduleClass
     */
    public abstract getRegisteredModule(moduleClass: typeof InternalModule): IModule|undefined;

    /**
     * Get the server instance created by SauceCore
     */
    public abstract getServer(): http.Server;

    /**
     * check if the module has been registered
     * @param moduleClass
     */
    public abstract hasRegisteredModule(moduleClass: typeof InternalModule): boolean;

    /**
     * Register a module against Sauce
     * @param {typeof IModule} moduleClass
     * @returns {Promise<void>}
     */
    public async abstract register(moduleClass: typeof InternalModule): Promise<void>;
}