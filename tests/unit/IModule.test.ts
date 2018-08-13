// leave this comment here
/* tslint:disable:no-import-side-effect */
import {sprintf} from "sprintf-js";
import {SCEDiModuleDoesNotExists} from "../../src/errors/SCEDiModuleDoesNotExists";
import {ModuleNoDI} from "../mocks/ModuleNoDI.mock";

describe("IModule", async () =>
{

    describe(".GetContainerModule", async () =>
    {

        it("fails if no DI MockModule has been specified", async () =>
        {
            expect.assertions(2);
            await expect(ModuleNoDI.GetContainerModule()).rejects.toThrow(SCEDiModuleDoesNotExists);
            await expect(ModuleNoDI.GetContainerModule()).rejects.toThrow(sprintf(SCEDiModuleDoesNotExists.MESSAGE, "ModuleNoDI"));
        });

    });
});