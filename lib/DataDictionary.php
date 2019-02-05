<?php
namespace Octri\ReportCounts;

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

    /**
     * Looks up the field label from the data dictionary for a given field name.
     * @return String label
     */
    public function getFieldLabel($fieldName) {
        return $this->dictionary[$fieldName]['field_label'];
    }

    /**
     * Checks if a field exists in the data dictionary.
     * @return Boolean `true` if the field exists, `false` otherwise.
     */
    public function fieldExists($fieldName) {
        return array_key_exists($fieldName, $this->dictionary) 
            && isset($this->dictionary[$fieldName]);
    }

    /**
     * Getter for `$this->dictionary`.
     * @return Array REDCap data dictionary.
     */
    public function getDictionary() {
        return $this->dictionary;
    }

}