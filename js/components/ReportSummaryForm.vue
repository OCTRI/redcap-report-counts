<template>
  <div class="card mb-3 report-summary-form">
    <div v-if="!hideFormTitle" class="card-header mb-0">
      <strong>Add a Report Count</strong>
      <a href="#"
         class="cancel-form float-right"
         role="button"
         data-toggle="collapse"
         aria-hidden="true"
         aria-expanded="true"
         @click="cancelForm">&times;</a>
    </div>
    <div class="card-body">
      <ul v-if="hasErrors && !loadingReportFields">
        <li v-for="error in errors" :key="error" class="text-danger font-weight-bold">{{ error }}</li>
      </ul>
      <div class="row form-group">
        <div class="col">
          <label for="title">Title</label>
          <input id="title" name="title" v-model="title" type="text" class="form-control">
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <label for="reportId">Report</label>
          <select id="reportId" name="reportId" v-model="reportId" class="form-control" @change="loadReportFields()">
            <option v-for="report in reports" :key="report.reportId" :value="report.reportId">{{ report.title }}</option>
          </select>
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <label for="strategy">Summary Type</label>
          <div class="form-check" v-for="(strategyVal, i) in strategies" :key="strategyVal">
            <input class="form-check-input" :id="'strategy' + i" name="strategy" v-model="strategy" :value="strategyVal" type="radio" :disabled="!reportSelected">
            <label class="form-check-label" :for="'strategy' + i">{{ strategyVal }}</label>
          </div>
        </div>
      </div>
      <div class="row form-group" v-if="showBucketByFields">
        <div class="col">
          <label>Field to Group Results
            <select id="bucketBy" name="bucketBy" v-model="bucketBy" class="form-control">
              <option v-for="field in reportFields" :key="field.field_name" :value="field.field_name">{{ field.field_name }} "{{ field.field_label }}"</option>
            </select>
          </label>
        </div>
      </div>
      <div class="row form-group mb-0">
        <div class="col">
          <button type="submit" class="btn btn-primary" @click="saveReportSummary(editing)">Save</button>
          <button type="cancel" class="btn btn-link" @click="cancelForm">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid/v4';
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

  props: {
    hideFormTitle: Boolean,
    editingProp: Boolean,
    titleProp: String,
    reportIdProp: Number,
    strategyProp: String,
    bucketByProp: String
  },

  data() {
    return {
      id: uuid(),
      editing: false,
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
    this.editing = this.editingProp ? true : false;
    this.title = this.titleProp;
    this.reportId = this.reportIdProp;
    this.strategy = this.strategyProp;
    this.bucketBy = this.bucketByProp;
    this.loadReportFields();
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
      this.id = uuid();
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
     * TODO: implement REDDEV-594
     */
    cancelForm() {
      console.warn('Cancel form is not implemented - see REDDEV-594');
      this.clearForm();
    },

    /**
     * Returns the model attributes to be saved to report config.
     */
    reportSummary() {
      return {
        id: this.id,
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
     * @param Boolean editing - true if editing a summary, otherwise saving a new summary
     */
    saveReportSummary(editing) {
      if (!this.validForm()) {
        return;
      }
      const { dataService } = this;
      this.savePromise = dataService.saveReportSummary(this.reportSummary(), editing)
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
