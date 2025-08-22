import { strict as assert } from 'assert';
import { Construct } from 'constructs';

/**
 * Allows you to control how many resources can be deployed at once
 * Use this to slow down your deploy and avoid AWS API Throttling
 * If you get an `internal error`, you may want to reduce parallelism
 *
 * Note: this creates a CDK dependency chain between resources in the same chunk.
 *
 * @param constructs
 * @param parallelism default 2, use 1 for sequential
 */
export const throttleDeploy = (
  constructs: Construct[],
  parallelism = 2
): void => {
  assert(parallelism > 0);

  // Create resource chunks which will be deployed sequentially
  const chunkSize = Math.ceil(constructs.length / parallelism);
  for (let i = 0; i < constructs.length; i += chunkSize) {
    const chunk = constructs.slice(i, i + chunkSize);
    // console.log({ chunk: chunk.length });
    chunk.forEach((resource, index) => {
      if (index > 0) {
        const previous = chunk[index - 1];
        // console.log({ current: resource.node.id, previous: previous.node.id });
        resource.node.addDependency(previous);
      }
    });
  }
};
