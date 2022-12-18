export type JSONElement = null | boolean | number | string | JSONArray | JSONObject;
export type JSONArray = JSONElement[];
export type JSONObject = {
    [member: string]: JSONElement,
    [member: number]: never,
    [member: symbol]: never,
};

export const enum MessageType {
    Callback = 'callback',
}

export type MessageError = {
    name: string,
    message: string,
    stack?: string
};

export type RemoteRequest<T> = {
    method: keyof RemoteContract<T>,
    reference: string,
    parameters: JSONArray,
};

export type RemoteResponse = {
    type: MessageType,
    reference: string,
    result?: JSONElement,
    error?: MessageError,
};

/**
 * A conditional type that matches any function with the following constraints:
 * - Must comply with async/await pattern
 * - The parameters must be JSON serializable
 * - The result value must be JSON serializable
 */
type RemoteMethod<TFunction> = TFunction extends (...parameters: infer _TParameters extends JSONElement[]) => Promise<JSONElement | void> ? TFunction : never;

export type RemoteContract<TContract> = {
    [TKey in keyof TContract]: TKey extends string ? RemoteMethod<TContract[TKey]> : never;
}