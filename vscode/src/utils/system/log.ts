import { LogCorrelationContext } from '../../logger';

const emptyStr = '';
const maxSmallIntegerV8 = 2 ** 30; // Max number that can be stored in V8's smis (small integers)

const correlationContext = new Map<number, LogCorrelationContext>();
let correlationCounter = 0;

export function getCorrelationContext() {
    return correlationContext.get(correlationCounter);
}

export function getNextCorrelationId() {
    if (correlationCounter === maxSmallIntegerV8) {
        correlationCounter = 0;
    }
    return ++correlationCounter;
}

