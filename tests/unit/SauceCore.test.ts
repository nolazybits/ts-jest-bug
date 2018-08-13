// leave this comment here
/* tslint:disable:no-import-side-effect */
import SpyInstance = jest.SpyInstance;
import {Express} from "express";
import http from "http";
import {Container} from "inversify";
import "jest-extended";
import request, {Response} from "supertest";
import {ISauceCore, SauceCore} from "../../src";
import {MockModule} from "../mocks/MockModule.mock";

describe("SauceCore", async () =>
{
    beforeEach(() =>
    {
        //  reset all mocks
        jest.restoreAllMocks();
    });

    it(".createServer", async () =>
    {
        expect.assertions(2);

        //  get our instance from the DI Container, used by SauceCore.
        let sut: ISauceCore = await new SauceCore().isReady;
        let server: http.Server = await sut.createServer();
        expect(server).not.toBeNull();
        server.close();

        //  now with an undefined port
        const port: string | undefined = process.env.APPLICATION_PORT;
        delete process.env.APPLICATION_PORT;
        sut = await new SauceCore().isReady;
        server = await sut.createServer();
        expect(server).not.toBeNull();
        server.close();
        process.env.APPLICATION_PORT = port;
    });

    it(".getAppContainer", async () =>
    {
        expect.assertions(1);

        //  get our instance from the DI Container, used by SauceCore.
        const sut: ISauceCore = await new SauceCore().isReady;
        expect(sut.getAppContainer() instanceof Container).toBeTruthy();
    });

    it(".getRegisteredModule", async () =>
    {
        expect.assertions(2);

        //  get our instance from the DI Container, used by SauceCore.
        const sut: ISauceCore = await new SauceCore().isReady;
        await sut.start();
        expect(sut.getRegisteredModule(SauceCore)).toBe(sut);
        expect(sut.getRegisteredModule(MockModule)).toBeUndefined();
        await sut.teardown();
    });

    it(".hasRegisteredModule", async () =>
    {
        expect.assertions(2);

        //  get our instance from the DI Container, used by SauceCore.
        const sut: ISauceCore = await new SauceCore().isReady;
        expect(sut.hasRegisteredModule(SauceCore)).toBeTruthy();
        expect(sut.hasRegisteredModule(MockModule)).toBeFalsy();
    });

    it(".getExpress", async () =>
    {
        expect.assertions(1);

        //  get our instance from the DI Container, used by SauceCore.
        const sut: ISauceCore = await new SauceCore().isReady;
        const isExpress: Function = (sut: Express): sut is Express =>
        {
            return sut.request !== undefined;
        };
        expect(isExpress(sut.getExpress())).toBeTruthy();
    });

    it(".getServer", async () =>
    {
        expect.assertions(1);

        //  get our instance from the DI Container, used by SauceCore.
        const sut: ISauceCore = await new SauceCore().isReady;
        const server: http.Server = await sut.createServer();
        const isServer: Function = (sut: http.Server): sut is http.Server =>
        {
            return sut.close !== undefined;
        };
        expect(isServer(sut.getServer())).toBeTruthy();
        server.close();
    });

    it("registers module successfully and call start module instance when SauceCore is started", async () =>
    {
        expect.assertions(1);

        const spyStart: SpyInstance = jest.spyOn(MockModule.prototype, "start");

        const sut: ISauceCore = await new SauceCore().isReady;
        await sut.register(MockModule);
        await sut.start();
        expect(spyStart).toHaveBeenCalled();

        await sut.teardown();
        spyStart.mockRestore();
    });

    it("de-registers module successfully and call teardown and onDeRegister on module instance", async () =>
    {
        expect.assertions(1);

        const spyTeardown: SpyInstance = jest.spyOn(MockModule.prototype, "teardown");
        const sut: ISauceCore = await new SauceCore().isReady;
        await sut.register(MockModule);
        await sut.start();
        await sut.deregister(MockModule);
        //  expect teardown and onDeRegister to have been called by SauceCore
        expect(spyTeardown).toHaveBeenCalled();

        await sut.teardown();
        spyTeardown.mockRestore();
    });

    it("errors on registration if the module has already been registered", async () =>
    {
        expect.assertions(1);

        const sut: ISauceCore = await new SauceCore().isReady;
        await sut.register(MockModule);

        /*  sadly it seems expect await with toThrow doesn't work properly
            as logged here https://github.com/facebook/jest/issues/1700  */
        // expect(async () => { await sut.register(MockModule); }).toThrow(`The module ${MockModule.name} has already been registered`);
        expect(sut.register(MockModule)).rejects.toThrow(`The module ${MockModule.name} has already been registered`);
    });

    it("errors on deregistration if the module has already been deregistered", async () =>
    {
        expect.assertions(1);

        const sut: ISauceCore = await new SauceCore().isReady;
        await sut.register(MockModule);
        await sut.deregister(MockModule);

        /*  sadly it seems expect await with toThrow doesn't work properly
            as logged here https://github.com/facebook/jest/issues/1700  */
        // expect(async () => { await sut.register(MockModule); }).toThrow(`The module ${MockModule.name} has already been registered`);
        expect(sut.deregister(MockModule)).rejects.toThrow(`The module ${MockModule.name} was never registered or has already been deregistered`);
    });

    it("registers itself", async () =>
    {
        expect.assertions(1);

        //  get our instance from the DI Container, used by SauceCore.
        const sut: ISauceCore = await new SauceCore().isReady;
        expect(sut.hasRegisteredModule(SauceCore)).toBeTruthy();
    });

    it("deregisters itself (even if this will never happen)", async () =>
    {
        expect.assertions(2);

        //  get our instance from the DI Container, used by SauceCore.
        const sut: ISauceCore = await new SauceCore().isReady;
        expect(sut.hasRegisteredModule(SauceCore)).toBeTruthy();
        await sut.deregister(SauceCore);
        expect(sut.hasRegisteredModule(SauceCore)).toBeFalsy();
    });

    /* tslint:disable-next-line:no-suspicious-comment */
    //  TODO rework once toHaveBeenCalledBefore is buggy atm
    it("starts all the modules in order of registration when started", async () =>
    {
        expect.assertions(1);

        const moduleOrder: number[] = [];
        const sut: ISauceCore = await new SauceCore().isReady;

        const spyModuleStart: SpyInstance = jest.spyOn(MockModule.prototype, "start");
        const spyModule2Start: SpyInstance = jest.spyOn(Module2.prototype, "start");
        const spyModule3Start: SpyInstance = jest.spyOn(Module3.prototype, "start");
        spyModuleStart.mockImplementation(async () =>
        {
            moduleOrder.push(1);
        });
        spyModule2Start.mockImplementation(async () =>
        {
            moduleOrder.push(2);
        });
        spyModule3Start.mockImplementation(async () =>
        {
            moduleOrder.push(3);
        });

        await sut.register(MockModule);
        await sut.register(Module2);
        await sut.register(Module3);
        await sut.start();

        expect(moduleOrder).toEqual(expect.arrayContaining([1, 2, 3]));

        await sut.teardown();
        spyModuleStart.mockRestore();
        spyModule2Start.mockRestore();
        spyModule3Start.mockRestore();
    });

    //  skipping this test as tohaveBeenCalledBefore is buggy atm
    it("stops all the modules in order of registration when started", async () =>
    {
        expect.assertions(1);

        const moduleOrder: number[] = [];
        const sut: ISauceCore = await new SauceCore().isReady;

        const spyModuleStop: SpyInstance = jest.spyOn(MockModule.prototype, "stop");
        const spyModule2Stop: SpyInstance = jest.spyOn(Module2.prototype, "stop");
        const spyModule3Stop: SpyInstance = jest.spyOn(Module3.prototype, "stop");
        spyModuleStop.mockImplementation(async () =>
        {
            moduleOrder.push(1);
        });
        spyModule2Stop.mockImplementation(async () =>
        {
            moduleOrder.push(2);
        });
        spyModule3Stop.mockImplementation(async () =>
        {
            moduleOrder.push(3);
        });

        await sut.register(MockModule);
        await sut.register(Module2);
        await sut.register(Module3);
        await sut.start();
        await sut.stop();

        expect(moduleOrder).toEqual(expect.arrayContaining([3, 2, 1]));

        await sut.teardown();
        spyModuleStop.mockRestore();
        spyModule2Stop.mockRestore();
        spyModule3Stop.mockRestore();
    });

    /* tslint:disable-next-line */
    it("GET /health", async (done: Function) =>
    {
        expect.assertions(1);

        const sut: ISauceCore = await new SauceCore().isReady;
        await sut.register(MockModule);
        const app: Express = sut.getExpress();

        //  spin up sauce core
        await sut.start();

        //  and call the endpoint
        const response: Response = await request(app).get(SauceCore.HEALTH_PATH);
        expect(response.status).toBe(200);

        //  then close the server
        await sut.teardown();

        done();
    }, 30000);

});

class Module2 extends MockModule
{
    public async stop(): Promise<void>
    /* tslint:disable-next-line:no-empty */
    {
    }

    public async start(): Promise<void>
    /* tslint:disable-next-line:no-empty */
    {
    }
}

class Module3 extends MockModule
{
    public async stop(): Promise<void>
    /* tslint:disable-next-line:no-empty */
    {
    }

    public async start(): Promise<void>
    /* tslint:disable-next-line:no-empty */
    {
    }
}
