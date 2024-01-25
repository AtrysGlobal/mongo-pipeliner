import {
  ICustomLookupStageParams,
  IDetailedAggregationPipelineBuilder,
  ILookupStageParams,
} from '../interfaces/pipeline-builder';
import { Model, PipelineStage } from 'mongoose';

/**
 * A class that helps you build aggregation pipelines.
 * It can be used in two ways:
 *
 * 1. Extending this class and defining your own methods
 * 2. Using the methods directly and managing the pipeline on your own
 *
 * @class
 * @implements {IDetailedAggregationPipelineBuilder}
 *
 * @example
 *
 * import { AggregationPipelineBuilder } from '../lib/base/pipeline-builder';
 * import mongoose from 'mongoose';
 * import { UserSchema } from '../shared/schema';
 *
 * const User = mongoose.model('User', UserSchema);
 *
 * class UserPipeliner extends AggregationPipelineBuilder {
 *  listPaginated(filter: any, page: number, limit: number) {
 *   return this.match(filter).paginate(page, limit).execute();
 *  }
 * }
 *
 */
export class AggregationPipelineBuilder implements IDetailedAggregationPipelineBuilder {
  protected pipeline: PipelineStage[];
  protected collection?: Model<any>;

  constructor(collection?: Model<any>, pipeline?: PipelineStage[]) {
    this.pipeline = pipeline || [];
    this.collection = collection;
  }

  /**
   * Filters the documents to pass only
   * those that match the specified conditions.
   *
   * @param match - The query in the $match stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  match(match: { [k: string]: any }): AggregationPipelineBuilder {
    this.pipeline.push({ $match: match });
    return this;
  }

  /**
   * Groups documents by some specified key
   * and can perform various aggregate
   * operations such as adding, counting,
   * obtaining averages, etc.
   *
   * @param group - The query in the $group stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  group(group: { _id: string; [k: string]: any }): AggregationPipelineBuilder {
    this.pipeline.push({ $group: group });
    return this;
  }

  /**
   * Sort documents by one or more fields.
   *
   * @param {*} sort - The query in the $sort stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  sort(sort: { [k: string]: 1 | -1 }): AggregationPipelineBuilder {
    this.pipeline.push({ $sort: sort });
    return this;
  }

  /**
   * Limits the number of documents passed
   * to the next stage in the pipeline.
   *
   * @param {number} limit - The query in the $limit stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  limit(limit: number): AggregationPipelineBuilder {
    this.pipeline.push({ $limit: limit });
    return this;
  }

  /**
   * Skips over a specified number of documents
   * and passes the remaining documents
   * to the next stage in the pipeline.
   *
   * @param {number} skip - The query in the $skip stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  skip(skip: number): AggregationPipelineBuilder {
    this.pipeline.push({ $skip: skip });
    return this;
  }

  /**
   * Adds new fields to documents.
   *
   * @param {*} payload - The query in the $set stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  set(payload: { [k: string]: any }): AggregationPipelineBuilder {
    this.pipeline.push({ $set: payload });
    return this;
  }

  /**
   * Removes/excludes fields from documents.
   *
   * @param {string | string[]} prop - The query in the $unset stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  unset(prop: string | string[]): AggregationPipelineBuilder {
    this.pipeline.push({ $unset: prop });
    return this;
  }

  /**
   * Reshapes each document in the stream,
   * such as by adding new fields or removing existing fields.
   *
   * @param {*} projection - The query in the $project stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  project(projection: { [k: string]: any }): AggregationPipelineBuilder {
    this.pipeline.push({ $project: projection });
    return this;
  }

  /**
   * Counts the number of documents input to the stage.
   *
   * @param {string} count - The query in the $count stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  count(count: string): AggregationPipelineBuilder {
    this.pipeline.push({ $count: count });
    return this;
  }

  /**
   * Process a set of input documents in multiple different ways,
   * all in a single aggregation stage.
   *
   * @param params - The query in the $lookup stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  facet(params: { [k: string]: any }): AggregationPipelineBuilder {
    this.pipeline.push({ $facet: params });
    return this;
  }

  /**
   * Writes the resulting documents of the aggregation pipeline
   * to a collection. The stage can incorporate the results
   * into an existing collection or write to a new collection.
   *
   * @param {string} collectionName - The query in the $out stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  out(collectionName: string): AggregationPipelineBuilder {
    this.pipeline.push({ $out: collectionName });
    return this;
  }

  /**
   * Perform a join with another collection.
   * It can be used to combine documents from two collections.
   *
   * @param {string} from - Collection to join
   * @param {string} localField - Field from the input documents
   * @param {string} foreignField - Field from the documents of the "from" collection
   * @param {string} as - Name of the new array field to add to the input documents
   * @returns {AggregationPipelineBuilder}
   *
   */
  lookup(params: ILookupStageParams): AggregationPipelineBuilder {
    this.pipeline.push({
      $lookup: {
        from: params.from,
        localField: params.localField,
        foreignField: params.foreignField,
        as: params.as,
      },
    });
    return this;
  }

  /**
   * Perform a join with another collection.
   * It can be used to combine documents from two collections.
   * This method allows you to specify a custom pipeline
   * to execute on the joined collection.
   *
   * @param {string} collectionName - Collection to join
   * @param {string} localField - Field from the input documents
   * @param {string} matchExpression - Filter condition for the documents of the "from" collection
   * @param {string} projection - Specifies the fields to return in the documents of the "from" collection
   * @param {string} as - Name of the new array field to add to the input documents
   * @returns {AggregationPipelineBuilder}
   *
   * @example
   *
   * const pipeliner = new AggregationPipelineBuilder();
   * const result = pipeliner
   *  .customLookup({
   *    collectionName: 'bookings',
   *    localField: 'bookingId',
   *    matchExpression: { $eq: ['$_id', '$$bookingId'] },
   *    projection: { _id: 0, name: 1, date: 1 },
   *    as: 'bookings',
   * })
   */
  customLookup(params: ICustomLookupStageParams): AggregationPipelineBuilder {
    const lookup_pipeline: any[] = [];

    if (params.matchExpression) {
      lookup_pipeline.push({ $match: { $expr: params.matchExpression } });
    }
    if (params.projection) {
      lookup_pipeline.push({ $project: params.projection });
    }

    this.pipeline.push({
      $lookup: {
        from: params.collectionName,
        let: { [params.localField]: `$${params.localField}` },
        pipeline: lookup_pipeline,
        as: params.as,
      },
    });

    return this;
  }

  /**
   * Perform a join with another collection.
   * It can be used to combine documents from two collections.
   * This method allows you to specify a custom pipeline
   * to execute on the joined collection.
   *
   * It also unwind the joined collection automatically.
   *
   *
   * @param {string} collectionName - Collection to join
   * @param {string} localField - Field from the input documents
   * @param {string} matchExpression - Filter condition for the documents of the "from" collection
   * @param {string} projection - Specifies the fields to return in the documents of the "from" collection
   * @param {string} as - Name of the new array field to add to the input documents
   * @returns {AggregationPipelineBuilder}
   *
   * @example
   *
   * const pipeliner = new AggregationPipelineBuilder();
   * const result = pipeliner
   *  .customUnwindLookup({
   *    collectionName: 'bookings',
   *    localField: 'bookingId',
   *    matchExpression: { $eq: ['$_id', '$$bookingId'] },
   *    projection: { _id: 0, name: 1, date: 1 },
   *    as: 'bookings',
   * })
   */
  customUnwindLookup(params: ICustomLookupStageParams): AggregationPipelineBuilder {
    this.customLookup(params);
    this.pipeline.push({ $unwind: { path: `$${params.as}`, preserveNullAndEmptyArrays: true } });
    return this;
  }

  /**
   * Builds a pipeline that will paginate the results
   * according to a limit and page number (skip).
   *
   * @param {number} limit - The query in the $limit stage
   * @param {number} page - The query in the $skip stage
   * @returns {AggregationPipelineBuilder}
   */
  paginate(limit: number = 10, page: number = 1): AggregationPipelineBuilder {
    this.pipeline.push({ $skip: limit * (page - 1) });
    this.pipeline.push({ $limit: limit });
    return this;
  }

  /**
   * Performs aggregation using the specified
   * aggregation pipeline.
   *
   * @param params - The query in the $lookup stage
   * @returns {Promise<any[]>}
   *
   */
  async execute(): Promise<any[]> {
    if (!this.collection) {
      throw new Error('No collection defined for this AggregationBuilder.');
    }
    return this.collection.aggregate(this.pipeline).exec();
  }

  /**
   * Returns the aggregation pipeline.
   * If reset is true, the pipeline will be reseted.
   * Otherwise, it will keep the pipeline.
   *
   * @param {boolean} reset - If true, the pipeline will be reseted
   * @returns {PipelineStage[]} - The aggregation pipeline
   *
   */
  assemble(reset: boolean = true): PipelineStage[] {
    const pipeline = this.pipeline;
    if (reset) {
      this.reset();
    }
    return pipeline;
  }

  /**
   * Resets the aggregation pipeline.
   * @returns {void}
   *
   */
  reset(): void {
    this.pipeline = [];
  }
}
