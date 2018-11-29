import { shallowMount, mount } from '@vue/test-utils';

import ConsortReport from '@/components/ConsortReport';
import { STRATEGY } from '@/report-strategy';

function provideWithSummaries() {
  return {
    assetUrls: {},
    dataService: {
      fetchReportSummary() {
        return Promise.resolve([{
          id: "bce1cc37-a9b4-458c-82d8-9f2f276bef93",
          title: "Report Name",
          reportId: 42,
          strategy: STRATEGY.ITEMIZED,
          bucketBy: "some_field"
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
      const reportSummaries = [
        { id: '7c121ae3-c6b4-4e88-b744-9f2503ac1605', reportId: 1, title: "One", strategy: "Itemized count", bucketBy: "dsp_stop_reason" },
        { id: '0236bf99-bb61-485f-a3e3-dd138f22f34c', reportId: 2, title: "Enrolled", strategy: "Total count", bucketBy: null },
        { id: '032172c9-e544-4272-bcdc-dceb732f30c5', reportId: 3, title: "Random", strategy: "Total count", bucketBy: null }
      ];

      const expected = [reportSummaries[0], reportSummaries[2]];

      wrapper.vm.reportSummaries = reportSummaries;
      wrapper.vm.deleteReportSummary('0236bf99-bb61-485f-a3e3-dd138f22f34c');

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
