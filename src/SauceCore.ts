import express, {Express, Request, Response} from "express";
import * as http from "http";
import {AsyncContainerModule, Container} from "inversify";
import {SCEModuleDoesNotExists} from "./errors/SCEModuleDoesNotExists";
import {IModule} from "./IModule";
import {InternalModule} from "./InternalModule";
import {ISauceCore} from "./ISauceCore";
import {SauceCoreContainerModule} from "./SauceCoreContainerModule";

export class SauceCore
    extends ISauceCore
    implements ISauceCore
{
    public static HEALTH_PATH: string = "/health";
    protected static _CONTAINER_MODULE: AsyncContainerModule;

    public isReady: Promise<ISauceCore>;

    private readonly _containerDI: Container;
    private readonly _express: Express;
    private readonly _modulesOrder: typeof InternalModule[];
    private _server!: http.Server;

    public constructor()
    {
        super();

        this._modulesOrder = [];

        //  setup inversify
        this._containerDI = new Container();

        //  setup express
        this._express = express();

        this.isReady = new Promise(async (resolve: Function): Promise<void> =>
        {
            await this._init();
            resolve(this);
        });
    }

    public static async GetContainerModule(): Promise<AsyncContainerModule>
    {
        if (!SauceCore._CONTAINER_MODULE)
        {
            SauceCore._CONTAINER_MODULE = new SauceCoreContainerModule();
        }
        return SauceCore._CONTAINER_MODULE;
    }

    public async createServer(serverPort?: string): Promise<http.Server>
    {
        const port: number = parseInt(process.env.APPLICATION_PORT || serverPort || "3000", 10);
        this._server = this._express.listen(port, () =>
        {
            /* tslint:disable-next-line:no-console */
            console.log(`Application listening on port ${port}...`);
            // this._logger.info("Application listening on port " + port + "...");
        });

        return Promise.resolve(this._server);
    }

    public async shutdownServer(): Promise<void>
    {
        if (this._server)
        {
            //  wrap the call back into a promise we're sending back
            return new Promise<void>((resolve: Function): void =>
            {
                this._server.close(resolve);
            });
        }
    }

    public async deregister(moduleClass: typeof InternalModule): Promise<void>
    {
        //  get our module instance
        const instance: IModule|undefined = this.getRegisteredModule(moduleClass);

        /* istanbul ignore else: return early */
        if (!instance)
        {
            throw new SCEModuleDoesNotExists(moduleClass.name);
        }

        //  stop the module
        await instance.stop();
        //  teardown the module
        await instance.teardown();
        //  remove it from our order array
        const index: number = this._modulesOrder.indexOf(moduleClass, 0);
        //  remove it from our registry
        this._modulesOrder.splice(index, 1);
        //  remove the modules bindings from the DI
        this._containerDI.unload(await moduleClass.GetContainerModule());
        //  remove the module class from DI
        this._containerDI.unbind(moduleClass);
    }

    public getAppContainer(): Container
    {
        return this._containerDI;
    }

    public getExpress(): Express
    {
        return this._express;
    }

    public getRegisteredModule(moduleClass: typeof InternalModule): IModule | undefined
    {
        if (this.hasRegisteredModule(moduleClass))
        {
            return this._containerDI.get(moduleClass);
        }
        return undefined;
    }

    public getServer(): http.Server
    {
        return this._server;
    }

    public hasRegisteredModule(moduleClass: typeof InternalModule): boolean
    {
        return this._modulesOrder.indexOf(moduleClass) !== -1;
    }

    public async register(moduleClass: typeof InternalModule): Promise<void>
    {
        /* istanbul ignore else: return early */
        if (this._modulesOrder.indexOf(moduleClass) !== -1)
        {
            throw new Error(`The module ${moduleClass.name} has already been registered`);
        }

        //  bind the module class to self
        this._containerDI.bind(moduleClass).toSelf();
        //  add the modules bindings from the DI
        await this._containerDI.loadAsync(await moduleClass.GetContainerModule());
        //  add it to the register order array
        this._modulesOrder.push(moduleClass);
    }

    public async setup(): Promise<void>
    {
        await this.createServer();
        //  set up the healthcheck endpoint
        this._setupHealthCheck();
    }

    /**
     * Starts all the modules in order of insertion
     */
    public async start(): Promise<void>
    {
        const moduleLength: number = this._modulesOrder.length;
        for (let i: number = 0; i < moduleLength; i++)
        {
            const mod: typeof IModule = this._modulesOrder[i];
            const sauceModule: IModule = this._containerDI.get(mod);
            // if the module hasn't been found throw an error
            /* istanbul ignore if: this should never really happen */
            if (!sauceModule)
            {
                throw new SCEModuleDoesNotExists(mod.name);
            }
            //  add the instance to our module registered to the sauce core
            await sauceModule.setup();
            //  skip this very module to avoid recursion
            /* istanbul ignore else */
            if (mod.name !== SauceCore.name)
            {
                await sauceModule.start();
            }
        }
    }

    public async stop(): Promise<void>
    {
        const moduleLength: number = this._modulesOrder.length;
        for (let i: number = moduleLength - 1; i >= 0; i--)
        {
            const mod: typeof InternalModule = this._modulesOrder[i];
            //  skip this very module to avoid recursion
            /* istanbul ignore else */
            if (mod.name === SauceCore.name)
            {
                continue;
            }
            const sauceModule: IModule|undefined = this.getRegisteredModule(mod);
            // if the module hasn't been found throw an error
            /* istanbul ignore if: this should never really happen */
            if (!sauceModule)
            {
                throw new SCEModuleDoesNotExists(mod.name);
            }
            await sauceModule.stop();
        }
    }

    public async teardown(): Promise<void>
    {
        await this.shutdownServer();
    }

    private async _init(): Promise<void>
    {
        //  bind ISauceCore to this instance
        this._containerDI.bind(ISauceCore).toConstantValue(this);
        //  bind SauceCore to this instance
        this._containerDI.bind(SauceCore).toConstantValue(this);
        //  load the bindings
        await this._containerDI.loadAsync(await SauceCore.GetContainerModule());
        this._modulesOrder.push(SauceCore);
    }

    private _setupHealthCheck(): void
    {
        this._express.get(SauceCore.HEALTH_PATH, (request: Request, response: Response) =>
        {
            response.statusCode = 200;
            response.send();
        });
    }
}