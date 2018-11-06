<template>
  <div class="card mb-3 report-summary-form">
    <div class="card-body">
      <h5 class="card-title">Add a Report Count</h5>
      <ul v-if="hasErrors">
        <li v-for="error in errors" :key="error" class="text-danger font-weight-bold">{{ error }}</li>
      </ul>
      <div class="row form-group">
        <div class="col-lg-6">
          <label for="title">Title</label>
          <input id="title" name="title" v-model="title" type="text" class="form-control">
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <label>Report
            <select id="reportId" name="reportId" v-model="reportId" class="form-control" @change="loadReportFields()">
              <option v-for="report in reports" :value="report.reportId">{{ report.title }}</option>
            </select>
          </label>
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <label for="strategy">Summary Type</label>
          <div class="form-check" v-for="(strategyVal, i) in strategies" :key="strategyVal">
            <input class="form-check-input" :id="'strategy' + i" name="strategy" v-model="strategy" :value="strategyVal" type="radio" :disabled="!reportSelected"></label>
            <label class="form-check-label" :for="'strategy' + i">{{ strategyVal }}</label>
          </div>
        </div>
      </div>
      <div class="row form-group" v-if="showBucketByFields">
        <div class="col">
          <label>Field to Group Results
            <select id="bucketBy" name="bucketBy" v-model="bucketBy" class="form-control">
              <option v-for="field in reportFields" :key="field.field_name" :value="field.field_name">{{field.field_name}} "{{field.field_label}}"</option>
            </select>
          </label>
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <button type="submit" class="btn btn-primary" @click="saveReportSummary">Submit</button>
          <a class="btn btn-link cancel" @click="cancelForm">Reset</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { STRATEGY } from '../report-strategy';

export const messages = {
  titleRequired: 'You must provide a title',
  reportRequired: 'You must select a report',
  strategyRequired: 'You must select a summary type',
  bucketByRequired: `You must select a field to group by when using the '${STRATEGY.ITEMIZED}' summary type`,
  noBucketByFields: `There are no fields to group by for the selected report when the '${STRATEGY.ITEMIZED}' summary type is selected.`
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
      errors: [],
      reportFields: [],
      loadingReportFields: false
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

    fetchReportFields(reportId) {
      const { dataService } = this;
      this.clearErrors();
      this.loadingReportFields = true;
      return dataService.getReportFields(this.reportId)
        .then(this.captureReportFields)
        .catch(this.handleConfigError)
        .finally(() => {
          this.loadingReportFields = false;
        });
    },

    captureReportFields(responseArray) {
      this.reportFields = responseArray;
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

    clearErrors() {
      this.errors = [];
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
      this.clearErrors();
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

    /**
     * Load fields to group by for the selected report.
     */
    loadReportFields() {
      this.reportFieldsPromise = this.fetchReportFields();
    }
  },

  watch: {
    /**
     * Watch strategy and if it is itemized and there are no fields to group by push an error.
     */
    strategy: function() {
      this.clearErrors();
      if (this.strategy === STRATEGY.ITEMIZED && this.reportFields.length === 0) {
        this.errors.push(messages.noBucketByFields);
      }
    },

    /**
     * Watch reportFields and if there are no fields and strategy is itemized push an error.
     */
    reportFields: function() {
      this.clearErrors();
      if (this.reportFields.length === 0 && this.strategy === STRATEGY.ITEMIZED) {
        this.bucketBy = null;
        this.errors.push(messages.noBucketByFields);
      }
    }
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
    },

    /**
     * @return true if a report has been selected.
     */
    reportSelected() {
      return this.reportId !== null;
    },

    /**
     * @return true if itemized strategy and the report has fields to group by.
     */
    hasReportFields() {
      return this.isItemizedStrategy && this.reportFields.length > 0;
    },

    /**
     * @return true if itemized strategy and there are fields to group by.
     */
    showBucketByFields() {
      return this.isItemizedStrategy && !this.loadingReportFields && this.hasReportFields;
    }
  }
}
</script>
