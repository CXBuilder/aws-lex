import { Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Stringify object which exclude constructs (circular reference)
 */
export function safeStringify(obj: unknown): string {
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (value instanceof Construct) {
        // Dont serialize constructs
        return `construct-${value.node.id}`;
      }
      if (typeof value === 'function') {
        // Dont serialize functions
        return '{function}';
      }
      if (typeof value === 'string' && Token.isUnresolved(value)) {
        // Dont serialize unresolved tokens.
        // Token change with each synth, which breaks the hashing operation
        return `{token}`;
      }
      return value;
    },
    2
  );
}
