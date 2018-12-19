<template>
  <div class="card mb-3 report-summary-form">
    <div v-if="!hideFormTitle" class="card-header mb-0">
      <strong>Create a Report Count</strong>
      <a href="#"
         class="cancel-form float-right"
         role="button"
         data-toggle="collapse"
         aria-hidden="true"
         aria-expanded="true"
         @click="cancelForm">&times;</a>
    </div>
    <div class="card-body">
      <ul v-if="hasErrors && !loadingReportFields && errors.save">
        <li class="text-danger font-weight-bold">{{ errors.save }}</li>
      </ul>
      <div class="row form-group">
        <div class="col">
          <label for="title">Report Count Title</label>
          <input id="title" name="title" v-model.trim="model.title" type="text" class="form-control" :class="{ 'is-invalid': errors.title }">
          <div class="invalid-feedback" v-if="errors.title">
            {{ errors.title }}
          </div>
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <label for="reportId">Select a Report</label>
          <select id="reportId" name="reportId" v-model="model.reportId" class="form-control" :class="{ 'is-invalid': errors.reportId }" @change="loadReportFields()">
            <option v-for="report in reports" :key="report.reportId" :value="report.reportId">{{ report.title }}</option>
          </select>
          <div class="invalid-feedback" v-if="errors.reportId">
            {{ errors.reportId }}
          </div>
        </div>
      </div>
      <div class="row form-group">
        <div class="col strategy-controls">
          <label for="strategy">Summary Type</label>
          <div class="form-check" v-for="(strategyVal, i) in strategies" :key="strategyVal">
            <input class="form-check-input" :class="{ 'is-invalid': errors.strategy }" :id="'strategy' + i" name="strategy" v-model="model.strategy" :value="strategyVal" type="radio" :disabled="!reportSelected">
            <label class="form-check-label" :for="'strategy' + i">{{ strategyVal }}</label>
          </div>
          <div class="invalid-feedback" v-if="errors.strategy">
            {{ errors.strategy }}
          </div>
        </div>
      </div>
      <div class="row form-group" v-if="showBucketByFields">
        <div class="col">
          <label for="bucketBy">Field to Group Results</label>
          <select id="bucketBy" name="bucketBy" v-model="model.bucketBy" class="form-control" :class="{ 'is-invalid': errors.bucketBy }">
            <option v-for="field in reportFields" :key="field.field_name" :value="field.field_name">{{ field.field_name }} "{{ field.field_label }}"</option>
          </select>
          <div class="invalid-feedback" v-if="errors.bucketBy">
            {{ errors.bucketBy }}
          </div>
        </div>
      </div>
      <div class="row form-group mb-0">
        <div class="col">
          <div class="btn-group">
            <button type="submit"
                    class="btn btn-primary"
                    @click="saveReportSummary(isEditing, false)">
              Save
            </button>
            <button v-if="saveMultiple"
                    type="button"
                    class="btn btn-primary dropdown-toggle dropdown-toggle-split"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
              <span class="sr-only">Toggle Save Dropdown</span>
            </button>
            <div v-if="saveMultiple" class="dropdown-menu">
              <button type="button"
                      class="dropdown-item"
                      @click="saveReportSummary(isEditing, true)">
                Save &amp; Create Another
              </button>
            </div>
          </div>
          <button type="cancel" class="btn btn-link" @click="cancelForm">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { STRATEGY } from '@/report-strategy';
import ReportSummaryConfig from '@/report-summary-config';

export const messages = {
  titleRequired: 'You must provide a title',
  reportRequired: 'You must select a report',
  strategyRequired: 'You must select a summary type',
  bucketByRequired: `You must select a field to group by when using the '${STRATEGY.ITEMIZED}' summary type`,
  noBucketByFields: `The selected report has no radio button or drop-down fields to group by`
};

/**
 * Renders report summary form for adding report counts.
 */
export default {
  name: 'ReportSummaryForm',
  inject: ['dataService'],

  props: {
    hideFormTitle: Boolean,
    initialState: ReportSummaryConfig,
    saveMultiple: {
      // enables the "Save & Create Another" menu
      type: Boolean,
      default: false
    }
  },

  data() {
    const { initialState } = this.$props;
    let model;

    if (initialState) {
      model = ReportSummaryConfig.fromObject(initialState);
    } else {
      model = new ReportSummaryConfig();
    }

    return {
      model,
      isEditing: Boolean(initialState),
      strategies: Object.values(STRATEGY),
      reports: [],
      errors: {
        title: '',
        reportId: '',
        strategy: '',
        bucketBy: '',
        save: ''
      },
      reportFields: [],
      loadingReportFields: false
    };
  },

  mounted() {
    const { model } = this;

    // capture the promise to synchronize tests
    this.reportPromise = this.fetchReports();
    if (model.reportId) {
      this.loadReportFields();
    }
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

    fetchReportFields() {
      const { dataService, model } = this;
      this.clearErrors();
      this.loadingReportFields = true;
      return dataService.getReportFields(model.reportId)
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
     * Resets the form model to the initial state if it was provided, otherwise sets it to
     * a new empty model.
     */
    clearForm() {
      const { isEditing, $props } = this;
      if (isEditing) {
        this.model = ReportSummaryConfig.fromObject($props.initialState);
      } else {
        this.model = new ReportSummaryConfig();
      }
    },

    clearErrors() {
      const { errors } = this;
      Object.keys(errors).forEach(key => errors[key] = '');
    },

    /**
     * Resets the form model and notifies the parent that the form was canceled.
     */
    cancelForm() {
      this.clearForm();
      this.$emit('formCanceled');
    },

    /**
     * Validate form.
     */
    validForm() {
      const { model, errors } = this;
      this.clearErrors();
      if (!model.title.length) {
        errors.title = messages.titleRequired;
      }
      if (model.reportId === null) {
        errors.reportId = messages.reportRequired;
      }
      this.validateItemization();
      return !this.hasErrors;
    },

    /**
     * Validate configuration for itemization.
     */
    validateItemization() {
      const {
        model,
        reportFields,
        isItemizedStrategy,
        errors
      } = this;

      errors.strategy = '';
      errors.bucketBy = '';

      if (model.strategy === null) {
        this.errors.strategy = messages.strategyRequired;
      }
      if (isItemizedStrategy && reportFields.length === 0) {
        this.errors.strategy = messages.noBucketByFields;
      }
      if (isItemizedStrategy && reportFields.length > 0 && model.bucketBy === null) {
        this.errors.bucketBy = messages.bucketByRequired;
      }
    },

    /**
     * Save report config and clear form.
     * @param {Boolean} editing - true if editing a summary, otherwise saving a new summary
     * @param {Boolean} saveAnother - true if the user wants to create another summary
     */
    saveReportSummary(editing, saveAnother = false) {
      if (!this.validForm()) {
        return;
      }
      const { dataService, model } = this;
      this.savePromise = dataService.saveReportSummary(model, editing)
        .then(responseArray => this.emitSaveEvent(responseArray, saveAnother))
        .then(this.clearForm)
        .catch(this.handleConfigError);
    },

    /**
     * Notifies the parent component that the form was saved by emitting an event.
     * @param {Promise->Object[]} responseArray - `dataService.fetchReportSummary` response
     * @param {Boolean} saveAnother - true if the user wants to create another summary
     */
    emitSaveEvent(responseArray, saveAnother = false) {
      this.$emit('reportSummarySaved', responseArray[0], saveAnother);
    },

    /**
     * Handles rejection of the `saveReportSummary` request.
     * @param {Error} reason - the error that triggered rejection.
     */
    handleConfigError(reason) {
      this.errors.save = 'An error occurred while trying to save this count.';
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
     * Watch strategy and validate summary config on changes.
     */
    selectedStrategy() {
      const { selectedStrategy, model } = this;

      if (selectedStrategy === STRATEGY.TOTAL) {
        model.bucketBy = null;
      }

      this.validateItemization();
    },

    /**
     * Watch reportFields and validate summary config on changes.
     */
    reportFields() {
      const{ reportFields, model } = this;

      if (reportFields.length === 0) {
        model.bucketBy = null;
      }

      this.validateItemization();
    }
  },

  computed: {
    /**
     * @return the currently selected summarization strategy
     */
    selectedStrategy() {
      return this.model.strategy;
    },

    errorCount() {
      const { errors } = this;
      return Object.values(errors)
        .filter(errorString => errorString.length > 0)
        .length;
    },

    /**
     * @return true if there are errors
     */
    hasErrors() {
      return this.errorCount > 0;
    },

    /**
     * @return true if the itemized strategy is selected
     */
    isItemizedStrategy() {
      return this.selectedStrategy === STRATEGY.ITEMIZED;
    },

    /**
     * @return true if a report has been selected.
     */
    reportSelected() {
      return this.model.reportId !== null;
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
