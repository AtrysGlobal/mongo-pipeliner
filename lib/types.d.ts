import { PipelineStage } from 'mongoose';

export interface IProtoPipelineBuilder {
  /**
   * Performs aggregation using the specified
   * aggregation pipeline.
   *
   * @param params - The query in the $lookup stage
   *
   */
  execute(): Promise<any>;

  /**
   * Returns the aggregation pipeline.
   *
   */
  assemble(): PipelineStage[];

  /**
   * Resets the aggregation pipeline.
   */
  reset(): void;
}

export interface IAggregationPipelineBuilder<T> extends IProtoPipelineBuilder {
  /**
   * Filters the documents to pass only
   * those that match the specified conditions.
   *
   * @param match - The query in the $match stage
   *
   */
  match(match: { [k: string]: any }): T;

  /**
   * Groups documents by some specified key
   * and can perform various aggregate
   * operations such as adding, counting,
   * obtaining averages, etc.
   *
   * @param group - The query in the $group stage
   *
   */
  group(group: { _id: string; [k: string]: any }): T;

  /**
   * Sort documents by one or more fields.
   *
   * @param sort - The query in the $sort stage
   *
   */
  sort(sort: { [k: string]: 1 | -1 }): T;

  /**
   * Limits the number of documents passed
   * to the next stage in the pipeline.
   *
   * @param {number} limit - The query in the $limit stage
   *
   */
  limit(limit: number): T;

  /**
   * Skips over a specified number of documents
   * and passes the remaining documents
   * to the next stage in the pipeline.
   *
   * @param {number} skip - The query in the $skip stage
   *
   */
  skip(skip: number): T;

  /**
   * Adds new fields to documents.
   *
   * @param {*} payload - The query in the $set stage
   *
   */
  set(payload: { [k: string]: any }): T;

  /**
   * Removes/excludes fields from documents.
   *
   * @param {string | string[]} prop - The query in the $unset stage
   *
   */
  unset(prop: string | string[]): T;

  /**
   * Reshapes each document in the stream,
   * such as by adding new fields or removing existing fields.
   *
   * @param projection - The query in the $project stage
   *
   */
  project(projection: { [k: string]: any }): T;

  /**
   * Counts the number of documents input to the stage.
   *
   * @param {string} count - The query in the $count stage
   *
   */
  count(count: string): T;

  /**
   * Writes the resulting documents of the aggregation pipeline
   * to a collection. The stage can incorporate the results
   * into an existing collection or write to a new collection.
   *
   * @param {string} collectionName - The query in the $out stage
   */
  out(collectionName: string): T;
}

export interface ILookupStageParams {
  from: string;
  localField: string;
  foreignField: string;
  as: string;
}

export interface ICustomLookupStageParams {
  collectionName: string;
  localField: { ref: string; alias: string } | string;
  matchExpression?: { [k: string]: any };
  projection?: { [k: string]: any };
  as: string;
}

export interface IDetailedAggregationPipelineBuilder<T> extends IAggregationPipelineBuilder<T> {
  /**
   * Perform a join with another collection.
   * It can be used to combine documents from two collections.
   *
   * @param params - The query in the $lookup stage
   */
  lookup(params: ILookupStageParams): T;

  /**
   * Process a set of input documents in multiple different ways,
   * all in a single aggregation stage.
   *
   * @param params - The query in the $lookup stage
   */
  facet(params: { [k: string]: any }): T;

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
  customLookup(params: ICustomLookupStageParams): T;

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
  customUnwindLookup(params: ICustomLookupStageParams): T;

  /**
   * Builds a pipeline that will paginate the results
   * according to a limit and page number (skip).
   *
   * @param {number} limit - The query in the $limit stage
   * @param {number} page - The query in the $skip stage
   *
   */
  paginate(limit: number, page: number): T;
}
