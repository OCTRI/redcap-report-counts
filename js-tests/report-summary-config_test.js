import ReportSummaryConfig from '@/report-summary-config';
import { STRATEGY } from '@/report-strategy';

import { uuidPattern } from './test-utils';

describe('ReportSummaryConfig class', () => {
  it('constructs a new default object when there are no arguments', () => {
    const obj = new ReportSummaryConfig();
    expect(obj.id).toMatch(uuidPattern);
    expect(obj.title).toBe('');
    expect(obj.reportId).toBeNull();
    expect(obj.strategy).toBeNull();
    expect(obj.bucketBy).toBeNull();
  });

  it('constructs an object with the expected properties when there are arguments', () => {
    const obj = new ReportSummaryConfig('abcd1234', 'Example Title', 99, STRATEGY.ITEMIZED, 'hobo');
    expect(obj.id).toEqual('abcd1234');
    expect(obj.title).toEqual('Example Title');
    expect(obj.reportId).toEqual(99);
    expect(obj.strategy).toEqual(STRATEGY.ITEMIZED);
    expect(obj.bucketBy).toEqual('hobo');
  });

  it('can clone an existing ReportSummaryConfig', () =>{
    const oldObj = new ReportSummaryConfig('a', 'Title', 42, STRATEGY.ITEMIZED, 'someField');
    const newObj = ReportSummaryConfig.fromObject(oldObj);

    // result should be a different object
    expect(newObj).not.toBe(oldObj);

    expect(newObj.id).toEqual(oldObj.id);
    expect(newObj.title).toEqual(oldObj.title);
    expect(newObj.reportId).toEqual(oldObj.reportId);
    expect(newObj.strategy).toEqual(oldObj.strategy);
    expect(newObj.bucketBy).toEqual(oldObj.bucketBy);
  });
});