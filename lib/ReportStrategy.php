<?php
namespace Octri\ConsortReport;

abstract class ReportStrategy {
    const TOTAL = 'Total count';
    const ITEMIZED = 'Itemized count';

    public static function strategies() {
        return array(self::TOTAL, self::ITEMIZED);
    }
}
