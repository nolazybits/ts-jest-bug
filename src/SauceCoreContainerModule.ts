import {AsyncContainerModule, interfaces} from "inversify";

export class SauceCoreContainerModule extends AsyncContainerModule
{
    public constructor()
    {
        const bindings: interfaces.AsyncContainerModuleCallBack = async (
            bind: interfaces.Bind,
            unbind: interfaces.Unbind,
            isBound: interfaces.IsBound,
            rebind: interfaces.Rebind): Promise<void> =>
        {
            return Promise.resolve();
        };

        super(bindings);
    }
}