from typing import Tuple, Optional
import re
from app.utils.enums import ResultFlag


def evaluate_numeric_flag(
    value: float,
    normal_range_str: Optional[str] = None,
    critical_low: Optional[float] = None,
    critical_high: Optional[float] = None,
) -> ResultFlag:
    """
    Evaluates numeric result value against reference ranges or critical thresholds.
    Accepts string formats like "70 - 100", "4.0 - 11.0", "< 200", "> 40".
    """
    if critical_low is not None and value <= critical_low:
        return ResultFlag.CRITICAL
    if critical_high is not None and value >= critical_high:
        return ResultFlag.CRITICAL

    if not normal_range_str:
        return ResultFlag.NORMAL

    # Try parsing range "min - max"
    match_range = re.search(r"([\d\.]+)\s*-\s*([\d\.]+)", normal_range_str)
    if match_range:
        low = float(match_range.group(1))
        high = float(match_range.group(2))
        if value < low:
            return ResultFlag.LOW
        elif value > high:
            return ResultFlag.HIGH
        else:
            return ResultFlag.NORMAL

    # Try parsing "< X"
    match_less = re.search(r"<\s*([\d\.]+)", normal_range_str)
    if match_less:
        limit = float(match_less.group(1))
        if value > limit:
            return ResultFlag.HIGH
        return ResultFlag.NORMAL

    # Try parsing "> X"
    match_greater = re.search(r">\s*([\d\.]+)", normal_range_str)
    if match_greater:
        limit = float(match_greater.group(1))
        if value < limit:
            return ResultFlag.LOW
        return ResultFlag.NORMAL

    return ResultFlag.NORMAL
