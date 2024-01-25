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

export interface IAggregationPipelineBuilder extends IProtoPipelineBuilder {
  // pipeline: PipelineStage[];
  // collection?: Model<T>;

  /**
   * Filters the documents to pass only
   * those that match the specified conditions.
   *
   * @param match - The query in the $match stage
   *
   */
  match(match: { [k: string]: any }): void;

  /**
   * Groups documents by some specified key
   * and can perform various aggregate
   * operations such as adding, counting,
   * obtaining averages, etc.
   *
   * @param group - The query in the $group stage
   *
   */
  group(group: { _id: string; [k: string]: any }): void;

  /**
   * Sort documents by one or more fields.
   *
   * @param sort - The query in the $sort stage
   *
   */
  sort(sort: { [k: string]: 1 | -1 }): void;

  /**
   * Limits the number of documents passed
   * to the next stage in the pipeline.
   *
   * @param {number} limit - The query in the $limit stage
   *
   */
  limit(limit: number): void;

  /**
   * Skips over a specified number of documents
   * and passes the remaining documents
   * to the next stage in the pipeline.
   *
   * @param {number} skip - The query in the $skip stage
   *
   */
  skip(skip: number): void;

  /**
   * Adds new fields to documents.
   *
   * @param payload - The query in the $set stage
   *
   */
  set(payload: { [k: string]: any }): void;

  /**
   * Removes/excludes fields from documents.
   *
   * @param {string | string[]} prop - The query in the $unset stage
   *
   */
  unset(prop: string | string[]): void;

  /**
   * Reshapes each document in the stream,
   * such as by adding new fields or removing existing fields.
   *
   * @param projection - The query in the $project stage
   *
   */
  project(projection: { [k: string]: any }): void;

  /**
   * Counts the number of documents input to the stage.
   *
   * @param {string} count - The query in the $count stage
   *
   */
  count(count: string): void;

  /**
   * Writes the resulting documents of the aggregation pipeline
   * to a collection. The stage can incorporate the results
   * into an existing collection or write to a new collection.
   *
   * @param {string} collectionName - The query in the $out stage
   */
  out(collectionName: string): void;
}

export interface ILookupStageParams {
  from: string;
  localField: string;
  foreignField: string;
  as: string;
}

export interface ICustomLookupStageParams {
  collectionName: string;
  localField: string;
  matchExpression?: { [k: string]: any };
  projection?: { [k: string]: any };
  as: string;
}

export interface IDetailedAggregationPipelineBuilder extends IAggregationPipelineBuilder {
  /**
   * Perform a join with another collection.
   * It can be used to combine documents from two collections.
   *
   * @param params - The query in the $lookup stage
   */
  lookup(params: ILookupStageParams): void;

  /**
   * Process a set of input documents in multiple different ways,
   * all in a single aggregation stage.
   *
   * @param params - The query in the $lookup stage
   */
  facet(params: { [k: string]: any }): void;

  customLookup(params: ICustomLookupStageParams): void;

  customUnwindLookup(params: ICustomLookupStageParams): void;

  /**
   * Builds a pipeline that will paginate the results
   * according to a limit and page number (skip).
   *
   * @param limit
   * @param page
   */
  paginate(limit: number, page: number): void;
}
