import Paho from 'paho-mqtt';

import type {
    HTTPMethod,
    RESTMessage,
    LinkData,
    EndpointConfig 
} from './Types';

export type NetValue<T> = {
    get?: () => Promise<void>;
} & ({
    code: 0 | 404 | 500;
} | {
    code: 200;
    data: T;
});

type FetchFunction =  (
    rsc: string,
    method?: HTTPMethod,
    data?: string) => Promise<Response>;

export class ScopedFetch {
    constructor(fetcher: FetchFunction) {
        this.fetchFunc = fetcher;
    }

    fetchFunc: FetchFunction;

    async fetch<T>(resource: string, method?: HTTPMethod, data?: string) {
        return this.fetchFunc(resource, method, data)
            .then((content) => content.json())
            .then((content) => content as RESTMessage<T>)
            .catch((err) => err as RESTMessage<void>);
    }

    async raw(resource: string) {
        return this.fetchFunc(resource)
            .then((content) => content.text())
            .catch((err) => console.log(err));
    }

    async activate<T>(link: LinkData, data?: string) {
        return this.fetch<T>(link.uri, link.method, data);
    }
    async activateRaw(link: LinkData, data?: string) {
        return this.raw(link.uri);
    }
};

export async function endpointFetch(
    endpoints: EndpointConfig,
    resource: string,
    method?: HTTPMethod,
    data?: string) {
    let finalResource: string | undefined;
    try {
        const parse = new URL(resource);
        console.log(resource, parse.hostname);
        finalResource = resource;
    } catch (e) {
        finalResource = endpoints.data + resource;
    }

    return fetch(finalResource, {
        method: method ? method : 'GET',
        // mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
    });
}

export type MqttListener = (message: string) => void;

export class ServerListener {
    constructor(subscriptions: string[]) {
        this.listener = new Paho.Client(
            "wss://birchy.dev:8083/",
            "kafei.dev");

        this.listener.onMessageArrived = (message) =>
            this.listeners.forEach(l => l(JSON.parse(message.payloadString)));
        
        this.listener.connect({
            timeout: 3,
            onSuccess: () => 
                subscriptions.forEach(sub =>
                    this.listener.subscribe(sub))
                ,
        });
    }

    addHandler(func: MqttListener) {
        this.listeners.push(func);
    }

    listener: Paho.Client;
    listeners: MqttListener[];
};
