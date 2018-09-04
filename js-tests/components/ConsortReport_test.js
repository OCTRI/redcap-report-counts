import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ConsortReport from '@/components/ConsortReport';
import ReportSummary from '@/components/ReportSummary';

function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      getReportConfig() {
        return Promise.resolve([{ "name": "Report Name", "reportId": 42 }]);
      }
    }
  };
}

describe('ConsortReport.vue', () => {
  let mockProvide, wrapper;

  beforeEach((done) => {
    mockProvide = createProvideObject();
    spyOn(mockProvide.dataService, 'getReportConfig').and.callThrough();

    wrapper = shallowMount(ConsortReport, {
      provide: mockProvide
    });

    wrapper.vm.configPromise.then(() => done());
  });

  it('requests report config when mounted', () => {
    const { dataService } = mockProvide;
    expect(dataService.getReportConfig).toHaveBeenCalled();
  });
});
