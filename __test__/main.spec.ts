import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { UserSchema } from '../shared/schema';
import { AggregationPipelineBuilder } from '../lib/pipeline-builder';
import { readFileSync } from 'fs';

describe('Mongo Pipeliner Main Tests', () => {
  let mongoServer: MongoMemoryServer;
  let mockElements: any[] = [];
  let User: mongoose.Model<any>;

  beforeEach(async () => {
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

  afterEach(async () => {
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

    expect(Array.isArray(countResult)).toBeTruthy();
    expect(countResult.length).toEqual(1);
    expect(countResult[0]).toHaveProperty('total');
    expect(countResult[0].total).toEqual(mockElements.filter((e) => e.is_verified).length);
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

    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toEqual(expectedPipeline.length);
    expect(result).toEqual(expectedPipeline);
  });

  it('Custom Lookup pipeline with alias have expected structure', () => {
    const expectedPipeline = [
      {
        $lookup: {
          from: 'bookings',
          let: { bookingId: '$bookingData.refId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$bookingId'] } } },
            { $project: { _id: 0, name: 1, date: 1 } },
          ],
          as: 'bookings',
        },
      },
      { $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true } },
    ];

    const pipeliner = new AggregationPipelineBuilder<any>();
    const result = pipeliner
      .customUnwindLookup({
        collectionName: 'bookings',
        localField: {
          ref: 'bookingData.refId',
          alias: 'bookingId',
        },
        as: 'bookings',
        matchExpression: { $eq: ['$_id', '$$bookingId'] },
        projection: { _id: 0, name: 1, date: 1 },
      })
      .assemble();

    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toEqual(expectedPipeline.length);
    expect(result).toEqual(expectedPipeline);
  });

  //Write another test for this
  it('Pipeline with pagination return filtered elements as expected', async () => {
    const pipeliner = new AggregationPipelineBuilder(User);

    const paginatedResult = await pipeliner.match({ is_verified: true }).paginate(10, 1).execute();

    expect(Array.isArray(paginatedResult)).toBeTruthy();
    expect(paginatedResult.length).toEqual(10);
    expect(paginatedResult[0]).toHaveProperty('is_verified');
    expect(paginatedResult[0].is_verified).toBeTruthy();
  });

  it('Pipeline builder heritage works as expected', async () => {
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

    class CustomBuilder extends AggregationPipelineBuilder<CustomBuilder> {
      constructor(model: mongoose.Model<any>) {
        super(model);
      }

      public firstStep(): CustomBuilder {
        return this.match({ is_verified: true })
          .customUnwindLookup({
            collectionName: 'bookings',
            localField: 'bookingId',
            as: 'bookings',
            matchExpression: { $eq: ['$_id', '$$bookingId'] },
            projection: { _id: 0, name: 1, date: 1 },
          })
          .group({ _id: 'gender', total: { $sum: 1 } });
      }

      public secondStep(): CustomBuilder {
        return this.set({ total: '$total' }).unset('_id');
      }
    }

    const pipeliner = new CustomBuilder(User);
    const result = pipeliner.firstStep().secondStep().assemble();

    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toEqual(expectedPipeline.length);
    expect(result).toEqual(expectedPipeline);
  });

  it('AddFields and merge operators are built as expected.', () => {
    const expectedPipeline = [
      { $addFields: { newField: 'myvalue' } },
      {
        $merge: {
          into: { db: 'sharded_db1', coll: 'sharded_coll1' },
          whenMatched: 'keepExisting',
          whenNotMatched: 'insert',
        },
      },
    ];

    const pipeliner = new AggregationPipelineBuilder();
    const result = pipeliner
      .addFields({ newField: 'myvalue' })
      .merge({
        into: { db: 'sharded_db1', coll: 'sharded_coll1' },
        whenMatched: 'keepExisting',
        whenNotMatched: 'insert',
      })
      .assemble();

    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toEqual(expectedPipeline.length);
    expect(result).toEqual(expectedPipeline);
  });
});
