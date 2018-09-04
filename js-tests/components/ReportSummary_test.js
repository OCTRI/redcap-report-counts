import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ReportSummary from '@/components/ReportSummary';

function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      getReportSummary() {
        return Promise.resolve({ "count": 101 });
      }
    }
  };
}

describe('ReportSummary.vue', () => {
  let mockProvide, wrapper;

  beforeEach((done) => {
    mockProvide = createProvideObject();
    spyOn(mockProvide.dataService, 'getReportSummary').and.callThrough();

    const response = { "count": 101 };

    wrapper = shallowMount(ReportSummary, {
      propsData: {
        reportName: 'Sample Report Name',
        reportId: 12345
      },
      provide: mockProvide
    });

    wrapper.vm.configPromise.then(() => done());
  });

  it('requests report summary when mounted', () => {
    const { dataService } = mockProvide;
    expect(dataService.getReportSummary).toHaveBeenCalled();
  });

  it('renders report summary', () => {
    const reportName = wrapper.find('h3');
    expect(reportName.text()).toBe('Sample Report Name');

    const reportCount = wrapper.find('p');
    expect(reportCount.text()).toBe('101');
  });
});
