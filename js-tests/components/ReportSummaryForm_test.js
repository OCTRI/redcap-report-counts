import { shallowMount } from '@vue/test-utils';

import ReportSummaryForm from '@/components/ReportSummaryForm';
import { messages } from '@/components/ReportSummaryForm';
import { STRATEGY } from '@/report-strategy';
import ReportSummaryConfig from '@/report-summary-config';

import {
  uuidPattern,
  mockReportFields,
  createProvideObject
} from '../test-utils';

describe('ReportSummaryForm.vue', () => {
  let mockProvide, wrapper, id;

  beforeEach(async () => {
    mockProvide = createProvideObject();

    spyOn(mockProvide.dataService, 'getReports').and.callThrough();
    spyOn(mockProvide.dataService, 'saveReportSummary').and.callThrough();

    wrapper = shallowMount(ReportSummaryForm, {
      provide: mockProvide
    });

    id = wrapper.vm.model.id;

    await wrapper.vm.reportPromise;
  });

  describe('Report Summary Form', () => {
    it('creates a new form model if initial state is absent', () => {
      expect(wrapper.vm.model).toBeDefined();
      expect(wrapper.vm.model.id).toMatch(uuidPattern);
    });

    it('clones the form model from initial state if present', () => {
      const wrapper = shallowMount(ReportSummaryForm, {
        provide: mockProvide,
        propsData: {
          initialState: new ReportSummaryConfig(42, 'Report 2', 2, STRATEGY.TOTAL, null)
        }
      });

      const { model, initialState } = wrapper.vm;
      expect(model).not.toBe(initialState);
      expect(model).toEqual(initialState);
    });

    it('renders form and title field', () => {
      expect(wrapper.findAll('.report-summary-form').length).toEqual(1);
      expect(wrapper.findAll(`#title${id}`).length).toEqual(1);
    });

    it('renders report drop-down', () => {
      expect(wrapper.findAll(`#reportId${id}`).length).toEqual(1);
      const options = wrapper.findAll(`#reportId${id} option`);
      expect(options.length).toEqual(3);
      expect(options.at(1).attributes().value).toEqual('2');
      expect(options.at(1).text()).toEqual('Report 2');
    });

    it('renders radio buttons for the strategy values', () => {
      const strategy = wrapper.findAll('input[name="strategy"]');
      expect(strategy.length).toEqual(2);
      const radio1 = strategy.at(0);
      const radio2 = strategy.at(1);
      expect(radio1.attributes().id).toEqual(`strategy0${id}`);
      expect(radio1.attributes().value).toEqual(STRATEGY.TOTAL);
      expect(radio2.attributes().id).toEqual(`strategy1${id}`);
      expect(radio2.attributes().value).toEqual(STRATEGY.ITEMIZED);
    });

    it('makes drop-down with group by values visible when itemized strategy selected', () => {
      const modelWithStrategy = ReportSummaryConfig.fromObject(wrapper.vm.model);
      modelWithStrategy.strategy = STRATEGY.ITEMIZED;

      wrapper.setData({
        model: modelWithStrategy,
        reportFields: mockReportFields
      });

      expect(wrapper.findAll(`#bucketBy${id}`).length).toEqual(1);

      const options = wrapper.findAll(`#bucketBy${id} option`);
      expect(options.length).toEqual(3);

      expect(options.at(0).text()).toEqual('field_1 "Field 1"');
      expect(options.at(0).attributes().value).toEqual('field_1');

      expect(options.at(2).text()).toEqual('field_3 "Field 3"');
      expect(options.at(2).attributes().value).toEqual('field_3');
    });
  });

  it('saves report summary on submit', async () => {
    const model = new ReportSummaryConfig(null, 'Report 2', 2, STRATEGY.TOTAL);
    wrapper.vm.model = model;
    wrapper.find('.btn-primary').trigger('click');

    await wrapper.vm.savePromise;

    const reportSummaryEvent = wrapper.emitted('reportSummarySaved');
    expect(reportSummaryEvent[0].length).toEqual(2);

    const [summaryObject, saveAnother] = reportSummaryEvent[0];
    expect(summaryObject).toEqual(model);
    expect(saveAnother).toBe(false);
  });

  it('saves report summary on Save & Create Another', async () => {
    wrapper.setProps({ saveMultiple: true });

    const model = new ReportSummaryConfig(null, 'Report 3', 3, STRATEGY.TOTAL);
    wrapper.vm.model = model;
    wrapper.find('button[data-toggle=dropdown]').trigger('click');
    wrapper.find('button.dropdown-item').trigger('click');

    await wrapper.vm.savePromise;

    const reportSummaryEvent = wrapper.emitted('reportSummarySaved');
    expect(reportSummaryEvent[0].length).toEqual(2);

    const [summaryObject, saveAnother] = reportSummaryEvent[0];
    expect(summaryObject).toEqual(model);
    expect(saveAnother).toBe(true);
  });

  it('validates form', () => {
    // Form rendered - no input
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errorCount).toEqual(2);
    expect(wrapper.vm.errors.title).toEqual(messages.titleRequired);
    expect(wrapper.vm.errors.reportId).toEqual(messages.reportRequired);
    expect(wrapper.findAll('#bucketBy').length).toEqual(0);

    // Only a report selected
    wrapper.vm.model.reportId = 42;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errorCount).toEqual(1);
    expect(wrapper.vm.errors.title).toEqual(messages.titleRequired);
    expect(wrapper.findAll('#bucketBy').length).toEqual(0);

    // Only a title entered
    wrapper.vm.model.title = 'Some Title';
    wrapper.vm.model.reportId = null;
    wrapper.vm.model.strategy = STRATEGY.TOTAL;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errorCount).toEqual(1);
    expect(wrapper.vm.errors.reportId).toEqual(messages.reportRequired);
    expect(wrapper.findAll(`#bucketBy${id}`).length).toEqual(0);

    // Require a bucketBy field on strategy='itemized'
    wrapper.vm.model.title = 'Itemized Results';
    wrapper.vm.model.reportId = 42;
    wrapper.vm.model.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.reportFields = mockReportFields;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errorCount).toEqual(1);
    expect(wrapper.vm.errors.bucketBy).toEqual(messages.bucketByRequired);
    expect(wrapper.findAll(`#bucketBy${id}`).length).toEqual(1);
    expect(wrapper.findAll(`#bucketBy${id}`).isVisible()).toEqual(true);
  });

  it('checks for fields to group by and displays error message accordingly', () => {
    wrapper.vm.model.title = 'No fields to group by test';
    wrapper.vm.model.reportId = 42;
    wrapper.vm.model.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.reportFields = [];

    // Show error message, no fields to group by
    expect(wrapper.vm.errorCount).toEqual(1);
    expect(wrapper.vm.errors.strategy).toEqual(messages.noBucketByFields);

    // Strategy changed to total, remove error message
    wrapper.vm.model.strategy = STRATEGY.TOTAL;
    expect(wrapper.vm.errorCount).toEqual(0);

    // Strategy changed back to itemized, display error message
    wrapper.vm.model.strategy = STRATEGY.ITEMIZED;
    expect(wrapper.vm.errorCount).toEqual(1);
    expect(wrapper.vm.errors.strategy).toEqual(messages.noBucketByFields);

    // Fields to group by are loaded, remove error message
    wrapper.vm.reportFields = mockReportFields;
    expect(wrapper.vm.errorCount).toEqual(1);
    expect(wrapper.vm.errors.bucketBy).toEqual(messages.bucketByRequired);
  });

  it('clears form on cancel when creating', () => {
    const originalId = wrapper.vm.model.id;
    wrapper.vm.model.reportId = 7;
    wrapper.vm.model.title = 'Report Title';
    wrapper.vm.model.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.model.bucketBy = 'someField';

    wrapper.vm.cancelForm();

    expect(wrapper.vm.model.id).not.toEqual(originalId);
    expect(wrapper.vm.model.reportId).toEqual(null);
    expect(wrapper.vm.model.title).toEqual('');
    expect(wrapper.vm.model.strategy).toEqual(STRATEGY.TOTAL);
    expect(wrapper.vm.model.bucketBy).toEqual(null);
  });

  it('resets the form to the initial state on cancel when editing', () => {
    const initialState = new ReportSummaryConfig(null, 'Initial', 3, STRATEGY.TOTAL);
    const wrapper = shallowMount(ReportSummaryForm, {
      provide: mockProvide,
      propsData: {
        initialState
      }
    });

    // model is initially equal to the initial state
    expect(wrapper.vm.model).toEqual(initialState);

    // changes made via the form mutate the model
    wrapper.find('input[name="title"]').setValue('New Title');
    expect(wrapper.vm.model).not.toEqual(initialState);

    // cancel resets the model to the initial state
    wrapper.find('button[type=cancel]').trigger('click');
    expect(wrapper.vm.model).toEqual(initialState);
  });

  it('emits an event when on cancel', () => {
    wrapper.find('button[type="cancel"]').trigger('click');
    expect(wrapper.emitted('formCanceled')).toBeTruthy();
  })

  it('disables strategy radio buttons unless a report is selected', () => {
    wrapper.vm.model.title = 'Report Title';

    const radios = wrapper.findAll('input[name="strategy"]');
    expect(radios.at(0).attributes().disabled).toBeTruthy();
    expect(radios.at(1).attributes().disabled).toBeTruthy();

    wrapper.vm.model.reportId = 42;

    expect(radios.at(0).attributes().disabled).toBeFalsy()
    expect(radios.at(1).attributes().disabled).toBeFalsy();
  });

  it('prevents form submission if changing report to one that does not have fields to bucket by', () => {
    // Choose a report that has reportFields
    wrapper.vm.model.title = 'Prevent Submission';
    wrapper.vm.model.reportId = 10;
    wrapper.vm.model.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.reportFields = mockReportFields;

    // Select one of the bucketBy options
    wrapper.findAll(`#bucketBy${id} option`).at(0).setSelected();

    // Switch to a report that does not have reportFields
    wrapper.vm.model.reportId = 11;
    wrapper.vm.reportFields = [];

    // There should now be a message saying there are no fields to group by
    expect(wrapper.vm.errors.strategy).toEqual(messages.noBucketByFields);

    // The bucketBy field should be reset
    expect(wrapper.vm.errors.bucketBy).not.toEqual(messages.bucketByRequired);

    // Try to submit the form
    wrapper.find('.btn-primary').trigger('click');

    // Ensure that the previously selected bucketBy field is not selected which
    // prevents the form from being submitted with an invalid bucketBy value.
    expect(wrapper.vm.errors.strategy).toEqual(messages.noBucketByFields);
  });

  it('hides form title', async () => {
    wrapper = shallowMount(ReportSummaryForm, {
      provide: createProvideObject(),
      propsData: {
        hideFormTitle: true
      }
    });
    await wrapper.vm.reportPromise;
    expect(wrapper.findAll('.card-header').length).toEqual(0);
  });

  it('shows form title', async () => {
    wrapper = shallowMount(ReportSummaryForm, {
      provide: createProvideObject(),
      propsData: {
        hideFormTitle: false
      }
    });
    await wrapper.vm.reportPromise;
    expect(wrapper.findAll('.card-header').length).toEqual(1);
  });
});