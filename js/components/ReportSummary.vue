<template>
  <div :id="id"
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
          <h3 class="card-title mb-1 float-left">{{ title }}</h3>
          <div class="drag-handle float-right text-muted"
               title="Drag to Reorder"
               @mousedown="enableDrag"
               @mouseup="disableDrag">
            <i class="fa fa-bars"></i>
          </div>
        </div>
        <div class="summary-controls mb-1">
          <a class="edit" v-if="canEdit" @click="editSummary">Edit <i class="fa fa-edit"></i></a>
          <a class="delete" v-if="canDelete" @click="deleteSummary">Delete <i class="far fa-trash-alt"></i></a>
        </div>
        <div v-if="editing && canEdit" class="edit-form container">
          <ReportSummaryForm :key="reportId + id"
                             :hideFormTitle=true
                             :editingProp=true
                             :titleProp="title"
                             :reportIdProp="reportId"
                             :strategyProp="strategy"
                             :bucketByProp="bucketBy" />
        </div>
        <ul class="summary-metadata lead list-unstyled mb-0">
          <li>Total Count: {{ totalRecords }}</li>
          <li v-if="isItemized" class="mt-0">Grouped By: {{ bucketByLabel }}</li>
        </ul>
        <ul v-if="isItemized" class="list-unstyled mt-3 mb-0" data-description="itemized-counts">
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
import ReportSummaryForm from './ReportSummaryForm';

/**
 * Renders report summary.
 */
export default {
  name: 'ReportSummary',

  components: {
    ReportSummaryForm
  },

  props: {
    id: String,
    title: String,
    reportId: Number,
    totalRecords: Number,
    strategy: String,
    bucketBy: String,
    bucketByLabel: String,
    summaryData: Array
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
        this.$emit('deleteSummary', this.id);
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
     * Emit editSummary event.
     */
    editSummary() {
      console.log('emit editSummary');
      this.editing = true;
      this.$emit('editSummary', this.id);
    },

    /**
     * Checks if the user has permission to edit a report summary.
     * @return true if the user has permission to edit a report summary.
     */
    canEdit() {
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
      const { id } = this;
      this.$emit('reorder-start', id);
    },

    /**
     * Handles the `dragenter` event. If this is the drop target, prevent default to allow
     * dropping the item. Otherwise reset the item that will be swapped.
     */
    onDragEnter(evt) {
      const { id, isDragging } = this;
      if (isDragging) {
        evt.preventDefault();
        this.$emit('reorder-swap-reset');
      } else {
        this.$emit('reorder-swap', id);
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
      return this.strategy === STRATEGY.ITEMIZED;
    },

    /**
     * @return true if the summary is being dragged.
     */
    isDragging() {
      return this.draggable;
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
