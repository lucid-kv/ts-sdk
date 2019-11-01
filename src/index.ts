/** Lucid API wrapper */
export class LucidAPI {
  /** Was the LucidAPI object initialized */
  protected isInstanceInitialized: boolean = false

  /** Lucid API endpoint */
  protected _LUCID_API_ENDPOINT: string
  /** Lucid KV endpoint */
  protected _LUCID_KV_ENDPOINT: string
  /** Lucid UI endpoint */
  protected _LUCID_UI_ENDPOINT: string
  /** Lucid endpoint version */
  protected _LUCID_ENDPOINT_VERSION: string

  /** Lucid endpoint */
  public get LUCID_ENDPOINT() { return this._LUCID_ENDPOINT }
  /** Lucid API endpoint */
  public get LUCID_API_ENDPOINT() { return this._LUCID_API_ENDPOINT }
  /** Lucid KV endpoint */
  public get LUCID_KV_ENDPOINT() { return this._LUCID_KV_ENDPOINT }
  /** Lucid UI endpoint */
  public get LUCID_UI_ENDPOINT() { return this._LUCID_UI_ENDPOINT }
  /** Lucid endpoint version */
  public get LUCID_ENDPOINT_VERSION() { return this._LUCID_ENDPOINT_VERSION }

  /**
   * @param LUCID_ENDPOINT Lucid endpoint
   * @param LUCID_JWT Lucid endpoint authentification JSON Web Token
   */
  constructor(protected _LUCID_ENDPOINT: string = 'http://localhost:7090', protected _LUCID_JWT?: string) {
    this._LUCID_API_ENDPOINT = `${_LUCID_ENDPOINT}/api`
    this._LUCID_KV_ENDPOINT = `${_LUCID_ENDPOINT}/api/kv`
    this._LUCID_UI_ENDPOINT = `${_LUCID_ENDPOINT}/api/ui`
    this._LUCID_ENDPOINT_VERSION = ''
  }


  /**
   * Initialize the Lucid API wrapper instance.
   * Checks the Lucid API endpoint is valid and get its version.
   * Checks the Lucid API endpoint authentification JSON Web Token if it was provided.
   *
   * @returns Lucid API endpoint version
   * @throws {Error} Instance already initialized - Invalid endpoint
   */
  public async init(): Promise<string> {
    if (this.isInstanceInitialized) throw new Error('The Lucid API wrapper instance is already initialized.')

    // Read Lucid endpoint version to check it is a valid endpoint
    const res = await fetch(`${this.LUCID_UI_ENDPOINT}/version`)
    const err = new Error('Error - Endpoint could not be determined to be a Lucid endpoint.')
    if (!res.ok) throw err
    const version = await res.text()
    if (!version.startsWith('Lucid Version')) throw err
    this._LUCID_ENDPOINT_VERSION = version.replace('Lucid Version ', '')

    // Check the Lucid JWT
    if (this._LUCID_JWT) {
      const res2 = await fetch(`${this._LUCID_KV_ENDPOINT}/check-token`, {
        headers: { Authorization: `Bearer ${this._LUCID_JWT}` }
      })
      if (!res2.ok) throw new Error(`Error ${res.status} - ${(await res.json()).message}`)
    }

    // Set the instance as initialized
    this.isInstanceInitialized = true
    return this._LUCID_ENDPOINT_VERSION
  }

  /**
   * Call the Lucid API
   *
   * @param key Targetted key
   * @param method HTTP method
   * @param body Request body
   * @param headers Headers to add to the request
   * @returns Request response
   * @throws {Error} Not logged in - GET, DELETE, HEAD with body - Missing PUT body - Request error
   */
  public async lucidApiCall(key: string, method = 'GET', body?: string, headers = {}): Promise<Response> {
    if (!this.isInstanceInitialized) throw new Error('The Lucid API wrapper instance was not initialized.')

    // Check logged in
    if (!this._LUCID_JWT) throw new Error('You must be logged in to request a key-value pair.')

    // Check if trying to do a request with a body when not allowed to
    const noBodyMethods = ['GET', 'DELETE', 'HEAD']
    if (noBodyMethods.some(x => method.toUpperCase() === x) && body)
      throw new Error(`Can't do a request with a body when using any of ${noBodyMethods.join(', ')} HTTP methods.`)

    // Check there's a body when doing a PUT request
    if (method.toUpperCase() === 'PUT' && !body)
      throw new Error('A PUT HTTP method request should have a body.')

    const res = await fetch(`${this._LUCID_KV_ENDPOINT}/${key}`, {
      method,
      body: body ? body : undefined,
      headers: {
        ...headers,
        Authorization: `Bearer ${this._LUCID_JWT}`
      }
    })
    if (!res.ok) {
      // The server returned an error, should always be json and `message` key
      const error = await res.json()
      throw new Error(`Error ${res.status} - ${error.message}`)
    }
    return res
  }


  /**
   * Retrieve the content associated with a key
   *
   * @param key Targetted key
   * @returns Data contained in the targetted key
   * @throws {Error} Key could not be found
   * @see https://clintnetwork.gitbook.io/lucid/docs/api#get-data
   */
  public getKey(key: string) { return this.lucidApiCall(key) }

  /**
   * Delete a key-value pair
   *
   * @param key Targetted key
   * @returns The key-value pair was deleted
   * @throws {Error} Key could not be found
   * @see https://clintnetwork.gitbook.io/lucid/docs/api#delete-data
   */
  public deleteKey(key: string) { return this.lucidApiCall(key, 'DELETE') }

  /**
   * Check a key-value pair exists
   *
   * @param key Targetted key
   * @returns The key-value pair exists
   * @throws {Error} Key could not be found
   * @see https://clintnetwork.gitbook.io/lucid/docs/api#check-key-initialization
   */
  public existsKey(key: string) { return this.lucidApiCall(key, 'HEAD') }

  /**
   * Store any data in a key-value pair
   *
   * @param key Targetted key
   * @param data Any data to store in the pair
   * @returns The key-value pair was updated
   * @throws {Error} Key can't be updated
   * @see https://clintnetwork.gitbook.io/lucid/docs/api#store-data-create-and-update
   */
  public storeKeyDataAny(key: string, data: any) { return this.lucidApiCall(key, 'PUT', data) }

  /**
   * Store JSON in a key-value pair
   *
   * @param key Targetted key
   * @param obj Object to store as JSON in the pair
   * @returns The key-value pair was updated
   * @throws {Error} Key can't be updated
   * @see https://clintnetwork.gitbook.io/lucid/docs/api#store-data-create-and-update
   */
  public storeKeyDataJson(key: string, obj: {}) {
    return this.lucidApiCall(key, 'PUT', JSON.stringify(obj), { 'Content-Type': 'application/json' })
  }
}
