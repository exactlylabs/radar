// Strong type for handling Optionals the same way Java does it
// Could come in handy in the future when no _optional_ attribute
// can be defined such as { key?: string } for example in an API
// response type definition if the content could be null for any reason.
export type Optional<T> = T | null | undefined;