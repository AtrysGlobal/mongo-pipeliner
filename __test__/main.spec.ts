import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { UserSchema } from '../shared/schema';
import { AggregationPipelineBuilder } from '../lib/base/pipeline-builder';
import { readFileSync } from 'fs';

describe('Mongo Pipeliner Main Tests', () => {
  let mongoServer: MongoMemoryServer;
  let mockElements: any[] = [];
  let User: mongoose.Model<any>;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    try {
      await mongoose.connect(uri);
      User = mongoose.model('User', UserSchema);
      const users = JSON.parse(readFileSync('./__test__/dump.json', 'utf8'));
      await User.insertMany(users);
      mockElements = users;
    } catch (error) {
      console.error('Failed to perform connection to MongoDB: ', error);
    }
  });

  after(async () => {
    try {
      await mongoose.disconnect();
      await mongoServer.stop();
    } catch (error) {
      console.error('Failed to disconnect from MongoDB: ', error);
    }
  });

  it('Pipeline count operator return output as expected', async () => {
    const pipeliner = new AggregationPipelineBuilder(User);

    const countResult = await pipeliner.match({ is_verified: true }).count('total').execute();
    console.log('Result: ', countResult);

    expect(countResult).to.be.an('array');
    expect(countResult).to.have.lengthOf(1);
    expect(countResult[0]).to.have.property('total');
    expect(countResult[0].total).to.equal(mockElements.filter((e) => e.is_verified).length);
  });

  it('Complex pipeline have expected structure', () => {
    const expectedPipeline = [
      { $match: { is_verified: true } },
      {
        $lookup: {
          from: 'bookings',
          let: { bookingId: '$bookingId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$bookingId'] } } },
            { $project: { _id: 0, name: 1, date: 1 } },
          ],
          as: 'bookings',
        },
      },
      { $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true } },
      { $group: { _id: 'gender', total: { $sum: 1 } } },
      { $set: { total: '$total' } },
      { $unset: '_id' },
    ];

    const pipeliner = new AggregationPipelineBuilder();
    const result = pipeliner
      .match({ is_verified: true })
      .customUnwindLookup({
        collectionName: 'bookings',
        localField: 'bookingId',
        as: 'bookings',
        matchExpression: { $eq: ['$_id', '$$bookingId'] },
        projection: { _id: 0, name: 1, date: 1 },
      })
      .group({ _id: 'gender', total: { $sum: 1 } })
      .set({ total: '$total' })
      .unset('_id')
      .assemble();

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(expectedPipeline.length);
    expect(result).to.deep.equal(expectedPipeline);
  });

  //Write another test for this
  it('Pipeline with pagination return filtered elements as expected', async () => {
    const pipeliner = new AggregationPipelineBuilder(User);

    const paginatedResult = await pipeliner.match({ is_verified: true }).paginate(10, 1).execute();

    expect(paginatedResult).to.be.an('array');
    expect(paginatedResult).to.have.lengthOf(10);
    expect(paginatedResult[0]).to.have.property('is_verified');
    expect(paginatedResult[0].is_verified).to.be.true;
  });
});
