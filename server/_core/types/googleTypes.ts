// Google OAuth 2.0 TypeScript types

export interface GoogleProfile {
    id: string;
    displayName: string;
    name?: {
        familyName?: string;
        givenName?: string;
    };
    emails?: Array<{
        value: string;
        verified: boolean;
    }>;
    photos?: Array<{
        value: string;
    }>;
    provider: string;
    _raw: string;
    _json: any;
}

export interface GoogleAuthConfig {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
}

export interface GoogleUserInfo {
    googleId: string;
    email: string | null;
    name: string;
    photoUrl: string | null;
}
