import {Receipt} from "web3-utils"
import AccessStatus from "../../models/AccessStatus"
import Asset from "../../ocean/Asset"
import ContractBase from "./ContractBase"

export default class OceanAuth extends ContractBase {

    public static async getInstance(): Promise<OceanAuth> {
        const auth: OceanAuth = new OceanAuth("OceanAuth")
        await auth.init()
        return auth
    }

    public async getOrderStatus(orderId: string): Promise<AccessStatus> {
        return this.call("statusOfAccessRequest", [orderId])
            .then((status: string) => {
                const statusInt = parseInt(status, 10)
                const statusString = AccessStatus[statusInt]
                return AccessStatus[statusString]
            })
    }

    public async getEncryptedAccessToken(orderId: string, consumerAddress: string): Promise<Receipt> {
        return this.call("getEncryptedAccessToken", [orderId], consumerAddress)
    }

    public async initiateAccessRequest(asset: Asset, publicKey: string,
                                       timeout: number, buyerAddress: string): Promise<Receipt> {
        const args = ["0x" + asset.getId(), asset.publisher.getId(), publicKey, timeout]
        return this.send("initiateAccessRequest", buyerAddress, args)
    }

    public async getTempPubKey(orderId: string) {
        return this.call("getTempPubKey", [orderId])
    }

    public async deliverAccessToken(orderId: string, accessToken: string, publisherAddress: string) {
        return this.send("deliverAccessToken", publisherAddress, [orderId, accessToken])
    }

}
