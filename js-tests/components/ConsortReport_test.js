import uuid from 'uuid/v4';
import { shallowMount, mount } from '@vue/test-utils';

import ConsortReport from '@/components/ConsortReport';
import { STRATEGY } from '@/report-strategy';

function provideWithSummaries() {
  return {
    assetUrls: {},
    dataService: {
      fetchReportSummary() {
        return Promise.resolve([{
          "title": "Report Name",
          "reportId": 42,
          "strategy": STRATEGY.ITEMIZED,
          "bucketBy": "some_field"
        }]);
      },

      getReports() {
        return Promise.resolve([]);
      },

      saveReportSummaries(reportSummaries) {
        return Promise.resolve([]);
      }
    }
  };
}

function provideWithoutSummaries() {
  return {
    assetUrls: {},
    dataService: {
      fetchReportSummary() {
        return Promise.resolve([]);
      },

      getReports() {
        return Promise.resolve([]);
      },

      saveReportSummaries(reportSummaries) {
        return Promise.resolve([]);
      }
    }
  };
}

describe('ConsortReport.vue', () => {
  let mockProvide, wrapper;

  describe('With report summaries', () => {
    beforeEach((done) => {
      mockProvide = provideWithSummaries();
      spyOn(mockProvide.dataService, 'fetchReportSummary').and.callThrough();
      spyOn(mockProvide.dataService, 'getReports').and.callThrough();
      spyOn(mockProvide.dataService, 'saveReportSummaries').and.callThrough();

      wrapper = shallowMount(ConsortReport, {
        provide: mockProvide
      });

      wrapper.vm.configPromise.then(() => done());
    });

    it('requests report summary when mounted', () => {
      const { dataService } = mockProvide;
      expect(dataService.fetchReportSummary).toHaveBeenCalled();
      expect(wrapper.vm.hasReportSummaries).toEqual(true);
    });

    it('deletes summary', () => {
      wrapper.vm.reportSummaries = [
        { "reportId":1, "title":"One",      "strategy":"Itemized count", "bucketBy":"dsp_stop_reason" },
        { "reportId":2, "title":"Enrolled", "strategy":"Total count",    "bucketBy":null },
        { "reportId":3, "title":"Random",   "strategy":"Total count",    "bucketBy":null }
      ];

      wrapper.vm.deleteReportSummary(1);

      const expected = [
        { "reportId":1, "title":"One",      "strategy":"Itemized count", "bucketBy":"dsp_stop_reason" },
        { "reportId":3, "title":"Random",   "strategy":"Total count",    "bucketBy":null }
      ];

      expect(wrapper.vm.reportSummaries).toEqual(expected);
    });
  });

  describe('Without report summaries', () => {
    beforeEach((done) => {
      mockProvide = provideWithoutSummaries();
      spyOn(mockProvide.dataService, 'fetchReportSummary').and.callThrough();

      wrapper = mount(ConsortReport, {
        provide: mockProvide
      });

      wrapper.vm.configPromise.then(() => done());
    });

    it('shows create a report button - all else hidden', () => {
      expect(wrapper.findAll('#create-a-report').length).toEqual(1);
      expect(wrapper.vm.showCreateReportButton).toEqual(true);
      expect(wrapper.vm.showReportForm).toEqual(false);
      expect(wrapper.findAll('.report-summary').length).toEqual(0);
      expect(wrapper.findAll('.report-summary-form').length).toEqual(0);
    });

    it('shows form when button pressed', () => {
      expect(wrapper.vm.showReportForm).toEqual(false);
      wrapper.find('#create-a-report').trigger('click');
      expect(wrapper.vm.showReportForm).toEqual(true);
    });
  });
});
