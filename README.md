# Mongoose Aggregation Pipeline Builder

![Repository Header](./media/repository_header.png)

As aggregation queries become increasingly complex, maintaining and understanding these structures can become challenging. This package addresses this issue by providing a fluid and flexible interface for building aggregation pipelines.

`mongoose-pipeliner` offers a class and interface that can be used as an aggregation pipeline builder or extended to construct a customized builder. This tool is intended to significantly simplify the process of building and maintaining complex aggregation queries.

## Features

- Simplification of Complex Queries: Facilitates the construction of complex aggregation pipelines.
- Design Patterns: Implements Builder and Template patterns for enhanced flexibility.
- Function Chaining: Enables a more readable and maintainable query building approach.
- Aggregation Operations: Supports all basic MongoDB aggregation operations and some advanced ones like lookup, set, unset, unwind, etc.
- Customization and Extensibility: Allows users to extend and customize the builder according to their specific needs.

## Installation

```bash
npm install mongoose-pipeliner
```

## Usage

Inject pipeline stages using the builder's methods. The builder will automatically add the stages to the pipeline in the order they are injected.

```typescript
const { User } from './models';
const { AggregationPipelineBuilder } from 'mongoose-pipeliner';

const builder = new AggregationPipelineBuilder();

builder.filter({ status: 'active' }).project({ name: 1, status: 1 }).limit(10);

const pipeline = builder.assemble();

// Use your pipeline with your Mongoose model
User.aggregation(pipeline).exec((err, result) => {
  // ...
});
```

You can perform aggregation operations directly from builder class.

```typescript
const { User } from './models';
const { AggregationPipelineBuilder } from 'mongoose-pipeliner';

const builder = new AggregationPipelineBuilder(User);
builder.filter({ status: 'active' }).project({ name: 1, status: 1 }).limit(10);

const result = await builder.execute();

```

## Implementation Strategies

Some useful implementation strategies to implement a `pipeline-builder` is to group operations that can be reused by multiple components or services through the template class strategy or inheritance.

```ts
import { AggregationPipelineBuilder } from 'mongoose-pipeliner';
import { User } from './models';

class MyCustomUserPipelineBuilder extends AggregationPipelineBuilder {
  myCustomOperation() {
    return this.filter({ status: 'active' }).project({ name: 1, status: 1 }).limit(10).skip().execute();
  }
}

// Use your pipeline with your Mongoose model

const result = await new MyCustomUserPipelineBuilder(User).myCustomOperation();
```

or

```ts
import { AggregationPipelineBuilder } from 'mongoose-pipeliner';
import { User } from './models';

class MyCustomUserPipelineBuilder extends AggregationPipelineBuilder {
  searchActive() {
    return this.filter({ status: 'active' }).project({ name: 1, status: 1 });
  }

  searchInactive() {
    return this.filter({ status: 'inactive' }).project({ name: 1, status: 1 });
  }

  standardPagination(limit: number = 10, page: number = 1) {
    return this.paginate(limit, page);
  }
}

// Use your pipeline with your Mongoose model

const builder = await new MyCustomUserPipelineBuilder(User);
const first_search = builder.searchActive().standardPagination(10, 2).execute();
const second_search = builder.searchInactive().standardPagination(10, 2).execute();
```

Or simply define a `pipeline-builder` as part of a utility class, service or component
that can be consumed or implemented throughout your application.

```ts
import { AggregationPipelineBuilder } from 'mongoose-pipeliner';
import { User } from './models';

/**
 * @description Provide custom pipelines to be injected
 * in some aggregation pipeline repository
 */
class UserPipelineProvider {
  protected static builder = new AggregationPipelineBuilder(User);

  static activePipeline() {
    return builder.filter({ status: 'active' }).project({ name: 1, status: 1 }).assemble();
  }

  static inactivePipeline() {
    return builder.filter({ status: 'inactive' }).project({ name: 1, status: 1 }).assemble();
  }

  static someComplexPipeline() {
    return [].concat(this.activePipeline() /* my custom proxy pipeline */);
  }
}

// Implement the provider class

class UserRepository {
  async findActiveUsers() {
    return User.aggregation(UserPipelineProvider.activePipeline()).exec();
  }

  async findInactiveUsers() {
    return User.aggregation(UserPipelineProvider.inactivePipeline()).exec();
  }

  async findSomeComplexUsers() {
    return User.aggregation(UserPipelineProvider.someComplexPipeline()).exec();
  }
}
```

## Contributing

Contributions are welcome. If you have ideas for improving this package, please read our contribution guide.

1. Fork the repository.
2. Create a new branch for each feature or improvement.
3. Submit a pull request with your changes.

## License

This project is licensed under MIT License - [Visit the license document](./LICENSE) file for details.
