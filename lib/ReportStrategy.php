<?php
namespace Octri\ConsortReport;

abstract class ReportStrategy {
    const TOTAL = 'total';
    const ITEMIZED = 'itemized';

    public static function strategies() {
        return array(self::TOTAL, self::ITEMIZED);
    }
}
