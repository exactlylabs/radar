export const isValidNumericalCharacter = character =>
  !isNaN(parseInt(character)) || character === '.';

export const isEventBackspace = nativeEvent => nativeEvent.inputType === 'deleteContentBackward';