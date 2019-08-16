import { MetaData } from './MetaData'
import { ServiceAgreementTemplate } from './ServiceAgreementTemplate'
import { Provider } from './ComputingProvider'

export type ServiceType =
    | 'Authorization'
    | 'Metadata'
    | 'Access'
    | 'Compute'
    | 'Computing'
    | 'FitchainCompute'

export interface ServiceCommon {
    type: ServiceType
    serviceDefinitionId?: string
    serviceEndpoint?: string
}

export interface ServiceAuthorization extends ServiceCommon {
    type: 'Authorization'
    service: 'SecretStore' | 'None' | 'RSAES-OAEP'
}

export interface ServiceMetadata extends ServiceCommon {
    type: 'Metadata'
    metadata: MetaData
}

export interface ServiceAccess extends ServiceCommon {
    type: 'Access'
    name?: string
    description?: string
    creator?: string
    templateId?: string
    purchaseEndpoint?: string
    serviceAgreementTemplate?: ServiceAgreementTemplate
}

export interface ServiceComputing extends ServiceCommon {
    type: 'Computing'
    templateId?: string
    provider?: Provider
    serviceAgreementTemplate?: ServiceAgreementTemplate
}

export interface ServiceCompute extends ServiceCommon {
    templateId?: string
}

export type Service<
    T extends ServiceType | 'default' = 'default'
> = T extends 'Authorization'
    ? ServiceAuthorization
    : T extends 'Metadata'
    ? ServiceMetadata
    : T extends 'Computing'
    ? ServiceComputing
    : T extends 'Access'
    ? ServiceAccess
    : T extends 'Compute'
    ? ServiceCompute
    : T extends 'default'
    ? ServiceCommon
    : ServiceCommon
