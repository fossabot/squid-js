import ContractBase from "../ContractBase"
import { zeroX } from "../../../utils"
import EventListener from "../../../keeper/EventListener"
import Event from "../../../keeper/Event"

export enum ConditionState {
    Uninitialized = 0,
    Unfulfilled = 1,
    Fulfilled = 2,
    Aborted = 3,
}

export const conditionStateNames = ["Uninitialized", "Unfulfilled", "Fulfilled", "Aborted"]

export abstract class Condition extends ContractBase {

    protected constructor(contractName: string) {
        super(contractName)
    }

    public static async getInstance(conditionName: string, conditionsClass: any): Promise<Condition & any> {
        const condition: Condition = new (conditionsClass as any)(conditionName)
        await condition.init()
        return condition
    }


    hashValues(...args: any[]): Promise<string> {
        return this.call("hashValues", args)
    }

    fulfill(agreementId: string, ...args: any[])
    fulfill(agreementId: string, args: any[], from?: string) {
        return this.sendFrom("fulfill", [zeroX(agreementId), ...args], from)
    }

    async generateIdHash(agreementId: string, ...values: any[]) {
        return this.generateId(agreementId, await this.hashValues(...values))
    }

    generateId(agreementId: string, valueHash: string) {
        return this.call<string>("generateId", [zeroX(agreementId), valueHash])
    }

    abortByTimeOut(agreementId: string, from?: string) {
        return this.sendFrom("abortByTimeOut", [zeroX(agreementId)], from)
    }

    public getConditionFulfilledEvent(agreementId: string): Event {
        return EventListener
            .subscribe(
                this.contractName,
                "Fulfilled",
                {agreementId: zeroX(agreementId)},
            )
    }
}
