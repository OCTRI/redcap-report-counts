import ReportSummaryModel from '@/report-summary-model';
import ReportSummaryConfig from '@/report-summary-config';
import { STRATEGY } from '@/report-strategy';

const exampleProps = {
  id: 'abc',
  title: 'title',
  reportId: 42,
  reportTitle: 'Some Report Title',
  strategy: STRATEGY.ITEMIZED,
  bucketBy: 'exampleField',
  bucketByLabel: 'Example field label',
  data: [],
  totalRecords: 0,
  reportExists: true
};

describe('ReportSummaryModel class', ()  => {
  it('sets the properties as expected', () => {
    const model = new ReportSummaryModel(
      exampleProps.id,
      exampleProps.title,
      exampleProps.reportId,
      exampleProps.reportTitle,
      exampleProps.strategy,
      exampleProps.bucketBy,
      exampleProps.bucketByLabel,
      exampleProps.data,
      exampleProps.totalRecords
    );

    expect(model.id).toEqual('abc');
    expect(model.title).toEqual('title');
    expect(model.reportId).toEqual(42);
    expect(model.reportTitle).toEqual('Some Report Title');
    expect(model.strategy).toEqual(STRATEGY.ITEMIZED);
    expect(model.bucketBy).toEqual('exampleField');
    expect(model.bucketByLabel).toEqual('Example field label');
    expect(model.data).toEqual([]);
    expect(model.totalRecords).toEqual(0);
  });

  it('can construct a model from another object\'s properties', () => {
    const model = ReportSummaryModel.fromObject(exampleProps);
    Object.keys(exampleProps).forEach(prop => {
      expect(model[prop]).toEqual(exampleProps[prop]);
    });
  });

  it('can compute a config object from the object props', () => {
    const model = ReportSummaryModel.fromObject(exampleProps);
    const config = model.config;

    expect(config).toEqual(jasmine.any(ReportSummaryConfig));
    Object.keys(config).forEach(prop => {
      expect(config[prop]).toEqual(model[prop]);
    });
  });
});
