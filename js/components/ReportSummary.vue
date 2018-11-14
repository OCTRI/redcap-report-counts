<template>
  <div class="card mb-3 report-summary" :data-index="index">
    <div class="card-body">
      <div class="container">
        <h3 class="card-title mb-0">{{ totalRecords }} - {{ title }}</h3>
        <div class="summary-controls mb-3">
          <a class="delete" v-if="canDelete" @click="deleteSummary">Delete <i class="far fa-trash-alt"></i></a>
        </div>
        <ul v-if="isItemized" class="list-unstyled">
          <li v-for="summary in sortedSummaryCounts" :key="summary.label">{{ summary.count }} - {{ summary.label }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import countBy from 'lodash/countBy';
import orderBy from 'lodash/orderBy';
import isString from 'lodash/isString';
import { MISSING } from '../constants';
import { STRATEGY } from '../report-strategy';

/**
 * Renders report summary.
 */
export default {
  name: 'ReportSummary',

  props: {
    index: Number,
    title: String,
    totalRecords: Number,
    strategy: String,
    summaryData: Array
  },

  methods: {
    /**
     * Emit deleteSummary event.
     */
    deleteSummary() {
      if (confirm('Permanently delete this summary?')) {
        this.$emit('deleteSummary', this.index);
      }
    },

    /**
     * Checks if the user has permission to delete a report summary.
     * @return true if the user has permission to delete a report summary.
     */
    canDelete() {
      // TODO: implement REDDEV-595
      return true;
    },

    /**
     * Checks a value to determine if it is missing. A value is missing
     * if it is not a string, or the string is of zero length.
     * @param String value - The label for a field value.
     * @return true if the value is missing
     */
    missingValue(value) {
      return !isString(value) || !value.trim();
    }
  },

  computed: {
    /**
     * @return true if the summary contains an itemized count.
     */
    isItemized() {
      return this.strategy === STRATEGY.ITEMIZED;
    },

    /**
     * Checks summaryData for missing values.
     * @return true if summaryData contains a missing value.
     */
    hasMissingValue() {
      return this.summaryData.some(val => this.missingValue(val));
    },

    /**
     * Inserts MISSING value if empty.
     * @return summaryData with empty values replaced by MISSING
     */
    summaryDataWithMissing() {
      return this.hasMissingValue ? this.summaryData.map(summary => {
        return this.missingValue(summary) ? MISSING : summary;
      }) : this.summaryData;
    },

    /**
     * Sum distinct summary data values and build an object of the form: `{ "field value": totalCount, "another value": anotherTotal }`
     * @return object with value and corresponding count
     */
    summaryCounts() {
      return countBy(this.summaryDataWithMissing);
    },

    /**
     * Transform summaryCounts into an array of the form: `[{ label: 'foo', count: 42 }, ...]`
     * @return an array of objects where each object has a label and a count.
     */
    mappedSummaryCounts() {
      const { summaryCounts } = this;
      return Object.keys(summaryCounts)
        .map(key => ({ label: key, count: summaryCounts[key] }));
    },

    /**
     * Sort summaries by count descending, label ascending, and stick MISSING at the bottom if present.
     * @return array of ordered summary counts
     */
    sortedSummaryCounts() {
      const ordered = orderBy(this.mappedSummaryCounts, ['count', 'label'], ['desc', 'asc']);
      // Missing count should be at the bottom of the list.
      if (this.hasMissingValue) {
        const index = ordered.findIndex(elem => elem.label === MISSING);
        const missing = ordered.splice(index, 1);
        ordered.push(missing[0]);
      }
      return ordered;
    }
  }
}
</script>
