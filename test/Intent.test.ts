import { Intent } from '../src/Intent';

describe('Intent', () => {
  test('should handle utterances with diacritics', () => {
    const intent = new Intent({
      name: 'OrderPizza',
      utterances: ['Quiero una pizza', 'Deseo pedir comida', 'Quiero café']
    });

    const cdkProps = intent.toCdk(false, false);
    
    expect(cdkProps.sampleUtterances).toEqual([
      { utterance: 'Quiero una pizza' },
      { utterance: 'Deseo pedir comida' },
      { utterance: 'Quiero café' }
    ]);
  });

  test('should handle confirmation prompt with diacritics', () => {
    const intent = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      confirmationPrompt: '¿Estás seguro que quieres pedir café?'
    });

    const cdkProps = intent.toCdk(false, false);
    
    const confirmationSetting = cdkProps.intentConfirmationSetting as any;
    expect(confirmationSetting?.promptSpecification.messageGroupsList[0].message.plainTextMessage?.value)
      .toBe('¿Estás seguro que quieres pedir café?');
  });

  test('should handle fulfillment prompt with diacritics', () => {
    const intent = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      fulfillmentPrompt: 'Tu pedido de café está listo'
    });

    const cdkProps = intent.toCdk(false, true);
    
    const fulfillmentHook = cdkProps.fulfillmentCodeHook as any;
    expect(fulfillmentHook?.postFulfillmentStatusSpecification?.successResponse?.messageGroupsList[0].message.plainTextMessage?.value)
      .toBe('Tu pedido de café está listo');
  });

  test('should handle custom fulfillment failure prompt with diacritics', () => {
    const intent = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      fulfillmentPrompt: 'Your order is ready',
      fulfillmentFailurePrompt: 'Lo siento, no pude procesar tu pedido de café'
    });

    const cdkProps = intent.toCdk(false, true);
    
    const fulfillmentHook = cdkProps.fulfillmentCodeHook as any;
    expect(fulfillmentHook?.postFulfillmentStatusSpecification?.failureResponse?.messageGroupsList[0].message.plainTextMessage?.value)
      .toBe('Lo siento, no pude procesar tu pedido de café');
  });

  test('should handle custom confirmation failure prompt with diacritics', () => {
    const intent = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      confirmationPrompt: 'Are you sure?',
      confirmationFailurePrompt: 'Está bien, no procederé con tu pedido'
    });

    const cdkProps = intent.toCdk(false, false);
    
    const confirmationSetting = cdkProps.intentConfirmationSetting as any;
    expect(confirmationSetting?.declinationResponse?.messageGroupsList[0].message.plainTextMessage?.value)
      .toBe('Está bien, no procederé con tu pedido');
  });

  test('should conditionally include confirmation responses', () => {
    // Only confirmation prompt
    const intent1 = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      confirmationPrompt: 'Are you sure?'
    });

    const cdkProps1 = intent1.toCdk(false, false);
    const confirmationSetting1 = cdkProps1.intentConfirmationSetting as any;
    expect(confirmationSetting1?.promptSpecification).toBeDefined();
    expect(confirmationSetting1?.declinationResponse).toBeUndefined();

    // Only confirmation failure prompt
    const intent2 = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      confirmationFailurePrompt: 'Cancelled'
    });

    const cdkProps2 = intent2.toCdk(false, false);
    const confirmationSetting2 = cdkProps2.intentConfirmationSetting as any;
    expect(confirmationSetting2?.promptSpecification).toBeUndefined();
    expect(confirmationSetting2?.declinationResponse).toBeDefined();

    // No confirmation prompts
    const intent3 = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza']
    });

    const cdkProps3 = intent3.toCdk(false, false);
    expect(cdkProps3.intentConfirmationSetting).toBeUndefined();
  });

  test('should conditionally include fulfillment responses', () => {
    // Only fulfillment prompt
    const intent1 = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      fulfillmentPrompt: 'Your order is ready'
    });

    const cdkProps1 = intent1.toCdk(false, true);
    const fulfillmentHook1 = cdkProps1.fulfillmentCodeHook as any;
    expect(fulfillmentHook1?.postFulfillmentStatusSpecification?.successResponse).toBeDefined();
    expect(fulfillmentHook1?.postFulfillmentStatusSpecification?.failureResponse).toBeUndefined();

    // Only fulfillment failure prompt
    const intent2 = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza'],
      fulfillmentFailurePrompt: 'Something went wrong'
    });

    const cdkProps2 = intent2.toCdk(false, true);
    const fulfillmentHook2 = cdkProps2.fulfillmentCodeHook as any;
    expect(fulfillmentHook2?.postFulfillmentStatusSpecification?.successResponse).toBeUndefined();
    expect(fulfillmentHook2?.postFulfillmentStatusSpecification?.failureResponse).toBeDefined();

    // No fulfillment prompts
    const intent3 = new Intent({
      name: 'OrderPizza',
      utterances: ['Order pizza']
    });

    const cdkProps3 = intent3.toCdk(false, true);
    const fulfillmentHook3 = cdkProps3.fulfillmentCodeHook as any;
    expect(fulfillmentHook3?.postFulfillmentStatusSpecification).toBeUndefined();
  });
});