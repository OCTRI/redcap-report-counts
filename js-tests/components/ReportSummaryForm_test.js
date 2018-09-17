import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ReportSummaryForm from '@/components/ReportSummaryForm';

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
        return Promise.resolve([{reportId: 2, title: 'Report 2', strategy: 'total', totalRecords: 19}]);
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

  it('renders report summary form', () => {
    expect(wrapper.findAll('.report-summary-form').length).toBe(1);
    expect(wrapper.findAll('#title').length).toBe(1);
    expect(wrapper.findAll('#reportId').length).toBe(1);
    wrapper.vm.$nextTick(() => {
      const options = wrapper.findAll('#reportId option');
      expect(options.length).toBe(3);
      expect(options.at(1).attributes().value).toBe('2');
      expect(options.at(1).text()).toBe('Report 2');
    });
  });

  it('saves report summary on submit', (done) => {
    wrapper.find('.btn-primary').trigger('click');
    wrapper.vm.savePromise.then(() => done());
    wrapper.vm.$nextTick(() => {
      const reportSummary = wrapper.emitted().reportSummary;
      expect(reportSummary[0].length).toBe(1);
      expect(reportSummary[0][0]['reportId']).toBe(2);
      expect(reportSummary[0][0]['title']).toBe('Report 2');
      expect(reportSummary[0][0]['strategy']).toBe('total');
      expect(reportSummary[0][0]['totalRecords']).toBe(19);
    });
  });

  it('retrieves report summary values from form', () => {
    wrapper.vm.reportId = 7;
    wrapper.vm.title = 'Report Title';
    const reportSummary = wrapper.vm.reportSummary();
    expect(reportSummary.reportId).toEqual(7);
    expect(reportSummary.title).toEqual('Report Title');
    expect(reportSummary.strategy).toEqual('total');
  });

  it('cancel clears form', () => {
    wrapper.vm.reportId = 7;
    wrapper.vm.title = 'Report Title';
    expect(wrapper.vm.reportId).toEqual(7);
    expect(wrapper.vm.title).toEqual('Report Title');
    wrapper.vm.cancelForm();
    expect(wrapper.vm.reportId).toEqual(null);
    expect(wrapper.vm.title).toEqual('');
  });
});
