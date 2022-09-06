export const isValidNumericalCharacter = character =>
  !isNaN(parseInt(character)) || character === '.';

export const isBackspace = nativeEvent => nativeEvent.inputType === 'deleteContentBackward';