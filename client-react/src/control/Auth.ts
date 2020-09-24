import type { HTTPMethod, EndpointConfig, MenuLink } from './Types';

export type AuthState = {
    loggedIn: boolean;
    username?: string;
    profileImg?: string;
    fetch: (source: string, method?: HTTPMethod, data?: any) => Promise<Response>;
};

export type AuthToken = {
    username?: string;
    token?: string;
};

export type AuthVerification = {

};

export async function authFetch(
    endpoints: EndpointConfig,
    source: string,
    method?: HTTPMethod,
    data?: string) {
    const token: AuthToken = JSON.parse(localStorage['Kafei-Api-Token']);

    if(!token) {
        const message = 'no authorization token available';
        const code    = 401;
        return Promise.reject({message, code});
    }

    return await fetch(endpoints.data + source, {
        method: method ? method : 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token.token,
        },
        body: data ? JSON.stringify(data) : undefined,
    });
}

export class LoginState {
    constructor(
        authState: AuthState,
        inLinks: MenuLink[],
        outLinks: MenuLink[]) {
        this.authState = authState;
        this.inLinks = inLinks;
        this.outLinks = outLinks;
        this.links = outLinks;
    }

    authState: AuthState;
    inLinks: MenuLink[];
    outLinks: MenuLink[];
    links?: MenuLink[];

    loggedInCycle(token?: AuthToken) {
        if(!token)
            return;

        localStorage['Kafei-Api-Token'] = JSON.stringify(token);
        this.authState.loggedIn = true;
        this.authState.username = token.username;
        this.links = this.inLinks;
    }
    loggedOutCycle() {
        localStorage.removeItem('Kafei-Api-Token');
        this.authState.loggedIn = false;
        this.authState.username = undefined;
        this.links = this.outLinks;
    }

    async isLoggedIn(endpoints: EndpointConfig) {
        try {
            let currToken = JSON.parse(localStorage['Kafei-Api-Token']);

            if(currToken) {
                const isLoggedIn = await authFetch(
                    endpoints,
                    '/v2/users/checkAuthenticate');
                
                if(isLoggedIn)
                {
                    this.loggedInCycle(currToken);
                    return true;
                }
            }
        } catch(err) {}
        return false;
    }
};
