from datetime import datetime
from typing import Optional

def parse_date(date_str: str) -> Optional[str]:
    if not date_str or date_str.strip() == "":
        return None

    date_formats = [
        "%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d",
        "%d/%m/%Y", "%m-%d-%Y", "%d.%m.%Y", "%Y.%m.%d",
    ]

    for fmt in date_formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt).date()
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    try:
        dt = datetime.fromisoformat(date_str.strip()).date()
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        raise ValueError(f"Unable to parse date: {date_str}. Supported formats: {', '.join(date_formats)}")
