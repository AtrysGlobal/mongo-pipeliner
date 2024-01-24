import {
  ICustomLookupStageParams,
  IDetailedAggregationPipelineBuilder,
  ILookupStageParams,
} from '../interface/pipeline-builder';
import { Document, Model, PipelineStage } from 'mongoose';

export class AggregationPipelineBuilder implements IDetailedAggregationPipelineBuilder {
  protected pipeline: PipelineStage[];
  protected collection?: Model<any>;

  constructor(collection?: Model<any>, pipeline?: PipelineStage[]) {
    this.pipeline = pipeline || [];
    this.collection = collection;
  }

  match(match: { [k: string]: any }): AggregationPipelineBuilder {
    this.pipeline.push({ $match: match });
    return this;
  }

  // Añade un paso $group al pipeline
  group(group: { _id: string; [k: string]: any }): AggregationPipelineBuilder {
    this.pipeline.push({ $group: group });
    return this;
  }

  sort(sort: { [k: string]: 1 | -1 }): AggregationPipelineBuilder {
    this.pipeline.push({ $sort: sort });
    return this;
  }

  limit(limit: number) {
    this.pipeline.push({ $limit: limit });
    return this;
  }

  skip(skip: number) {
    this.pipeline.push({ $skip: skip });
    return this;
  }

  set(payload: { [k: string]: any }) {
    this.pipeline.push({ $set: payload });
    return this;
  }

  unset(prop: string | string[]) {
    this.pipeline.push({ $unset: prop });
    return this;
  }

  project(projection: { [k: string]: any }) {
    this.pipeline.push({ $project: projection });
    return this;
  }

  count(count: string) {
    this.pipeline.push({ $count: count });
    return this;
  }

  facet(params: { [k: string]: any }) {
    this.pipeline.push({ $facet: params });
    return this;
  }

  out(collectionName: string) {
    this.pipeline.push({ $out: collectionName });
    return this;
  }

  lookup(params: ILookupStageParams) {
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

  customLookup(params: ICustomLookupStageParams) {
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
        let: { localField: `$${params.localField}` },
        pipeline: lookup_pipeline,
        as: params.as,
      },
    });

    return this;
  }
  customUnwindLookup(params: ICustomLookupStageParams) {
    this.customLookup(params);
    this.pipeline.push({ $unwind: { path: `$${params.as}`, preserveNullAndEmptyArrays: true } });
    return this;
  }

  paginate(limit: number = 10, page: number = 1) {
    this.pipeline.push({ $skip: limit * (page - 1) });
    this.pipeline.push({ $limit: limit });
    return this;
  }

  // Ejecuta el pipeline de agregación
  async execute() {
    if (!this.collection) {
      throw new Error('No collection defined for this AggregationBuilder.');
    }
    return this.collection.aggregate(this.pipeline).exec();
  }

  // Método para obtener el pipeline actual (útil para depuración)
  assemble(reset: boolean = true): PipelineStage[] {
    const pipeline = this.pipeline;
    if (reset) {
      this.reset();
    }
    return pipeline;
  }

  reset(): void {
    this.pipeline = [];
  }
}
