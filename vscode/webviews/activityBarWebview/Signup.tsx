import React, { useState } from 'react';
import { ChevronLeftIcon, LockClosedIcon } from '@heroicons/react/solid';
import prependHttp from 'prepend-http';
import { vscode } from '../common/message';
import { getSubdomain } from './App';
import { GitHubButton, GoogleButton, MintlifyButton } from '../common/svgs';

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
  signInUrl?: string,
  setSignInUrl: (string) => void
  onBack: () => void
};

export default function Signup({ signInUrl, setSignInUrl, onBack }: SignupProps) {
  const [signInMethod, setSignInMethod] = useState<string>();
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

  if (signInMethod === 'mintlify') {
    return <>
    <div className="flex items-center cursor-pointer" onClick={() => setSignInMethod(undefined)}>
      <ChevronLeftIcon className="h-5 w-5" />
      Back
    </div>
    <p className="mt-1 font-medium">Mintlify Dashboard URL</p>
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

  return <div className="space-y-2">
    <div className="flex items-center cursor-pointer" onClick={onBack}>
      <ChevronLeftIcon className="h-5 w-5" />
      Back
    </div>
    <button
      type="submit"
      className="flex items-center justify-center submit opacity-100 hover:cursor-pointer"
      onClick={onClickSignUp}
    >
      <GoogleButton className="h-4 w-4 text-white mr-2" />
      Sign in with Google
    </button>
    <button
      type="submit"
      className="flex items-center justify-center submit opacity-100 hover:cursor-pointer"
      onClick={onClickSignUp}
    >
      <GitHubButton className="h-4 w-4 text-white mr-2" />
      Sign in with GitHub
    </button>
    <button
      type="submit"
      className="flex items-center justify-center submit opacity-100 hover:cursor-pointer"
      onClick={() => setSignInMethod('mintlify')}
    >
      <MintlifyButton className="h-4 w-4 text-white mr-2" />
      Sign in with Mintlify
    </button>
    </div>;
}