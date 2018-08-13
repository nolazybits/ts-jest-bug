import {sprintf} from "sprintf-js";

export class SCEDiModuleDoesNotExists extends Error
{
    public static MESSAGE: string = "The DI module %s hasn't been specified";

    public constructor(diModuleName: string)
    {
        super(sprintf(SCEDiModuleDoesNotExists.MESSAGE, diModuleName));
    }

}