import { AggregationPipelineBuilder } from '../lib/base/pipeline-builder';
import mongoose from 'mongoose';
import { UserSchema } from '../shared/schema';

const User = mongoose.model('User', UserSchema);

class UserPipeliner extends AggregationPipelineBuilder {
  listPaginated(filter: any, page: number, limit: number) {
    // Just return the pipeline with .assemble()
    return this.match(filter).paginate(page, limit).assemble();
  }

  listCount(filter: any) {
    // Just return the pipeline with .assemble()
    return this.match(filter).count('total').assemble();
  }
}

async function main() {
  // No model is provided here
  const pipeliner = new UserPipeliner();

  const list_pipeline = pipeliner.listPaginated({ name: 'John' }, 1, 10);
  const list_count_pipeline = pipeliner.listCount({ name: 'John' });

  console.log('List pipeline: ', list_pipeline);
  console.log('List count pipeline : ', list_count_pipeline);

  //   Manage aggregation pipeline execution on your own
  const list = await User.aggregate(list_pipeline).exec();
  const list_count = await User.aggregate(list_count_pipeline).exec();

  console.log('List: ', list);
  console.log('List count: ', list_count);
}

main();
