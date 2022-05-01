import Analytics from 'analytics-node';
const analytics = new Analytics('pkG5P17lwtHkBOY1b8svfKfyRmPctvER');

type Properties = {
  [key: string]: string | number | boolean | Date | string[]
}

const runIfProduction = (func: () => void) => {
  if (process.env.NODE_ENV === 'production') {
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

export const trackOpen = (fields: any) => {
  runIfProduction(() => {
    analytics.track(fields);
  });
}