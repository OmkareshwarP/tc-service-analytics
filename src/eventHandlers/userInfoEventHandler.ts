import { AnalyticsEventData } from "../typeDefs.js";
import { logError } from "../utils/index.js";

export const userInfoEventHandler = async (data: AnalyticsEventData) => {
    try {
        // eslint-disable-next-line no-console
        console.log({ data });
    } catch (error) {
        logError(error.message, 'errorWhileHandlingUserInfoEvent', 10, error, data);
    }
}
