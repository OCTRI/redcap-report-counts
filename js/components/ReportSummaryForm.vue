<template>
  <div class="card mb-3 report-summary-form">
    <div class="card-body">
      <h5 class="card-title">Add a Report Count</h5>
      <div class="form-group">
        <label>Title <input id="title" name="title" v-model="title" type="text" class="form-control"></label>
      </div>
      <div class="form-group">
        <label>Report
          <select id="reportId" name="reportId" v-model="reportId" class="form-control">
            <option v-for="report in reports" :value="report.reportId">{{ report.title }}</option>
          </select>
        </label>
      </div>
      <button type="submit" class="btn btn-primary" @click="saveReportSummary">Submit</button>
      <a class="btn btn-link cancel" @click="cancelForm">Reset</a>
    </div>
  </div>
</template>

<script>
/**
 * Renders report summary form for adding report counts.
 */
export default {
  name: 'ReportSummaryForm',
  inject: ['dataService'],

  data() {
    return {
      title: '',
      reportId: null,
      reports: []
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.reportPromise = this.fetchReports();
  },

  methods: {
    /**
     * Signal a new report is being built.
     */
    fetchReports() {
      const { dataService } = this;
      return dataService.getReports()
        .then(this.captureReports)
        .catch(this.handleConfigError);
    },

    /**
     * Sets reports array from `getReports` response.
     * @param {Promise->Object[]} responseArray - `dataService.getReports` response
     */
    captureReports(responseArray) {
      this.reports = responseArray;
    },

    /**
     * Clears current form values.
     */
    clearForm() {
      this.title = '';
      this.reportId = null;
    },

    /**
     * Currently canceling the ReportSummaryForm just clears the fields.
     * TODO: May close the form eventually, but currently clears the form until we better understand the UI.
     */
    cancelForm() {
      this.clearForm();
    },

    /**
     * Returns the model attributes to be saved to report config.
     */
    reportSummary() {
      return {
        reportId: this.reportId,
        title: this.title,
        strategy: 'total'
      };
    },

    /**
     * Save report config and clear form.
     */
    saveReportSummary() {
      const { dataService } = this;
      this.savePromise = dataService.saveReportSummary(this.reportSummary())
        .then(this.captureReportSummary)
        .catch(this.handleConfigError)
        .finally(this.clearForm);
    },

    /**
     * Sets report summary from `fetchReportSummary` response. This response is
     * emitted and processed by ConsortReport.
     * @param {Promise->Object[]} responseArray - `dataService.fetchReportSummary` response
     */
    captureReportSummary(responseArray) {
      this.$emit('reportSummary', responseArray[0]);
    },
  }
}
</script>
