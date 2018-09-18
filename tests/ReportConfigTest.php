<?php
use Octri\ConsortReport\ReportConfig,
    PHPUnit\Framework\TestCase;

require_once('MockAbstractExternalModule.php');
require_once('lib/constants.php');

/**
 * @covers ReportConfig
 */
final class ReportConfigTest extends TestCase {

  private $projectIdWithConfigSet = '42';
  private $projectIdWithConfigNotSet = '99';
  private $reportConfigKey = \Octri\ConsortReport\REPORT_CONFIG_KEY;

  public function testGetReportConfig() {
    $mockConfig = MockAbstractExternalModule::$settings[$this->projectIdWithConfigNotSet][$this->reportConfigKey];
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
    $this->assertEquals($config[1]['strategy'], 'itemized');
    $this->assertEquals($config[1]['bucket-by'], 'bucket_field');
    $this->assertEquals($config[2]['name'], 'Report 3');
  }

}
