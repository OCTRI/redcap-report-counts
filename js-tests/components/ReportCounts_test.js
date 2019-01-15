import { shallowMount, mount } from '@vue/test-utils';

import ReportCounts from '@/components/ReportCounts';
import ReportCountsHelp from '@/components/ReportCountsHelp';
import ReportSummaryModel from '@/report-summary-model';
import { STRATEGY } from '@/report-strategy';

import { createProvideObject, waitForSelector } from '../test-utils';

const aboutTextSelector = '#about-report-counts-module';

describe('ReportCounts.vue', () => {
  let mockProvide, wrapper;

  describe('With report summaries', () => {
    beforeEach(async () => {
      const mockExistingSummary = ReportSummaryModel.fromObject({
        id: 'bce1cc37-a9b4-458c-82d8-9f2f276bef93',
        title: 'Report Name',
        reportId: 42,
        strategy: STRATEGY.ITEMIZED,
        bucketBy: 'some_field'
      });

      mockProvide = createProvideObject();
      spyOn(mockProvide.dataService, 'getReports').and.callThrough();
      spyOn(mockProvide.dataService, 'saveReportSummaries').and.callThrough();
      spyOn(mockProvide.dataService, 'fetchReportSummary')
        .and.returnValue(Promise.resolve([mockExistingSummary]))

      wrapper = shallowMount(ReportCounts, {
        provide: mockProvide
      });

      await wrapper.vm.configPromise;
    });

    it('requests report summary when mounted', () => {
      const { dataService } = mockProvide;
      expect(dataService.fetchReportSummary).toHaveBeenCalled();
      expect(wrapper.vm.hasReportSummaries).toEqual(true);
    });

    it('has help and instructions', () => {
      expect(wrapper.find(ReportCountsHelp).exists()).toBe(true);
      // about text should not display when there are summaries
      expect(wrapper.find(aboutTextSelector).exists()).toBe(false);
    });

    it('deletes summary', () => {
      const reportSummaries = [
        { id: '7c121ae3-c6b4-4e88-b744-9f2503ac1605', reportId: 1, title: 'One', strategy: 'Itemized count', bucketBy: 'dsp_stop_reason' },
        { id: '0236bf99-bb61-485f-a3e3-dd138f22f34c', reportId: 2, title: 'Enrolled', strategy: 'Total count', bucketBy: null },
        { id: '032172c9-e544-4272-bcdc-dceb732f30c5', reportId: 3, title: 'Random', strategy: 'Total count', bucketBy: null }
      ].map(ReportSummaryModel.fromObject);

      const expected = [reportSummaries[0], reportSummaries[2]];

      wrapper.vm.reportSummaries = reportSummaries;
      wrapper.vm.deleteReportSummary('0236bf99-bb61-485f-a3e3-dd138f22f34c');

      expect(wrapper.vm.reportSummaries).toEqual(expected);
    });

    it('replaces an existing summary when an update is received', () => {
      const reportSummaries = [
        { id: '7c121ae3-c6b4-4e88-b744-9f2503ac1605', reportId: 1, title: 'One', strategy: STRATEGY.TOTAL },
        { id: '0236bf99-bb61-485f-a3e3-dd138f22f34c', reportId: 2, title: 'Two', strategy: STRATEGY.TOTAL },
        { id: '032172c9-e544-4272-bcdc-dceb732f30c5', reportId: 3, title: 'Three', strategy: STRATEGY.TOTAL }
      ].map(ReportSummaryModel.fromObject);

      const replacement = ReportSummaryModel.fromObject(reportSummaries[1]);
      replacement.title = 'Replaced';

      wrapper.vm.reportSummaries = reportSummaries;
      wrapper.vm.updateReportSummary(replacement);

      // the whole array object should be replaced
      expect(wrapper.vm.reportSummaries).not.toBe(reportSummaries);
      expect(wrapper.vm.reportSummaries[1]).toEqual(replacement);
    });
  });

  describe('creating reports', () => {
    const fillForm = async (wrapper) => {
      wrapper.find('input[name=title]').setValue('Title');
      wrapper.findAll('select[name=reportId] option').at(1).setSelected();
      await waitForSelector(wrapper, '[name="strategy"]:first-child:enabled');
      wrapper.findAll('input[name=strategy]').at(0).setChecked();
    };

    beforeEach(async () => {
      mockProvide = createProvideObject();
      spyOn(mockProvide.dataService, 'saveReportSummary').and.callThrough();

      wrapper = mount(ReportCounts, {
        provide: mockProvide
      });

      await wrapper.vm.configPromise;
    });

    it('has help and text describing the module', () => {
      expect(wrapper.find(ReportCountsHelp).exists()).toBe(true);
      expect(wrapper.find(aboutTextSelector).exists()).toBe(true);
    });

    it('shows create a report button', () => {
      expect(wrapper.findAll('#create-a-report').length).toEqual(1);
      expect(wrapper.findAll('.report-summary-form').length).toEqual(0);
    });

    it('shows form when button pressed', () => {
      expect(wrapper.findAll('.report-summary-form').length).toEqual(0);
      wrapper.find('#create-a-report').trigger('click');
      expect(wrapper.findAll('.report-summary-form').length).toEqual(1);
    });

    it('hides form when X is pressed', () => {
      wrapper.find('#create-a-report').trigger('click');
      expect(wrapper.findAll('.report-summary-form').length).toEqual(1);

      wrapper.find('.cancel-form').trigger('click');
      expect(wrapper.findAll('.report-summary-form').length).toEqual(0);
    });

    it('hides form when cancel button is pressed', () => {
      wrapper.find('#create-a-report').trigger('click');
      expect(wrapper.findAll('.report-summary-form').length).toEqual(1);

      wrapper.find('button[type=cancel]').trigger('click');
      expect(wrapper.findAll('.report-summary-form').length).toEqual(0);
    });

    it('saves and hides the form when save button is pressed', async () => {
      const { dataService } = mockProvide;
      wrapper.find('#create-a-report').trigger('click');

      // wait for reports request to complete
      await waitForSelector(wrapper, 'select option');

      await fillForm(wrapper);
      wrapper.find('button[type=submit]').trigger('click');

      await Promise.resolve();
      expect(dataService.saveReportSummary).toHaveBeenCalled();

      // form closes after save
      expect(wrapper.find('#create-a-report').exists()).toBe(true);
      expect(wrapper.find('.report-summary-form').exists()).toBe(false);
    });

    it('saves and keeps the form open when save and create button is pressed', async () => {
      const { dataService } = mockProvide;
      wrapper.find('#create-a-report').trigger('click');

      // wait for reports request to complete
      await waitForSelector(wrapper, 'select option');

      await fillForm(wrapper);
      wrapper.find('button.dropdown-item').trigger('click');

      await Promise.resolve();
      expect(dataService.saveReportSummary).toHaveBeenCalled();

      // form should still be open
      expect(wrapper.find('.report-summary-form').exists()).toBe(true);
      expect(wrapper.find('#create-a-report').exists()).toBe(false);
    });
  });

  describe('reordering with drag and drop', () => {
    let mockReportSummaries;

    beforeEach(async () => {
      mockReportSummaries = [
        {
          id: 'one-id',
          title: 'Count 1',
          reportId: 11,
          strategy: STRATEGY.ITEMIZED,
          bucketBy: 'some_field_1'
        },
        {
          id: 'two-id',
          title: 'Count 2',
          reportId: 22,
          strategy: STRATEGY.ITEMIZED,
          bucketBy: 'some_field_2'
        },
        {
          id: 'three-id',
          title: 'Count 3',
          reportId: 33,
          strategy: STRATEGY.TOTAL
        },
      ].map(ReportSummaryModel.fromObject);

      mockProvide = {
        assetUrls: {},
        dataService: {
          fetchReportSummary() {
            return Promise.resolve(mockReportSummaries);
          },
          getReports() {
            return Promise.resolve([]);
          },
          saveReportSummaries(reportSummaries) {
            return Promise.resolve([]);
          }
        }
      };

      wrapper = shallowMount(ReportCounts, {
        provide: mockProvide
      });

      await wrapper.vm.configPromise;
    });

    it('default dnd state', () => {
      const { dragItemId, dropItemId, startIndex, originalArray } = wrapper.vm.dndState;
      expect(dragItemId).toEqual(null);
      expect(dropItemId).toEqual(null);
      expect(startIndex).toEqual(null);
      expect(originalArray).toEqual(null);
    });

    it('summary is being dragged', () => {
      wrapper.vm.dndState.dragItemId = 'one-id';
      expect(wrapper.vm.isBeingDragged('one-id')).toEqual(true);
    });

    it('summary is not being dragged', () => {
      wrapper.vm.dndState.dragItemId = 'other-id';
      expect(wrapper.vm.isBeingDragged('one-id')).toEqual(false);
    });

    it('finds summary index', () => {
      expect(wrapper.vm.findSummaryIndex('one-id')).toEqual(0);
      expect(wrapper.vm.findSummaryIndex('two-id')).toEqual(1);
      expect(wrapper.vm.findSummaryIndex('three-id')).toEqual(2);
    });

    it('handles drag start', () => {
      wrapper.vm.startReorder('two-id');

      const { dragItemId, startIndex, originalArray } = wrapper.vm.dndState;
      expect(dragItemId).toEqual('two-id');
      expect(startIndex).toEqual(1);
      expect(originalArray).toEqual(mockReportSummaries);
    });

    it('swaps summaries', () => {
      wrapper.vm.startReorder('two-id');

      expect(wrapper.vm.findSummaryIndex('two-id')).toEqual(1);
      expect(wrapper.vm.findSummaryIndex('three-id')).toEqual(2);

      wrapper.vm.swapWith('three-id');

      expect(wrapper.vm.findSummaryIndex('two-id')).toEqual(2);
      expect(wrapper.vm.findSummaryIndex('three-id')).toEqual(1);
    });

    it('cancels dnd re-order', () => {
      wrapper.vm.dndState.dropItemId = 'some-id';
      wrapper.vm.resetSwapItem();
      expect(wrapper.vm.dndState.dropItemId).toEqual(null);
    });

    it('resets swap item', () => {
      wrapper.vm.dndState.dropItemId = 'three-id';
      expect(wrapper.vm.dndState.dropItemId).toEqual('three-id');
      wrapper.vm.resetSwapItem();
      expect(wrapper.vm.dndState.dropItemId).toEqual(null);
    });

    it('resets dnd state', () => {
      wrapper.vm.dragItemId = 'one-id';
      wrapper.vm.dropItemId = 'three-id';
      wrapper.vm.startIndex = 0;

      wrapper.vm.resetDndState();

      const { dragItemId, dropItemId, startIndex } = wrapper.vm.dndState;
      expect(dragItemId).toEqual(null);
      expect(dropItemId).toEqual(null);
      expect(startIndex).toEqual(null);
    });

    it('persists new order', () => {
      const { dataService } = mockProvide;
      spyOn(mockProvide.dataService, 'saveReportSummaries').and.callThrough();

      wrapper.vm.dndState.dragItemId = 'one-id';
      wrapper.vm.dndState.startIndex = 2;

      wrapper.vm.endReorder();

      const { dragItemId, dropItemId, startIndex } = wrapper.vm.dndState;
      expect(dragItemId).toEqual(null);
      expect(dropItemId).toEqual(null);
      expect(startIndex).toEqual(null);

      expect(dataService.saveReportSummaries).toHaveBeenCalled();
    });

    it('does not persist new order if it has not changed', () => {
      const { dataService } = mockProvide;
      spyOn(mockProvide.dataService, 'saveReportSummaries').and.callThrough();

      wrapper.vm.dndState.dragItemId = 'one-id';
      wrapper.vm.dndState.startIndex = 0;
      wrapper.vm.endReorder();

      expect(dataService.saveReportSummaries).toHaveBeenCalledTimes(0);
    });
  });

});