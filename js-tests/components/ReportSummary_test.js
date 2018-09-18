import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ReportSummary from '@/components/ReportSummary';

function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      fetchReportSummary() {
        return Promise.resolve([{ "title": "Report Name", "reportId": 42 }]);
      }
    }
  };
}

describe('ReportSummary.vue', () => {
  describe('For total strategy', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ReportSummary, {
        propsData: {
          title: 'Sample Report Name',
          totalRecords: 101,
          strategy: 'total'
        }
      });
    });

    it('renders report summary', () => {
      const reportName = wrapper.find('h3');
      expect(reportName.text()).toBe('101 - Sample Report Name');
    });
  });

  describe('For itemized strategy', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ReportSummary, {
        propsData: {
          title: 'Sample Itemized Report Name',
          totalRecords: 6,
          strategy: 'itemized',
          summaryData: [
            'Patient follow-up',
            'Patient withdrew consent',
            'Patient follow-up',
            'Patient follow-up',
            'Patient withdrew consent',
            'Perceived drug side effects'
          ]
        }
      });
    });

    it('renders report summary with itemized counts', (done) => {
      const reportName = wrapper.find('h3');

      expect(reportName.text()).toBe('6 - Sample Itemized Report Name');

      wrapper.vm.$nextTick(() => {
        expect(wrapper.findAll('li').length).toEqual(3);
        expect(wrapper.findAll('li').at(0).text()).toEqual('3 - Patient follow-up');
        expect(wrapper.findAll('li').at(1).text()).toEqual('2 - Patient withdrew consent');
        expect(wrapper.findAll('li').at(2).text()).toEqual('1 - Perceived drug side effects');
        done();
      });
    });
  });
});
