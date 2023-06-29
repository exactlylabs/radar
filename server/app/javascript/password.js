export function validatePasswordFields(passwordInput, passwordCheckInput) {
  if (!passwordComplies(passwordInput)) {
    return "Password must be 8 characters long and contain symbols and numbers";
  }
  if (!passwordsMatch(passwordInput, passwordCheckInput)) {
    return "Passwords don't match";
  }
  return null;
}

function passwordComplies(passwordInput) {
  const password = passwordInput.value;
  return password.length >= 8 && /\d/.test(password) && /[!@#$%^&*]/.test(password);
}

function passwordsMatch(passwordInput, passwordCheckInput) {
  const password = passwordInput.value;
  const passwordConfirmation = passwordCheckInput.value;
  return password === passwordConfirmation;
}