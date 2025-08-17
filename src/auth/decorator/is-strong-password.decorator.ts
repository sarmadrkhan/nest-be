import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(minLength = 8, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return (
            value.length >= minLength &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /\d/.test(value) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(value)
          );
        },
        defaultMessage(args: ValidationArguments) {
          const missing: string[] = [];
          if (args.value.length < minLength) {
            missing.push(`minimum ${minLength} characters`);
          }
          if (!/[A-Z]/.test(args.value)) missing.push('an uppercase letter');
          if (!/[a-z]/.test(args.value)) missing.push('a lowercase letter');
          if (!/\d/.test(args.value)) missing.push('a number');
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(args.value)) missing.push('a special character');

          if (missing.length === 1) {
            return `Password must contain at least ${missing[0]}`;
          }
          const last = missing.pop();
          return `Password must contain at least ${missing.join(', ')} and ${last}`;
        },
      },
    });
  };
}
