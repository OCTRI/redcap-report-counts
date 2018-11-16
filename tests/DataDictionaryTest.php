<?php
use Octri\ConsortReport\DataDictionary,
    PHPUnit\Framework\TestCase;

/**
 * @covers DataDictionary
 */
final class DataDictionaryTest extends TestCase {

  public function testGetFieldName() {
    $mockDictionary = array(
      'screen_id' => array(
        "field_name" => "screen_id",
        "form_name" => "screening_id",
        "field_label" => "Screening Id"
      ),
      'dsp_stop_reason' => array(
        "field_name" => "dsp_stop_reason",
        "form_name" => "subject_data",
        "field_label" => "Stop Reason"
      ),
      'another_field' => array(
        "field_name" => "another_field",
        "form_name" => "another_form",
        "field_label" => "Another Field"
      )
    );
    $dataDictionary = new DataDictionary($mockDictionary);
    $this->assertEquals('Stop Reason', $dataDictionary->getFieldLabel('dsp_stop_reason'));
    $this->assertEquals('Another Field', $dataDictionary->getFieldLabel('another_field'));
  }

}