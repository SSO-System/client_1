import { db } from '../db/connection';
import pkceChallenge from 'pkce-challenge';

export const create_pkce = async (session: string) => {
  const pkce: { code_challenge: string, code_verifier: string } = pkceChallenge(64);
  const codeChallenge: string = pkce.code_challenge;
  const codeVerifier: string = pkce.code_verifier;

  await db.collection('app_session').doc(session).set({
    codeVerifier,
    codeChallenge,
  },
  {
    merge: true
  });
  
  return codeChallenge;
};