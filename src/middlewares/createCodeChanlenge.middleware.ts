import { create_pkce } from '../actions/create_pkce';

export const createCodeChallenge = async (req, res, next) => {
    const _app_session = req.sessionID;
    const session = req.session;

    if (session.code_challenge === undefined) { 
        const result: any = await create_pkce(_app_session);
        const { codeChallenge, codeVerifier } = result;
        req.session.code_challenge = codeChallenge;
        req.session.code_verifier = codeVerifier;
    } 

    next();
}