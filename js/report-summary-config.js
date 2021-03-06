import { v4 as uuid } from 'uuid';
import { STRATEGY } from './report-strategy';

/**
 * Configuration for a report summary.
 */
export default class ReportSummaryConfig {
  /**
   * Creates a new `ReportSummaryConfig` object with property values copied from another object.
   *
   * @param {Object} other - the object to copy property values from.
   * @return {ReportSummaryConfig} a new object with the same property values
   */
  static fromObject(other) {
    const { id, title, reportId, strategy, bucketBy, reportExists } = other;
    return new ReportSummaryConfig(id, title, reportId, strategy, bucketBy, reportExists);
  }

  /**
   *
   * @param {String} id - optional. Defaults to generating a new UUID.
   * @param {String} title - optional report summary title. Defaults to an empty string.
   * @param {Number} reportId - optional report ID. Defaults to null.
   * @param {String} strategy - optional report summary strategy. Should be one of the
   *   constants from `report-strategy.js`. Defaults to STRATEGY.TOTAL.
   * @param {String} bucketBy - field to bucket itemized counts by. Only valid when `strategy`
   *   is `STRATEGY.ITEMIZED`. Defaults to null.
   * @param {Boolean} reportExists - `true` if the report exists, otherwise `false` indicating
   *   the report is inaccessible or deleted.
   */
  constructor(id, title, reportId, strategy, bucketBy, reportExists) {
    this.id = id || uuid();
    this.title = title || '';
    this.reportId = reportId || null;
    this.strategy = strategy || STRATEGY.TOTAL;
    this.bucketBy = bucketBy || null;
    this.reportExists = reportExists || false;
  }
}