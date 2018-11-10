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
        <ReportSummaryForm @reportSummary="addReportSummary" />
      </div>

      <div v-if="hasReportSummaries">
        <ReportSummary v-for="(summary, i) in reportSummaries"
                       :key="summary.reportId + i"
                       :index="i"
                       :title="summary.title"
                       :strategy="summary.strategy"
                       :summaryData="summary.data"
                       :total-records="summary.totalRecords"
                       @deleteSummary="deleteReportSummary" />
      </div>
    </div>
  </div>
</template>

<script>
import ReportSummary from './ReportSummary';
import ReportSummaryForm from './ReportSummaryForm';

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
      reportSummaries: [],
      loading: true,
      newReport: false,
      reports: []
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
     * @param {Integer} index - the report summary index to be delete from reportSummaries
     */
    deleteReportSummary(index) {
      const { dataService } = this;
      this.reportSummaries.splice(index, 1);
      this.saveSummariesPromise = dataService.saveReportSummaries(this.reportSummaries)
        .catch(this.handleConfigError);
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
