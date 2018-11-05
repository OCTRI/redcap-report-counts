import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ReportSummaryForm from '@/components/ReportSummaryForm';
import { messages } from '@/components/ReportSummaryForm';
import { STRATEGY } from '@/report-strategy';

function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      getReports() {
        return Promise.resolve([
          { reportId: 1, "title": "Report 1" },
          { reportId: 2, "title": "Report 2" },
          { reportId: 3, "title": "Report 3" }
        ]);
      },

      saveReportSummary(reportSummary) {
        return Promise.resolve([{reportId: 2, title: 'Report 2', strategy: STRATEGY.TOTAL, totalRecords: 19}]);
      },

      getBucketByFields() {
        return Promise.resolve([
          { form_name: "form_1", field_name: "field_1_form_1", field_label: "Field 1 Form 1" },
          { form_name: "form_1", field_name: "field_2_form_1", field_label: "Field 2 Form 1" },
          { form_name: "form_2", field_name: "field_1_form_2", field_label: "Field 1 Form 2" },
          { form_name: "form_2", field_name: "field_2_form_2", field_label: "Field 2 Form 2" },
          { form_name: "form_2", field_name: "field_3_form_2", field_label: "Field 3 Form 2" }
        ]);
      }
    }
  };
}

describe('ReportSummaryForm.vue', () => {
  let mockProvide, wrapper;

  beforeEach((done) => {
    mockProvide = createProvideObject();

    spyOn(mockProvide.dataService, 'getReports').and.callThrough();
    spyOn(mockProvide.dataService, 'saveReportSummary').and.callThrough();

    wrapper = shallowMount(ReportSummaryForm, {
      provide: mockProvide
    });

    wrapper.vm.reportPromise.then(() => done());
  });

  describe('Report Summary Form', () => {
    it('renders form and title field', () => {
      expect(wrapper.findAll('.report-summary-form').length).toBe(1);
      expect(wrapper.findAll('#title').length).toBe(1);
    });

    it('renders report drop-down', () => {
      expect(wrapper.findAll('#reportId').length).toBe(1);
      wrapper.vm.$nextTick(() => {
        const options = wrapper.findAll('#reportId option');
        expect(options.length).toBe(3);
        expect(options.at(1).attributes().value).toBe('2');
        expect(options.at(1).text()).toBe('Report 2');
      });
    });

    it('makes drop-down with group by values visible when itemized strategy selected', () => {
      wrapper.vm.strategy = STRATEGY.ITEMIZED;

      const strategy = wrapper.findAll('input[name="strategy"]');
      expect(strategy.length).toBe(2);
      const radio1 = strategy.at(0);
      const radio2 = strategy.at(1);
      expect(radio1.attributes().id).toBe('strategy0');
      expect(radio1.attributes().value).toBe(STRATEGY.TOTAL);
      expect(radio2.attributes().id).toBe('strategy1');
      expect(radio2.attributes().value).toBe(STRATEGY.ITEMIZED);
    });

    it('renders strategy drop-down with all group by values', () => {
      wrapper.vm.strategy = STRATEGY.ITEMIZED;

      const optGroups = wrapper.findAll('#bucketBy optgroup');
      expect(wrapper.findAll('#bucketBy').length).toBe(1);
      expect(optGroups.length).toBe(2);

      const optionsGroup1 = optGroups.at(0).findAll('option');
      const optionsGroup2 = optGroups.at(1).findAll('option');;
      expect(optionsGroup1.length).toBe(2);
      expect(optionsGroup2.length).toBe(3);
      // check first option in first optgroup
      expect(optionsGroup1.at(0).text()).toBe('field_1_form_1 "Field 1 Form 1"');
      expect(optionsGroup1.at(0).attributes().value).toBe('field_1_form_1');
      // check third option in second optgroup
      expect(optionsGroup2.at(2).text()).toBe('field_3_form_2 "Field 3 Form 2"');
      expect(optionsGroup2.at(2).attributes().value).toBe('field_3_form_2');
    });
  });

  it('saves report summary on submit', (done) => {
    wrapper.vm.title = 'Report 2';
    wrapper.vm.reportId = 2;
    wrapper.vm.strategy = STRATEGY.TOTAL;
    wrapper.find('.btn-primary').trigger('click');
    wrapper.vm.savePromise.then(() => done());
    wrapper.vm.$nextTick(() => {
      const reportSummary = wrapper.emitted().reportSummary;
      expect(reportSummary[0].length).toBe(1);
      expect(reportSummary[0][0]['reportId']).toBe(2);
      expect(reportSummary[0][0]['title']).toBe('Report 2');
      expect(reportSummary[0][0]['strategy']).toBe(STRATEGY.TOTAL);
      expect(reportSummary[0][0]['totalRecords']).toBe(19);
    });
  });

  it('validates form', () => {
    // Form rendered - no input
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(3);
    expect(wrapper.vm.errors.includes(messages.titleRequired)).toBe(true);
    expect(wrapper.vm.errors.includes(messages.reportRequired)).toBe(true);
    expect(wrapper.vm.errors.includes(messages.strategyRequired)).toBe(true);
    expect(wrapper.findAll('#bucketBy').length).toBe(0);

    // Only a report selected
    wrapper.vm.title = '';
    wrapper.vm.reportId = 42;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(2);
    expect(wrapper.vm.errors.includes(messages.titleRequired)).toBe(true);
    expect(wrapper.vm.errors.includes(messages.strategyRequired)).toBe(true);
    expect(wrapper.findAll('#bucketBy').length).toBe(0);

    // Only a title entered
    wrapper.vm.title = 'Some Title';
    wrapper.vm.reportId = null;
    wrapper.vm.strategy = STRATEGY.TOTAL;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(1);
    expect(wrapper.vm.errors.includes(messages.reportRequired)).toBe(true);
    expect(wrapper.findAll('#bucketBy').length).toBe(0);

    // Require a bucketBy field on strategy='itemized'
    wrapper.vm.title = 'Itemized Results';
    wrapper.vm.reportId = 42;
    wrapper.vm.strategy = STRATEGY.ITEMIZED;
    wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.vm.errors.length).toEqual(1);
    expect(wrapper.vm.errors.includes(messages.bucketByRequired)).toBe(true);
    expect(wrapper.findAll('#bucketBy').length).toBe(1);
    expect(wrapper.findAll('#bucketBy').isVisible()).toBe(true);
  });

  it('retrieves report summary values from form', () => {
    wrapper.vm.reportId = 7;
    wrapper.vm.title = 'Report Title';
    wrapper.vm.strategy = STRATEGY.TOTAL;
    wrapper.vm.bucketBy = 'bucketField';
    const reportSummary = wrapper.vm.reportSummary();
    expect(reportSummary.reportId).toEqual(7);
    expect(reportSummary.title).toEqual('Report Title');
    expect(reportSummary.strategy).toEqual(STRATEGY.TOTAL);
    expect(reportSummary.bucketBy).toEqual('bucketField');
  });

  it('cancel clears form', () => {
    wrapper.vm.reportId = 7;
    wrapper.vm.title = 'Report Title';
    wrapper.vm.strategy = STRATEGY.ITEMIZED;
    wrapper.vm.bucketBy = 'someField';
    expect(wrapper.vm.reportId).toEqual(7);
    expect(wrapper.vm.title).toEqual('Report Title');
    expect(wrapper.vm.strategy).toEqual(STRATEGY.ITEMIZED);
    expect(wrapper.vm.bucketBy).toEqual('someField');
    wrapper.vm.cancelForm();
    expect(wrapper.vm.reportId).toEqual(null);
    expect(wrapper.vm.title).toEqual('');
    expect(wrapper.vm.strategy).toEqual(null);
    expect(wrapper.vm.bucketBy).toEqual(null);
  });
});
