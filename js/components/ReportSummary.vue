<template>
  <div :id="model.id"
       class="card mb-3 report-summary"
       :draggable="draggable"
       @dragstart="onDragStart"
       @dragend="onDragEnd"
       @dragenter="onDragEnter"
       @dragover="onDragOver"
       @drop.prevent="onDrop">
    <div class="card-body">
      <div class="container">
        <div class="clearfix">
          <h3 class="card-title mb-1 float-left">{{ model.title }}</h3>
          <div class="drag-handle float-right text-muted"
               title="Drag to Reorder"
               v-if="securityConfig.hasReportsRights"
               @mousedown="enableDrag"
               @mouseup="disableDrag">
            <i class="fa fa-arrows-alt"></i>
          </div>
        </div>
        <div class="summary-controls mb-1" v-if="securityConfig.hasReportsRights">
          <a class="edit" @click="editSummary">Edit <i class="fa fa-edit"></i></a>
          <a class="delete" @click="deleteSummary">Delete <i class="far fa-trash-alt"></i></a>
        </div>
        <div v-if="editing && securityConfig.hasReportsRights" class="edit-form container">
          <ReportSummaryForm :hideFormTitle=true
                             :initial-state="model.config"
                             @reportSummarySaved="forwardUpdatedSummary"
                             @formCanceled="cancelEdit" />
        </div>
        <div v-if="showCounts">
          <ul class="summary-metadata lead list-unstyled mb-0">
            <li>Total Count: {{ model.totalRecords }}</li>
            <li :title="'Report id: ' + model.reportId">For Report: {{ model.reportTitle }}</li>
            <li v-if="isItemized" class="mt-0">Grouped By: {{ model.bucketByLabel }}</li>
          </ul>
          <ul v-if="isItemized" class="list-unstyled mt-3 mb-0" data-description="itemized-counts">
            <li v-for="summary in sortedSummaryCounts" :key="summary.label">{{ summary.count }} - {{ summary.label }}</li>
          </ul>
        </div>
        <div v-else class="mt-3">
          <div class="alert alert-danger" data-description="report-alert">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import countBy from 'lodash/countBy';
import orderBy from 'lodash/orderBy';
import isString from 'lodash/isString';

import ReportSummaryModel from '@/report-summary-model';
import { MISSING } from '@/constants';
import { STRATEGY } from '@/report-strategy';

import ReportSummaryForm from './ReportSummaryForm';

export const messages = {
  missingReport: 'The report used for this summary no longer exists.',
  missingBucketByField: 'The field used to group counts by no longer exists, has been renamed, or was removed from the report.'
};

/**
 * Renders report summary.
 */
export default {
  name: 'ReportSummary',

  components: {
    ReportSummaryForm
  },

  props: {
    model: ReportSummaryModel,
    securityConfig: Object
  },

  data() {
    return {
      draggable: false,
      editing: false
    };
  },

  methods: {
    /**
     * Emit deleteSummary event.
     */
    deleteSummary() {
      if (confirm('Permanently delete this summary?')) {
        this.$emit('summaryDeleted', this.model.id);
      }
    },

    /**
     * Emits the reportSummary event to notify the parent when the summary is edited.
     * @param {Object} reportSummary - report summary data returned from the server
     */
    forwardUpdatedSummary(reportSummary) {
      this.editing = false;
      this.$emit('reportSummaryUpdated', reportSummary);
    },

    /**
     * Hides the form when edit is canceled.
     */
    cancelEdit() {
      this.editing = false;
    },

    /**
     * Emit editSummary event.
     */
    editSummary() {
      this.editing = true;
      // this.$emit('editSummary', this.id);
    },

    /**
     * Checks a value to determine if it is missing. A value is missing
     * if it is not a string, or the string is of zero length.
     * @param String value - The label for a field value.
     * @return true if the value is missing
     */
    missingValue(value) {
      return !isString(value) || !value.trim();
    },

    /**
     * Enables dragging the element.
     */
    enableDrag() {
      this.draggable = true;
    },

    /**
     * Disables dragging the element.
     */
    disableDrag() {
      this.draggable = false;
    },

    /**
     * Handles the `dragstart` event, notifying the container that the user has started
     * reordering the summaries.
     */
    onDragStart() {
      const { id } = this.model;
      this.$emit('reorder-start', id);
    },

    /**
     * Handles the `dragenter` event. If this is the drop target, prevent default to allow
     * dropping the item. Otherwise reset the item that will be swapped.
     */
    onDragEnter(evt) {
      const { model, isDragging } = this;
      if (isDragging) {
        evt.preventDefault();
        this.$emit('reorder-swap-reset');
      } else {
        this.$emit('reorder-swap', model.id);
      }
    },

    /**
     * Handles the `dragover` event. If this is the drop target, prevent default to allow
     * dropping the item.
     */
    onDragOver(evt) {
      const { isDragging } = this;
      if (isDragging) {
        evt.preventDefault();
      }
    },

    /**
     * Handles the `drop` event, notifying the container that the reorder is complete.
     */
    onDrop(evt) {
      this.$emit('reorder-end');
    },

    /**
     * Handles the `dragend` event, notifying the container if the reorder was canceled.
     */
    onDragEnd(evt) {
      const { dataTransfer } = evt;
      this.disableDrag();
      if (dataTransfer.dropEffect === 'none') {
        this.$emit('reorder-cancel');
      }
    }
  },

  computed: {
    /**
     * @return true if the summary contains an itemized count.
     */
    isItemized() {
      return this.model.strategy === STRATEGY.ITEMIZED;
    },

    /**
     * @return true if the count is itemized and the bucket by field exists.
     */
    canItemize() {
      const { model } = this;
      return this.isItemized && model.bucketByFieldExists && model.bucketByExistsOnReport;
    },

    /**
     * @return true if the summary is being dragged.
     */
    isDragging() {
      return this.draggable;
    },

    /**
     * Checks data for missing values.
     * @return true if data contains a missing value.
     */
    hasMissingValue() {
      return this.model.data && this.model.data.some(this.missingValue);
    },

    /**
     * Inserts MISSING value if empty.
     * @return data with empty values replaced by MISSING
     */
    summaryDataWithMissing() {
      return this.hasMissingValue ? this.model.data.map(summary => {
        return this.missingValue(summary) ? MISSING : summary;
      }) : this.model.data;
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
    },

    /**
     * @return true if itemized counts should be shown
     */
    showItemizedCounts() {
      return this.canItemize;
    },

    /**
     * @return true if the configured report exists
     */
    reportExists() {
      const { model } = this;
      return model.reportExists;
    },

    /**
     * @return true if the configuration for bucketing is valid - the field has not been renamed or deleted
     */
    validBucketByConfig() {
      return !this.isItemized || this.canItemize;
    },

    /**
     * @return true if counts can be displayed
     */
    showCounts() {
      return this.reportExists && this.validBucketByConfig;
    },

    /**
     * @return error message string
     */
    errorMessage() {
      if (!this.reportExists) {
        return messages.missingReport;
      } else if (!this.validBucketByConfig) {
        return messages.missingBucketByField;
      }
    }
  }
}
</script>