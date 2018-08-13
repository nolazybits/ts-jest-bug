import {AsyncContainerModule, injectable, interfaces} from "inversify";
import {IModule} from "../../src";
import {IMockModule} from "./IMockModule";

@injectable()
export class MockModule
    extends IModule
    implements IModule
{
    public static async GetContainerModule(): Promise<AsyncContainerModule>
    {
        return new AsyncContainerModule(
            async (
                bind: interfaces.Bind,
                unbind: interfaces.Unbind,
                isBound: interfaces.IsBound,
                rebind: interfaces.Rebind): Promise<void> =>
            {
                //  bind the module to its interface
                bind(IMockModule).to(MockModule);

                return Promise.resolve();
            }
        );
    }

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