import { API_ENDPOINT } from "./api";
import { NextRouter } from "next/router";

export type Integration = {
    type: string,
    title: string,
    description?: string,
    iconSrc: string,
    installUrl: string,
    useRouter?: boolean,
}

export const getIntegrations = (orgId: string): Integration[] => {
    return [
      {
        type: 'slack',
        title: 'Slack',
        description: 'Connect with your workspace',
        iconSrc: '/assets/integrations/slack.svg',
        installUrl: `${API_ENDPOINT}/routes/integrations/slack/install?org=${orgId}&close=true`,
      },
      {
        type: 'github',
        title: 'GitHub',
        description: 'Enable documentation review',
        iconSrc: '/assets/integrations/github.svg',
        installUrl: `${API_ENDPOINT}/routes/integrations/github/install?org=${orgId}&close=true`,
      },
      {
        type: 'vscode',
        title: 'VS Code',
        description: 'Connect code to documentation',
        iconSrc: '/assets/integrations/vscode.svg',
        installUrl: '/api/login/vscode',
        useRouter: true,
      }
  ];
}

export const onInstallIntegration = (integration: Integration, router: NextRouter) => { 
    if (integration?.useRouter) {
      return router.push(integration.installUrl);
    }
    const popupCenter = ({url, title, w, h}: { url: string, title: string, w: number, h: number }) => {
      // Fixes dual-screen position                             Most browsers      Firefox
      const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
      const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;
  
      const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
      const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
  
      const systemZoom = width / window.screen.availWidth;
      const left = (width - w) / 2 / systemZoom + dualScreenLeft
      const top = (height - h) / 2 / systemZoom + dualScreenTop
      const newWindow = window.open(url, title, 
        `
        scrollbars=yes,
        width=${w / systemZoom}, 
        height=${h / systemZoom}, 
        top=${top}, 
        left=${left}
        `
      )

      newWindow?.focus();
    }
    console.log('before popupCenter');
    popupCenter({url: integration.installUrl, title: 'Connect with integration', w: 520, h: 570})
    console.log('after popupCenter');
  }

