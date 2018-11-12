import Aquarius from "../aquarius/Aquarius"
import AquariusProvider from "../aquarius/AquariusProvider"
import SearchQuery from "../aquarius/query/SearchQuery"
import Brizo from "../brizo/Brizo"
import BrizoProvider from "../brizo/BrizoProvider"
import ConfigProvider from "../ConfigProvider"
import Authentication from "../ddo/Authentication"
import DDOCondition from "../ddo/Condition"
import DDO from "../ddo/DDO"
import MetaData from "../ddo/MetaData"
import Parameter from "../ddo/Parameter"
import Service from "../ddo/Service"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Config from "../models/Config"
import ValuePair from "../models/ValuePair"
import ValueType from "../models/ValueType"
import SecretStoreProvider from "../secretstore/SecretStoreProvider"
import Account from "./Account"
import IdGenerator from "./IdGenerator"
import Condition from "./ServiceAgreements/Condition"
import ServiceAgreement from "./ServiceAgreements/ServiceAgreement"
import ServiceAgreementTemplate from "./ServiceAgreements/ServiceAgreementTemplate"
import Access from "./ServiceAgreements/Templates/Access"

export default class Ocean {

    public static async getInstance(config: Config) {

        if (!Ocean.instance) {
            ConfigProvider.setConfig(config)
            Ocean.instance = new Ocean()
            Ocean.instance.keeper = await Keeper.getInstance()
            Ocean.instance.aquarius = await AquariusProvider.getAquarius()
            Ocean.instance.brizo = await BrizoProvider.getBrizo()
        }

        return Ocean.instance
    }

    private static instance = null

    private keeper: Keeper
    private aquarius: Aquarius
    private brizo: Brizo

    private constructor() {
    }

    public async getAccounts(): Promise<Account[]> {

        // retrieve eth accounts
        const ethAccounts = await Web3Provider.getWeb3().eth.getAccounts()

        return ethAccounts.map((address: string) => new Account(address))
    }

    public async registerAsset(metadata: MetaData, publisher: Account): Promise<DDO> {

        const {didRegistry} = this.keeper

        const id: string = IdGenerator.generateId()
        const did: string = `did:op:${id}`
        const serviceDefinitionId: string = IdGenerator.generatePrefixedId()

        metadata.base.contentUrls = await Promise.all(metadata.base.contentUrls.map(async (contentUrl) => {

            const encryptedUrl: string = await SecretStoreProvider.getSecretStore().encryptDocument(id, contentUrl)

            return encryptedUrl
        }))

        const template = new Access()
        const serviceAgreementTemplate = new ServiceAgreementTemplate(template)

        // get condition keys from template
        const conditions: Condition[] = await serviceAgreementTemplate.getConditions()

        // create ddo conditions out of the keys
        const ddoConditions: DDOCondition[] = conditions.map((condition: Condition): DDOCondition => {
            return {
                name: condition.methodReflection.methodName,
                timeout: condition.timeout,
                conditionKey: condition.condtionKey,
                parameters: condition.methodReflection.inputs.map((input: ValuePair) => {
                    return {
                        ...input,
                        // todo: change remove, move to execute
                        value: "xxx",
                    } as Parameter
                }),

            } as DDOCondition
        })
        const serviceEndpoint = this.aquarius.getServiceEndpoint(did)

        // create ddo itself
        const ddo: DDO = new DDO({
            authentication: [{
                type: "RsaSignatureAuthentication2018",
                publicKey: did + "#keys-1",
            } as Authentication],
            id: did,
            publicKey: [
                {
                    id: did + "#keys-1",
                },
                {
                    type: "Ed25519VerificationKey2018",
                },
                {
                    owner: did,
                },
                {
                    publicKeyBase58: publisher.getId(),
                },
            ],
            service: [
                {
                    type: template.templateName,
                    purchaseEndpoint: this.brizo.getPurchaseEndpoint(),
                    serviceEndpoint: this.brizo.getConsumeEndpoint(publisher.getId(),
                        serviceDefinitionId, metadata.base.contentUrls[0]),
                    // the id of the service agreement?
                    serviceDefinitionId,
                    // the id of the service agreement template
                    templateId: serviceAgreementTemplate.getId(),
                    conditions: ddoConditions,
                } as Service,
                {
                    serviceEndpoint: this.brizo.getComputeEndpoint(publisher.getId(),
                        serviceDefinitionId, "xxx", "xxx"),
                    type: "Compute",
                } as Service,
                {
                    type: "Metadata",
                    metadata,
                    serviceEndpoint,
                } as Service,
            ],
        })

        const storedDdo = await this.aquarius.storeDDO(ddo)

        await didRegistry.registerAttribute(id, ValueType.DID, "Metadata", serviceEndpoint,
            publisher.getId())

        return storedDdo
    }

    public async signServiceAgreement(did: string, consumer: Account): Promise<string> {

        const ddo = await AquariusProvider.getAquarius().retrieveDDO(did)
        const id = did.replace("did:op:", "")

        const serviceAgreementId: string = IdGenerator.generateId()
        const serviceAgrementSignature: string = await ServiceAgreement.signServiceAgreement(id,
            ddo, serviceAgreementId, consumer)

        return serviceAgrementSignature
    }

    public async executeServiceAgreement(did: string, serviceAgreementSignature: string,
                                         consumer: Account, publisher: Account): Promise<ServiceAgreement> {

        const ddo = await AquariusProvider.getAquarius().retrieveDDO(did)
        const id = did.replace("did:op:", "")

        const serviceAgreementId: string = IdGenerator.generateId()
        const serviceAgrement: ServiceAgreement = await ServiceAgreement.executeServiceAgreement(id,
            ddo, serviceAgreementId, serviceAgreementSignature, consumer, publisher)

        return serviceAgrement
    }

    public async searchAssets(query: SearchQuery): Promise<DDO[]> {
        return this.aquarius.queryMetadata(query)
    }

    public async searchAssetsByText(text: string): Promise<DDO[]> {
        return this.aquarius.queryMetadataByText({
            text,
            page: 0,
            offset: 100,
            query: {
                value: 1,
            },
            sort: {
                value: 1,
            },
        } as SearchQuery)
    }
}
