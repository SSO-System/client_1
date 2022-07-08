import { IssuerMetadata } from 'openid-client';
const ISSUER = "http://localhost:3000";

export const metadata: IssuerMetadata = {
    issuer: ISSUER,
    authorization_endpoint: ISSUER + "/auth",
    token_endpoint: ISSUER + "/token",
    jwks_uri: ISSUER + "/jwks",
    userinfo_endpoint: ISSUER + "/me",
    revocation_endpoint: ISSUER + "/token/revocation",
    end_session_endpoint: ISSUER + "/session/end",
    token_endpoint_auth_methods_supported: [
        "client_secret_basic",
        "client_secret_jwt",
        "client_secret_post",
        "private_key_jwt",
        "none"
    ],
    token_endpoint_auth_signing_alg_values_supported: [
        "HS256",
        "RS256",
        "PS256",
        "ES256",
        "EdDSA"
    ],
    introspection_endpoint_auth_methods_supported: [
        "client_secret_basic",
        "client_secret_jwt",
        "client_secret_post",
        "private_key_jwt",
        "none"
    ],
    introspection_endpoint_auth_signing_alg_values_supported: [
        "HS256",
        "RS256",
        "PS256",
        "ES256",
        "EdDSA"
    ],
    revocation_endpoint_auth_methods_supported: [
        "client_secret_basic",
        "client_secret_jwt",
        "client_secret_post",
        "private_key_jwt",
        "none"
    ],
    revocation_endpoint_auth_signing_alg_values_supported: [
        "HS256",
        "RS256",
        "PS256",
        "ES256",
        "EdDSA"
    ],
    request_object_signing_alg_values_supported: [
        "HS256",
        "RS256",
        "PS256",
        "ES256",
        "EdDSA"
    ],
}