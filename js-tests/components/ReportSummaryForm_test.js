import { shallowMount } from '@vue/test-utils';

import ReportSummaryForm from '@/components/ReportSummaryForm';
import { messages } from '@/components/ReportSummaryForm';
import { STRATEGY } from '@/report-strategy';

const uuidPattern = /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/i;

const mockReportFields = [
  { field_name: 'field_1', field_label: 'Field 1' },
  { field_name: 'field_2', field_label: 'Field 2' },
  { field_name: 'field_3', field_label: 'Field 3' }
];

function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      getReports() {
        return Promise.resolve([
          { reportId: 1, 'title': 'Report 1' },
          { reportId: 2, 'title': 'Report 2' },
          { reportId: 3, 'title': 'Report 3' }
        ]);
      },

      saveReportSummary(reportSummary) {
        return Promise.resolve([reportSummary]);
      },

      getReportFields() {
        return Promise.resolve(mockReportFields);
      }
    }
  };
}

describe('ReportSummaryForm.vue', () => {
  let mockProvide, wrapper;

  beforeEach(async () => {
    mockProvide = createProvideObject();

    spyOn(mockProvide.dataService, 'getReports').and.callThrough();
    spyOn(mockProvide.dataService, 'saveReportSummary').and.callThrough();

    wrapper = shallowMount(ReportSummaryForm, {
      provide: mockProvide
    });

    await wrapper.vm.reportPromise;
  });

  describe('Report Summary Form', () => {
    it('generates a unique ID for the report summary', () => {
      expect(wrapper.vm.id).toMatch(uuidPattern);
    });

    it('renders form and title field', () => {
      expect(wrapper.findAll('.report-summary-form').length).toEqual(1);
      expect(wrapper.findAll('#title').length).toEqual(1);
    });

    it('renders report drop-down', () => {
      expect(wrapper.findAll('#reportId').length).toEqual(1);
      const options = wrapper.findAll('#reportId option');
      expect(options.length).toEqual(3);
      expect(options.at(1).attributes().value).toEqual('2');
      expect(options.at(1).text()).toEqual('Report 2');
    });

    it('makes drop-down with group by values visible when itemized strategy selected', () => {
      wrapper.vm.strategy = STRATEGY.ITEMIZED;

      const strategy = wrapper.findAll('input[name="strategy"]');
      expect(strategy.length).toEqual(2);
      const radio1 = strategy.at(0);
      const radio2 = strategy.at(1);
      expect(radio1.attributes().id).toEqual('strategy0');
      expect(radio1.attributes().value).toEqual(STRATEGY.TOTAL);
      expect(radio2.attributes().id).toEqual('strategy1');
      expect(radio2.attributes().value).toEqual(STRATEGY.ITEMIZED);
    });

    it('renders strategy drop-down with all group by values', () => {
      wrapper.vm.reportId = 42;
      wrapper.vm.strategy = STRATEGY.ITEMIZED;
      wrapper.vm.reportFields = mockReportFields;

      expect(wrapper.findAll('#bucketBy').length).toEqual(1);

      const options = wrapper.findAll('#bucketBy option');
      expect(options.length).toEqual(3);

      expect(options.at(0).text()).toEqual('field_1 "Field 1"');
      expect(options.at(0).attributes().value).toEqual('field_1');

      expect(options.at(2).text()).toEqual('field_3 "Field 3"');
      expect(options.at(2).attributes().value).toEqual('field_3');
    });
  });

  it('saves report summary on submit', async () => {
    wrapper.vm.title = 'Report 2';
    wrapper.vm.reportId = 2;
    wrapper.vm.strategy = STRATEGY.TOTAL;
    wrapper.find('.btn-primary').trigger('click');

    await wrapper.vm.savePromise;

    const reportSummary = wrapper.emitted().reportSummary;
    expect(reportSummary[0].length).toEqual(1);

    const summaryObject = reportSummary[0][0];
    expect(summaryObject.id).toMatch(uuidPattern);
    expect(summaryObject.reportId).toEqual(2);
    expect(summaryObject.title).toEqual('Report 2');
    expect(summaryObject.strategy).toEqual(STRATEGY.TOTAL);
  });

  it('validates form', () => {
    // Form rendered - no input
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(3);
    expect(wrapper.vm.errors.includes(messages.titleRequired)).toEqual(true);
    expect(wrapper.vm.errors.includes(messages.reportRequired)).toEqual(true);
    expect(wrapper.vm.errors.includes(messages.strategyRequired)).toEqual(true);
    expect(wrapper.findAll('#bucketBy').length).toEqual(0);

    // Only a report selected
    wrapper.vm.title = '';
    wrapper.vm.reportId = 42;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(2);
    expect(wrapper.vm.errors.includes(messages.titleRequired)).toEqual(true);
    expect(wrapper.vm.errors.includes(messages.strategyRequired)).toEqual(true);
    expect(wrapper.findAll('#bucketBy').length).toEqual(0);

    // Only a title entered
    wrapper.vm.title = 'Some Title';
    wrapper.vm.reportId = null;
    wrapper.vm.strategy = STRATEGY.TOTAL;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(1);
    expect(wrapper.vm.errors.includes(messages.reportRequired)).toEqual(true);
    expect(wrapper.findAll('#bucketBy').length).toEqual(0);

    // Require a bucketBy field on strategy='itemized'
    wrapper.vm.title = 'Itemized Results';
    wrapper.vm.reportId = 42;
    wrapper.vm.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.reportFields = mockReportFields;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(1);
    expect(wrapper.vm.errors.includes(messages.bucketByRequired)).toEqual(true);
    expect(wrapper.findAll('#bucketBy').length).toEqual(1);
    expect(wrapper.findAll('#bucketBy').isVisible()).toEqual(true);
  });

  it('checks for fields to group by and displays error message accordingly', () => {
    wrapper.vm.title = 'No fields to group by test';
    wrapper.vm.reportId = 42;
    wrapper.vm.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.reportFields = [];

    // Show error message, no fields to group by
    expect(wrapper.vm.errors.length).toEqual(1);
    expect(wrapper.vm.errors.includes(messages.noBucketByFields)).toEqual(true);

    // Strategy changed to total, remove error message
    wrapper.vm.strategy = STRATEGY.TOTAL;
    expect(wrapper.vm.errors.length).toEqual(0);

    // Strategy changed back to itemized, display error message
    wrapper.vm.strategy = STRATEGY.ITEMIZED;
    expect(wrapper.vm.errors.length).toEqual(1);

    // Fields to group by are loaded, remove error message
    wrapper.vm.reportFields = mockReportFields;
    expect(wrapper.vm.errors.length).toEqual(0);
  });

  it('retrieves report summary values from form', () => {
    const id = wrapper.vm.id;
    wrapper.vm.reportId = 7;
    wrapper.vm.title = 'Report Title';
    wrapper.vm.strategy = STRATEGY.TOTAL;
    wrapper.vm.bucketBy = 'bucketField';
    const reportSummary = wrapper.vm.reportSummary();
    expect(reportSummary.id).toEqual(id);
    expect(reportSummary.reportId).toEqual(7);
    expect(reportSummary.title).toEqual('Report Title');
    expect(reportSummary.strategy).toEqual(STRATEGY.TOTAL);
    expect(reportSummary.bucketBy).toEqual('bucketField');
  });

  it('cancel clears form', () => {
    const originalId = wrapper.vm.id;
    wrapper.vm.reportId = 7;
    wrapper.vm.title = 'Report Title';
    wrapper.vm.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.bucketBy = 'someField';
    expect(wrapper.vm.reportId).toEqual(7);
    expect(wrapper.vm.title).toEqual('Report Title');
    expect(wrapper.vm.strategy).toEqual(STRATEGY.ITEMIZED);
    expect(wrapper.vm.bucketBy).toEqual('someField');
    wrapper.vm.cancelForm();
    expect(wrapper.vm.id).not.toEqual(originalId);
    expect(wrapper.vm.reportId).toEqual(null);
    expect(wrapper.vm.title).toEqual('');
    expect(wrapper.vm.strategy).toEqual(null);
    expect(wrapper.vm.bucketBy).toEqual(null);
  });

  it('disables strategy radio buttons unless a report is selected', () => {
    wrapper.vm.title = 'Report Title';

    const radios = wrapper.findAll('input[name="strategy"]');
    expect(radios.at(0).attributes().disabled).toBeTruthy();
    expect(radios.at(1).attributes().disabled).toBeTruthy();

    wrapper.vm.reportId = 42;

    expect(radios.at(0).attributes().disabled).toBeFalsy()
    expect(radios.at(1).attributes().disabled).toBeFalsy();
  });

  it('prevents form submission if changing report to one that does not have fields to bucket by', () => {
    // Choose a report that has reportFields
    wrapper.vm.title = 'Prevent Submission';
    wrapper.vm.reportId = 10;
    wrapper.vm.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.reportFields = mockReportFields;

    // Select one of the bucketBy options
    wrapper.findAll('#bucketBy option').at(0).element.selected = true;
    wrapper.find('#bucketBy').trigger('change');

    // Switch to a report that does not have reportFields
    wrapper.vm.reportId = 11;
    wrapper.vm.reportFields = [];

    // There should now be a message saying there are no fields to group by
    expect(wrapper.vm.errors.includes(messages.noBucketByFields)).toEqual(true);
    expect(wrapper.vm.errors.includes(messages.bucketByRequired)).toEqual(false);

    // Try to submit the form
    wrapper.find('.btn-primary').trigger('click');

    // Ensure that the previously selected bucketBy field is not selected which
    // prevents the form from being submitted with an invalid bucketBy value.
    expect(wrapper.vm.errors.includes(messages.bucketByRequired)).toEqual(true);
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