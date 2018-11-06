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
            <select id="reportId" name="reportId" v-model="reportId" class="form-control">
              <option v-for="report in reports" :value="report.reportId">{{ report.title }}</option>
            </select>
          </label>
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <label for="strategy">Summary Type</label>
          <div class="form-check" v-for="(strategyVal, i) in strategies" :key="strategyVal">
            <input class="form-check-input" :id="'strategy' + i" name="strategy" v-model="strategy" :value="strategyVal" type="radio"></label>
            <label class="form-check-label" :for="'strategy' + i">{{ strategyVal }}</label>
          </div>
        </div>
      </div>
      <div class="row form-group" v-if="isItemizedStrategy">
        <div class="col">
          <label>Field to Group Results
            <select id="bucketBy" name="bucketBy" v-model="bucketBy" class="form-control">
              <optgroup :label="label" v-for="(fields, label) in groupedBucketByFields" :key="fields.field_name">
                <option v-for="field in fields" :key="field.field_name" :value="field.field_name">{{field.field_name}} "{{field.field_label}}"</option>
              </optgroup>
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
import groupBy from 'lodash/groupBy';

export const messages = {
  titleRequired: 'You must provide a title',
  reportRequired: 'You must select a report',
  strategyRequired: 'You must select a summary type',
  bucketByRequired: `You must select a field to group by when using the ${STRATEGY.ITEMIZED} summary type`
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
      bucketByFields: []
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.reportPromise = this.fetchReports();
    this.bucketByFields = this.fetchBucketByFields();
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

    fetchBucketByFields() {
      const { dataService } = this;
      return dataService.getBucketByFields()
        .then(this.captureBucketByFields)
        .catch(this.handleGettingFieldsError);
    },

    captureBucketByFields(responseArray) {
      this.bucketByFields = responseArray;
    },

    handleGettingFieldsError(reason) {
      this.errors.push('An error occurred while retrieving fields to group by.');
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
    },

    /**
     * Group fields by form name. Used to generate optgroups in form select.
     */
    groupedBucketByFields() {
      return groupBy(this.bucketByFields, function(obj) {
        return obj.form_name;
      });
    }
  }
}
</script>
