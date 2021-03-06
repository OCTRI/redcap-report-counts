<?php
use Octri\ReportCounts\ReportConfig,
    PHPUnit\Framework\TestCase,
    Prophecy\PhpUnit\ProphecyTrait;

require_once('MockAbstractExternalModule.php');
require_once('lib/constants.php');
require_once('lib/ReportStrategy.php');

/**
 * @covers ReportConfig
 */
final class ReportConfigTest extends TestCase {

  use ProphecyTrait;

  private $projectIdWithConfigSet = '42';
  private $projectIdWithConfigNotSet = '99';
  private $reportConfigKey = \Octri\ReportCounts\REPORT_CONFIG_KEY;

  public function testGetReportConfig() {
    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))
                       ->setMethods([
                         'getProjectSetting',
                         'setProjectSetting'
                       ])
                       ->getMock();

    $mockModule->expects($this->once())
               ->method('getProjectSetting')
               ->with(
                 $this->equalTo($this->reportConfigKey),
                 $this->equalTo($this->projectIdWithConfigNotSet)
               );

    $reportConfig = new ReportConfig($this->projectIdWithConfigNotSet, $mockModule);
    $config = $reportConfig->getReportConfig();
    $this->assertFalse($config);
  }

  public function testGetReportConfigAlreadyInitialized() {
    $mockConfig = MockAbstractExternalModule::$settings[$this->projectIdWithConfigSet][$this->reportConfigKey];

    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))
                       ->setMethods([
                         'getProjectSetting',
                         'setProjectSetting'
                       ])
                       ->getMock();

    $mockModule->method('getProjectSetting')
               ->willReturn($mockConfig);

    $mockModule->expects($this->never())
               ->method('setProjectSetting')
               ->with(
                 $this->any(),
                 $this->any(),
                 $this->any()
               );

    $reportConfig = new ReportConfig($this->projectIdWithConfigSet, $mockModule);
    $config = json_decode($reportConfig->getReportConfig(), true);

    $this->assertEquals($config[0]['reportId'], 101);
    $this->assertEquals($config[1]['strategy'], \Octri\ReportCounts\ReportStrategy::ITEMIZED);
    $this->assertEquals($config[1]['bucketBy'], 'bucket_field');
    $this->assertEquals($config[2]['name'], 'Report 3');
  }

  public function testValidate() {
    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))->getMock();
    $reportConfig = new ReportConfig($this->projectIdWithConfigSet, $mockModule);

    // Valid Report Summary
    $reportSummary = array(
        'reportId' => 42,
        'title' => 'This is the title',
        'strategy' => \Octri\ReportCounts\ReportStrategy::TOTAL
    );
    $errors = $reportConfig->validate($reportSummary);
    $this->assertTrue(count($errors) === 0, 'report summary should be valid');
  }

  public function testValidateStrategy() {
    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))->getMock();
    $reportConfig = new ReportConfig($this->projectIdWithConfigSet, $mockModule);

    $reportSummary = array(
        'reportId' => 42,
        'title' => 'This is the title',
        'strategy' => 'notvalid'
    );
    $errors = $reportConfig->validate($reportSummary);
    $this->assertTrue(in_array('Invalid strategy', $errors), 'validate should report invalid strategy');
  }

  public function testValidateMissingFieldAndReportId() {
    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))->getMock();
    $reportConfig = new ReportConfig($this->projectIdWithConfigSet, $mockModule);

    $reportSummary = array(
        'reportId' => null,
        'title' => 'This is the title'
    );
    $errors = $reportConfig->validate($reportSummary);
    $this->assertTrue(in_array('Missing field strategy', $errors), 'validate should report missing field strategy');
    $this->assertTrue(in_array('reportId must be an integer greater than zero', $errors), 'validate should report invalid reportId');
  }

  public function testValidateMissingBucketByField() {
    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))->getMock();
    $reportConfig = new ReportConfig($this->projectIdWithConfigSet, $mockModule);

    $reportSummary = array(
        'reportId' => 42,
        'title' => 'This is the title',
        'strategy' => \Octri\ReportCounts\ReportStrategy::ITEMIZED
    );
    $errors = $reportConfig->validate($reportSummary);
    $this->assertTrue(in_array('Missing bucketBy field when using strategy ' . \Octri\ReportCounts\ReportStrategy::ITEMIZED, $errors), 'validate should report missing field bucketBy');
  }

  public function testValidateMissingBucketByValue() {
    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))->getMock();
    $reportConfig = new ReportConfig($this->projectIdWithConfigSet, $mockModule);

    $reportSummary = array(
        'reportId' => 42,
        'title' => 'This is the title',
        'strategy' => \Octri\ReportCounts\ReportStrategy::ITEMIZED,
        'bucketBy' => null
    );
    $errors = $reportConfig->validate($reportSummary);
    $this->assertTrue(in_array('bucketBy must have a value', $errors), 'validate should report missing value for bucketBy');
  }

  public function testSaveReportSummaries() {
    $reportSummaries = array(array(
        "reportId" => 1,
        "title" => "Title One",
        "strategy" => "Itemized count",
        "bucketBy" => "bucket_field"
    ));
    $mockModule = $this->getMockBuilder(get_class(new MockAbstractExternalModule()))->getMock();
    $module = $this->prophesize(get_class($mockModule));
    $module->setProjectSetting($this->reportConfigKey, $reportSummaries, $this->projectIdWithConfigSet)->shouldBeCalled();
    $reportConfig = new ReportConfig($this->projectIdWithConfigSet, $module->reveal());
    $reportConfig->saveReportSummaries($reportSummaries);
  }

}
