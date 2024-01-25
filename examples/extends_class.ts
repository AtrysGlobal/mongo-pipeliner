import { AggregationPipelineBuilder } from '../lib/base/pipeline-builder';
import mongoose from 'mongoose';
import { UserSchema } from '../shared/schema';

const User = mongoose.model('User', UserSchema);

class UserPipeliner extends AggregationPipelineBuilder {
  listPaginated(filter: any, page: number, limit: number) {
    return this.match(filter).paginate(page, limit).execute();
  }

  listCount(filter: any) {
    return this.match(filter).count('total').execute();
  }
}

async function main() {
  const pipeliner = new UserPipeliner(User);

  const list = await pipeliner.listPaginated({ name: 'John' }, 1, 10);
  const list_count = await pipeliner.listCount({ name: 'John' });

  console.log('List: ', list);
  console.log('List count: ', list_count);
}

main();
