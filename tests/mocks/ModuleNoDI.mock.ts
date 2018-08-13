import {IModule} from "../../src";

export class ModuleNoDI
    extends IModule
    implements IModule
{
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