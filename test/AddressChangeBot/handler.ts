import { Context, LexV2Event, LexV2Handler, LexV2Result } from 'aws-lambda';

// Helper function to get the first interpretation
const getInterpretation = (event: LexV2Event) => {
  if (!event.interpretations || event.interpretations.length === 0) {
    throw new Error('No interpretations found');
  }
  return event.interpretations[0];
};

// Helper function to get slot value
const getSlotValue = (event: LexV2Event, slotName: string) => {
  const interpretation = getInterpretation(event);
  return interpretation.intent.slots[slotName]?.value.interpretedValue;
};

// Helper function to get intent name
const getIntentName = (event: LexV2Event): string => {
  const interpretation = getInterpretation(event);
  return interpretation.intent.name;
};

// Helper function to get slots
const getSlots = (event: LexV2Event) => {
  const interpretation = getInterpretation(event);
  return interpretation.intent.slots;
};

// Helper function to create a fulfilled response
const createFulfilledResponse = (event: LexV2Event, message?: string): LexV2Result => {
  const sessionAttributes = event.sessionState.sessionAttributes || {};
  const slots = getSlots(event);
  const intentName = getIntentName(event);

  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: 'Close',
      },
      intent: {
        slots,
        name: intentName,
        state: 'Fulfilled',
      },
    },
    messages: message
      ? [
          {
            contentType: 'PlainText',
            content: message,
          },
        ]
      : undefined,
  };
};

// Helper function to create a failed response
const createFailedResponse = (event: LexV2Event, message: string): LexV2Result => {
  const sessionAttributes = event.sessionState.sessionAttributes || {};
  const slots = getSlots(event);
  const intentName = getIntentName(event);

  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: 'Close',
      },
      intent: {
        slots,
        name: intentName,
        state: 'Failed',
      },
    },
    messages: [
      {
        contentType: 'PlainText',
        content: message,
      },
    ],
  };
};

export const handler: LexV2Handler = async (
  event: LexV2Event,
  context?: Context
): Promise<LexV2Result> => {
  if (event.invocationSource !== 'FulfillmentCodeHook') {
    throw new Error(`${event.invocationSource} is not implemented yet`);
  }

  const intentName = getIntentName(event);

  if (intentName !== 'AddressChange') {
    return createFailedResponse(
      event,
      `Lambda doesnt know how to handle intent: ${intentName}`
    );
  }

  const houseNumber = getSlotValue(event, 'houseNumber');
  const streetName = getSlotValue(event, 'streetName');
  const city = getSlotValue(event, 'city');
  const state = getSlotValue(event, 'state');
  const zipCode = getSlotValue(event, 'zipCode');

  // TODO: Validate address & Update DB?
  console.debug('result', { houseNumber, streetName, city, state, zipCode });
  const isSuccess = await Promise.resolve(true);

  return isSuccess
    ? createFulfilledResponse(event, 'Success')
    : createFailedResponse(event, 'Validation or DB Update failed');
};
