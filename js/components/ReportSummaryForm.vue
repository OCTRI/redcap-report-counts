<template>
  <div class="card mb-3 report-summary-form">
    <div class="card-body">
      <h5 class="card-title">Add a Report Count</h5>
      <ul v-if="hasErrors">
        <li v-for="error in errors" :key="error" class="text-danger font-weight-bold">{{ error }}</li>
      </ul>
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
      <div class="form-group">
        <label>Strategy
          <select id="strategy" name="strategy" v-model="strategy" class="form-control">
            <option v-for="strategy in strategies" :key="strategy" :value="strategy">{{ strategy }}</option>
          </select>
        </label>
      </div>
      <div class="form-group" v-if="isItemizedStrategy">
        <label>Group By <input id="bucketBy" name="bucketBy" v-model="bucketBy" type="text" class="form-control"></label>
      </div>
      <button type="submit" class="btn btn-primary" @click="saveReportSummary">Submit</button>
      <a class="btn btn-link cancel" @click="cancelForm">Reset</a>
    </div>
  </div>
</template>

<script>
import { STRATEGY } from '../report-strategy';

export const messages = {
  titleRequired: 'You must provide a title',
  reportRequired: 'You must select a report',
  strategyRequired: 'You must select a strategy',
  bucketByRequired: `You must select a field to group by when using the ${STRATEGY.ITEMIZED} strategy`
};

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
      strategy: null,
      bucketBy: null,
      strategies: Object.values(STRATEGY),
      reports: [],
      errors: []
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
      this.strategy = null;
      this.bucketBy = null;
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
        strategy: this.strategy,
        bucketBy: this.bucketBy
      };
    },

    /**
     * Validate form.
     */
    validForm() {
      this.errors = [];
      if (!this.title.trim().length) {
        this.errors.push(messages.titleRequired);
      }
      if (this.reportId === null) {
        this.errors.push(messages.reportRequired);
      }
      if (this.strategy === null) {
        this.errors.push(messages.strategyRequired);
      }
      if (this.strategy === STRATEGY.ITEMIZED && this.bucketBy === null) {
        this.errors.push(messages.bucketByRequired);
      }
      return this.errors.length === 0;
    },

    /**
     * Save report config and clear form.
     */
    saveReportSummary() {
      if (!this.validForm()) {
        return;
      }
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

    /**
     * Handles rejection of the `saveReportSummary` request.
     * @param {Error} reason - the error that triggered rejection.
     */
    handleConfigError(reason) {
      this.errors.push('An error occurred while trying to save this count.');
    },
  },

  computed: {
    /**
     * @return true if there are errors
     */
    hasErrors() {
      return this.errors.length > 0;
    },

    /**
     * @return true if the itemized strategy is selected
     */
    isItemizedStrategy() {
      return this.strategy === STRATEGY.ITEMIZED;
    }
  }
}
</script>
