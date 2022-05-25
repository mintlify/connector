import Analytics from 'analytics-node';
import { ISDEV } from '../helpers/environment';
const analytics = new Analytics('pkG5P17lwtHkBOY1b8svfKfyRmPctvER');

type Properties = {
  [key: string]: string | number | boolean | Date | string[]
}

const runIfProduction = (func: () => void) => {
  if (!ISDEV) {
    func();
  }
}

export const identify = (userId: string, traits?: Properties) => {
  runIfProduction(() => {
    analytics.identify({
      userId,
      traits,
    });
  })
}

export const track = (userId: string, event: string, properties?: Properties) => {
  runIfProduction(() => {
    analytics.track({
      userId,
      event,
      properties
    });
  })
}