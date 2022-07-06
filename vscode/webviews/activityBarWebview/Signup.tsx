import React from 'react';
import { LockClosedIcon } from '@heroicons/react/solid';
import prependHttp from 'prepend-http';
import { vscode } from '../common/message';
import { getSubdomain } from './App';

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const formatSignInUrl = (signInUrl: string) => {
  let signInWithProtocol = prependHttp(signInUrl);
  const lastCharacter = signInWithProtocol[signInWithProtocol.length - 1];
  if (lastCharacter === '/') {
    signInWithProtocol = signInWithProtocol.slice(0, -1);
  }

  return signInWithProtocol;
};

type SignupProps = {
  signInUrl: string,
  setSignInUrl: (string) => void
};

export default function Signup({ signInUrl, setSignInUrl }: SignupProps) {
  const onClickSignIn = () => {
    if (!signInUrl) {
      return;
    }
    let signInWithProtocol = formatSignInUrl(signInUrl);
    const subdomain = getSubdomain(signInUrl);
    vscode.postMessage({ command: 'login', args: {signInWithProtocol, subdomain} });
  };

  const onClickSignUp = () => {
    vscode.postMessage({ command: 'sign-up' });
  };

  return <>
     <button
      type="submit"
      className={classNames("flex items-center justify-center submit mt-2 opacity-100 hover:cursor-pointer")}
      onClick={onClickSignUp}
    >
      Create an account
    </button>
    <p className="text-center">
      OR
    </p>
    <p className="mt-1 font-medium">Dashboard URL</p>
    <input
      className="text-sm"
      type="text"
      value={signInUrl}
      onChange={(e) => setSignInUrl(e.target.value)}
      placeholder="name.mintlify.com"
    />
    <button
      type="submit"
      className={classNames("flex items-center justify-center submit mt-2", !signInUrl ? 'opacity-50 hover:cursor-default' : 'opacity-100 hover:cursor-pointer')}
      onClick={onClickSignIn}
      disabled={!signInUrl}
    >
      <LockClosedIcon className="mr-1 h-4 w-4" aria-hidden="true" />
      Sign in with Mintlify
    </button>
    </>;
}