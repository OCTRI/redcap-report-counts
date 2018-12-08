<template>
  <div id="consort-report-container" class="container">
    <h1>Consort Reports</h1>

    <div class="error" v-if="hasError">
      {{ errorMessage }}
      <ul v-if="hasErrorDetails">
        <li v-for="message in errorDetails" :key="message">{{ message }}</li>
      </ul>
    </div>

    <div class="alert alert-info" role="alert" v-if="loading">
      Loading consort report, please wait...
    </div>
    <div v-if="!loading">
      <div v-if="showCreateReportButton">
        <input id="create-a-report"
               type="button"
               name="create-a-report"
               value="Create a Report"
               class="btn btn-primary"
               @click="createReport">
      </div>

      <div v-if="showReportForm">
        <ReportSummaryForm @reportSummary="addReportSummary" :key="formId" />
      </div>

      <div v-if="hasReportSummaries">
        <ReportSummary v-for="summary in reportSummaries"
                       :key="summary.id"
                       :id="summary.id"
                       :class="{ 'drag-chosen': isBeingDragged(summary.id) }"
                       :title="summary.title"
                       :reportId="summary.reportId"
                       :strategy="summary.strategy"
                       :bucketBy="summary.bucketBy"
                       :bucketByLabel="summary.bucketByLabel"
                       :summaryData="summary.data"
                       :total-records="summary.totalRecords"
                       @deleteSummary="deleteReportSummary"
                       @reorder-start="startReorder"
                       @reorder-swap="swapWith"
                       @reorder-swap-reset="resetSwapItem"
                       @reorder-end="endReorder"
                       @reorder-cancel="cancelReorder"/>
      </div>
    </div>
  </div>
</template>

<script>
import ReportSummary from './ReportSummary';
import ReportSummaryForm from './ReportSummaryForm';
import uuid from 'uuid/v4';

const messages = {
  warnings: {
    configError: 'Report configuration could not be loaded due to an error: '
  }
};

/**
 * ConsortReport root component.
 */
export default {
  name: 'ConsortReport',
  inject: ['dataService'],

  components: {
    ReportSummary,
    ReportSummaryForm
  },

  data() {
    return {
      formId: uuid(),
      reportSummaries: [],
      loading: true,
      newReport: false,
      reports: [],
      dndState: {
        dragItemId: null,
        dropItemId: null,
        startIndex: null,
        originalArray: null
      }
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.configPromise = this.fetchReportSummary();
  },

  methods: {
    /**
     * Get a report summary.
     */
    fetchReportSummary() {
      const { dataService } = this;
      return dataService.fetchReportSummary()
        .then(this.captureReportSummaries)
        .catch(this.handleConfigError)
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * Sets report summaries from `fetchReportSummary` response.
     * @param {Promise->Object[]} responseArray - `dataService.fetchReportSummary` response
     */
    captureReportSummaries(responseArray) {
      this.reportSummaries = responseArray;
    },

    /**
     * Captures the report summary from ReportSummaryForm and appends to the
     * list of report summaries.
     * @param {Object} reportSummary - report summary data used to generate a ReportSummary.
     */
    addReportSummary(reportSummary) {
      this.reportSummaries.push(reportSummary);
    },

    /**
     * Delete a report summary.
     * @param {String} id - the id of the report summary to delete from reportSummaries
     */
    deleteReportSummary(id) {
      const index = this.findSummaryIndex(id);
      this.reportSummaries.splice(index, 1);
      this.saveReportSummaries();
    },

    /**
     * Persists changes to reportSummaries.
     */
    saveReportSummaries() {
      const { dataService } = this;
      this.saveSummariesPromise = dataService.saveReportSummaries(this.reportSummaries.map((summary) => {
        return {
          reportId: summary.reportId,
          title: summary.title,
          strategy: summary.strategy,
          bucketBy: summary.bucketBy
        };
      })).catch(this.handleConfigError);
    },

    /**
     * Handles rejection of the `fetchReportConfig` request.
     * @param {Error} reason - the error that triggered rejection.
     */
    handleConfigError(reason) {
      this.errorMessage = messages.warnings.configError;
      this.errorDetails = [ reason.message ];
    },

    /**
     * Indicate a report is being created.
     */
    createReport() {
      this.newReport = true;
    },

    /**
     * Reports whether the summary with the given ID is being dragged.
     * @param {String} id - a reportSummary id
     * @return {Boolean} true if the summary is currently being dragged, otherwise false
     */
    isBeingDragged(id) {
      const { dragItemId } = this.dndState;
      return id === dragItemId;
    },

    /**
     * Reports whether the given value is one of the reportSummary IDs.
     * @param {Any} value - a value to compare to reportSummary IDs
     * @return {Boolean} true if value is one of the summary IDs, otherwise false
     */
    isValidSummary(value) {
      const { reportSummaries } = this;
      return reportSummaries.some(summary => summary.id === value);
    },

    /**
     * Reports whether the dragging item should be swapped with the reportSummary with
     * the given id.
     * @param {String} id - a reportSummary ID
     * @return {Boolean} true if id is different from the current drag item and the
     *   current drop item, false if it would swap the drag item with itself or repeat
     *   the last swap
     */
    shouldSwap(id) {
      const { dragItemId, dropItemId } = this.dndState;
      return id !== dragItemId && id !== dropItemId;
    },

    /**
     * Reset drag and drop state after the drag stops.
     */
    resetDndState() {
      this.dndState = {
        dragItemId: null,
        dropItemId: null,
        startIndex: null
      };
    },

    /**
     * Finds the index of the item with the given ID in reportSummaries.
     * @param {String} id - the reportSummary ID to search for
     * @return {Number} the index of the matching reportSummary
     */
    findSummaryIndex(id) {
      const { reportSummaries } = this;
      return reportSummaries.findIndex(summary => summary.id === id);
    },

    /**
     * Given two reportSummary IDs, replaces reportSummaries with a new array where
     * the matching summaries are swapped.
     * @param {String} id1 - a reportSummary ID
     * @param {String} id2 - a reportSummary ID
     */
    swapReportSummaries(id1, id2) {
      const { reportSummaries } = this;
      const idx1 = this.findSummaryIndex(id1);
      const idx2 = this.findSummaryIndex(id2);
      const newArray = [...reportSummaries];

      if (idx1 < idx2) {
        // insert item at idx1 after idx2, then delete original
        newArray.splice(idx2 + 1, 0, newArray[idx1]);
        newArray.splice(idx1, 1);
      } else {
        // insert item at idx1 before idx2, then delete original
        newArray.splice(idx2, 0, newArray[idx1]);
        newArray.splice(idx1 + 1, 1);
      }

      this.reportSummaries = newArray;
    },

    /**
     * Captures the ID and initial position of the summary being moved.
     * @param {String} id - a reportSummary ID
     */
    startReorder(id) {
      const { dndState, reportSummaries } = this;
      if (this.isValidSummary(id)) {
        dndState.dragItemId = id;
        dndState.startIndex = this.findSummaryIndex(id);
        dndState.originalArray = reportSummaries;
      }
    },

    /**
     * Swaps the summary being moved with the one with the given ID, if needed.
     * @param {String} id - a reportSummary ID
     */
    swapWith(id) {
      const { dndState } = this;
      if (this.isValidSummary(id) && this.shouldSwap(id)) {
        dndState.dropItemId = id;
        this.swapReportSummaries(dndState.dragItemId, dndState.dropItemId);
      }
    },

    /**
     * Resets the ID of the item being swapped to allow moving both directions.
     */
    resetSwapItem() {
      const { dndState } = this;
      dndState.dropItemId = null;
    },

    /**
     * Resets drag and drop state and persists new order.
     */
    endReorder() {
      const { dragItemId, startIndex } = this.dndState;
      const persistChange = this.findSummaryIndex(dragItemId) !== startIndex;
      this.resetDndState();
      if (persistChange) {
        this.saveReportSummaries();
      }
    },

    /**
     * Resets drag and drop state when drag is canceled.
     */
    cancelReorder() {
      const { originalArray } = this.dndState;
      this.reportSummaries = originalArray;
      this.resetDndState();
    }
  },

  computed: {
    hasError() {
      const { errorMessage } = this;
      return Boolean(errorMessage);
    },

    hasErrorDetails() {
      const { errorDetails } = this;
      return Array.isArray(errorDetails) && errorDetails.length > 0;
    },

    /**
     * Handle showing the ReportSummaryForm.
     * @return true if the ReportSummaryForm should be shown.
     */
    showReportForm() {
      return !this.showCreateReportButton;
    },

    /**
     * Checks if there are report summaries.
     */
    hasReportSummaries() {
      return this.reportSummaries.length > 0;
    },

    /**
     * Checks if the create a report button should be shown.
     * @return true if there are no report summaries and create a report hasn't been started.
     */
    showCreateReportButton() {
      return !this.hasReportSummaries && !this.newReport;
    }
  }
}
</script>
