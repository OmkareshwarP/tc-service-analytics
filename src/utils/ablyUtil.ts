import Ably from 'ably';
import { eventTypes, logData, logError } from './index.js';
import { AnalyticsEventData } from '../typeDefs.js';
import { userInfoEventHandler } from '../eventHandlers/userInfoEventHandler.js';

let ably: Ably.Realtime;

export const initializeAbly = () => {
  ably = new Ably.Realtime({
    key: process.env.ABLY_API_KEY,
  });

  ably.connection.once('connected', () => {
    logData('Connected to Ably!', 'ablyReady', 2, '');
  });
};

export const getAblyClient = (): Ably.Realtime => {
  return ably;
}

export const ablyCloseConnection = () => {
  ably.connection.close();
  ably.connection.once('closed', () => {
    logData('Connection to Ably closed.', 'ablyClosed', 9, '');
  });
};


export const ablySubscribe = () => {
  const ably = getAblyClient();
  const channel: Ably.RealtimeChannel = ably.channels.get(process.env.ANALYTICS_CHANNEL);

  channel.subscribe((event) => {
    const data: AnalyticsEventData = JSON.parse(event.data);
    if (!data.eventName) {
      logError('Event name missing in event data', 'eventNameMissingError', 5, new Error(`Event name missing: ${JSON.stringify(data)}`));
    }

    switch (data.eventName) {
      case eventTypes.userInfoEvent:
        userInfoEventHandler(data)
          .then(() => {
            logData(`Event processed successfully: ${eventTypes.userInfoEvent}`, 'eventProcessed', 2, JSON.stringify(data));
          })
          .catch((err) => {
            logError(`Error while processing event: ${eventTypes.userInfoEvent}`, 'eventProcessingError', 5, err);
          })
        break;
      default:
        logError('Unknown event name', 'unknownEventName', 5, new Error(`Event name unknown: ${JSON.stringify(data)}`));
        break;
    }
  });

  channel.on((stateChange) => {
    if (stateChange.reason) {
      logError(`Error on channel: ${stateChange.reason.message}`, 'ablySubscribeError', 9, stateChange);
    }
  });

  channel.on('update', (stateChange) => {
    if (stateChange.reason) {
      logError(`Error on channel: ${stateChange.reason.message}`, 'ablySubscribeError', 9, stateChange);
    }
  });
};
