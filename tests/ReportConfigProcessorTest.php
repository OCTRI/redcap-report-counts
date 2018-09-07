<?php
use Octri\ConsortReport\ReportConfigProcessor,
    PHPUnit\Framework\TestCase;

/**
 * @covers ReportConfigProcessor
 */
final class ReportConfigProcessorTest extends TestCase {

    /**
     * Report as returned by REDCap.
     */
    private $mockReport = array(
        array('screen_id' => 1, 'dsp_stop_reason' => 'Patient follow-up'),
        array('screen_id' => 2, 'dsp_stop_reason' => 'Patient withdrew consent'),
        array('screen_id' => 3, 'dsp_stop_reason' => 'Patient follow-up'),
        array('screen_id' => 4, 'dsp_stop_reason' => 'Patient follow-up'),
        array('screen_id' => 5, 'dsp_stop_reason' => 'Patient withdrew consent'),
        array('screen_id' => 6, 'dsp_stop_reason' => 'Perceived drug side effects')
    );

    /**
     * An entry in the array found in `sample.report-config.json`. This summary
     * config is for an itemized report.
     */
    private $mockItemizedSummaryConfig = array(
        'reportId' => 42,
        'title' => 'Test Report Summary',
        'strategy' => 'itemized',
        'bucket-by' => 'dsp_stop_reason'
    );

    /**
     * An entry in the array found in `sample.report-config.json`. This summary
     * config is for a report that only includes the total number of records.
     */
    private $mockTotalSummaryConfig = array(
        'reportId' => 43,
        'title' => 'Test Report Summary with Total',
        'strategy' => 'total'
    );

    public function testReportSummaryWithOnlyTotalCount() {
        $expectedSummaryConfig = array_merge($this->mockTotalSummaryConfig,
            array("totalRecords" => 6));

        $reportProcessor = new ReportConfigProcessor($this->mockReport, $this->mockTotalSummaryConfig);

        $processedSummaryConfig = $reportProcessor->summaryConfig();

        $this->assertEquals($expectedSummaryConfig, $processedSummaryConfig, "The processed summary config should contain total number of records.");
        $this->assertFalse(isset($processedSummaryConfig['data']), "There should be no bucket data for strategy=total");
        $this->assertEquals(6, $processedSummaryConfig['totalRecords'], "Processed summary config should include the total number of records.");
    }

    public function testItemizedReportSummary() {
        $expectedBucketData = array(
            'Patient follow-up',
            'Patient withdrew consent',
            'Patient follow-up',
            'Patient follow-up',
            'Patient withdrew consent',
            'Perceived drug side effects'
        );

        $expectedSummaryConfig = array_merge($this->mockItemizedSummaryConfig, array(
            "totalRecords" => 6,
            "data" => $expectedBucketData
        ));

        $reportProcessor = new ReportConfigProcessor($this->mockReport, $this->mockItemizedSummaryConfig);

        $processedSummaryConfig = $reportProcessor->summaryConfig();

        $this->assertEquals($expectedSummaryConfig, $processedSummaryConfig, "The processed summary config should contain bucket data and total number of records.");
        $this->assertEquals($expectedBucketData, $processedSummaryConfig['data'], "Processed summary config should include data for bucketing.");
        $this->assertEquals(6, $processedSummaryConfig['totalRecords'], "Processed summary config should include the total number of records.");
    }

}
