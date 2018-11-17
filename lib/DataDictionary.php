<?php
namespace Octri\ConsortReport;

/**
 * A class for working with a project's data dictionary.
 */
class DataDictionary {

    private $dictionary;

    /**
     * @param Array dictionary Data dictionary as returned by `REDCap::getDataDictionary('array')`
     */
    public function __construct($dictionary) {
        assert(isset($dictionary), '$dictionary is required.');
        $this->dictionary = $dictionary;
    }

    public function getFieldLabel($fieldName) {
        return $this->dictionary[$fieldName]['field_label'];
    }

}