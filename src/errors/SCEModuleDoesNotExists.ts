import {sprintf} from "sprintf-js";

export class SCEModuleDoesNotExists extends Error
{
    public static MESSAGE: string = "The module %s was never registered or has already been deregistered";

    public constructor(moduleName: string)
    {
        super(sprintf(SCEModuleDoesNotExists.MESSAGE, moduleName));
    }

}