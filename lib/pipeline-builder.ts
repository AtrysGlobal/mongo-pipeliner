import {
  ICustomLookupStageParams,
  IDetailedAggregationPipelineBuilder,
  ILookupStageParams,
  IMergeStageParams,
} from './types';
import { Model, PipelineStage } from 'mongoose';

// export abstract class BaseAggregationPipelineBuilder {
//   match(match: { [k: string]: any }){
//     throw new Error("Method not implemented");

//   }
// }

export interface BaseAggregationPipelineBuilder extends AggregationPipelineBuilder {
  match(match: { [k: string]: any }): BaseAggregationPipelineBuilder;
  group(group: { _id: string; [k: string]: any }): BaseAggregationPipelineBuilder;
  sort(sort: { [k: string]: 1 | -1 }): BaseAggregationPipelineBuilder;
  limit(limit: number): BaseAggregationPipelineBuilder;
  skip(skip: number): BaseAggregationPipelineBuilder;
  set(payload: { [k: string]: any }): BaseAggregationPipelineBuilder;
  unset(prop: string | string[]): BaseAggregationPipelineBuilder;
  project(projection: { [k: string]: any }): BaseAggregationPipelineBuilder;
  count(count: string): BaseAggregationPipelineBuilder;
  facet(params: { [k: string]: any }): BaseAggregationPipelineBuilder;
  out(collectionName: string): BaseAggregationPipelineBuilder;
  lookup(params: ILookupStageParams): BaseAggregationPipelineBuilder;
  customLookup(params: ICustomLookupStageParams): BaseAggregationPipelineBuilder;
  customUnwindLookup(params: ICustomLookupStageParams): BaseAggregationPipelineBuilder;
  paginate(limit: number, page: number): BaseAggregationPipelineBuilder;

  addCustom(stage: PipelineStage): BaseAggregationPipelineBuilder;
  addFields(fields: { [k: string]: any }): BaseAggregationPipelineBuilder;
  unwind(path: string, preserveNullAndEmptyArrays: boolean): BaseAggregationPipelineBuilder;
  merge(params: IMergeStageParams): BaseAggregationPipelineBuilder;
  unionWith(collectionName: string, pipeline: any[]): BaseAggregationPipelineBuilder;

  execute(): Promise<any[]>;
  assemble(reset?: boolean): PipelineStage[];
  reset(): void;
}

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
export class AggregationPipelineBuilder<T extends BaseAggregationPipelineBuilder = BaseAggregationPipelineBuilder>
  implements IDetailedAggregationPipelineBuilder<T>
{
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
   * @returns {}
   *
   */
  match(match: { [k: string]: any }): T {
    this.pipeline.push({ $match: match });
    return this as unknown as T;
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
  group(group: { _id: string; [k: string]: any }): T {
    this.pipeline.push({ $group: group });
    return this as unknown as T;
  }

  /**
   * Sort documents by one or more fields.
   *
   * @param {*} sort - The query in the $sort stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  sort(sort: { [k: string]: 1 | -1 }): T {
    this.pipeline.push({ $sort: sort });
    return this as unknown as T;
  }

  /**
   * Limits the number of documents passed
   * to the next stage in the pipeline.
   *
   * @param {number} limit - The query in the $limit stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  limit(limit: number): T {
    this.pipeline.push({ $limit: limit });
    return this as unknown as T;
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
  skip(skip: number): T {
    this.pipeline.push({ $skip: skip });
    return this as unknown as T;
  }

  /**
   * Adds new fields to documents.
   *
   * @param {*} payload - The query in the $set stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  set(payload: { [k: string]: any }): T {
    this.pipeline.push({ $set: payload });
    return this as unknown as T;
  }

  /**
   * Removes/excludes fields from documents.
   *
   * @param {string | string[]} prop - The query in the $unset stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  unset(prop: string | string[]): T {
    this.pipeline.push({ $unset: prop });
    return this as unknown as T;
  }

  /**
   * Reshapes each document in the stream,
   * such as by adding new fields or removing existing fields.
   *
   * @param {*} projection - The query in the $project stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  project(projection: { [k: string]: any }): T {
    this.pipeline.push({ $project: projection });
    return this as unknown as T;
  }

  /**
   * Counts the number of documents input to the stage.
   *
   * @param {string} count - The query in the $count stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  count(count: string): T {
    this.pipeline.push({ $count: count });
    return this as unknown as T;
  }

  /**
   * Process a set of input documents in multiple different ways,
   * all in a single aggregation stage.
   *
   * @param params - The query in the $lookup stage
   * @returns {AggregationPipelineBuilder}
   *
   */
  facet(params: { [k: string]: any }): T {
    this.pipeline.push({ $facet: params });
    return this as unknown as T;
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
  out(collectionName: string): T {
    this.pipeline.push({ $out: collectionName });
    return this as unknown as T;
  }

  /**
   * Writes the resulting documents of the aggregation pipeline
   * to a collection. The stage can incorporate the results
   * into an existing collection or write to a new collection.
   *
   * IMPORTANT:
   *
   * - If the collection does not exist, the $merge stage creates the collection.
   * - If the collection does exist, the $merge stage combines the documents from the input
   * and the specified collection.
   *
   * @param {string} into           - Into which collection the results will be written
   * @param {string} on             - Optional. Field or fields that act as a unique identifier
   *                                  for a document.
   * @param {string} whenMatched    - Optional. The behavior of $merge if a result document and
   *                                  an existing document in the collection have the same value
   *                                  for the specified on field(s).
   * @param {string} whenNotMatched - Optional. The behavior of $merge if a result document does
   *                                  not match an existing document in the out collection.
   * @returns {AggregationPipelineBuilder}
   */
  merge(params: IMergeStageParams): T {
    this.pipeline.push({
      $merge: {
        into: params.into,
        on: params.on,
        whenMatched: params.whenMatched || 'merge',
        whenNotMatched: params.whenNotMatched || 'insert',
      },
    });
    return this as unknown as T;
  }

  /**
   * Performs a union of two collections. $unionWith combines pipeline results from two collections
   * into a single result set. The stage outputs the combined result set (including duplicates)
   * to the next stage.
   *
   * @param {string} collectionName - The name of the collection to union with
   * @param {any[]} pipeline        - The pipeline to execute on the unioned collection
   *
   * @returns {AggregationPipelineBuilder}
   */
  unionWith(collectionName: string, pipeline: any[]): T {
    this.pipeline.push({ $unionWith: { coll: collectionName, pipeline } });
    return this as unknown as T;
  }

  /**
   * Perform a join with another collection.
   * It can be used to combine documents from two collections.
   *
   * @param {string} from         - Collection to join
   * @param {string} localField   - Field from the input documents
   * @param {string} foreignField - Field from the documents of the "from" collection
   * @param {string} as           - Name of the new array field to add to the input documents
   * @returns {AggregationPipelineBuilder}
   *
   */
  lookup(params: ILookupStageParams): T {
    this.pipeline.push({
      $lookup: {
        from: params.from,
        localField: params.localField,
        foreignField: params.foreignField,
        as: params.as,
      },
    });
    return this as unknown as T;
  }

  /**
   * Deconstructs an array field from the input documents to output a document
   * for each element.
   * Each output document is the input document with the value of the array
   * field replaced by the element.
   *
   * @param {string} path                        - Path to unwind
   * @param {boolean} preserveNullAndEmptyArrays - If true, if the path is null or empty, it will be preserved
   * @returns {AggregationPipelineBuilder}
   */
  unwind(path: string, preserveNullAndEmptyArrays: boolean = false): T {
    this.pipeline.push({ $unwind: { path, preserveNullAndEmptyArrays } });
    return this as unknown as T;
  }

  /**
   * Adds new fields to documents. $addFields outputs documents that contain all
   * existing fields from the input documents and newly added fields.
   *
   * @param {object} fields - The fields to add
   * @returns {AggregationPipelineBuilder}
   */
  addFields(fields: { [k: string]: any }): T {
    this.pipeline.push({ $addFields: fields });
    return this as unknown as T;
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
   *
   * // In case you need to implement an alias for 'composed' localField
   * // Just ensure to use the 'alias' property in the matchExpression object
   *
   * const pipeliner = new AggregationPipelineBuilder();
   * const result = pipeliner
   * .customLookup({
   *  collectionName: 'authors',
   *  localField: {
   *    ref: 'author.refId',
   *    alias: 'authorId',
   *  },
   *  matchExpression: { $eq: ['$_id', '$$authorId'] },
   *  projection: { _id: 0, name: 1, date: 1 },
   *  as: 'author',
   * })
   *
   */
  customLookup(params: ICustomLookupStageParams): T {
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
        let: {
          [typeof params.localField === 'string' ? params.localField : params.localField.alias]:
            `$${typeof params.localField === 'string' ? params.localField : params.localField.ref}`,
        },
        pipeline: lookup_pipeline,
        as: params.as,
      },
    });

    return this as unknown as T;
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
   *
   * // In case you need to implement an alias for 'composed' localField
   * // Just ensure to use the 'alias' property in the matchExpression object
   *
   * const pipeliner = new AggregationPipelineBuilder();
   * const result = pipeliner
   * .customLookup({
   *  collectionName: 'authors',
   *  localField: {
   *    ref: 'author.refId',
   *    alias: 'authorId',
   *  },
   *  matchExpression: { $eq: ['$_id', '$$authorId'] },
   *  projection: { _id: 0, name: 1, date: 1 },
   *  as: 'author',
   * })
   *
   */
  customUnwindLookup(params: ICustomLookupStageParams): T {
    this.customLookup(params);
    this.pipeline.push({ $unwind: { path: `$${params.as}`, preserveNullAndEmptyArrays: true } });
    return this as unknown as T;
  }

  /**
   * Builds a pipeline that will paginate the results
   * according to a limit and page number (skip).
   *
   * @param {number} limit - The query in the $limit stage
   * @param {number} page - The query in the $skip stage
   * @returns {AggregationPipelineBuilder}
   */
  paginate(limit: number = 10, page: number = 1): T {
    this.pipeline.push({ $skip: limit * (page - 1) });
    this.pipeline.push({ $limit: limit });
    return this as unknown as T;
  }

  /**
   * Allows you to add a custom stage to the pipeline.
   *
   * NOTE: This method is not type-safe and should be used with caution.
   *
   * @param {PipelineStage} stage - The custom stage to add to the pipeline
   * @returns {AggregationPipelineBuilder}
   */
  addCustom(stage: PipelineStage): T {
    this.pipeline.push(stage);
    return this as unknown as T;
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
