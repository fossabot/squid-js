export interface File {
    /**
     * File URL.
     * @type {string}
     */
    url: string

    /**
     * File index.
     * @type {number}
     */
    index?: number

    /**
     * File checksum.
     * @type {[type]}
     */
    checksum?: string

    /**
     * Checksum hash algorithm.
     * @type {[type]}
     */
    checksumType?: string

    /**
     * File content length.
     * @type {[type]}
     */
    contentLength?: number

    /**
     * Resource ID (depending on the source).
     * @type {[type]}
     */
    resourceId?: string

    /**
     * File encoding.
     * @type {string}
     * @example "UTF-8"
     */
    encoding?: string

    /**
     * File compression (e.g. no, gzip, bzip2, etc).
     * @type {string}
     * @example "zip"
     */
    compression?: string

    /**
     * File format, if applicable.
     * @type {string}
     * @example "text/csv"
     */
    contentType?: string
}

/**
 * Base attributes of Assets Metadata.
 * @see https://github.com/oceanprotocol/OEPs/tree/master/8#base-attributes
 */
export interface MetaDataBase {

    /**
     * Descriptive name of the Asset.
     * @type {string}
     * @example "UK Weather information 2011"
     */
    name: string

    /**
     * Type of the Asset. Helps to filter by the type of asset,
     * initially ("dataset", "algorithm", "container", "workflow", "other").
     * @type {string}
     * @example "dataset"
     */
    type: "dataset" | "algorithm" | "container" | "workflow" | "other"

    /**
     * Details of what the resource is. For a dataset, this attribute
     * explains what the data represents and what it can be used for.
     * @type {string}
     * @example "Weather information of UK including temperature and humidity"
     */
    description?: string

    /**
     * The date on which the asset was created by the originator in
     * ISO 8601 format, Coordinated Universal Time.
     * @type {string}
     * @example "2019-01-31T08:38:32Z"
     */
    dateCreated: string

    /**
     * The date on which the asset DDO was registered into the metadata store.
     * This value is created automatically by Aquarius upon registering,
     * so this value can't be set.
     * @type {string}
     * @example "2019-01-31T08:38:32Z"
     */
    datePublished?: string

    /**
     * Name of the entity generating this data (e.g. Tfl, Disney Corp, etc.).
     * @type {string}
     * @example "Met Office"
     */
    author: string

    /**
     * Short name referencing the license of the asset (e.g. Public Domain, CC-0, CC-BY, No License Specified, etc. ).
     * If it's not specified, the following value will be added: "No License Specified".
     * @type {string}
     * @example "CC-BY"
     */
    license: string

    /**
     * The party holding the legal copyright. Empty by default.
     * @type {string}
     * @example "Met Office"
     */
    copyrightHolder?: string

    /**
     * Example of the concept of this asset. This example is part
     * of the metadata, not an external link.
     * @type {string}
     * @example "423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68"
     */
    workExample?: string

    /**
     * Mapping of links for data samples, or links to find out more information.
     * Links may be to either a URL or another Asset. We expect marketplaces to
     * converge on agreements of typical formats for linked data: The Ocean Protocol
     * itself does not mandate any specific formats as these requirements are likely
     * to be domain-specific.
     * @type {any[]}
     * @example
     * [
     *    {
     *      anotherSample: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/",
     *    },
     *    {
     *      fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/",
     *    },
     *  ]
     */
    links?: Array<{[name: string]: string}>

    /**
     * The language of the content. Please use one of the language
     * codes from the {@link https://tools.ietf.org/html/bcp47 IETF BCP 47 standard}.
     * @type {String}
     * @example "en"
     */
    inLanguage?: string

    /**
     * Categories used to describe this content. Empty by default.
     * @type {string[]}
     * @example ["Economy", "Data Science"]
     */
    categories?: string[]

    /**
     * Keywords or tags used to describe this content. Empty by default.
     * @type {string[]}
     * @example ["weather", "uk", "2011", "temperature", "humidity"]
     */
    tags?: string[]

    /**
     * Price of the asset.
     * @type {number}
     * @example 10
     */
    price: number

    /**
     * Array of File objects including the encrypted file urls and some additional information.
     * @type {File[]}
     */
    files: File[]

    /**
     * SHA3 hash of concatenated values: [list of all file checksums] + name + author + license + did
     * @type {string}
     */
    checksum?: string

    encryptedFiles?: any
}

/**
 * Curation attributes of Assets Metadata.
 * @see https://github.com/oceanprotocol/OEPs/tree/master/8#curation-attributes
 */
export interface Curation {
    /**
     * Decimal value between 0 and 1. 0 is the default value.
     * @type {number}
     * @example 0.93
     */
    rating: number

    /**
     * Number of votes. 0 is the default value.
     * @type {number}
     * @example 123
     */
    numVotes: number

    /**
     * Schema applied to calculate the rating.
     * @type {string}
     * @example "Binary Voting"
     */
    schema?: string
}

/**
 * Additional Information of Assets Metadata.
 * @see https://github.com/oceanprotocol/OEPs/tree/master/8#additional-information
 */
export interface AdditionalInformation {
    /**
     * An indication of update latency - i.e. How often are updates expected (seldom,
     * annually, quarterly, etc.), or is the resource static that is never expected
     * to get updated.
     * @type {string}
     * @example "yearly"
     */
    updateFrequency: string

    /**
     * A link to machine-readable structured markup (such as ttl/json-ld/rdf)
     * describing the dataset.
     * @type {StructuredMarkup[]}
     */
    structuredMarkup: Array<{
        uri: string
        mediaType: string,
    }>

    /**
     * Checksum of attributes to be able to compare if there are changes in
     * the asset that you are purchasing.
     * @type {string}
     */
    checksum: string
}

export interface MetaData {
    additionalInformation?: AdditionalInformation
    base: MetaDataBase
    curation?: Curation
}
